import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { getAllSitePages, upsertSitePage } from '@/lib/sitePages';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const pages = await getAllSitePages();
    return Response.json({ pages });
  } catch (error) {
    console.error('Failed to load site pages:', error);
    return Response.json({ error: 'Failed to load site pages' }, { status: 500 });
  }
}

export async function POST(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const slug = String(body.slug || '').trim().toLowerCase();

    if (!slug) {
      return Response.json({ error: 'Page slug is required' }, { status: 400 });
    }

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
    console.error('Failed to save page content:', error);
    return Response.json({ error: 'Failed to save page content' }, { status: 500 });
  }
}
