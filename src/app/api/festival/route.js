import { prisma } from '@/lib/prisma';
import { DEFAULT_FESTIVAL_SETTINGS } from '@/lib/festival';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const setting = await prisma.festivalSetting.findUnique({
      where: { id: 'default' },
    });
    return Response.json(
      { festival: setting || DEFAULT_FESTIVAL_SETTINGS },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Failed to load festival settings, using default fallback:', error);
    return Response.json(
      { festival: DEFAULT_FESTIVAL_SETTINGS },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=86400',
        },
      }
    );
  }
}
