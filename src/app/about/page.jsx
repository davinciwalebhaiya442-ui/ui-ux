import LegalLayout from '@/components/LegalLayout';
import MarkdownContent from '@/components/MarkdownContent';
import { getSitePage } from '@/lib/sitePages';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const page = await getSitePage('about');
  return {
    title: page?.title || 'About Us',
    description: page?.description || 'The story, engineering discipline, and color science philosophy behind DavinciWaleBhaiya.',
  };
}

export default async function AboutPage() {
  const page = await getSitePage('about');

  return (
    <LegalLayout
      badge={page?.badge || 'Studio & Tools'}
      title={page?.title || 'About DavinciWaleBhaiya'}
      lastUpdated={page?.lastUpdated || 'October 2026'}
      description={page?.description}
    >
      <MarkdownContent content={page?.content || ''} />
    </LegalLayout>
  );
}
