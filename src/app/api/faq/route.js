import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const faqs = await prisma.faq.findMany({
    where: { published: true },
    orderBy: { sortOrder: 'asc' },
  });
  return Response.json(
    { faqs },
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
      faq: await prisma.faq.create({
        data: {
          question: b.question,
          answer: b.answer,
          category: b.category,
          sortOrder: Number(b.sortOrder || 0),
          published: Boolean(b.published),
        },
      }),
    },
    { status: 201 }
  );
}
