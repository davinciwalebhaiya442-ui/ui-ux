import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  const [events, downloads, orders, products] = await Promise.all([
    prisma.analyticsEvent.groupBy({ by: ['name'], _count: { _all: true }, orderBy: { _count: { name: 'desc' } }, take: 20 }),
    prisma.download.count(),
    prisma.order.count(),
    prisma.product.count(),
  ]);
  return Response.json({ events, totals: { downloads, orders, products } });
}
