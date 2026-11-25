import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { ensureProfile } from '@/lib/account';
import { createSignedDownloadUrl } from '@/lib/storage/r2';

const attempts = new Map();

export async function POST(request, { params }) {
  try {
    const authUser = await getAuthenticatedUser().catch(() => null);

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
        published: true,
      },
    });

    if (!product) {
      return Response.json({ error: 'PRODUCT_UNAVAILABLE' }, { status: 404 });
    }

    // Only PAID products require authentication and purchase access
    if (product.type === 'PAID') {
      if (!authUser) {
        return Response.json({ error: 'LOGIN_REQUIRED' }, { status: 401 });
      }

      const purchase = await prisma.productAccess.findUnique({
        where: {
          userId_productId: {
            userId: authUser.id,
            productId: product.id,
          },
        },
      });

      if (!purchase || purchase.accessType !== 'PURCHASE') {
        return Response.json({ error: 'PURCHASE_REQUIRED' }, { status: 403 });
      }
    }

    // Rate-limiting check based on IP or User
    const clientIdentifier = authUser?.id || request.headers.get('x-forwarded-for') || 'guest';
    const now = Date.now();
    const recent = (attempts.get(clientIdentifier) || []).filter((time) => now - time < 60_000);
    if (recent.length >= 25) {
      return Response.json({ error: 'RATE_LIMITED' }, { status: 429 });
    }
    attempts.set(clientIdentifier, [...recent, now]);

    // For FREE products, NO LOGIN REQUIRED! Direct download!
    if (!product.downloadFileKey) {
      return Response.json(
        { error: 'Download package will be available in the library shortly.' },
        { status: 404 }
      );
    }

    const rawKey = (product.downloadFileKey || '').trim();
    const isUrl = rawKey.startsWith('http://') || rawKey.startsWith('https://');
    const isDrive = isUrl && rawKey.includes('drive.google.com');
    const fileName = product.downloadFileName || (isDrive ? 'Google Drive Cloud Archive' : `${product.slug || 'package'}.zip`);

    const recordDownloadEvent = async () => {
      try {
        let targetUserId = authUser?.id;
        if (!targetUserId) {
          const guestUser = await prisma.profile.upsert({
            where: { userId: 'guest_downloads' },
            update: {},
            create: {
              userId: 'guest_downloads',
              email: 'community@davinciwalebhaiya.com',
              name: 'Community Download',
              role: 'customer',
            },
          });
          targetUserId = guestUser.userId;
        } else {
          await ensureProfile(authUser);
        }

        const accessType = product.type === 'PAID' ? 'PURCHASE' : 'FREE_DOWNLOAD';
        const access = await prisma.productAccess.upsert({
          where: { userId_productId: { userId: targetUserId, productId: product.id } },
          update: {},
          create: { userId: targetUserId, productId: product.id, accessType },
        });

        await prisma.download.create({
          data: { userId: targetUserId, productId: product.id, accessId: access.id },
        });
      } catch (trackErr) {
        console.warn('Download tracking notice:', trackErr?.message || trackErr);
      }
    };

    if (isUrl) {
      await recordDownloadEvent();

      return Response.json({
        url: rawKey,
        fileName,
        isExternal: true,
        isDrive,
      });
    }

    try {
      const url = await createSignedDownloadUrl(
        rawKey,
        3600, // 1 hour link
        fileName
      );

      // Track download analytics
      await recordDownloadEvent();

      return Response.json({
        url,
        fileName,
        expiresIn: 3600,
        isExternal: false,
        isDrive: false,
      });

      return Response.json({
        url,
        fileName,
        expiresIn: 3600,
        isExternal: false,
        isDrive: false,
      });
    } catch (storageErr) {
      console.error('Storage error creating signed download URL:', storageErr);
      return Response.json({ error: 'DOWNLOAD_STORAGE_ERROR' }, { status: 503 });
    }
  } catch (error) {
    console.error('Download route handler error:', error);
    return Response.json({ error: 'DOWNLOAD_UNAVAILABLE' }, { status: 500 });
  }
}
