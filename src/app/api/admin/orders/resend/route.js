import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { sendOrderDeliveryEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return Response.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    const result = await sendOrderDeliveryEmail(order.id);
    if (!result) {
      return Response.json({ error: 'Failed to dispatch email' }, { status: 500 });
    }

    return Response.json({
      success: true,
      email: order.user?.email,
      message: `Delivery email sent to ${order.user?.email}`,
    });
  } catch (error) {
    console.error('[AdminResendEmail] Error:', error);
    return Response.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
