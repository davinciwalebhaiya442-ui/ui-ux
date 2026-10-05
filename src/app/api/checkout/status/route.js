import { prisma } from '@/lib/prisma';
import { getRazorpay } from '@/lib/payments/razorpay';
import { fulfillOrder } from '@/lib/orders';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber')?.trim();
    const razorpayOrderId = searchParams.get('razorpayOrderId')?.trim();
    const razorpayPaymentId = searchParams.get('razorpayPaymentId')?.trim();

    if (!orderNumber && !razorpayOrderId && !razorpayPaymentId) {
      return Response.json({ error: 'MISSING_PARAMS' }, { status: 400 });
    }

    // 1. Check in database first
    let order = await prisma.order.findFirst({
      where: {
        OR: [
          ...(orderNumber ? [{ orderNumber }] : []),
          ...(razorpayOrderId ? [{ razorpayOrderId }] : []),
          ...(razorpayPaymentId ? [{ razorpayPaymentId }] : []),
        ],
      },
      include: { items: true, user: true },
    });

    if (!order) {
      return Response.json({ status: 'NOT_FOUND' }, { status: 404 });
    }

    // If already marked as PAID
    if (order.status === 'PAID') {
      return Response.json({
        status: 'PAID',
        orderNumber: order.orderNumber,
        customerEmail: order.user?.email || null,
      });
    }

    // 2. If still PENDING in DB, check Razorpay directly to see if payment was captured
    const rzpOrderId = razorpayOrderId || order.razorpayOrderId;
    let capturedPayment = null;

    if (rzpOrderId) {
      try {
        const payments = await getRazorpay().orders.fetchPayments(rzpOrderId);
        if (payments?.items?.length > 0) {
          for (const p of payments.items) {
            if (p.status === 'captured') {
              capturedPayment = p;
              break;
            }
            if (p.status === 'authorized') {
              try {
                await getRazorpay().payments.capture(p.id, p.amount, p.currency || 'INR');
                capturedPayment = p;
                break;
              } catch (capErr) {
                console.warn(`[CheckoutStatus] Auto-capture failed for ${p.id}:`, capErr?.message);
                capturedPayment = p;
                break;
              }
            }
          }
        }
      } catch (rzpErr) {
        console.warn(`[CheckoutStatus] Razorpay check error for order ${rzpOrderId}:`, rzpErr?.message || rzpErr);
      }
    }

    if (!capturedPayment && (razorpayPaymentId || order.razorpayPaymentId)) {
      const pid = razorpayPaymentId || order.razorpayPaymentId;
      try {
        const p = await getRazorpay().payments.fetch(pid);
        if (p && (p.status === 'captured' || p.status === 'authorized')) {
          if (p.status === 'authorized') {
            await getRazorpay().payments.capture(p.id, p.amount, p.currency || 'INR').catch(() => {});
          }
          capturedPayment = p;
        }
      } catch (pErr) {
        console.warn(`[CheckoutStatus] Payment fetch error for ${pid}:`, pErr?.message || pErr);
      }
    }

    if (capturedPayment) {
      console.log(`[CheckoutStatus] Auto-reconciling paid order ${order.orderNumber} via payment ${capturedPayment.id}`);
      const result = await fulfillOrder({
        orderId: order.id,
        razorpayPaymentId: capturedPayment.id,
        razorpaySignature: 'VERIFIED_VIA_STATUS_CHECK',
      });

      if (result.success) {
        return Response.json({
          status: 'PAID',
          orderNumber: order.orderNumber,
          customerEmail: order.user?.email || null,
        });
      }
    }

    // If still pending
    return Response.json({
      status: order.status,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error('[CheckoutStatus] Error:', error);
    return Response.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
