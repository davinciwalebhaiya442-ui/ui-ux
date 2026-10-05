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
    await fulfillOrder({
      orderId: order.id,
      razorpayPaymentId: payment.id,
      razorpaySignature: 'WEBHOOK_VERIFIED',
    });
  }

  if (event.event === 'payment.failed') {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'FAILED', paymentStatus: 'FAILED' },
    }).catch(() => {});
  }

  if (event.event === 'refund.processed') {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'REFUNDED', paymentStatus: 'REFUNDED' },
    }).catch(() => {});
  }

  return Response.json({ received: true });
}
