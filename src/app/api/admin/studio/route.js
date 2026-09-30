import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
export async function GET(request) { const unauthorized = await requireAdmin(request); if (unauthorized) return unauthorized; return Response.json({ requests: await prisma.studioRequest.findMany({ orderBy: { createdAt: 'desc' } }) }); }
export async function PATCH(request) { const unauthorized = await requireAdmin(request); if (unauthorized) return unauthorized; const b = await request.json(); const item = await prisma.studioRequest.update({ where: { id: b.id }, data: { status: b.status, internalNotes: b.internalNotes } }); return Response.json({ request: item }); }
