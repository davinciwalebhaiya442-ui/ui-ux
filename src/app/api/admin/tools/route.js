import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const tools = await prisma.tool.findMany({ orderBy: { createdAt: 'desc' } });
    return Response.json({ tools });
  } catch (error) {
    console.error('Tools GET error:', error);
    return Response.json({ error: 'Failed to load tools' }, { status: 500 });
  }
}

export async function POST(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const tool = await prisma.tool.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        icon: body.icon || null,
        image: body.image || null,
        url: body.url || null,
        featured: Boolean(body.featured),
        published: body.published !== false,
      },
    });
    return Response.json({ tool }, { status: 201 });
  } catch (error) {
    console.error('Tools POST error:', error);
    return Response.json(
      { error: error?.code === 'P2002' ? 'A tool with this slug already exists' : 'Failed to create tool' },
      { status: error?.code === 'P2002' ? 409 : 400 }
    );
  }
}

export async function PATCH(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) return Response.json({ error: 'Tool ID required' }, { status: 400 });

    const tool = await prisma.tool.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.slug ? { slug: data.slug } : {}),
        ...(data.description ? { description: data.description } : {}),
        ...(data.icon !== undefined ? { icon: data.icon } : {}),
        ...(data.image !== undefined ? { image: data.image } : {}),
        ...(data.url !== undefined ? { url: data.url } : {}),
        ...(data.featured !== undefined ? { featured: Boolean(data.featured) } : {}),
        ...(data.published !== undefined ? { published: Boolean(data.published) } : {}),
      },
    });
    return Response.json({ tool });
  } catch (error) {
    console.error('Tools PATCH error:', error);
    return Response.json({ error: 'Failed to update tool' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return Response.json({ error: 'Tool ID required' }, { status: 400 });

    await prisma.tool.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    console.error('Tools DELETE error:', error);
    return Response.json({ error: 'Failed to delete tool' }, { status: 500 });
  }
}
