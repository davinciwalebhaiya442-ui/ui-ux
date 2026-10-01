import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export async function getAdminUser() {
  const user = await getAuthenticatedUser();
  if (!user) return { user: null, profile: null };
  let profile = await prisma.profile.findUnique({ where: { userId: user.id }, select: { role: true } });
  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        userId: user.id,
        email: user.email,
        name: user.user_metadata?.name || null,
        role: user.email === 'admin@gmail.com' ? 'admin' : 'customer',
      },
      select: { role: true },
    }).catch(() => null);
  } else if (user.email === 'admin@gmail.com' && profile.role !== 'admin') {
    profile = await prisma.profile.update({
      where: { userId: user.id },
      data: { role: 'admin' },
      select: { role: true },
    }).catch(() => profile);
  }
  return { user, profile };
}

export async function requireAdmin() {
  try {
    const { user, profile } = await getAdminUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (profile?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    return null;
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function requireAdminMedia(request) {
  return requireAdmin(request);
}

export async function requireAdminPage() {
  let result;
  try {
    result = await getAdminUser();
  } catch {
    redirect('/login?next=/admin');
  }
  if (!result.user) redirect('/login?next=/admin');
  if (result.profile?.role !== 'admin') redirect('/');
}
