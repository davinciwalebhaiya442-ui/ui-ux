import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const role = searchParams.get('role');

    const where = {
      ...(role && role !== 'ALL' ? { role } : {}),
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { name: { contains: search, mode: 'insensitive' } },
              { userId: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const users = await prisma.profile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        _count: {
          select: {
            access: true,
            downloads: true,
            orders: true,
          },
        },
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            total: true,
            currency: true,
            status: true,
            createdAt: true,
          },
        },
        access: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            product: {
              select: { name: true, slug: true, type: true },
            },
          },
        },
      },
    });

    return Response.json({ users });
  } catch (error) {
    console.error('Users API error:', error);
    return Response.json({ error: 'Unable to load users' }, { status: 500 });
  }
}
