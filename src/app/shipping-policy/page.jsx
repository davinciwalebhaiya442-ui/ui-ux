import LegalLayout from '@/components/LegalLayout';
import MarkdownContent from '@/components/MarkdownContent';
import { getSitePage } from '@/lib/sitePages';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const page = await getSitePage('shipping-policy');
  return {
    title: page?.title || 'Shipping & Delivery Policy',
    description: page?.description || 'Digital delivery and electronic fulfillment policy for digital assets purchased on DavinciWaleBhaiya.',
  };
}

export default async function ShippingPolicyPage() {
  const page = await getSitePage('shipping-policy');

  return (
    <LegalLayout
      badge={page?.badge || 'Fulfillment & Electronic Delivery'}
      title={page?.title || 'Shipping & Delivery Policy'}
      lastUpdated={page?.lastUpdated || 'October 1, 2026'}
      description={page?.description}
    >
      <MarkdownContent content={page?.content || ''} />
    </LegalLayout>
  );
}
