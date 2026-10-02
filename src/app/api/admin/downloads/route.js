import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const [downloads, paidOrders] = await Promise.all([
      prisma.download.findMany({
        orderBy: { createdAt: 'desc' },
        take: 300,
        include: { user: true, product: true, access: true },
      }),
      prisma.order.findMany({
        where: { status: 'PAID' },
        orderBy: { createdAt: 'desc' },
        include: { user: true, items: true },
      }),
    ]);

    // Ensure all paid order purchases are represented
    const mappedDownloads = downloads.map((d) => ({
      id: d.id,
      user: {
        email: d.user?.email || 'guest',
        name: d.user?.name || null,
        userId: d.userId,
      },
      product: {
        id: d.product?.id,
        name: d.product?.name || 'Asset',
        slug: d.product?.slug,
        type: d.product?.type || (d.access?.accessType === 'PURCHASE' ? 'PAID' : 'FREE'),
        price: d.product?.price || 0,
      },
      accessType: d.access?.accessType || (d.product?.type === 'PAID' ? 'PURCHASE' : 'FREE_DOWNLOAD'),
      createdAt: d.createdAt,
    }));

    // Merge any paid orders that might not be in downloads table
    const existingOrderKeys = new Set(
      downloads.map((d) => `${d.userId}_${d.productId}`)
    );

    for (const order of paidOrders) {
      for (const item of order.items) {
        const key = `${order.userId}_${item.productId}`;
        if (!existingOrderKeys.has(key)) {
          mappedDownloads.push({
            id: `order-dl-${order.id}-${item.productId}`,
            user: {
              email: order.user?.email || 'Customer',
              name: order.user?.name || null,
              userId: order.userId,
            },
            product: {
              id: item.productId,
              name: item.productName,
              slug: item.productId,
              type: 'PAID',
              price: item.price,
            },
            accessType: 'PURCHASE',
            createdAt: order.createdAt,
          });
          existingOrderKeys.add(key);
        }
      }
    }

    // Sort all downloads newest first
    mappedDownloads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return Response.json({ downloads: mappedDownloads });
  } catch (error) {
    console.error('Error fetching admin downloads:', error);
    return Response.json({ error: 'Failed to fetch downloads' }, { status: 500 });
  }
}
