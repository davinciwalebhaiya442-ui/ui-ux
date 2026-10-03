import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const DEFAULT_COMPARISON_SETTINGS = {
  id: 'default',
  badge: '02 / COLOR SCIENCE COMPARISON',
  title: 'Photochemical Print Emulation',
  subtitle: 'Drag horizontally to compare unprocessed RAW camera log footage against our Kodak 2383 DCTL film transform.',
  beforeImage: '',
  afterImage: '',
  beforeLabel: 'RAW Log (DWG / ACES)',
  afterLabel: 'Kodak 2383 Print DCTL',
  cardBadge: 'SPECTRAL DENSITY NOTES',
  cardTag: '35mm Print',
  description: 'Standard digital grading clips RGB channels as saturation increases, leading to harsh neon skin tones and plastic highlights.\n\nReal 35mm film print stock behaves subtractively: as colors saturate, they absorb light and gain physical dye density, naturally rolling off into deep, organic shadows.',
  features: [
    'Preserves 16-bit float highlight dynamic range',
    'Smooth subtractive cyan-orange skin separation',
    'Zero 3D LUT banding or contour artifacting',
    'D55, D60, D65 & Tungsten white balances included',
  ],
};

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
