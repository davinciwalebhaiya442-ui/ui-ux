import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/account';
export async function GET(request, { params }) { const auth = await requireUser(); if (auth.error) return auth.error; const order = await prisma.order.findFirst({ where: { orderNumber: params.orderNumber, userId: auth.user.id }, include: { items: true } }); if (!order) return Response.json({ error: 'ORDER_NOT_FOUND' }, { status: 404 }); return Response.json({ order }); }
