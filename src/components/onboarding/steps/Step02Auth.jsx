'use client';

import { useState } from 'react';

export default function Step02Auth({ onNext }) {
  const [mode, setMode]       = useState('signin');
  const [showPw, setShowPw]   = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const isSignup = mode === 'signup';

  function switchMode(m) {
    setMode(m);
    setShowPw(false);
    setShowCpw(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onNext();
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
        {isSignup && (
          <div className="ob-field">
            <label className="ob-field-label" htmlFor="s2-username">Username</label>
            <div className="ob-input-wrap">
              <input
                className="ob-input"
                type="text"
                id="s2-username"
                name="username"
                placeholder="alexlewis"
                autoComplete="username"
              />
            </div>
          </div>
        )}

        {isSignup && (
          <div className="ob-field">
            <label className="ob-field-label" htmlFor="s2-dob">Date of birth</label>
            <div className="ob-input-wrap">
              <input
                className="ob-input"
                type="date"
                id="s2-dob"
                name="dob"
              />
            </div>
          </div>
        )}

        <div className="ob-field">
          <label className="ob-field-label" htmlFor="s2-email">Email</label>
          <div className="ob-input-wrap">
            <input
              className="ob-input"
              type="email"
              id="s2-email"
              name="email"
              placeholder="you@example.com"
              autoComplete="email"
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
              name="password"
              placeholder="••••••••"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
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
                name="confirm-password"
                placeholder="••••••••"
                autoComplete="new-password"
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

        <button type="submit" className="ob-submit-btn">
          {isSignup ? 'Create account' : 'Sign in'}
        </button>
      </form>

      <div className="ob-divider">
        <div className="ob-divider-line" />
        <span className="ob-divider-text">or continue with</span>
        <div className="ob-divider-line" />
      </div>

      <div className="ob-social-row">
        <button type="button" className="ob-social-btn google" onClick={onNext}>
          <i className="ph-bold ph-google-logo" /> Google
        </button>
        <button type="button" className="ob-social-btn apple" onClick={onNext}>
          <i className="ph-bold ph-apple-logo" /> Apple
        </button>
      </div>

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
