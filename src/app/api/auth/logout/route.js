import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = getSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {}
  return Response.json({ success: true });
}
