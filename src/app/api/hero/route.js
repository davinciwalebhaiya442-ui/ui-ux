import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const DEFAULT_HERO_SETTINGS = {
  id: 'default',
  heading: 'DAVINCI WALE BHAIYA',
  description: '',
  badge: 'ECOSYSTEM',
  heroImage: '/hero/2.jpg',
  fontFamily: 'sans',
  textColor: '#ffffff',
  primaryButtonText: 'Work With Us',
  primaryButtonLink: '#catalogue',
};

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
