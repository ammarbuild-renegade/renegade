import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase client for Client Components.
 *
 * createBrowserClient is already a singleton internally, so calling this on
 * every render is cheap - no need to memoise it.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
