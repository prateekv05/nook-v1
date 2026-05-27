'use client';

import { useState, useEffect } from 'react';
import { createClient } from '../../../lib/supabase';

export default function Step02Auth({ state, setState, onNext }) {
  const [mode, setMode]     = useState(state?.authMode === 'signin' ? 'signin' : 'signup');
  const [checking, setChecking] = useState(true);
  const [email, setEmail]   = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const isSignup = mode === 'signup';

  useEffect(() => {
    async function checkSession() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setChecking(false); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', session.user.id)
        .single();

      if (profile?.onboarding_completed) {
        window.location.href = '/dashboard';
      } else {
        onNext();
      }
    }
    checkSession();
  }, []);

  function switchMode(m) {
    setMode(m);
    setError('');
    setShowPw(false);
    setShowCpw(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (isSignup) {
      if (password !== confirmPw) { setError('Passwords do not match.'); return; }
      if (password.length < 8)   { setError('Password must be at least 8 characters.'); return; }
    }

    setLoading(true);
    const supabase = createClient();

    if (isSignup) {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        },
      });

      setLoading(false);
      if (authError) { setError(authError.message); return; }

      setState(s => ({ ...s, email }));

      if (!data.session) {
        setEmailSent(true);
        return;
      }

      onNext();
    } else {
      const { data: signInData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      setLoading(false);
      if (authError) { setError(authError.message); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', signInData.user.id)
        .single();

      if (profile?.onboarding_completed) {
        window.location.href = '/dashboard';
      } else {
        onNext();
      }
    }
  }

  if (checking) return null;

  if (emailSent) {
    return (
      <>
        <div className="ob-heading-block">
          <h1 className="ob-headline" style={{ fontSize: '36px', lineHeight: '1.1' }}>
            Check your email.
          </h1>
          <p className="ob-subtext">
            We sent a confirmation link to <strong style={{ color: 'var(--text-1)' }}>{email}</strong>.
            <br />Click it to verify your account, then sign in.
          </p>
        </div>

        <button
          type="button"
          className="ob-submit-btn"
          style={{ marginTop: 8 }}
          onClick={() => { setEmailSent(false); switchMode('signin'); }}
        >
          Back to sign in
        </button>
      </>
    );
  }

  return (
    <>
      <div className="ob-heading-block">
        <h1 className="ob-headline" style={{ fontSize: '36px', lineHeight: '1.1' }}>
          {isSignup ? 'Create account.' : 'Welcome back.'}
        </h1>
        <p className="ob-subtext">
          {isSignup ? 'Join Nook today.' : 'Sign in to your Nook account.'}
        </p>
      </div>

      <div className="ob-mode-tabs" role="tablist">
        <button
          type="button"
          className={`ob-mode-tab${!isSignup ? ' active' : ''}`}
          role="tab"
          aria-selected={!isSignup}
          onClick={() => switchMode('signin')}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`ob-mode-tab${isSignup ? ' active' : ''}`}
          role="tab"
          aria-selected={isSignup}
          onClick={() => switchMode('signup')}
        >
          Create account
        </button>
      </div>

      <form className="ob-form" onSubmit={handleSubmit} noValidate>
        <div className="ob-field">
          <label className="ob-field-label" htmlFor="s2-email">Email</label>
          <div className="ob-input-wrap">
            <input
              className="ob-input"
              type="email"
              id="s2-email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="ob-field">
          <label className="ob-field-label" htmlFor="s2-password">Password</label>
          <div className="ob-input-wrap">
            <input
              className="ob-input has-action"
              type={showPw ? 'text' : 'password'}
              id="s2-password"
              placeholder="••••••••"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <button
              type="button"
              className="ob-input-action"
              onClick={() => setShowPw(v => !v)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              <i className={`ph-bold ${showPw ? 'ph-eye-slash' : 'ph-eye'}`} />
            </button>
          </div>
        </div>

        {isSignup && (
          <div className="ob-field">
            <label className="ob-field-label" htmlFor="s2-confirm-pw">Confirm password</label>
            <div className="ob-input-wrap">
              <input
                className="ob-input has-action"
                type={showCpw ? 'text' : 'password'}
                id="s2-confirm-pw"
                placeholder="••••••••"
                autoComplete="new-password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="ob-input-action"
                onClick={() => setShowCpw(v => !v)}
                aria-label={showCpw ? 'Hide password' : 'Show password'}
              >
                <i className={`ph-bold ${showCpw ? 'ph-eye-slash' : 'ph-eye'}`} />
              </button>
            </div>
          </div>
        )}

        {!isSignup && (
          <a href="#" className="ob-forgot">Forgot password?</a>
        )}

        {error && (
          <p style={{ fontSize: 13, color: 'var(--error-col)', margin: '4px 0 0', lineHeight: 1.4 }}>
            {error}
          </p>
        )}

        <button type="submit" className="ob-submit-btn" disabled={loading || !email || !password}>
          {loading
            ? <><i className="ph-bold ph-spinner-gap" style={{ animation: 'spin 0.7s linear infinite' }} /> {isSignup ? 'Creating…' : 'Signing in…'}</>
            : isSignup ? 'Create account' : 'Sign in'
          }
        </button>
      </form>

      <button
        type="button"
        className="ob-bottom-link"
        style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: 'auto' }}
        onClick={() => switchMode(isSignup ? 'signin' : 'signup')}
      >
        {isSignup
          ? <span>Already have an account? <span>Sign in</span></span>
          : <span>New here? <span>Create account</span></span>
        }
      </button>
    </>
  );
}
