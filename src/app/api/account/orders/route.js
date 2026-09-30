import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/account';
export async function GET(request) { const auth = await requireUser(); if (auth.error) return auth.error; const orders = await prisma.order.findMany({ where: { userId: auth.user.id }, include: { items: true }, orderBy: { createdAt: 'desc' } }); return Response.json({ orders }); }
