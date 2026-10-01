import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseEnv } from './config';

export function getSupabaseServerClient() {
  const cookieStore = cookies();
  const { url, key } = supabaseEnv();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // Can be safely ignored if middleware is present.
        }
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
