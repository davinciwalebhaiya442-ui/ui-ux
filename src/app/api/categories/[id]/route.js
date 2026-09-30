import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { categorySchema } from '@/lib/category';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  const category = await prisma.category.findFirst({
    where: {
      OR: [{ id: params.id }, { slug: params.id }],
    },
    include: { _count: { select: { products: true } } },
  });
  if (!category) return Response.json({ error: 'Category not found' }, { status: 404 });
  return Response.json({ category });
}

export async function PATCH(request, { params }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
      },
    });

    if (!existing) return Response.json({ error: 'Category not found' }, { status: 404 });

    const category = await prisma.category.update({
      where: { id: existing.id },
      data: categorySchema.partial().parse(await request.json()),
      include: { _count: { select: { products: true } } },
    });

    return Response.json({ category });
  } catch (error) {
    if (error?.code === 'P2025') return Response.json({ error: 'Category not found' }, { status: 404 });
    if (error?.code === 'P2002') return Response.json({ error: 'A category with this slug already exists' }, { status: 409 });
    return Response.json({ error: 'Unable to update category' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const rawId = params.id;
    const decodedId = decodeURIComponent(rawId);

    const category = await prisma.category.findFirst({
      where: {
        OR: [{ id: rawId }, { slug: rawId }, { id: decodedId }, { slug: decodedId }],
      },
      include: { _count: { select: { products: true } } },
    });

    if (!category) return Response.json({ error: 'Category not found' }, { status: 404 });

    if (category._count.products > 0) {
      // Reassign products to a fallback category so foreign key doesn't block deletion
      let fallback = await prisma.category.findFirst({
        where: { id: { not: category.id } },
      });
      if (!fallback) {
        fallback = await prisma.category.create({
          data: { name: 'General', slug: 'general', description: 'General category', published: true },
        });
      }
      await prisma.product.updateMany({
        where: { categoryId: category.id },
        data: { categoryId: fallback.id },
      });
    }

    await prisma.category.delete({ where: { id: category.id } });
    return Response.json({ success: true, deletedId: category.id });
  } catch (error) {
    console.error('Delete category error:', error);
    return Response.json({ error: error.message || 'Unable to delete category' }, { status: 500 });
  }
}
