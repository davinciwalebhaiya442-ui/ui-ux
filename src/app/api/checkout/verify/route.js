import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/account';
import { verifyPaymentSignature } from '@/lib/payments/razorpay';
import { sendOrderDeliveryEmail } from '@/lib/email';

export async function POST(request) {
  const auth = await requireUser();
  if (auth.error) return auth.error;
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await request.json();
    const order = await prisma.order.findFirst({ where: { razorpayOrderId, userId: auth.user.id }, include: { items: true } });
    if (!order) return Response.json({ error: 'ORDER_NOT_FOUND' }, { status: 404 });
    if (order.status === 'PAID') return Response.json({ success: true, orderNumber: order.orderNumber });
    if (!verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) return Response.json({ error: 'PAYMENT_VERIFICATION_FAILED' }, { status: 400 });

    const paid = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: order.id },
        data: { status: 'PAID', paymentStatus: 'CAPTURED', razorpayPaymentId, razorpaySignature },
      });
      for (const item of order.items) {
        await tx.productAccess.upsert({
          where: { userId_productId: { userId: auth.user.id, productId: item.productId } },
          update: { accessType: 'PURCHASE' },
          create: { userId: auth.user.id, productId: item.productId, accessType: 'PURCHASE' },
        });
      }
      return updated;
    });

    // Deliver product zip download links directly to customer email
    await sendOrderDeliveryEmail(paid.id).catch((err) => console.error('Failed to send order email:', err));

    return Response.json({ success: true, orderNumber: paid.orderNumber });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'PAYMENT_VERIFICATION_FAILED' }, { status: 400 });
  }
}
