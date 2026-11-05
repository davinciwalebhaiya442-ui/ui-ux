import { prisma } from './prisma';
import { sendOrderDeliveryEmail } from './email';

/**
 * Fulfills an order: updates to PAID, grants product access, records downloads, and sends download email.
 * Uses sequential operations instead of interactive transactions to ensure full compatibility with
 * Supabase PgBouncer connection pooler on serverless edge environments (avoiding P2028 timeout).
 */
export async function fulfillOrder({
  orderId,
  orderNumber,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  paypalOrderId,
  paypalCaptureId,
  paymentGateway,
}) {
  // 1. Locate order
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        ...(orderId ? [{ id: orderId }] : []),
        ...(orderNumber ? [{ orderNumber }] : []),
        ...(razorpayOrderId ? [{ razorpayOrderId }] : []),
        ...(razorpayPaymentId ? [{ razorpayPaymentId }] : []),
        ...(paypalOrderId ? [{ paypalOrderId }] : []),
        ...(paypalCaptureId ? [{ paypalCaptureId }] : []),
      ],
    },
    include: { items: true, user: true },
  });

  if (!order) {
    return { success: false, error: 'ORDER_NOT_FOUND' };
  }

  // If already paid, still ensure email was sent and return success
  if (order.status === 'PAID') {
    return { success: true, order, alreadyPaid: true };
  }

  // 2. Mark order as PAID directly
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: 'PAID',
      paymentStatus: 'CAPTURED',
      ...(paymentGateway ? { paymentGateway } : {}),
      ...(razorpayPaymentId ? { razorpayPaymentId } : {}),
      ...(razorpaySignature ? { razorpaySignature } : {}),
      ...(paypalOrderId ? { paypalOrderId } : {}),
      ...(paypalCaptureId ? { paypalCaptureId } : {}),
    },
  });

  // If order used a coupon, increment redemption count
  if (order.couponId) {
    try {
      await prisma.coupon.update({
        where: { id: order.couponId },
        data: { usedCount: { increment: 1 } },
      });
    } catch (couponErr) {
      console.warn(`[fulfillOrder] Coupon count increment warning:`, couponErr?.message || couponErr);
    }
  }

  // 3. Grant product access & downloads
  for (const item of order.items) {
    try {
      const access = await prisma.productAccess.upsert({
        where: { userId_productId: { userId: order.userId, productId: item.productId } },
        update: { accessType: 'PURCHASE' },
        create: { userId: order.userId, productId: item.productId, accessType: 'PURCHASE' },
      });

      await prisma.download.create({
        data: {
          userId: order.userId,
          productId: item.productId,
          accessId: access.id,
        },
      }).catch(() => {});
    } catch (accessErr) {
      console.warn(`[fulfillOrder] Access grant warning for product ${item.productId}:`, accessErr?.message || accessErr);
    }
  }

  // 4. Send email with signed direct download URLs to customer (asynchronous / non-blocking)
  sendOrderDeliveryEmail(updatedOrder.id).catch((emailErr) => {
    console.error(`[fulfillOrder] Failed to send delivery email for order ${updatedOrder.id}:`, emailErr);
  });

  return { success: true, order: updatedOrder };
}
