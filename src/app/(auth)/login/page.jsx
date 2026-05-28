'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  return (
    <Suspense>
      <AuthPage />
    </Suspense>
  )
}

function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const formRef = useRef(null)

  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    if (searchParams.get('mode') === 'signup') setMode('signup')
  }, [searchParams])

  function switchMode(m) {
    setMode(m)
    setError('')
    setFieldErrors({})
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirm(false)
  }

  function triggerShake() {
    const form = formRef.current
    if (!form) return
    form.classList.remove('shake')
    void form.offsetWidth
    form.classList.add('shake')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    if (mode === 'signin') {
      if (!email || !password) { triggerShake(); return }
      setLoading(true)
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError(authError.message)
        setLoading(false)
        triggerShake()
        return
      }
      router.push('/dashboard')
    } else {
      const errors = {}
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.'
      if (password.length < 8) errors.password = 'Password must be at least 8 characters.'
      if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.'
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors)
        triggerShake()
        return
      }
      setLoading(true)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        },
      })
      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        triggerShake()
        return
      }
      if (!data.session) {
        setEmailSent(true)
        setLoading(false)
        return
      }
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        onboarding_completed: false,
        is_pro: true,
        pro_trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      })
      window.location.replace('/onboarding')
    }
  }

  if (emailSent) {
    return (
      <div className="ob-auth-page">
        <div className="ob-step active" style={{ margin: '0 auto', animation: 'none' }}>
          <nav className="ob-topnav auth">
            <Link href="/" className="ob-back-btn" aria-label="Go back">
              <i className="ph-bold ph-arrow-left" />
            </Link>
          </nav>
          <div className="ob-heading-block">
            <h1 className="ob-headline" style={{ fontSize: '36px', lineHeight: '1.1' }}>
              Check your email.
            </h1>
            <p className="ob-subtext">
              We sent a confirmation link to{' '}
              <strong style={{ color: 'var(--text-1)' }}>{email}</strong>.
              <br />Click it to verify your account, then sign in.
            </p>
          </div>
          <button
            className="ob-submit-btn"
            onClick={() => { setEmailSent(false); switchMode('signin') }}
          >
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  const isSignup = mode === 'signup'

  return (
    <div className="ob-auth-page">
      <div className="ob-step active" style={{ margin: '0 auto', animation: 'none' }}>

        <nav className="ob-topnav auth">
          <Link href="/" className="ob-back-btn" aria-label="Go back">
            <i className="ph-bold ph-arrow-left" />
          </Link>
        </nav>

        <div className="ob-heading-block">
          <h1 className="ob-headline" style={{ fontSize: '36px', lineHeight: '1.1' }}>
            {isSignup ? 'Create account.' : 'Welcome back.'}
          </h1>
          <p className="ob-subtext">
            {isSignup ? 'Start your Nook journey.' : 'Sign in to your Nook account.'}
          </p>
        </div>

        <div className="ob-mode-tabs" role="tablist">
          <button
            className={`ob-mode-tab${!isSignup ? ' active' : ''}`}
            role="tab"
            aria-selected={!isSignup}
            onClick={() => switchMode('signin')}
          >
            Sign in
          </button>
          <button
            className={`ob-mode-tab${isSignup ? ' active' : ''}`}
            role="tab"
            aria-selected={isSignup}
            onClick={() => switchMode('signup')}
          >
            Create account
          </button>
        </div>

        <form
          ref={formRef}
          className="ob-form"
          onSubmit={handleSubmit}
          noValidate
        >

          <div className="ob-field">
            <label className="ob-field-label" htmlFor="auth-email">Email</label>
            <div className="ob-input-wrap">
              <input
                className={`ob-input${fieldErrors.email ? ' error' : ''}`}
                type="email"
                id="auth-email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: '' })) }}
                disabled={loading}
              />
            </div>
            {fieldErrors.email && <p className="ob-field-error show">{fieldErrors.email}</p>}
          </div>

          <div className="ob-field">
            <label className="ob-field-label" htmlFor="auth-password">Password</label>
            <div className="ob-input-wrap">
              <input
                className={`ob-input has-action${fieldErrors.password ? ' error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                id="auth-password"
                placeholder="••••••••"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: '' })) }}
                disabled={loading}
              />
              <button
                type="button"
                className="ob-input-action"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={`ph-bold ${showPassword ? 'ph-eye-slash' : 'ph-eye'}`} />
              </button>
            </div>
            {fieldErrors.password && <p className="ob-field-error show">{fieldErrors.password}</p>}
          </div>

          {isSignup && (
            <div className="ob-field">
              <label className="ob-field-label" htmlFor="auth-confirm">Confirm password</label>
              <div className="ob-input-wrap">
                <input
                  className={`ob-input has-action${fieldErrors.confirmPassword ? ' error' : ''}`}
                  type={showConfirm ? 'text' : 'password'}
                  id="auth-confirm"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setFieldErrors(p => ({ ...p, confirmPassword: '' })) }}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="ob-input-action"
                  onClick={() => setShowConfirm(v => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  <i className={`ph-bold ${showConfirm ? 'ph-eye-slash' : 'ph-eye'}`} />
                </button>
              </div>
              {fieldErrors.confirmPassword && <p className="ob-field-error show">{fieldErrors.confirmPassword}</p>}
            </div>
          )}

          {!isSignup && (
            <a href="#" className="ob-forgot">Forgot password?</a>
          )}

          {error && <p className="ob-field-error show">{error}</p>}

          <button
            type="submit"
            className="ob-submit-btn"
            disabled={loading}
            style={{ marginTop: 6 }}
          >
            {loading
              ? <><i className="ph-bold ph-spinner-gap" style={{ animation: 'spin 0.7s linear infinite' }} /> {isSignup ? 'Creating…' : 'Signing in…'}</>
              : isSignup ? 'Create account' : 'Sign in'
            }
          </button>

        </form>

        <div className="ob-divider">
          <div className="ob-divider-line" />
          <span className="ob-divider-text">or continue with</span>
          <div className="ob-divider-line" />
        </div>

        <div className="ob-social-row">
          <button type="button" className="ob-social-btn google">
            <i className="ph-bold ph-google-logo" />
            Google
          </button>
          <button type="button" className="ob-social-btn apple">
            <i className="ph-bold ph-apple-logo" />
            Apple
          </button>
        </div>

        <a
          href="#"
          className="ob-bottom-link"
          onClick={e => { e.preventDefault(); switchMode(isSignup ? 'signin' : 'signup') }}
        >
          {isSignup
            ? <>Already have an account? <span>Sign in</span></>
            : <>New here? <span>Create account</span></>
          }
        </a>

      </div>
    </div>
  )
}
