import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { DEFAULT_COMPARISON_SETTINGS } from '@/app/api/comparison/route';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const comparison = await prisma.comparisonSetting.findUnique({
      where: { id: 'default' },
    });
    return Response.json({ comparison: comparison || DEFAULT_COMPARISON_SETTINGS });
  } catch (error) {
    console.error('Failed to load comparison settings in admin:', error);
    return Response.json({ comparison: DEFAULT_COMPARISON_SETTINGS });
  }
}

export async function PATCH(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const title = String(body.title || '').trim();
    if (!title) {
      return Response.json({ error: 'Section title is required and cannot be empty.' }, { status: 400 });
    }

    const data = {
      badge: String(body.badge || '').trim(),
      title,
      subtitle: String(body.subtitle || '').trim(),
      beforeImage: String(body.beforeImage || '').trim(),
      afterImage: String(body.afterImage || '').trim(),
      beforeLabel: String(body.beforeLabel || 'RAW Log (DWG / ACES)').trim(),
      afterLabel: String(body.afterLabel || 'Kodak 2383 Print DCTL').trim(),
      cardBadge: String(body.cardBadge || '').trim(),
      cardTag: String(body.cardTag || '').trim(),
      description: String(body.description || '').trim(),
      features: Array.isArray(body.features)
        ? body.features.map((f) => String(f).trim()).filter(Boolean)
        : DEFAULT_COMPARISON_SETTINGS.features,
    };

    const comparison = await prisma.comparisonSetting.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    });

    try {
      revalidatePath('/');
      revalidatePath('/api/comparison');
    } catch {}

    return Response.json({ comparison, success: true });
  } catch (error) {
    console.error('Failed to update comparison settings:', error);
    return Response.json({ error: 'Unable to save comparison settings.' }, { status: 500 });
  }
}
