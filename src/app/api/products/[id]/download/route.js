import { prisma } from '@/lib/prisma';
import { requireUser, ensureProfile } from '@/lib/account';
import { createSignedDownloadUrl } from '@/lib/storage/r2';

const attempts = new Map();

export async function POST(request, { params }) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const now = Date.now();
  const recent = (attempts.get(auth.user.id) || []).filter((time) => now - time < 60_000);
  if (recent.length >= 10) return Response.json({ error: 'RATE_LIMITED' }, { status: 429 });
  attempts.set(auth.user.id, [...recent, now]);
  const product = await prisma.product.findFirst({ where: { OR: [{ id: params.id }, { slug: params.id }] } });
  if (!product || !product.published) return Response.json({ error: 'PRODUCT_UNAVAILABLE' }, { status: 404 });
  if (product.type === 'PAID') {
    const purchase = await prisma.productAccess.findUnique({ where: { userId_productId: { userId: auth.user.id, productId: product.id } } });
    if (!purchase || purchase.accessType !== 'PURCHASE') return Response.json({ error: 'PURCHASE_REQUIRED' }, { status: 403 });
  }
  if (!product.downloadFileKey) return Response.json({ error: 'DOWNLOAD_UNAVAILABLE' }, { status: 404 });
  try {
    await ensureProfile(auth.user);
    const access = await prisma.productAccess.upsert({ where: { userId_productId: { userId: auth.user.id, productId: product.id } }, update: {}, create: { userId: auth.user.id, productId: product.id, accessType: 'FREE_DOWNLOAD' } });
    if (access.accessType !== 'FREE_DOWNLOAD' && product.type !== 'PAID') return Response.json({ error: 'ACCESS_DENIED' }, { status: 403 });
    const url = await createSignedDownloadUrl(product.downloadFileKey, 600, product.downloadFileName);
    await prisma.download.create({ data: { userId: auth.user.id, productId: product.id, accessId: access.id } });
    return Response.json({ url, fileName: product.downloadFileName, expiresIn: 600 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'DOWNLOAD_UNAVAILABLE' }, { status: 503 });
  }
}
