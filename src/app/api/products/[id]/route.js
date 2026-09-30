import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { parseBody, toFrontendProduct } from '@/lib/product';

export async function GET(_request, { params }) {
  const product = await prisma.product.findUnique({ where: { slug: params.id }, include: { category: true } });
  if (!product || !product.published) return Response.json({ error: 'Product not found' }, { status: 404 });
  return Response.json({ product: toFrontendProduct(product) });
}

export async function PATCH(request, { params }) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const data = parseBody(await request.json(), true);
    const product = await prisma.product.update({ where: { id: params.id }, data, include: { category: true } });
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
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    await prisma.product.delete({ where: { id: params.id } });
    return Response.json({ success: true });
  } catch (error) {
    if (error?.code === 'P2025') return Response.json({ error: 'Product not found' }, { status: 404 });
    return Response.json({ error: 'Unable to delete product' }, { status: 500 });
  }
}
