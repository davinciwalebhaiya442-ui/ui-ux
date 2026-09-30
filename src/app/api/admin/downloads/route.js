import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  const downloads = await prisma.download.findMany({ orderBy: { createdAt: 'desc' }, take: 200, include: { user: true, product: true, access: true } });
  return Response.json({ downloads });
}
