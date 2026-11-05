import { prisma } from '@/lib/prisma';
import { DEFAULT_FESTIVAL_SETTINGS } from '@/lib/festival';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const setting = await prisma.festivalSetting.findUnique({
      where: { id: 'default' },
    });
    return Response.json(
      { festival: setting || DEFAULT_FESTIVAL_SETTINGS },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, proxy-revalidate',
          'CDN-Cache-Control': 'no-store',
          'Surrogate-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('Failed to load festival settings, using default fallback:', error);
    return Response.json(
      { festival: DEFAULT_FESTIVAL_SETTINGS },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  }
}
