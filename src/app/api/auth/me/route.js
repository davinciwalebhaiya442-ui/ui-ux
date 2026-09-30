import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, getSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return Response.json({ user: null });
  const profile = await prisma.profile.upsert({ where: { userId: user.id }, update: { email: user.email }, create: { userId: user.id, email: user.email, name: user.user_metadata?.name || null, role: 'customer' } });
  return Response.json({ user: { id: user.id, email: user.email, name: profile?.name || user.user_metadata?.name || null, role: profile?.role || 'customer' } });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({ email: body.email, password: body.password, options: { data: { name: body.name } } });
    if (error) return Response.json({ error: error.message }, { status: 400 });
    if (data.user) await prisma.profile.upsert({ where: { userId: data.user.id }, update: { name: body.name, email: data.user.email }, create: { userId: data.user.id, name: body.name, email: data.user.email, role: 'customer' } });
    return Response.json({ user: data.user, needsEmailConfirmation: !data.session }, { status: 201 });
  } catch (error) { return Response.json({ error: 'Unable to create account' }, { status: 400 }); }
}
