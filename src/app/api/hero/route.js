import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

import { DEFAULT_HERO_SETTINGS } from '@/lib/hero';

export { DEFAULT_HERO_SETTINGS };

export async function GET() {
  try {
    const setting = await prisma.heroSetting.findUnique({
      where: { id: 'default' },
    });
    return Response.json(
      { hero: setting || DEFAULT_HERO_SETTINGS },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('Failed to load hero settings, returning default fallback:', error);
    return Response.json({ hero: DEFAULT_HERO_SETTINGS });
  }
}
