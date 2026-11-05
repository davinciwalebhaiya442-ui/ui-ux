import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const [coupons, statsResult] = await Promise.all([
      prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { orders: { where: { status: 'PAID' } } },
          },
        },
      }),
      prisma.order.aggregate({
        where: {
          status: 'PAID',
          discount: { gt: 0 },
        },
        _sum: {
          discount: true,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    const totalCoupons = coupons.length;
    const activeCoupons = coupons.filter((c) => {
      if (!c.isActive) return false;
      if (c.expiresAt && new Date(c.expiresAt) < new Date()) return false;
      if (c.maxUses && c.usedCount >= c.maxUses) return false;
      return true;
    }).length;

    const totalRedemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
    const totalDiscountGiven = statsResult._sum.discount || 0;

    return Response.json({
      coupons,
      stats: {
        totalCoupons,
        activeCoupons,
        totalRedemptions,
        totalDiscountGiven,
      },
    });
  } catch (error) {
    console.error('Failed to fetch coupons:', error);
    return Response.json({ error: 'Failed to fetch coupons.' }, { status: 500 });
  }
}

export async function POST(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json().catch(() => ({}));
    let {
      code,
      description = '',
      discountType = 'PERCENTAGE',
      discountPercent = null,
      discountInr = null,
      discountUsd = null,
      minOrderInr = 0,
      minOrderUsd = 0,
      maxUses = null,
      productId = null,
      expiresAt = null,
      isActive = true,
    } = body || {};

    const cleanCode = (code || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!cleanCode || cleanCode.length < 2) {
      return Response.json(
        { error: 'Coupon code must be at least 2 alphanumeric characters.' },
        { status: 400 }
      );
    }

    // Check code uniqueness
    const existing = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });
    if (existing) {
      return Response.json(
        { error: `Coupon code "${cleanCode}" already exists. Please choose a unique code.` },
        { status: 400 }
      );
    }

    if (discountType === 'PERCENTAGE') {
      const p = parseInt(discountPercent, 10);
      if (isNaN(p) || p < 1 || p > 100) {
        return Response.json(
          { error: 'Discount percentage must be between 1% and 100%.' },
          { status: 400 }
        );
      }
      discountPercent = p;
      discountInr = null;
      discountUsd = null;
    } else {
      discountType = 'FIXED';
      const inr = discountInr ? parseInt(discountInr, 10) : 0;
      const usd = discountUsd ? parseInt(discountUsd, 10) : 0;
      if (inr <= 0 && usd <= 0) {
        return Response.json(
          { error: 'Please enter a valid fixed discount amount for INR (₹) or USD ($).' },
          { status: 400 }
        );
      }
      discountInr = inr > 0 ? inr : Math.max(1, Math.round(usd * 83));
      discountUsd = usd > 0 ? usd : Math.max(1, Math.round(inr / 83));
      discountPercent = null;
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        description: description ? description.trim() : null,
        discountType,
        discountPercent,
        discountInr,
        discountUsd,
        minOrderInr: minOrderInr ? Math.max(0, parseInt(minOrderInr, 10)) : 0,
        minOrderUsd: minOrderUsd ? Math.max(0, parseInt(minOrderUsd, 10)) : 0,
        maxUses: maxUses ? Math.max(1, parseInt(maxUses, 10)) : null,
        productId: productId ? String(productId).trim() : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: Boolean(isActive),
      },
    });

    return Response.json({ success: true, coupon });
  } catch (error) {
    console.error('Failed to create coupon:', error);
    return Response.json({ error: error.message || 'Failed to create coupon.' }, { status: 500 });
  }
}
