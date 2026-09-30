import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search')?.trim();

    const where = {
      ...(categoryId && categoryId !== 'ALL' ? { categoryId } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { slug: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [posts, categories] = await Promise.all([
      prisma.contentPost.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
      prisma.contentCategory.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { posts: true } } },
      }),
    ]);

    return Response.json({ posts, categories });
  } catch (error) {
    console.error('Content API GET error:', error);
    return Response.json({ error: 'Failed to load content' }, { status: 500 });
  }
}

export async function POST(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const post = await prisma.contentPost.create({
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt || null,
        content: body.content,
        categoryId: body.categoryId,
        tags: Array.isArray(body.tags) ? body.tags : [],
        published: Boolean(body.published),
        featured: Boolean(body.featured),
        coverImage: body.coverImage || null,
      },
      include: { category: true },
    });

    return Response.json({ post }, { status: 201 });
  } catch (error) {
    console.error('Content API POST error:', error);
    return Response.json(
      { error: error?.code === 'P2002' ? 'A post with this slug already exists' : 'Failed to create post' },
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

    if (!id) return Response.json({ error: 'Post ID is required' }, { status: 400 });

    const post = await prisma.contentPost.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.slug ? { slug: data.slug } : {}),
        ...(data.excerpt !== undefined ? { excerpt: data.excerpt } : {}),
        ...(data.content ? { content: data.content } : {}),
        ...(data.categoryId ? { categoryId: data.categoryId } : {}),
        ...(data.tags ? { tags: Array.isArray(data.tags) ? data.tags : [] } : {}),
        ...(data.published !== undefined ? { published: Boolean(data.published) } : {}),
        ...(data.featured !== undefined ? { featured: Boolean(data.featured) } : {}),
        ...(data.coverImage !== undefined ? { coverImage: data.coverImage } : {}),
      },
      include: { category: true },
    });

    return Response.json({ post });
  } catch (error) {
    console.error('Content API PATCH error:', error);
    return Response.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return Response.json({ error: 'Post ID is required' }, { status: 400 });

    await prisma.contentPost.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    console.error('Content API DELETE error:', error);
    return Response.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
