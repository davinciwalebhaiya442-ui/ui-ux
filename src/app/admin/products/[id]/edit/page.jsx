import ProductForm from '../../../VisualProductForm';
import { prisma } from '@/lib/prisma';
import { toFrontendProduct } from '@/lib/product';

export const dynamic = 'force-dynamic';

export default async function EditProductPage({ params }) {
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { id: params.id },
        { slug: params.id },
      ],
    },
    include: { category: true },
  });

  if (!product) {
    return (
      <div className="min-h-screen bg-[#05070d] text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Product not found</h2>
        <p className="text-sm text-white/50 mb-6">Could not find product matching &ldquo;{params.id}&rdquo;.</p>
        <a href="/admin/products" className="rounded-xl bg-white px-4 py-2.5 text-xs font-medium text-black">
          Back to Products
        </a>
      </div>
    );
  }

  return <ProductForm product={toFrontendProduct(product)} />;
}
