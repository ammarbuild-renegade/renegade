import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 *
 * Note the await on cookies() - in Next 15 and later it is asynchronous.
 * Because of that this function is async too, so every caller awaits it.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // A Server Component cannot set cookies. This is expected and safe
            // to ignore: proxy.ts refreshes the session before the page runs,
            // so the cookie is already current by the time we get here.
          }
        },
      },
    }
  )
}
