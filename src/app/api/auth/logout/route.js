import { getSupabaseServerClient } from '@/lib/supabase/server';
import { clearAdmin2FACookie } from '@/lib/admin-2fa';

export async function POST() {
  try {
    const supabase = getSupabaseServerClient();
    await supabase.auth.signOut();
    await clearAdmin2FACookie();
  } catch {}
  return Response.json({ success: true });
}
