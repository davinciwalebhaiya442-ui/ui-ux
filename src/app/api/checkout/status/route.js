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
    if (rzpOrderId) {
      try {
        const payments = await getRazorpay().orders.fetchPayments(rzpOrderId);
        const captured = payments?.items?.find((p) => p.status === 'captured');

        if (captured) {
          console.log(`[CheckoutStatus] Auto-reconciling paid order ${order.orderNumber} via payment ${captured.id}`);
          const result = await fulfillOrder({
            orderId: order.id,
            razorpayPaymentId: captured.id,
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
      } catch (rzpErr) {
        console.warn(`[CheckoutStatus] Razorpay check error for ${rzpOrderId}:`, rzpErr?.message || rzpErr);
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
