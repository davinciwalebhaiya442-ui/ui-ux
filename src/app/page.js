import { prisma } from '@/lib/prisma';
import { toFrontendProduct } from '@/lib/product';
import HomeClient from '@/components/HomeClient';
import { DEFAULT_HERO_SETTINGS } from '@/lib/hero';
import { DEFAULT_COMPARISON_SETTINGS } from '@/lib/comparison';
import { DEFAULT_FOOTER_SETTINGS } from '@/lib/footer';

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

async function getInitialComparison() {
  try {
    const comparison = await prisma.comparisonSetting.findUnique({
      where: { id: 'default' },
    });
    if (!comparison) return DEFAULT_COMPARISON_SETTINGS;
    return {
      id: comparison.id || 'default',
      badge: comparison.badge || DEFAULT_COMPARISON_SETTINGS.badge,
      title: comparison.title || DEFAULT_COMPARISON_SETTINGS.title,
      subtitle: comparison.subtitle || DEFAULT_COMPARISON_SETTINGS.subtitle,
      beforeImage: comparison.beforeImage || '',
      afterImage: comparison.afterImage || '',
      beforeLabel: comparison.beforeLabel || DEFAULT_COMPARISON_SETTINGS.beforeLabel,
      afterLabel: comparison.afterLabel || DEFAULT_COMPARISON_SETTINGS.afterLabel,
      cardBadge: comparison.cardBadge || DEFAULT_COMPARISON_SETTINGS.cardBadge,
      cardTag: comparison.cardTag || DEFAULT_COMPARISON_SETTINGS.cardTag,
      description: comparison.description || DEFAULT_COMPARISON_SETTINGS.description,
      features: Array.isArray(comparison.features)
        ? comparison.features
        : DEFAULT_COMPARISON_SETTINGS.features,
    };
  } catch (error) {
    console.error('Failed to get initial comparison:', error);
    return DEFAULT_COMPARISON_SETTINGS;
  }
}

async function getInitialFooter() {
  try {
    const footer = await prisma.footerSetting.findUnique({
      where: { id: 'default' },
    });
    return footer || DEFAULT_FOOTER_SETTINGS;
  } catch (error) {
    console.error('Failed to get initial footer:', error);
    return DEFAULT_FOOTER_SETTINGS;
  }
}

export default async function Home() {
  const [initialProducts, initialHero, initialComparison, initialFooter] = await Promise.all([
    getInitialProducts(),
    getInitialHero(),
    getInitialComparison(),
    getInitialFooter(),
  ]);
  return (
    <HomeClient
      initialProducts={initialProducts}
      initialHero={initialHero}
      initialComparison={initialComparison}
      initialFooter={initialFooter}
    />
  );
}
