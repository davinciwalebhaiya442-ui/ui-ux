import { prisma } from '@/lib/prisma';
import { toFrontendProduct } from '@/lib/product';
import HomeClient from '@/components/HomeClient';
import { DEFAULT_HERO_SETTINGS } from '@/app/api/hero/route';

export const dynamic = 'force-dynamic';

async function getInitialProducts() {
  try {
    const products = await prisma.product.findMany({
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return products.map(toFrontendProduct);
  } catch (error) {
    console.error('Failed to get initial products:', error);
    return [];
  }
}

async function getInitialHero() {
  try {
    const hero = await prisma.heroSetting.findUnique({
      where: { id: 'default' },
    });
    if (!hero) return DEFAULT_HERO_SETTINGS;
    return {
      heading: hero.heading || 'DAVINCI WALE BHAIYA',
      description: hero.description || '',
      badge: hero.badge || '',
      heroImage: hero.heroImage || '/hero/2.jpg',
      fontFamily: hero.fontFamily || 'sans',
      customFontUrl: hero.customFontUrl || '',
      textColor: hero.textColor || '#ffffff',
      primaryButtonText: hero.primaryButtonText || '',
      primaryButtonLink: hero.primaryButtonLink || '',
    };
  } catch (error) {
    console.error('Failed to get initial hero:', error);
    return DEFAULT_HERO_SETTINGS;
  }
}

export default async function Home() {
  const [initialProducts, initialHero] = await Promise.all([
    getInitialProducts(),
    getInitialHero(),
  ]);
  return <HomeClient initialProducts={initialProducts} initialHero={initialHero} />;
}
