import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseEnv } from './config';

export function getSupabaseServerClient() {
  const cookieStore = cookies();
  const { url, key } = supabaseEnv();
  return createServerClient(url, key, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {}
      },
      remove(name, options) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {}
      },
    },
  });
}

export async function getAuthenticatedUser() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null;
  try {
    const { data, error } = await getSupabaseServerClient().auth.getUser();
    if (error || !data) return null;
    return data.user;
  } catch (err) {
    console.error('getAuthenticatedUser error:', err);
    return null;
  }
}
