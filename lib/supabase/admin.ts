import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase admin client.
 * Uses service role key (bypasses RLS) if available,
 * otherwise falls back to anon key.
 * Use this in all API routes for reliable data access.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const key = serviceRoleKey || anonKey;

  if (!supabaseUrl || !key) {
    throw new Error('Missing Supabase environment variables (URL or key)');
  }

  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
