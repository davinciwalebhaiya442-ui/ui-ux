import { prisma } from './prisma';

/**
 * Validates a coupon code and calculates the exact discount amount and final total.
 * Safe for serverless edge / node runtimes.
 *
 * @param {Object} params
 * @param {string} params.code - The raw coupon code
 * @param {string[]} params.productIds - Array of product IDs in cart
 * @param {'INR' | 'USD'} params.currency - 'INR' or 'USD'
 * @param {number} params.subtotal - The order subtotal
 */
export async function validateAndCalculateCoupon({
  code,
  productIds = [],
  currency = 'INR',
  subtotal = 0,
}) {
  const normalizedCode = (code || '').trim().toUpperCase();

  if (!normalizedCode) {
    return { valid: false, error: 'Please enter a coupon code.' };
  }

  const numSubtotal = Number(subtotal) || 0;
  if (numSubtotal <= 0) {
    return { valid: false, error: 'Invalid order amount.' };
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: normalizedCode },
  });

  if (!coupon) {
    return { valid: false, error: 'Invalid promo code. Please check and try again.' };
  }

  if (!coupon.isActive) {
    return { valid: false, error: 'This coupon code is no longer active.' };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, error: 'This coupon code has expired.' };
  }

  if (coupon.maxUses !== null && coupon.maxUses !== undefined && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: 'This coupon has reached its maximum redemption limit.' };
  }

  if (coupon.productId && (!productIds.length || !productIds.includes(coupon.productId))) {
    return { valid: false, error: 'This coupon code is not applicable for this product.' };
  }

  // Minimum order validation
  const curr = (currency || 'INR').toUpperCase();
  if (curr === 'INR' && coupon.minOrderInr && coupon.minOrderInr > 0 && numSubtotal < coupon.minOrderInr) {
    return { valid: false, error: `Minimum order of ₹${coupon.minOrderInr} required to use this code.` };
  }
  if (curr === 'USD' && coupon.minOrderUsd && coupon.minOrderUsd > 0 && numSubtotal < coupon.minOrderUsd) {
    return { valid: false, error: `Minimum order of $${coupon.minOrderUsd} required to use this code.` };
  }

  // Calculate discount amount
  let discountAmount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    const percent = Math.min(100, Math.max(1, Number(coupon.discountPercent || 0)));
    discountAmount = Math.round((numSubtotal * percent) / 100);
  } else {
    // FIXED amount
    const rawFixed = curr === 'USD' ? Number(coupon.discountUsd || 0) : Number(coupon.discountInr || 0);
    discountAmount = Math.max(0, rawFixed);
  }

  if (discountAmount <= 0) {
    return { valid: false, error: 'Coupon does not yield any discount for this order.' };
  }

  // Gateways (Razorpay & PayPal) require minimum 1 unit (₹1 or $1) to process an order
  const finalTotal = Math.max(1, numSubtotal - discountAmount);
  // Re-adjust discount amount if it reduced price below 1 unit
  const effectiveDiscount = numSubtotal - finalTotal;

  const successMessage =
    coupon.discountType === 'PERCENTAGE'
      ? `${coupon.discountPercent}% discount applied!`
      : `${curr === 'USD' ? '$' : '₹'}${effectiveDiscount} discount applied!`;

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountPercent: coupon.discountPercent,
      discountInr: coupon.discountInr,
      discountUsd: coupon.discountUsd,
    },
    discountAmount: effectiveDiscount,
    subtotal: numSubtotal,
    finalTotal,
    message: successMessage,
  };
}
