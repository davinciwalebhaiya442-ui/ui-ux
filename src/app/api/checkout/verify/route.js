import { prisma } from '@/lib/prisma';
import { verifyPaymentSignature, getRazorpay } from '@/lib/payments/razorpay';
import { fulfillOrder } from '@/lib/orders';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawOrderId = body.razorpay_order_id || body.razorpayOrderId;
    const rawPaymentId = body.razorpay_payment_id || body.razorpayPaymentId;
    const rawSignature = body.razorpay_signature || body.razorpaySignature;

    if (!rawOrderId && !rawPaymentId) {
      console.error('Missing Razorpay verification keys:', body);
      return Response.json({ error: 'MISSING_PAYMENT_DETAILS' }, { status: 400 });
    }

    const cleanOrderId = rawOrderId ? String(rawOrderId).trim() : '';
    const cleanPaymentId = rawPaymentId ? String(rawPaymentId).trim() : '';
    const cleanSignature = rawSignature ? String(rawSignature).trim() : '';

    // 1. Locate corresponding order in database
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(cleanOrderId ? [{ razorpayOrderId: cleanOrderId }] : []),
          ...(cleanPaymentId ? [{ razorpayPaymentId: cleanPaymentId }] : []),
        ],
      },
      include: { items: true, user: true },
    });

    if (!order) {
      console.error('Order not found in DB:', { cleanOrderId, cleanPaymentId });
      return Response.json({ error: 'ORDER_NOT_FOUND' }, { status: 404 });
    }

    // Already paid & confirmed
    if (order.status === 'PAID') {
      return Response.json({ success: true, orderNumber: order.orderNumber });
    }

    // 2. Cryptographic signature check
    let isValid = false;
    if (cleanSignature && cleanOrderId && cleanPaymentId) {
      try {
        isValid = verifyPaymentSignature(cleanOrderId, cleanPaymentId, cleanSignature);
      } catch (sigErr) {
        console.warn('Signature verification exception:', sigErr);
      }
    }

    // 3. Fallback verification directly with Razorpay API (with retry loop for async gateway capture)
    if (!isValid && cleanPaymentId) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const payment = await getRazorpay().payments.fetch(cleanPaymentId);
          if (payment) {
            const matchesOrder =
              !payment.order_id ||
              payment.order_id === cleanOrderId ||
              payment.notes?.orderNumber === order.orderNumber;

            if (matchesOrder) {
              if (payment.status === 'captured') {
                isValid = true;
                break;
              }
              if (payment.status === 'authorized') {
                try {
                  await getRazorpay().payments.capture(cleanPaymentId, payment.amount, payment.currency || 'INR');
                  isValid = true;
                  break;
                } catch (capErr) {
                  console.warn('Payment capture attempt exception:', capErr);
                  isValid = true;
                  break;
                }
              }
            }
          }
        } catch (rzpErr) {
          console.error(`Razorpay payment fetch attempt ${attempt} failed:`, rzpErr?.message || rzpErr);
        }

        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }
    }

    if (!isValid) {
      console.error('Payment verification failed for order:', cleanOrderId, cleanPaymentId);
      return Response.json({ error: 'PAYMENT_VERIFICATION_FAILED' }, { status: 400 });
    }

    // 4. Fulfill order, grant downloads, and dispatch delivery email
    const fulfillment = await fulfillOrder({
      orderId: order.id,
      razorpayPaymentId: cleanPaymentId,
      razorpaySignature: cleanSignature || 'VERIFIED_VIA_RAZORPAY_API',
    });

    if (!fulfillment.success) {
      console.error('Fulfillment error in verify route:', fulfillment.error);
      return Response.json({ error: 'FULFILLMENT_FAILED' }, { status: 500 });
    }

    return Response.json({ success: true, orderNumber: fulfillment.order?.orderNumber || order.orderNumber });
  } catch (error) {
    console.error('Payment verification top-level error:', error);
    return Response.json({ error: 'PAYMENT_VERIFICATION_FAILED' }, { status: 400 });
  }
}
