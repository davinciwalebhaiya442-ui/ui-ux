import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/account';
import { toFrontendProduct } from '@/lib/product';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  const search = new URL(request.url).searchParams;
  const page = Math.max(1, Number(search.get('page') || 1));
  const limit = Math.min(50, Math.max(1, Number(search.get('limit') || 20)));
  const where = { userId: auth.user.id };
  const [total, access] = await Promise.all([
    prisma.productAccess.count({ where }),
    prisma.productAccess.findMany({ where, include: { product: { include: { category: true } }, downloads: { orderBy: { createdAt: 'desc' }, take: 1 } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
  ]);
  return Response.json({ products: access.map((item) => ({ ...toFrontendProduct(item.product), accessType: item.accessType, accessId: item.id, lastDownloadAt: item.downloads[0]?.createdAt || null })), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}
