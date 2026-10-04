import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { DEFAULT_FOOTER_SETTINGS } from '@/lib/footer';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const footer = await prisma.footerSetting.findUnique({
      where: { id: 'default' },
    });
    return Response.json({ footer: footer || DEFAULT_FOOTER_SETTINGS });
  } catch (error) {
    console.error('Failed to load footer in admin:', error);
    return Response.json({ footer: DEFAULT_FOOTER_SETTINGS });
  }
}

export async function PATCH(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();

    const data = {
      brandName: String(body.brandName || DEFAULT_FOOTER_SETTINGS.brandName).trim(),
      brandTagline: String(body.brandTagline || DEFAULT_FOOTER_SETTINGS.brandTagline).trim(),
      newsletterHeading: String(body.newsletterHeading || DEFAULT_FOOTER_SETTINGS.newsletterHeading).trim(),
      newsletterPlaceholder: String(body.newsletterPlaceholder || DEFAULT_FOOTER_SETTINGS.newsletterPlaceholder).trim(),
      newsletterButtonText: String(body.newsletterButtonText || DEFAULT_FOOTER_SETTINGS.newsletterButtonText).trim(),
      supportEmail: String(body.supportEmail || DEFAULT_FOOTER_SETTINGS.supportEmail).trim(),
      youtubeUrl: String(body.youtubeUrl ?? DEFAULT_FOOTER_SETTINGS.youtubeUrl).trim(),
      instagramUrl: String(body.instagramUrl ?? DEFAULT_FOOTER_SETTINGS.instagramUrl).trim(),
      twitterUrl: String(body.twitterUrl ?? '').trim(),
      discordUrl: String(body.discordUrl ?? '').trim(),
      productsLinks: Array.isArray(body.productsLinks) ? body.productsLinks : DEFAULT_FOOTER_SETTINGS.productsLinks,
      companyLinks: Array.isArray(body.companyLinks) ? body.companyLinks : DEFAULT_FOOTER_SETTINGS.companyLinks,
      legalLinks: Array.isArray(body.legalLinks) ? body.legalLinks : DEFAULT_FOOTER_SETTINGS.legalLinks,
      copyrightText: String(body.copyrightText || DEFAULT_FOOTER_SETTINGS.copyrightText).trim(),
    };

    const footer = await prisma.footerSetting.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    });

    try {
      revalidatePath('/');
      revalidatePath('/api/footer');
    } catch {}

    return Response.json({ footer, success: true });
  } catch (error) {
    console.error('Failed to update footer settings:', error);
    return Response.json({ error: 'Unable to save footer settings.' }, { status: 500 });
  }
}
