import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/payments/razorpay';
import { sendOrderDeliveryEmail } from '@/lib/email';

export async function POST(request) {
  const raw = await request.text();
  try {
    if (!verifyWebhookSignature(raw, request.headers.get('x-razorpay-signature'))) {
      return Response.json({ error: 'INVALID_SIGNATURE' }, { status: 401 });
    }
  } catch {
    return Response.json({ error: 'WEBHOOK_NOT_CONFIGURED' }, { status: 503 });
  }

  const event = JSON.parse(raw);
  const payment = event.payload?.payment?.entity;
  const orderId = payment?.order_id;
  if (!orderId) return Response.json({ received: true });

  const order = await prisma.order.findUnique({
    where: { razorpayOrderId: orderId },
    include: { items: true },
  });
  if (!order) return Response.json({ received: true });

  if (event.event === 'payment.captured' && order.status !== 'PAID') {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'PAID', paymentStatus: 'CAPTURED', razorpayPaymentId: payment.id },
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
    });

    // Send order confirmation & zip downloads email
    await sendOrderDeliveryEmail(order.id).catch((err) => console.error('Webhook order email error:', err));
  }

  if (event.event === 'payment.failed') {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'FAILED', paymentStatus: 'FAILED' },
    });
  }

  if (event.event === 'refund.processed') {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'REFUNDED', paymentStatus: 'REFUNDED' },
    });
  }

  return Response.json({ received: true });
}
