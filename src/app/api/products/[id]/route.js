import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { parseBody, toFrontendProduct } from '@/lib/product';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { id: params.id },
        { slug: params.id },
      ],
    },
    include: { category: true },
  });

  if (!product || !product.published) {
    return Response.json({ error: 'Product not found' }, { status: 404 });
  }

  return Response.json({ product: toFrontendProduct(product) });
}

export async function PATCH(request, { params }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const data = parseBody(await request.json(), true);

    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { id: params.id },
          { slug: params.id },
        ],
      },
    });

    if (!existing) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    const product = await prisma.product.update({
      where: { id: existing.id },
      data,
      include: { category: true },
    });

    return Response.json({ product: toFrontendProduct(product) });
  } catch (error) {
    if (error?.code === 'P2025') return Response.json({ error: 'Product not found' }, { status: 404 });
    if (error?.code === 'P2002') return Response.json({ error: 'A product with this slug already exists' }, { status: 409 });
    if (error?.name === 'ZodError') return Response.json({ error: 'Invalid product data', details: error.issues }, { status: 400 });
    console.error(error);
    return Response.json({ error: 'Unable to update product' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { id: params.id },
          { slug: params.id },
        ],
      },
    });

    if (!existing) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    await prisma.product.delete({ where: { id: existing.id } });
    return Response.json({ success: true });
  } catch (error) {
    if (error?.code === 'P2025') return Response.json({ error: 'Product not found' }, { status: 404 });
    console.error(error);
    return Response.json({ error: 'Unable to delete product' }, { status: 500 });
  }
}
