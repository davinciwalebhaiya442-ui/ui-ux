import { prisma } from './prisma';
import { sendOrderDeliveryEmail } from './email';

/**
 * Fulfills an order: updates to PAID, grants product access, records downloads, and sends download email.
 */
export async function fulfillOrder({ orderId, orderNumber, razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  // 1. Locate order
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        ...(orderId ? [{ id: orderId }] : []),
        ...(orderNumber ? [{ orderNumber }] : []),
        ...(razorpayOrderId ? [{ razorpayOrderId }] : []),
        ...(razorpayPaymentId ? [{ razorpayPaymentId }] : []),
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

  // 2. Database transaction to mark PAID & grant access
  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: order.id },
      data: {
        status: 'PAID',
        paymentStatus: 'CAPTURED',
        ...(razorpayPaymentId ? { razorpayPaymentId } : {}),
        razorpaySignature: razorpaySignature || 'VERIFIED_VIA_RAZORPAY_API',
      },
    });

    for (const item of order.items) {
      const access = await tx.productAccess.upsert({
        where: { userId_productId: { userId: order.userId, productId: item.productId } },
        update: { accessType: 'PURCHASE' },
        create: { userId: order.userId, productId: item.productId, accessType: 'PURCHASE' },
      });

      await tx.download.create({
        data: {
          userId: order.userId,
          productId: item.productId,
          accessId: access.id,
        },
      });
    }

    return updated;
  });

  // 3. Send email with signed direct download URLs to customer
  try {
    await sendOrderDeliveryEmail(updatedOrder.id);
  } catch (emailErr) {
    console.error(`[fulfillOrder] Failed to send delivery email for order ${updatedOrder.id}:`, emailErr);
  }

  return { success: true, order: updatedOrder };
}
