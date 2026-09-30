import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const faqs = await prisma.faq.findMany({ orderBy: { sortOrder: 'asc' } });
    return Response.json({ faqs });
  } catch (error) {
    console.error('FAQ GET error:', error);
    return Response.json({ error: 'Failed to load FAQs' }, { status: 500 });
  }
}

export async function POST(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const count = await prisma.faq.count();
    const faq = await prisma.faq.create({
      data: {
        question: body.question,
        answer: body.answer,
        category: body.category || 'General',
        sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : count,
        published: body.published !== false,
      },
    });
    return Response.json({ faq }, { status: 201 });
  } catch (error) {
    console.error('FAQ POST error:', error);
    return Response.json({ error: 'Failed to create FAQ' }, { status: 400 });
  }
}

export async function PATCH(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) return Response.json({ error: 'FAQ ID required' }, { status: 400 });

    const faq = await prisma.faq.update({
      where: { id },
      data: {
        ...(data.question ? { question: data.question } : {}),
        ...(data.answer ? { answer: data.answer } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: Number(data.sortOrder) } : {}),
        ...(data.published !== undefined ? { published: Boolean(data.published) } : {}),
      },
    });
    return Response.json({ faq });
  } catch (error) {
    console.error('FAQ PATCH error:', error);
    return Response.json({ error: 'Failed to update FAQ' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return Response.json({ error: 'FAQ ID required' }, { status: 400 });

    await prisma.faq.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    console.error('FAQ DELETE error:', error);
    return Response.json({ error: 'Failed to delete FAQ' }, { status: 500 });
  }
}
