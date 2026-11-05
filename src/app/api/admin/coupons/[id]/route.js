import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request, { params }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = params;
    const body = await request.json().catch(() => ({}));

    const existing = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existing) {
      return Response.json({ error: 'Coupon not found.' }, { status: 404 });
    }

    const updateData = {};

    if ('isActive' in body) {
      updateData.isActive = Boolean(body.isActive);
    }

    if ('description' in body) {
      updateData.description = body.description ? String(body.description).trim() : null;
    }

    if ('maxUses' in body) {
      updateData.maxUses = body.maxUses ? Math.max(1, parseInt(body.maxUses, 10)) : null;
    }

    if ('expiresAt' in body) {
      updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
    }

    if ('minOrderInr' in body) {
      updateData.minOrderInr = body.minOrderInr ? Math.max(0, parseInt(body.minOrderInr, 10)) : 0;
    }

    if ('minOrderUsd' in body) {
      updateData.minOrderUsd = body.minOrderUsd ? Math.max(0, parseInt(body.minOrderUsd, 10)) : 0;
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    return Response.json({ success: true, coupon: updated });
  } catch (error) {
    console.error('Failed to update coupon:', error);
    return Response.json({ error: error.message || 'Failed to update coupon.' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = params;

    const existing = await prisma.coupon.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } },
    });

    if (!existing) {
      return Response.json({ error: 'Coupon not found.' }, { status: 404 });
    }

    // If already used in orders, soft-delete by deactivating to preserve order history integrity
    if (existing._count?.orders > 0) {
      await prisma.coupon.update({
        where: { id },
        data: { isActive: false },
      });
      return Response.json({ success: true, message: 'Coupon deactivated (retained in historical orders).' });
    }

    await prisma.coupon.delete({
      where: { id },
    });

    return Response.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete coupon:', error);
    return Response.json({ error: error.message || 'Failed to delete coupon.' }, { status: 500 });
  }
}
