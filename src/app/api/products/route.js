import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { parseBody, toFrontendProduct } from '@/lib/product';

import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') || 20)));
    const search = searchParams.get('search')?.trim();
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const featured = searchParams.get('featured');
    const where = {
      ...(type ? { type: type.toUpperCase() } : {}),
      ...(featured ? { featured: featured === 'true' } : {}),
      ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }] } : {}),
      ...(category ? { category: { slug: category } } : {}),
    };

    const products = await prisma.product.findMany({
      where,
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    let total = products.length;
    if (page > 1 || products.length === limit) {
      total = await prisma.product.count({ where });
    }

    return Response.json(
      { products: products.map(toFrontendProduct), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=59',
        },
      }
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Unable to load products' }, { status: 500 });
  }
}

export async function POST(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const data = parseBody(await request.json());
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) return Response.json({ error: 'Category not found' }, { status: 400 });
    const product = await prisma.product.create({ data, include: { category: true } });
    try {
      revalidatePath('/');
      revalidatePath('/api/products');
    } catch {}
    return Response.json({ product: toFrontendProduct(product) }, { status: 201 });
  } catch (error) {
    if (error?.code === 'P2002') return Response.json({ error: 'A product with this slug already exists' }, { status: 409 });
    if (error?.name === 'ZodError') return Response.json({ error: 'Invalid product data', details: error.issues }, { status: 400 });
    console.error(error);
    return Response.json({ error: 'Unable to create product' }, { status: 500 });
  }
}
