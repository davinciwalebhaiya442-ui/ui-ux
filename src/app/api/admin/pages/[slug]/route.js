import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { getSitePage, upsertSitePage } from '@/lib/sitePages';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const slug = params.slug;
    const page = await getSitePage(slug);
    if (!page) {
      return Response.json({ error: 'Page not found' }, { status: 404 });
    }
    return Response.json({ page });
  } catch (error) {
    console.error('Failed to get page:', error);
    return Response.json({ error: 'Failed to get page' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const slug = params.slug;
    const body = await request.json();

    const page = await upsertSitePage(slug, body);

    try {
      revalidatePath(`/${slug}`);
      revalidatePath('/about');
      revalidatePath('/contact');
      revalidatePath('/terms');
      revalidatePath('/privacy');
      revalidatePath('/refund-policy');
      revalidatePath('/shipping-policy');
    } catch {}

    return Response.json({ page, success: true });
  } catch (error) {
    console.error('Failed to update page:', error);
    return Response.json({ error: 'Failed to update page' }, { status: 500 });
  }
}
