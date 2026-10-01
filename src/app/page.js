import { prisma } from '@/lib/prisma';
import { toFrontendProduct } from '@/lib/product';
import HomeClient from '@/components/HomeClient';

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

export default async function Home() {
  const initialProducts = await getInitialProducts();
  return <HomeClient initialProducts={initialProducts} />;
}
