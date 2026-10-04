import LegalLayout from '@/components/LegalLayout';
import MarkdownContent from '@/components/MarkdownContent';
import { getSitePage } from '@/lib/sitePages';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const page = await getSitePage('privacy');
  return {
    title: page?.title || 'Privacy Policy',
    description: page?.description || 'How DavinciWaleBhaiya collects, uses, and protects your personal information and transaction data.',
  };
}

export default async function PrivacyPolicyPage() {
  const page = await getSitePage('privacy');

  return (
    <LegalLayout
      badge={page?.badge || 'Privacy & Security'}
      title={page?.title || 'Privacy Policy'}
      lastUpdated={page?.lastUpdated || 'October 1, 2026'}
      description={page?.description}
    >
      <MarkdownContent content={page?.content || ''} />
    </LegalLayout>
  );
}
