import { prisma } from '@/lib/prisma';
import { validateAndCalculateCoupon } from '@/lib/coupons';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { code, productIds, currency = 'INR' } = body || {};

    if (!code || typeof code !== 'string') {
      return Response.json({ valid: false, error: 'Please enter a coupon code.' }, { status: 400 });
    }

    if (!Array.isArray(productIds) || !productIds.length) {
      return Response.json({ valid: false, error: 'No products in checkout.' }, { status: 400 });
    }

    // 1. Fetch products from database to calculate genuine subtotal
    const products = await prisma.product.findMany({
      where: {
        OR: [{ id: { in: productIds } }, { slug: { in: productIds } }],
        published: true,
      },
    });

    if (!products.length) {
      return Response.json({ valid: false, error: 'Product not found.' }, { status: 404 });
    }

    const curr = (currency || 'INR').toUpperCase();
    let subtotal = 0;
    if (curr === 'USD') {
      subtotal = products.reduce((sum, p) => {
        const explicitUSD = Number(p.priceUSD || 0);
        if (explicitUSD > 0) return sum + explicitUSD;
        return sum + Math.max(1, Math.round(Number(p.price || 0) / 83));
      }, 0);
    } else {
      subtotal = products.reduce((sum, p) => sum + Number(p.price || 0), 0);
    }

    // 2. Validate and calculate discount
    const result = await validateAndCalculateCoupon({
      code,
      productIds: products.map((p) => p.id),
      currency: curr,
      subtotal,
    });

    if (!result.valid) {
      return Response.json({ valid: false, error: result.error }, { status: 400 });
    }

    return Response.json({
      valid: true,
      code: result.coupon.code,
      discountType: result.coupon.discountType,
      discountPercent: result.coupon.discountPercent,
      discountAmount: result.discountAmount,
      subtotal: result.subtotal,
      finalTotal: result.finalTotal,
      currency: curr,
      message: result.message,
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return Response.json({ valid: false, error: 'Unable to validate coupon code.' }, { status: 500 });
  }
}
