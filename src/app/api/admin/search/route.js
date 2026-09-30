import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return Response.json({ results: { products: [], users: [], orders: [], content: [], studio: [] } });
  }

  try {
    const [products, users, orders, content, studio] = await Promise.all([
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 6,
        select: { id: true, name: true, slug: true, type: true, price: true, published: true },
      }),
      prisma.profile.findMany({
        where: {
          OR: [
            { email: { contains: q, mode: 'insensitive' } },
            { name: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 6,
        select: { userId: true, name: true, email: true, role: true },
      }),
      prisma.order.findMany({
        where: {
          OR: [
            { orderNumber: { contains: q, mode: 'insensitive' } },
            { user: { email: { contains: q, mode: 'insensitive' } } },
          ],
        },
        take: 6,
        select: { id: true, orderNumber: true, total: true, currency: true, status: true, createdAt: true },
      }),
      prisma.contentPost.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 6,
        select: { id: true, title: true, slug: true, published: true },
      }),
      prisma.studioRequest.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { requestType: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 6,
        select: { id: true, name: true, email: true, requestType: true, status: true },
      }),
    ]);

    return Response.json({
      results: {
        products,
        users,
        orders,
        content,
        studio,
      },
    });
  } catch (error) {
    console.error('Admin search error:', error);
    return Response.json({ error: 'Search failed' }, { status: 500 });
  }
}
