import { prisma } from './prisma';
import { DEFAULT_SITE_PAGES } from './sitePagesDefaults';

export async function getSitePage(slug) {
  try {
    const page = await prisma.sitePage.findUnique({
      where: { slug },
    });
    if (page) return page;
  } catch (err) {
    console.error(`[getSitePage] Error fetching ${slug}:`, err);
  }

  // Fallback to default template if exists
  return DEFAULT_SITE_PAGES[slug] || null;
}

export async function getAllSitePages() {
  try {
    const dbPages = await prisma.sitePage.findMany({
      orderBy: { slug: 'asc' },
    });

    const pageMap = new Map();

    // Fill with default slugs first
    Object.keys(DEFAULT_SITE_PAGES).forEach((slug) => {
      pageMap.set(slug, DEFAULT_SITE_PAGES[slug]);
    });

    // Override with DB values
    dbPages.forEach((p) => {
      pageMap.set(p.slug, p);
    });

    return Array.from(pageMap.values());
  } catch (err) {
    console.error('[getAllSitePages] Error:', err);
    return Object.values(DEFAULT_SITE_PAGES);
  }
}

export async function upsertSitePage(slug, data) {
  const defaults = DEFAULT_SITE_PAGES[slug] || {};
  return await prisma.sitePage.upsert({
    where: { slug },
    update: {
      title: data.title !== undefined ? data.title : defaults.title || slug,
      badge: data.badge !== undefined ? data.badge : defaults.badge || '',
      description: data.description !== undefined ? data.description : defaults.description || '',
      lastUpdated: data.lastUpdated !== undefined ? data.lastUpdated : defaults.lastUpdated || '',
      content: data.content !== undefined ? data.content : defaults.content || '',
      published: data.published !== undefined ? data.published : true,
    },
    create: {
      slug,
      title: data.title || defaults.title || slug,
      badge: data.badge || defaults.badge || '',
      description: data.description || defaults.description || '',
      lastUpdated: data.lastUpdated || defaults.lastUpdated || '',
      content: data.content || defaults.content || '',
      published: data.published !== undefined ? data.published : true,
    },
  });
}
