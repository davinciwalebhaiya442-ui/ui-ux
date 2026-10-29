import { prisma } from '@/lib/prisma';
import { DEFAULT_FOOTER_SETTINGS } from '@/lib/footer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const setting = await prisma.footerSetting.findUnique({
      where: { id: 'default' },
    });
    return Response.json(
      { footer: setting || DEFAULT_FOOTER_SETTINGS },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Failed to load footer settings, using default fallback:', error);
    return Response.json(
      { footer: DEFAULT_FOOTER_SETTINGS },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  }
}
