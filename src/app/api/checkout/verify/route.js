import { prisma } from '@/lib/prisma';
import { verifyPaymentSignature, getRazorpay } from '@/lib/payments/razorpay';
import { sendOrderDeliveryEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const body = await request.json();
    const razorpayOrderId = body.razorpay_order_id || body.razorpayOrderId;
    const razorpayPaymentId = body.razorpay_payment_id || body.razorpayPaymentId;
    const razorpaySignature = body.razorpay_signature || body.razorpaySignature;

    if (!razorpayOrderId || !razorpayPaymentId) {
      console.error('Missing Razorpay verification keys:', body);
      return Response.json({ error: 'MISSING_PAYMENT_DETAILS' }, { status: 400 });
    }

    // Verify cryptographic payment signature from Razorpay
    let isValid = false;
    if (razorpaySignature) {
      try {
        isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
      } catch (sigErr) {
        console.warn('Signature verification exception:', sigErr);
      }
    }

    // Direct fallback verification with Razorpay API
    if (!isValid) {
      try {
        const payment = await getRazorpay().payments.fetch(razorpayPaymentId);
        if (
          payment &&
          payment.order_id === razorpayOrderId &&
          (payment.status === 'captured' || payment.status === 'authorized')
        ) {
          isValid = true;
        }
      } catch (rzpErr) {
        console.error('Razorpay direct payment fetch check failed:', rzpErr);
      }
    }

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
          razorpaySignature: razorpaySignature || 'VERIFIED_VIA_RAZORPAY_API',
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
