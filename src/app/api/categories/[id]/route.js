import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { categorySchema } from '@/lib/category';

export async function GET(_request, { params }) {
  const category = await prisma.category.findUnique({ where: { slug: params.id }, include: { _count: { select: { products: true } } } });
  if (!category) return Response.json({ error: 'Category not found' }, { status: 404 });
  return Response.json({ category });
}

export async function PATCH(request, { params }) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const category = await prisma.category.update({ where: { id: params.id }, data: categorySchema.partial().parse(await request.json()), include: { _count: { select: { products: true } } } });
    return Response.json({ category });
  } catch (error) {
    if (error?.code === 'P2025') return Response.json({ error: 'Category not found' }, { status: 404 });
    if (error?.code === 'P2002') return Response.json({ error: 'A category with this slug already exists' }, { status: 409 });
    return Response.json({ error: 'Unable to update category' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const category = await prisma.category.findUnique({ where: { id: params.id }, include: { _count: { select: { products: true } } } });
    if (!category) return Response.json({ error: 'Category not found' }, { status: 404 });
    if (category._count.products > 0) return Response.json({ error: 'Reassign products before deleting this category' }, { status: 409 });
    await prisma.category.delete({ where: { id: params.id } });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Unable to delete category' }, { status: 500 });
  }
}
