import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { categorySchema } from '@/lib/category';

export const dynamic = 'force-dynamic';

export async function GET() {
  const categories = await prisma.category.findMany({ include: { _count: { select: { products: true } } }, orderBy: { name: 'asc' } });
  return Response.json(
    { categories },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}

export async function POST(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const category = await prisma.category.create({ data: categorySchema.parse(await request.json()) });
    return Response.json({ category }, { status: 201 });
  } catch (error) {
    if (error?.code === 'P2002') return Response.json({ error: 'A category with this slug already exists' }, { status: 409 });
    if (error?.name === 'ZodError') return Response.json({ error: 'Invalid category data', details: error.issues }, { status: 400 });
    return Response.json({ error: 'Unable to create category' }, { status: 500 });
  }
}
