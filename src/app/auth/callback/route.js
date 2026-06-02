import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/onboarding'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && sessionData?.user) {
      const user = sessionData.user

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      const isReturningUser = existingProfile?.onboarding_completed === true

      if (!isReturningUser) {
        await supabase.from('profiles').upsert({
          id: user.id,
          first_name: user.user_metadata?.given_name ?? user.user_metadata?.full_name?.split(' ')[0] ?? null,
          last_name: user.user_metadata?.family_name ?? null,
          avatar_url: user.user_metadata?.avatar_url ?? null,
          email: user.email,
          timezone: 'UTC',
          onboarding_completed: false,
          is_pro: true,
          pro_trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        })
      }

      const destination = isReturningUser ? '/dashboard' : (next === '/dashboard' ? '/dashboard' : '/onboarding')
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
