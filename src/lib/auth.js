export function requireAdmin(request) {
  const configuredKey = process.env.ADMIN_KEY;
  const suppliedKey = request.headers.get('x-admin-key') || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!configuredKey || !suppliedKey || suppliedKey !== configuredKey) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function requireAdminMedia(request) {
  const configuredKey = process.env.ADMIN_KEY;
  const suppliedKey = request.headers.get('x-admin-key') || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (configuredKey && suppliedKey === configuredKey) return null;
  try {
    const { getAuthenticatedUser } = await import('@/lib/supabase/server');
    const { prisma } = await import('@/lib/prisma');
    const user = await getAuthenticatedUser();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const profile = await prisma.profile.findUnique({ where: { userId: user.id }, select: { role: true } });
    if (profile?.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    return null;
  } catch { return Response.json({ error: 'Unauthorized' }, { status: 401 }); }
}
