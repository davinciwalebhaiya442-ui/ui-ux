import { createBrowserClient } from '@supabase/ssr';
import { supabaseEnv } from './config';

let client;
export function getSupabaseBrowserClient() {
  if (!client) {
    const { url, key } = supabaseEnv();
    client = createBrowserClient(url, key);
  }
  return client;
}
