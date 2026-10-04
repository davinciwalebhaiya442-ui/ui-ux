import LegalLayout from '@/components/LegalLayout';
import MarkdownContent from '@/components/MarkdownContent';
import { getSitePage } from '@/lib/sitePages';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const page = await getSitePage('terms');
  return {
    title: page?.title || 'Terms & Conditions',
    description: page?.description || 'Terms and conditions governing the use of DavinciWaleBhaiya digital assets, plugins, presets, and services.',
  };
}

export default async function TermsPage() {
  const page = await getSitePage('terms');

  return (
    <LegalLayout
      badge={page?.badge || 'Legal Agreement'}
      title={page?.title || 'Terms & Conditions'}
      lastUpdated={page?.lastUpdated || 'October 1, 2026'}
      description={page?.description}
    >
      <MarkdownContent content={page?.content || ''} />
    </LegalLayout>
  );
}
