import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d'; // '7d' | '30d' | '90d' | 'all'

    const now = new Date();
    let dateFilter = {};
    let daysCount = 30;

    if (period === '7d') {
      daysCount = 7;
      dateFilter = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
    } else if (period === '30d') {
      daysCount = 30;
      dateFilter = { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    } else if (period === '90d') {
      daysCount = 90;
      dateFilter = { gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
    } else if (period === 'all') {
      daysCount = 60; // Show last 60 days on chart when 'all' is selected
    }

    const orderWhere = {
      status: 'PAID',
      ...(dateFilter.gte ? { createdAt: dateFilter } : {}),
    };

    const downloadWhere = dateFilter.gte ? { createdAt: dateFilter } : {};

    const [
      allTimeOrdersCount,
      allTimePaidOrders,
      periodOrdersCount,
      totalOrdersAttempted,
      allTimeDownloadsCount,
      periodDownloadsCount,
      totalProfilesCount,
      topProductsRaw,
      categories,
      ordersWithItems,
    ] = await Promise.all([
      prisma.order.count({ where: { status: 'PAID' } }).catch(() => 0),
      prisma.order.findMany({ where: { status: 'PAID' }, select: { total: true, currency: true } }).catch(() => []),
      prisma.order.count({ where: orderWhere }).catch(() => 0),
      prisma.order.count(dateFilter.gte ? { where: { createdAt: dateFilter } } : {}).catch(() => 0),
      prisma.download.count().catch(() => 0),
      prisma.download.count({ where: downloadWhere }).catch(() => 0),
      prisma.profile.count().catch(() => 0),
      prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          _count: {
            select: { access: true, downloads: true },
          },
        },
      }).catch(() => []),
      prisma.contentCategory.findMany().catch(() => []),
      prisma.order.findMany({
        where: orderWhere,
        include: {
          items: true,
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 300,
      }).catch(() => []),
    ]);

    const periodPaidList = Array.isArray(ordersWithItems) ? ordersWithItems : [];
    const allPaidList = Array.isArray(allTimePaidOrders) ? allTimePaidOrders : [];

    const periodRevenueINR = periodPaidList.filter((o) => o.currency !== 'USD').reduce((sum, o) => sum + (o.total || 0), 0);
    const periodRevenueUSD = periodPaidList.filter((o) => o.currency === 'USD').reduce((sum, o) => sum + (o.total || 0), 0);

    const allTimeRevenueINR = allPaidList.filter((o) => o.currency !== 'USD').reduce((sum, o) => sum + (o.total || 0), 0);
    const allTimeRevenueUSD = allPaidList.filter((o) => o.currency === 'USD').reduce((sum, o) => sum + (o.total || 0), 0);

    const periodRevenue = periodRevenueINR;
    const allTimeRevenue = allTimeRevenueINR;
    const averageOrderValue = periodOrdersCount > 0 ? Math.round(periodRevenue / periodOrdersCount) : 0;
    const checkoutSuccessRate = totalOrdersAttempted > 0
      ? Math.round((periodOrdersCount / totalOrdersAttempted) * 100)
      : 100;

    // Build timeline daily buckets
    const chartLabels = [];
    const chartRevenue = [];
    const chartOrders = [];
    const chartDownloads = [];

    // Distinct dates
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      chartLabels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      chartRevenue.push(0);
      chartOrders.push(0);
      chartDownloads.push(0);
    }

    // Populate chart orders & revenue
    ordersWithItems.forEach((o) => {
      const diffDays = Math.floor((now.getTime() - new Date(o.createdAt).getTime()) / (24 * 60 * 60 * 1000));
      const targetIdx = daysCount - 1 - diffDays;
      if (targetIdx >= 0 && targetIdx < daysCount) {
        chartRevenue[targetIdx] += o.total || 0;
        chartOrders[targetIdx] += 1;
      }
    });

    // Populate downloads count per day
    const recentDownloads = await prisma.download.findMany({
      where: {
        createdAt: { gte: new Date(now.getTime() - daysCount * 24 * 60 * 60 * 1000) },
      },
      select: { createdAt: true },
    }).catch(() => []);

    recentDownloads.forEach((d) => {
      const diffDays = Math.floor((now.getTime() - new Date(d.createdAt).getTime()) / (24 * 60 * 60 * 1000));
      const targetIdx = daysCount - 1 - diffDays;
      if (targetIdx >= 0 && targetIdx < daysCount) {
        chartDownloads[targetIdx] += 1;
      }
    });

    // Calculate product leaderboard
    const topProducts = topProductsRaw
      .map((p) => {
        const salesCount = p._count?.access || 0;
        const downloadsCount = p._count?.downloads || 0;
        const revenue = p.type === 'PAID' ? salesCount * (p.price || 0) : 0;
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          category: p.category?.name || 'Asset',
          type: p.type,
          price: p.price,
          thumbnailKey: p.thumbnailKey,
          salesCount,
          downloadsCount,
          revenue,
        };
      })
      .sort((a, b) => b.revenue - a.revenue || b.downloadsCount - a.downloadsCount);

    // Category breakdown
    const categoryRevenueMap = {};
    topProducts.forEach((p) => {
      const cat = p.category || 'General';
      if (!categoryRevenueMap[cat]) {
        categoryRevenueMap[cat] = { category: cat, revenue: 0, sales: 0, downloads: 0 };
      }
      categoryRevenueMap[cat].revenue += p.revenue;
      categoryRevenueMap[cat].sales += p.salesCount;
      categoryRevenueMap[cat].downloads += p.downloadsCount;
    });

    const categoryBreakdown = Object.values(categoryRevenueMap).sort((a, b) => b.revenue - a.revenue);

    // Unique paying customers count in period
    const payingCustomerEmails = new Set();
    ordersWithItems.forEach((o) => {
      const email = o.user?.email || o.userId;
      if (email) payingCustomerEmails.add(email.toLowerCase());
    });

    // Recent orders snippet for quick audit
    const recentOrders = ordersWithItems.slice(0, 10).map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customer: o.user?.name || o.user?.email || 'Customer',
      email: o.user?.email || o.userId,
      total: o.total,
      currency: o.currency,
      itemsCount: o.items?.length || 0,
      createdAt: o.createdAt,
    }));

    return Response.json({
      period,
      summary: {
        periodRevenue,
        periodRevenueINR,
        periodRevenueUSD,
        allTimeRevenue,
        allTimeRevenueINR,
        allTimeRevenueUSD,
        periodOrders: periodOrdersCount,
        allTimeOrders: allTimeOrdersCount,
        averageOrderValue,
        checkoutSuccessRate,
        payingCustomersCount: payingCustomerEmails.size,
        totalCustomersCount: totalProfilesCount,
        periodDownloads: periodDownloadsCount,
        allTimeDownloads: allTimeDownloadsCount,
      },
      chart: {
        labels: chartLabels,
        revenue: chartRevenue,
        orders: chartOrders,
        downloads: chartDownloads,
      },
      topProducts,
      categoryBreakdown,
      recentOrders,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return Response.json({ error: 'Failed to calculate analytics metrics' }, { status: 500 });
  }
}
