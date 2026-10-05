import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/payments/razorpay';
import { fulfillOrder } from '@/lib/orders';

export async function POST(request) {
  const raw = await request.text();
  try {
    if (!verifyWebhookSignature(raw, request.headers.get('x-razorpay-signature'))) {
      return Response.json({ error: 'INVALID_SIGNATURE' }, { status: 401 });
    }
  } catch {
    return Response.json({ error: 'WEBHOOK_NOT_CONFIGURED' }, { status: 503 });
  }

  try {
    const event = JSON.parse(raw);
    const payment = event.payload?.payment?.entity;
    const orderPayload = event.payload?.order?.entity;
    const orderId = payment?.order_id || orderPayload?.id;
    const paymentId = payment?.id;

    if (!orderId) {
      return Response.json({ received: true });
    }

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      console.log(`[Webhook] Processing ${event.event} for Razorpay order: ${orderId}`);
      await fulfillOrder({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: 'VERIFIED_VIA_RAZORPAY_WEBHOOK',
      });
    }

    if (event.event === 'payment.failed') {
      const order = await prisma.order.findUnique({
        where: { razorpayOrderId: orderId },
      });
      if (order && order.status !== 'PAID') {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'FAILED', paymentStatus: 'FAILED' },
        });
      }
    }

    if (event.event === 'refund.processed') {
      const order = await prisma.order.findUnique({
        where: { razorpayOrderId: orderId },
      });
      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'REFUNDED', paymentStatus: 'REFUNDED' },
        });
      }
    }
  } catch (err) {
    console.error('[Webhook] Error processing event:', err);
  }

  return Response.json({ received: true });
}
