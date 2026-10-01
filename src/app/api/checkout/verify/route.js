import { prisma } from '@/lib/prisma';
import { verifyPaymentSignature } from '@/lib/payments/razorpay';
import { sendOrderDeliveryEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await request.json();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return Response.json({ error: 'MISSING_PAYMENT_DETAILS' }, { status: 400 });
    }

    // Verify cryptographic payment signature from Razorpay
    const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      return Response.json({ error: 'PAYMENT_VERIFICATION_FAILED' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { razorpayOrderId },
      include: { items: true, user: true },
    });

    if (!order) {
      return Response.json({ error: 'ORDER_NOT_FOUND' }, { status: 404 });
    }

    if (order.status === 'PAID') {
      return Response.json({ success: true, orderNumber: order.orderNumber });
    }

    const paid = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          paymentStatus: 'CAPTURED',
          razorpayPaymentId,
          razorpaySignature,
        },
      });

      for (const item of order.items) {
        await tx.productAccess.upsert({
          where: { userId_productId: { userId: order.userId, productId: item.productId } },
          update: { accessType: 'PURCHASE' },
          create: { userId: order.userId, productId: item.productId, accessType: 'PURCHASE' },
        });
      }

      return updated;
    });

    // Deliver product zip download links directly to customer email via Resend
    try {
      await sendOrderDeliveryEmail(paid.id);
    } catch (emailErr) {
      console.error('Failed to send order email:', emailErr);
    }

    return Response.json({ success: true, orderNumber: paid.orderNumber });
  } catch (error) {
    console.error('Payment verification error:', error);
    return Response.json({ error: 'PAYMENT_VERIFICATION_FAILED' }, { status: 400 });
  }
}
