'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

function validate(fields) {
  const errors = {}
  if (!fields.firstName.trim()) errors.firstName = 'First name is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) errors.email = 'Enter a valid email address.'
  if (fields.password.length < 8) errors.password = 'Password must be at least 8 characters.'
  if (fields.password !== fields.confirmPassword) errors.confirmPassword = 'Passwords do not match.'
  return errors
}

export default function SignupPage() {
  const router = useRouter()

  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')

    const errors = validate({ firstName, email, password, confirmPassword })
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        data: { first_name: firstName.trim() },
      },
    })

    if (signUpError) {
      setSubmitError(signUpError.message)
      setLoading(false)
      return
    }

    // No session = email confirmation required. Don't proceed until confirmed.
    if (!data.session) {
      setEmailSent(true)
      setLoading(false)
      return
    }

    // Session exists (email confirmation disabled in Supabase settings).
    // Update profile and continue to onboarding.
    const user = data.user
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      first_name: firstName.trim(),
      email,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      onboarding_completed: false,
      is_pro: true,
      pro_trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    })

    if (profileError) {
      setSubmitError('Account created but profile setup failed. Please try signing in.')
      setLoading(false)
      return
    }

    router.push('/onboarding')
  }

  function clearFieldError(field) {
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: '' }))
  }

  if (emailSent) {
    return (
      <div className="auth-page">
        <div className="auth-card sett-card">
          <div className="auth-logo">
            <div className="auth-logo-mark">N</div>
            <span className="auth-logo-name">Nook</span>
          </div>
          <h1 className="auth-heading">Check your email.</h1>
          <p className="auth-confirm-msg">
            We sent a confirmation link to <strong>{email}</strong>.<br />
            Click it to activate your account, then sign in.
          </p>
          <Link href="/login" className="ob-cta-btn auth-submit" style={{ display: 'flex', justifyContent: 'center', textDecoration: 'none' }}>
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card sett-card">

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-mark">N</div>
          <span className="auth-logo-name">Nook</span>
        </div>

        {/* Heading */}
        <h1 className="auth-heading">Create your account.</h1>

        <form onSubmit={handleSubmit} noValidate>

          {/* First name */}
          <div className="auth-field">
            <div className="ob-input-wrap">
              <input
                className={`ob-input${fieldErrors.firstName ? ' error' : ''}`}
                type="text"
                placeholder="First name"
                autoComplete="given-name"
                value={firstName}
                onChange={e => { setFirstName(e.target.value); clearFieldError('firstName') }}
                disabled={loading}
              />
            </div>
            {fieldErrors.firstName && (
              <p className="auth-field-error">{fieldErrors.firstName}</p>
            )}
          </div>

          {/* Email */}
          <div className="auth-field">
            <div className="ob-input-wrap">
              <input
                className={`ob-input${fieldErrors.email ? ' error' : ''}`}
                type="email"
                placeholder="Email address"
                autoComplete="email"
                value={email}
                onChange={e => { setEmail(e.target.value); clearFieldError('email') }}
                disabled={loading}
              />
            </div>
            {fieldErrors.email && (
              <p className="auth-field-error">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="auth-field">
            <div className="ob-input-wrap">
              <input
                className={`ob-input has-action${fieldErrors.password ? ' error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                autoComplete="new-password"
                value={password}
                onChange={e => { setPassword(e.target.value); clearFieldError('password') }}
                disabled={loading}
              />
              <button
                type="button"
                className="ob-input-action"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <i className={showPassword ? 'ph-bold ph-eye-slash' : 'ph-bold ph-eye'} />
              </button>
            </div>
            {fieldErrors.password && (
              <p className="auth-field-error">{fieldErrors.password}</p>
            )}
          </div>

          {/* Confirm password */}
          <div className="auth-field">
            <div className="ob-input-wrap">
              <input
                className={`ob-input has-action${fieldErrors.confirmPassword ? ' error' : ''}`}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={e => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword') }}
                disabled={loading}
              />
              <button
                type="button"
                className="ob-input-action"
                onClick={() => setShowConfirm(v => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                <i className={showConfirm ? 'ph-bold ph-eye-slash' : 'ph-bold ph-eye'} />
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="auth-field-error">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          {/* Submit error */}
          {submitError && (
            <p className="auth-error">{submitError}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="ob-cta-btn auth-submit"
            disabled={loading}
          >
            {loading
              ? <><i className="ph-bold ph-spinner-gap auth-spinner" />Creating account…</>
              : 'Create account'
            }
          </button>

        </form>

        {/* Sign in link */}
        <p className="auth-switch">
          Already have an account?{' '}
          <Link href="/login" className="auth-link">Sign in</Link>
        </p>

      </div>
    </div>
  )
}
