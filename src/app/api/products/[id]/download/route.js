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

    try {
      const fileName = product.downloadFileName || `${product.slug || 'package'}.zip`;
      const url = await createSignedDownloadUrl(
        product.downloadFileKey,
        3600, // 1 hour link
        fileName
      );

      // Track download analytics if user is logged in
      if (authUser) {
        try {
          await ensureProfile(authUser);
          const access = await prisma.productAccess.upsert({
            where: { userId_productId: { userId: authUser.id, productId: product.id } },
            update: {},
            create: { userId: authUser.id, productId: product.id, accessType: 'FREE_DOWNLOAD' },
          });
          await prisma.download.create({
            data: { userId: authUser.id, productId: product.id, accessId: access.id },
          });
        } catch (e) {
          console.warn('Analytics tracking non-fatal error:', e);
        }
      }

      return Response.json({
        url,
        fileName,
        expiresIn: 3600,
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
