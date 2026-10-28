import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/** Pages a signed-out visitor is allowed to open. */
const PUBLIC_PATHS = ['/', '/login', '/signup', '/auth']

/**
 * Refreshes the auth session on every request, and sends signed-out visitors
 * to the login page.
 *
 * Two rules here are easy to get wrong and both matter:
 *
 *   1. Use getClaims(), not getSession(). getSession() reads the cookie without
 *      revalidating it, so a tampered cookie would be believed. Never trust it
 *      in server code.
 *
 *   2. Return the exact response object that setAll built. Returning a fresh
 *      NextResponse throws away the refreshed cookies and the user is logged
 *      out on the next request, seemingly at random.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          // Cache-Control, Expires and Pragma - a cached authenticated page
          // served to the next visitor would be a serious leak.
          if (headers) {
            for (const [key, value] of Object.entries(headers)) {
              supabaseResponse.headers.set(key, value as string)
            }
          }
        },
      },
    }
  )

  const { data } = await supabase.auth.getClaims()
  const signedIn = Boolean(data?.claims)

  const path = request.nextUrl.pathname
  const isPublic = PUBLIC_PATHS.some((p) => path === p || path.startsWith(p + '/'))

  if (!signedIn && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', path) // send them back where they were going
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
