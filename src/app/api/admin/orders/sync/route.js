import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { getRazorpay } from '@/lib/payments/razorpay';
import { fulfillOrder } from '@/lib/orders';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const pendingOrders = await prisma.order.findMany({
      where: { status: 'PENDING' },
      include: { items: true, user: true },
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    const reconciled = [];

    for (const order of pendingOrders) {
      if (!order.razorpayOrderId) continue;

      try {
        const payments = await getRazorpay().orders.fetchPayments(order.razorpayOrderId);
        const captured = payments?.items?.find((p) => p.status === 'captured');

        if (captured) {
          console.log(`[AdminOrderSync] Reconciling paid order ${order.orderNumber} (Payment: ${captured.id})`);
          const result = await fulfillOrder({
            orderId: order.id,
            razorpayPaymentId: captured.id,
            razorpaySignature: 'ADMIN_MANUAL_SYNC',
          });

          if (result.success) {
            reconciled.push({
              orderNumber: order.orderNumber,
              customerEmail: order.user?.email,
              paymentId: captured.id,
            });
          }
        }
      } catch (err) {
        console.warn(`[AdminOrderSync] Failed to check Razorpay for ${order.orderNumber}:`, err?.message || err);
      }
    }

    return Response.json({
      success: true,
      scanned: pendingOrders.length,
      reconciledCount: reconciled.length,
      reconciled,
    });
  } catch (error) {
    console.error('[AdminOrderSync] Error:', error);
    return Response.json({ error: 'Sync failed' }, { status: 500 });
  }
}
