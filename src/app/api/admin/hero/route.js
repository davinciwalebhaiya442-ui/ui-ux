import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { DEFAULT_HERO_SETTINGS } from '@/lib/hero';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const hero = await prisma.heroSetting.findUnique({
      where: { id: 'default' },
    });
    return Response.json({ hero: hero || DEFAULT_HERO_SETTINGS });
  } catch (error) {
    console.error('Failed to load hero in admin:', error);
    return Response.json({ hero: DEFAULT_HERO_SETTINGS });
  }
}

export async function PATCH(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const heading = String(body.heading || '').trim();
    if (!heading) {
      return Response.json({ error: 'Main heading is required and cannot be empty.' }, { status: 400 });
    }

    const data = {
      heading,
      description: String(body.description || '').trim(),
      badge: String(body.badge || '').trim(),
      heroImage: String(body.heroImage || '/hero/2.jpg').trim(),
      fontFamily: String(body.fontFamily || 'sans').trim(),
      customFontUrl: String(body.customFontUrl || '').trim(),
      textColor: String(body.textColor || '#ffffff').trim(),
      primaryButtonText: String(body.primaryButtonText || '').trim(),
      primaryButtonLink: String(body.primaryButtonLink || '').trim(),
    };

    const hero = await prisma.heroSetting.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    });

    try {
      revalidatePath('/');
      revalidatePath('/api/hero');
    } catch {}

    return Response.json({ hero, success: true });
  } catch (error) {
    console.error('Failed to update hero settings:', error);
    return Response.json({ error: 'Unable to save hero settings.' }, { status: 500 });
  }
}
