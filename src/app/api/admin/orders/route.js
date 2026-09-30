import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.trim();

    const where = {
      ...(status && status !== 'ALL' ? { status } : {}),
      ...(search
        ? {
            OR: [
              { orderNumber: { contains: search, mode: 'insensitive' } },
              { user: { email: { contains: search, mode: 'insensitive' } } },
              { user: { name: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        user: true,
        items: true,
      },
    });

    return Response.json({ orders });
  } catch (error) {
    console.error('Orders API error:', error);
    return Response.json({ error: 'Unable to load orders' }, { status: 500 });
  }
}

export async function PATCH(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { id, status, paymentStatus } = body;

    if (!id) return Response.json({ error: 'Order ID is required' }, { status: 400 });

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
      },
      include: { user: true, items: true },
    });

    return Response.json({ order: updated });
  } catch (error) {
    console.error('Order update error:', error);
    return Response.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
