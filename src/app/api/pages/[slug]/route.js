import { getSitePage } from '@/lib/sitePages';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const slug = params.slug;
    const page = await getSitePage(slug);
    if (!page) {
      return Response.json({ error: 'Page not found' }, { status: 404 });
    }
    return Response.json({ page });
  } catch (error) {
    console.error('Failed to get public page:', error);
    return Response.json({ error: 'Failed to get page' }, { status: 500 });
  }
}
