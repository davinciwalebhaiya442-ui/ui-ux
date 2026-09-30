import ProductForm from '../../../VisualProductForm';
import { prisma } from '@/lib/prisma';
import { toFrontendProduct } from '@/lib/product';

export default async function EditProductPage({ params }) {
  const product = await prisma.product.findUnique({ where: { id: params.id }, include: { category: true } });
  if (!product) return <p>Product not found.</p>;
  return <ProductForm product={toFrontendProduct(product)} />;
}
