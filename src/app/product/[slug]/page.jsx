import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { toFrontendProduct } from '@/lib/product';
import ProductViewClient from './ProductViewClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (!slug) return { title: 'Product Not Found | DaVinci Wale Bhaiya' };

  try {
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { slug: slug },
          { id: slug },
        ],
      },
      include: { category: true },
    });

    if (!product) {
      return {
        title: 'Product Not Found | DaVinci Wale Bhaiya',
        description: 'The requested DaVinci Resolve asset could not be found.',
      };
    }

    const title = `${product.name} | DaVinci Wale Bhaiya`;
    const description = product.shortDescription || product.description || 'Download high quality DaVinci Resolve assets, plugins, and LUTs.';
    const siteUrl = process.env.NEXTAUTH_URL || 'https://davinciwalebhaiya.com';

    let ogImage = `${siteUrl}/hero/2.jpg`;
    if (product.thumbnailKey) {
      ogImage = product.thumbnailKey.startsWith('http')
        ? product.thumbnailKey
        : `${siteUrl}/api/media?key=${encodeURIComponent(product.thumbnailKey)}`;
    } else if (product.beforeImage) {
      ogImage = product.beforeImage.startsWith('http')
        ? product.beforeImage
        : `${siteUrl}/api/media?key=${encodeURIComponent(product.beforeImage)}`;
    }

    const shareUrl = `${siteUrl}/product/${product.slug || product.id}`;

    return {
      title,
      description,
      alternates: {
        canonical: shareUrl,
      },
      openGraph: {
        title,
        description,
        url: shareUrl,
        siteName: 'DaVinci Wale Bhaiya',
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
    };
  } catch (error) {
    console.error('Error generating metadata for product:', error);
    return {
      title: 'Product | DaVinci Wale Bhaiya',
    };
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  if (!slug) notFound();

  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { slug: slug },
        { id: slug },
      ],
    },
    include: { category: true },
  });

  if (!product) {
    notFound();
  }

  // Fetch related products from the same category
  let relatedProducts = [];
  try {
    const rawRelated = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        NOT: { id: product.id },
      },
      include: { category: true },
      take: 3,
    });
    relatedProducts = rawRelated.map(toFrontendProduct);
  } catch (err) {
    console.error('Error fetching related products:', err);
  }

  const frontendProduct = toFrontendProduct(product);
  const siteUrl = process.env.NEXTAUTH_URL || 'https://davinciwalebhaiya.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: frontendProduct.name,
    description: frontendProduct.tagline || frontendProduct.description,
    image: frontendProduct.thumbnailKey || `${siteUrl}/hero/2.jpg`,
    offers: {
      '@type': 'Offer',
      price: frontendProduct.type === 'free' ? '0' : String(frontendProduct.price),
      priceCurrency: frontendProduct.currency || 'INR',
      availability: 'https://schema.org/InStock',
      url: `${siteUrl}/product/${frontendProduct.slug || frontendProduct.id}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductViewClient asset={frontendProduct} relatedAssets={relatedProducts} />
    </>
  );
}
