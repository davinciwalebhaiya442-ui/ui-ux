import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    let dateFilter = {};
    const now = new Date();
    if (period === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { gte: startOfDay };
    } else if (period === '7d') {
      dateFilter = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
    } else if (period === '30d') {
      dateFilter = { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    } else if (period === '90d') {
      dateFilter = { gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
    }

    const orderWhere = {
      status: 'PAID',
      ...(dateFilter.gte ? { createdAt: dateFilter } : {}),
    };

    const downloadWhere = dateFilter.gte ? { createdAt: dateFilter } : {};

    const [
      totalProducts,
      publishedProducts,
      freeProducts,
      totalUsers,
      totalDownloads,
      periodDownloads,
      totalOrders,
      periodOrders,
      periodRevenueAggregate,
      totalRevenueAggregate,
      pendingStudioCount,
      recentProducts,
      recentOrders,
      recentDownloads,
      recentStudio,
      recentUsers,
      topProductsRaw,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { published: true } }),
      prisma.product.count({ where: { type: 'FREE' } }),
      prisma.profile.count(),
      prisma.download.count(),
      prisma.download.count({ where: downloadWhere }),
      prisma.order.count(),
      prisma.order.count({ where: orderWhere }),
      prisma.order.aggregate({ _sum: { total: true }, where: orderWhere }),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: 'PAID' } }),
      prisma.studioRequest.count({ where: { status: 'NEW' } }),
      prisma.product.findMany({ take: 6, orderBy: { createdAt: 'desc' }, include: { category: true } }),
      prisma.order.findMany({ take: 6, orderBy: { createdAt: 'desc' }, include: { items: true, user: true } }),
      prisma.download.findMany({ take: 6, orderBy: { createdAt: 'desc' }, include: { product: true, user: true, access: true } }),
      prisma.studioRequest.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
      prisma.profile.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { userId: true, name: true, email: true, role: true, createdAt: true } }),
      prisma.product.findMany({
        take: 5,
        orderBy: { access: { _count: 'desc' } },
        include: {
          category: true,
          _count: { select: { downloads: true, access: true } },
        },
      }),
    ]);

    // Format chart points (last 7 or 14 intervals)
    const daysCount = period === 'today' ? 24 : period === '7d' ? 7 : 14;
    const chartLabels = [];
    const chartRevenue = [];
    const chartOrders = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      if (period === 'today') {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000);
        chartLabels.push(`${d.getHours()}:00`);
      } else {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        chartLabels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }
      chartRevenue.push(0);
      chartOrders.push(0);
    }

    // Populate chart points from recent orders
    const paidOrders = await prisma.order.findMany({
      where: {
        status: 'PAID',
        createdAt: { gte: new Date(now.getTime() - (daysCount + 1) * 24 * 60 * 60 * 1000) },
      },
      select: { total: true, createdAt: true },
    });

    paidOrders.forEach((o) => {
      const orderDate = new Date(o.createdAt);
      const diffDays = Math.floor((now.getTime() - orderDate.getTime()) / (24 * 60 * 60 * 1000));
      const idx = daysCount - 1 - diffDays;
      if (idx >= 0 && idx < daysCount) {
        chartRevenue[idx] += o.total;
        chartOrders[idx] += 1;
      }
    });

    // Pending action items
    const unpublishedDrafts = await prisma.product.count({ where: { published: false } });
    const missingMediaCount = await prisma.product.count({
      where: {
        AND: [
          { thumbnailKey: null },
          { previewImages: { equals: [] } },
        ],
      },
    });

    return Response.json({
      period,
      stats: {
        products: totalProducts,
        publishedProducts,
        freeProducts,
        users: totalUsers,
        downloads: periodDownloads,
        totalDownloads,
        orders: periodOrders,
        totalOrders,
        revenue: periodRevenueAggregate._sum.total || 0,
        totalRevenue: totalRevenueAggregate._sum.total || 0,
        pendingStudioRequests: pendingStudioCount,
      },
      chart: {
        labels: chartLabels,
        revenue: chartRevenue,
        orders: chartOrders,
      },
      pendingActions: {
        studioRequests: pendingStudioCount,
        unpublishedDrafts,
        missingMedia: missingMediaCount,
      },
      recent: {
        products: recentProducts,
        orders: recentOrders,
        downloads: recentDownloads,
        studio: recentStudio,
        users: recentUsers,
      },
      topProducts: topProductsRaw.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        type: p.type,
        price: p.price,
        category: p.category?.name || 'Asset',
        thumbnailKey: p.thumbnailKey,
        previewImages: p.previewImages,
        downloadsCount: p._count.downloads,
        salesCount: p._count.access,
        revenue: p.type === 'PAID' ? p._count.access * p.price : 0,
      })),
    });
  } catch (error) {
    console.error('Admin overview API error:', error);
    return Response.json({ error: 'Unable to load dashboard data' }, { status: 500 });
  }
}
