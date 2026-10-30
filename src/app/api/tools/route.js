import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const tools = await prisma.tool.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  });
  return Response.json(
    { tools },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
      },
    }
  );
}

export async function POST(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;
  const b = await request.json();
  return Response.json(
    {
      tool: await prisma.tool.create({
        data: {
          name: b.name,
          slug: b.slug,
          description: b.description,
          icon: b.icon,
          image: b.image,
          url: b.url,
          featured: Boolean(b.featured),
          published: Boolean(b.published),
        },
      }),
    },
    { status: 201 }
  );
}
