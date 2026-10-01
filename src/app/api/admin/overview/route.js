import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    const now = new Date();
    let startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === '90d') {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (period === 'all') {
      startDate = new Date(0);
    }

    // Consolidated queries to eliminate pool congestion
    const [allProducts, allOrders, allDownloads, allStudio, recentProfiles, totalUsersCount] = await Promise.all([
      prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          type: true,
          price: true,
          published: true,
          thumbnailKey: true,
          previewImages: true,
          createdAt: true,
          category: { select: { id: true, name: true } },
          _count: { select: { downloads: true, access: true } },
        },
      }).catch(() => []),
      prisma.order.findMany({
        take: 200,
        orderBy: { createdAt: 'desc' },
        include: { items: true, user: true },
      }).catch(() => []),
      prisma.download.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: { product: { select: { name: true, slug: true } }, user: true },
      }).catch(() => []),
      prisma.studioRequest.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
      }).catch(() => []),
      prisma.profile.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: { userId: true, name: true, email: true, role: true, createdAt: true },
      }).catch(() => []),
      prisma.profile.count().catch(() => 1),
    ]);

    // Derived product stats
    const totalProducts = allProducts.length;
    const publishedProducts = allProducts.filter((p) => p.published).length;
    const freeProducts = allProducts.filter((p) => p.type === 'FREE').length;
    const unpublishedDrafts = allProducts.filter((p) => !p.published).length;
    const missingMediaCount = allProducts.filter((p) => !p.thumbnailKey).length;

    // Derived order & revenue stats
    const paidOrders = allOrders.filter((o) => o.status === 'PAID');
    const periodOrders = paidOrders.filter((o) => new Date(o.createdAt) >= startDate);
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const periodRevenue = periodOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Derived download stats
    const totalDownloads = allDownloads.length;
    const periodDownloads = allDownloads.filter((d) => new Date(d.createdAt) >= startDate).length;

    // Studio requests stats
    const pendingStudioCount = allStudio.filter((s) => s.status === 'NEW').length;

    // Chart points formatting
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

    return Response.json({
      period,
      stats: {
        products: totalProducts,
        publishedProducts: publishedProducts,
        freeProducts: freeProducts,
        users: totalUsersCount || recentProfiles.length,
        downloads: periodDownloads,
        totalDownloads: totalDownloads,
        orders: periodOrders.length,
        totalOrders: paidOrders.length,
        revenue: periodRevenue,
        totalRevenue: totalRevenue,
        pendingStudioRequests: pendingStudioCount,
      },
      chart: {
        labels: chartLabels,
        revenue: chartRevenue,
        orders: chartOrders,
      },
      pendingActions: {
        studioRequests: pendingStudioCount,
        unpublishedDrafts: unpublishedDrafts,
        missingMedia: missingMediaCount,
      },
      recent: {
        products: allProducts.slice(0, 6),
        orders: allOrders.slice(0, 6),
        downloads: allDownloads.slice(0, 6),
        studio: allStudio.slice(0, 5),
        users: recentProfiles,
      },
      topProducts: allProducts.slice(0, 5).map((p) => ({
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
      })),
    });
  } catch (error) {
    console.error('Admin overview API error:', error);
    return Response.json({ error: 'Unable to load dashboard data' }, { status: 500 });
  }
}
