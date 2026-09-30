import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  const users = await prisma.profile.findMany({ orderBy: { createdAt: 'desc' }, select: { userId: true, name: true, email: true, role: true, createdAt: true, _count: { select: { access: true, downloads: true } } } });
  return Response.json({ users });
}
