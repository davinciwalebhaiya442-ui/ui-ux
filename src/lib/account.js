import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export async function requireUser() {
  const user = await getAuthenticatedUser();
  if (!user) return { error: Response.json({ error: 'LOGIN_REQUIRED' }, { status: 401 }) };
  return { user };
}

export async function ensureProfile(user) {
  const name = user.user_metadata?.name || user.user_metadata?.full_name || null;
  return prisma.profile.upsert({ where: { userId: user.id }, update: { name, email: user.email }, create: { userId: user.id, name, email: user.email, role: 'customer' } });
}
