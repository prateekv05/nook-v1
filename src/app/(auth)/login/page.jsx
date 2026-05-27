'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
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
        <h1 className="auth-heading">Welcome back.</h1>

        <form onSubmit={handleSubmit} noValidate>

          {/* Email */}
          <div className="auth-field">
            <div className="ob-input-wrap">
              <input
                className="ob-input"
                type="email"
                placeholder="Email address"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <div className="ob-input-wrap">
              <input
                className="ob-input has-action"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="ob-input-action"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={0}
              >
                <i className={showPassword ? 'ph-bold ph-eye-slash' : 'ph-bold ph-eye'} />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="auth-error">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="ob-cta-btn auth-submit"
            disabled={loading || !email || !password}
          >
            {loading
              ? <><i className="ph-bold ph-spinner-gap auth-spinner" />Signing in…</>
              : 'Sign in'
            }
          </button>

          {/* Forgot password */}
          <div className="auth-forgot">
            <button type="button" className="auth-text-btn">
              Forgot password?
            </button>
          </div>

        </form>

        {/* Sign up link */}
        <p className="auth-switch">
          New to Nook?{' '}
          <Link href="/signup" className="auth-link">Create account</Link>
        </p>

      </div>
    </div>
  )
}
