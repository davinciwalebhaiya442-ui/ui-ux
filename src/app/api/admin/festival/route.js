import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { DEFAULT_FESTIVAL_SETTINGS } from '@/lib/festival';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const setting = await prisma.festivalSetting.findUnique({
      where: { id: 'default' },
    });
    return Response.json(
      { festival: setting || DEFAULT_FESTIVAL_SETTINGS },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Failed to load festival settings in admin:', error);
    return Response.json(
      { festival: DEFAULT_FESTIVAL_SETTINGS },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  }
}

export async function POST(request) {
  return PATCH(request);
}

export async function PUT(request) {
  return PATCH(request);
}

export async function PATCH(request) {
  const unauthorized = await requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();

    const allowedEffects = [
      'snow',
      'diwali',
      'newyear',
      'christmas',
      'holi',
      'eid',
      'durga_puja',
      'dussehra',
      'ganesh',
      'independence',
      'valentine',
      'halloween',
    ];

    const data = {
      enabled: Boolean(body.enabled),
      effect: allowedEffects.includes(body.effect) ? body.effect : 'snow',
      intensity: ['low', 'medium', 'high'].includes(body.intensity) ? body.intensity : 'medium',
      enableOnMobile: body.enableOnMobile !== undefined ? Boolean(body.enableOnMobile) : true,
      greetingText: String(body.greetingText || '').trim(),
      greetingEnabled: Boolean(body.greetingEnabled),
      customSpeed: Number.isInteger(body.customSpeed) ? body.customSpeed : 1,
    };

    const festival = await prisma.festivalSetting.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    });

    try {
      revalidatePath('/');
      revalidatePath('/api/festival');
    } catch {}

    return Response.json({ festival, success: true });
  } catch (error) {
    console.error('Failed to update festival settings:', error);
    return Response.json({ error: 'Unable to save festival settings.' }, { status: 500 });
  }
}

