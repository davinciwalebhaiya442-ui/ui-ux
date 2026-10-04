import LegalLayout from '@/components/LegalLayout';
import MarkdownContent from '@/components/MarkdownContent';
import { getSitePage } from '@/lib/sitePages';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const page = await getSitePage('refund-policy');
  return {
    title: page?.title || 'Refund & Cancellation Policy',
    description: page?.description || 'Refund, return, and cancellation policy for digital products and assets purchased on DavinciWaleBhaiya.',
  };
}

export default async function RefundPolicyPage() {
  const page = await getSitePage('refund-policy');

  return (
    <LegalLayout
      badge={page?.badge || 'Payments & Consumer Protection'}
      title={page?.title || 'Refund & Cancellation Policy'}
      lastUpdated={page?.lastUpdated || 'October 1, 2026'}
      description={page?.description}
    >
      <MarkdownContent content={page?.content || ''} />
    </LegalLayout>
  );
}
