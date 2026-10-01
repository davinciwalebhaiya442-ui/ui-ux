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
      prisma.product.count().catch(() => 0),
      prisma.product.count({ where: { published: true } }).catch(() => 0),
      prisma.product.count({ where: { type: 'FREE' } }).catch(() => 0),
      prisma.profile.count().catch(() => 0),
      prisma.download.count().catch(() => 0),
      prisma.download.count({ where: downloadWhere }).catch(() => 0),
      prisma.order.count().catch(() => 0),
      prisma.order.count({ where: orderWhere }).catch(() => 0),
      prisma.order.aggregate({ _sum: { total: true }, where: orderWhere }).catch(() => ({ _sum: { total: 0 } })),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: 'PAID' } }).catch(() => ({ _sum: { total: 0 } })),
      prisma.studioRequest.count({ where: { status: 'NEW' } }).catch(() => 0),
      prisma.product.findMany({ take: 6, orderBy: { createdAt: 'desc' }, include: { category: true } }).catch(() => []),
      prisma.order.findMany({ take: 6, orderBy: { createdAt: 'desc' }, include: { items: true, user: true } }).catch(() => []),
      prisma.download.findMany({ take: 6, orderBy: { createdAt: 'desc' }, include: { product: true, user: true, access: true } }).catch(() => []),
      prisma.studioRequest.findMany({ take: 5, orderBy: { createdAt: 'desc' } }).catch(() => []),
      prisma.profile.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { userId: true, name: true, email: true, role: true, createdAt: true } }).catch(() => []),
      prisma.product.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          _count: { select: { downloads: true, access: true } },
        },
      }).catch(() => []),
    ]);

    // Format chart points
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

    // Populate chart points from recent orders safely
    const paidOrders = await prisma.order.findMany({
      where: {
        status: 'PAID',
        createdAt: { gte: new Date(now.getTime() - (period === 'today' ? 24 * 3600 * 1000 : daysCount * 24 * 3600 * 1000)) },
      },
      select: { total: true, createdAt: true },
    }).catch(() => []);

    paidOrders.forEach((o) => {
      const diffMs = now.getTime() - new Date(o.createdAt).getTime();
      const idx = period === 'today'
        ? Math.floor(diffMs / (60 * 60 * 1000))
        : Math.floor(diffMs / (24 * 60 * 60 * 1000));
      const targetIdx = daysCount - 1 - idx;
      if (targetIdx >= 0 && targetIdx < daysCount) {
        chartRevenue[targetIdx] += o.total || 0;
        chartOrders[targetIdx] += 1;
      }
    });

    // Pending action items
    const unpublishedDrafts = await prisma.product.count({ where: { published: false } }).catch(() => 0);
    const missingMediaCount = await prisma.product.count({
      where: { thumbnailKey: null },
    }).catch(() => 0);

    return Response.json({
      period,
      stats: {
        products: totalProducts ?? 0,
        publishedProducts: publishedProducts ?? 0,
        freeProducts: freeProducts ?? 0,
        users: totalUsers ?? 0,
        downloads: periodDownloads ?? 0,
        totalDownloads: totalDownloads ?? 0,
        orders: periodOrders ?? 0,
        totalOrders: totalOrders ?? 0,
        revenue: periodRevenueAggregate?._sum?.total || 0,
        totalRevenue: totalRevenueAggregate?._sum?.total || 0,
        pendingStudioRequests: pendingStudioCount ?? 0,
      },
      chart: {
        labels: chartLabels,
        revenue: chartRevenue,
        orders: chartOrders,
      },
      pendingActions: {
        studioRequests: pendingStudioCount ?? 0,
        unpublishedDrafts: unpublishedDrafts ?? 0,
        missingMedia: missingMediaCount ?? 0,
      },
      recent: {
        products: Array.isArray(recentProducts) ? recentProducts : [],
        orders: Array.isArray(recentOrders) ? recentOrders : [],
        downloads: Array.isArray(recentDownloads) ? recentDownloads : [],
        studio: Array.isArray(recentStudio) ? recentStudio : [],
        users: Array.isArray(recentUsers) ? recentUsers : [],
      },
      topProducts: Array.isArray(topProductsRaw) ? topProductsRaw.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        type: p.type,
        price: p.price,
        category: p.category?.name || 'Asset',
        thumbnailKey: p.thumbnailKey,
        previewImages: p.previewImages,
        downloadsCount: p._count?.downloads || 0,
        salesCount: p._count?.access || 0,
        revenue: p.type === 'PAID' ? (p._count?.access || 0) * (p.price || 0) : 0,
      })) : [],
    });
  } catch (error) {
    console.error('Admin overview API error:', error);
    return Response.json({ error: 'Unable to load dashboard data' }, { status: 500 });
  }
}
