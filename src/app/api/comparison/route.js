import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

import { DEFAULT_COMPARISON_SETTINGS } from '@/lib/comparison';

export { DEFAULT_COMPARISON_SETTINGS };

export async function GET() {
  try {
    const setting = await prisma.comparisonSetting.findUnique({
      where: { id: 'default' },
    });
    return Response.json(
      { comparison: setting || DEFAULT_COMPARISON_SETTINGS },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=30',
        },
      }
    );
  } catch (error) {
    console.error('Failed to load comparison settings, returning default fallback:', error);
    return Response.json({ comparison: DEFAULT_COMPARISON_SETTINGS });
  }
}
