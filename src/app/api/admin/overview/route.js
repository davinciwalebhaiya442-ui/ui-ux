import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  const [products, publishedProducts, freeProducts, users, downloads, orders, revenue, studioRequests, recentProducts, recentOrders, recentDownloads, recentStudio] = await Promise.all([
    prisma.product.count(), prisma.product.count({ where: { published: true } }), prisma.product.count({ where: { type: 'FREE' } }), prisma.profile.count(), prisma.download.count(), prisma.order.count(), prisma.order.aggregate({ _sum: { total: true }, where: { status: 'PAID' } }), prisma.studioRequest.count({ where: { status: 'NEW' } }),
    prisma.product.findMany({ take: 6, orderBy: { createdAt: 'desc' }, include: { category: true } }),
    prisma.order.findMany({ take: 6, orderBy: { createdAt: 'desc' }, include: { items: true, user: true } }),
    prisma.download.findMany({ take: 6, orderBy: { createdAt: 'desc' }, include: { product: true, user: true, access: true } }),
    prisma.studioRequest.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
  ]);
  return Response.json({ stats: { products, publishedProducts, freeProducts, users, downloads, orders, revenue: revenue._sum.total || 0, studioRequests }, recent: { products: recentProducts, orders: recentOrders, downloads: recentDownloads, studio: recentStudio } });
}
