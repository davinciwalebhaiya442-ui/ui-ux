import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { verifyAdmin2FACookie } from '@/lib/admin-2fa';

export async function getAdminUser() {
  const user = await getAuthenticatedUser();
  if (!user) return { user: null, profile: null };

  let profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { id: true, role: true, email: true, name: true },
  });

  if (!profile) {
    const isFirstAdmin =
      user.email === 'admin@gmail.com' ||
      (await prisma.profile.count({ where: { role: 'admin' } })) === 0;

    profile = await prisma.profile
      .create({
        data: {
          userId: user.id,
          email: user.email,
          name: user.user_metadata?.name || null,
          role: isFirstAdmin ? 'admin' : 'customer',
        },
        select: { id: true, role: true, email: true, name: true },
      })
      .catch(() => null);
  } else if (user.email === 'admin@gmail.com' && profile.role !== 'admin') {
    profile = await prisma.profile
      .update({
        where: { userId: user.id },
        data: { role: 'admin' },
        select: { id: true, role: true, email: true, name: true },
      })
      .catch(() => profile);
  }

  return { user, profile };
}

export async function requireAdmin() {
  try {
    const { user, profile } = await getAdminUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (profile?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    // Verify 2FA session token
    const is2faOk = await verifyAdmin2FACookie(user.id);
    if (!is2faOk) {
      return Response.json({ error: '2FA_REQUIRED' }, { status: 403 });
    }

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

  // Verify 2FA session token
  const is2faOk = await verifyAdmin2FACookie(result.user.id);
  if (!is2faOk) {
    redirect('/login?next=/admin&needs2fa=1');
  }
}
