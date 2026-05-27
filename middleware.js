import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

const PROTECTED_PATHS = ['/dashboard', '/settings']
const AUTH_PATHS = ['/login', '/signup']
// Routes where we skip the onboarding check to avoid redirect loops
const ONBOARDING_EXEMPT = ['/onboarding', '/login', '/signup']

// Forward any auth cookies Supabase wrote (e.g. token refresh) onto a redirect response
// so the refreshed session isn't lost and the next request doesn't flash to /login.
function withCookies(redirectResponse, supabaseResponse) {
  supabaseResponse.cookies.getAll().forEach(cookie => {
    redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
  })
  return redirectResponse
}

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() validates the JWT server-side — never trust getSession() in middleware
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PATHS.some(p => pathname.startsWith(p))
  const isAuthPage  = AUTH_PATHS.some(p => pathname.startsWith(p))
  const isOnboardingExempt = ONBOARDING_EXEMPT.some(p => pathname.startsWith(p))

  // No session → gate protected routes
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return withCookies(NextResponse.redirect(url), supabaseResponse)
  }

  // Has session → bounce away from auth pages
  if (isAuthPage && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return withCookies(NextResponse.redirect(url), supabaseResponse)
  }

  // Has session on a protected page → check onboarding completion
  // Single PK lookup on profiles — RLS allows the user to read their own row
  if (user && !isOnboardingExempt) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()

    if (profile && profile.onboarding_completed === false) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return withCookies(NextResponse.redirect(url), supabaseResponse)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
