import { createClient } from '@supabase/supabase-js'

/**
 * Service-role client. Bypasses every row-level security policy.
 *
 * ONLY import this from a route handler. Never from a component, never from
 * anything with 'use client' at the top, and never from a server action that
 * a signed-in user can reach - those have a real user and should use the
 * normal server client so the policies still apply.
 *
 * It exists for exactly one case: an anonymous visitor who legitimately needs
 * to write, where the route handler itself is the thing doing the authorising.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY

  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must both be set.')
  }

  return createClient(url, key, { auth: { persistSession: false } })
}
