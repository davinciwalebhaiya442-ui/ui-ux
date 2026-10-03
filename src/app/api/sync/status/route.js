import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [latestProduct, latestHero, latestComparison] = await Promise.all([
      prisma.product.findFirst({ select: { updatedAt: true }, orderBy: { updatedAt: 'desc' } }),
      prisma.heroSetting.findUnique({ where: { id: 'default' }, select: { updatedAt: true } }),
      prisma.comparisonSetting.findUnique({ where: { id: 'default' }, select: { updatedAt: true } }),
    ]);

    const timestamps = [
      latestProduct?.updatedAt ? new Date(latestProduct.updatedAt).getTime() : 0,
      latestHero?.updatedAt ? new Date(latestHero.updatedAt).getTime() : 0,
      latestComparison?.updatedAt ? new Date(latestComparison.updatedAt).getTime() : 0,
    ];

    const version = Math.max(...timestamps, 0);

    return Response.json(
      { version },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch {
    return Response.json({ version: 0 });
  }
}
