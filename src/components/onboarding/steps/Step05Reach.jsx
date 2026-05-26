'use client';

import { useState } from 'react';

function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function Step05Reach({ state, setState, onNext }) {
  const [touched, setTouched] = useState(false);

  const email   = state.email;
  const confirm = state.confirmEmail;

  const emailOk   = isValidEmail(email);
  const confirmOk = confirm.length > 0 && email === confirm;
  const canContinue = emailOk && confirmOk;

  function emailStatus() {
    if (!email) return null;
    return emailOk ? 'ok' : 'err';
  }

  function confirmStatus() {
    if (!confirm) return null;
    if (email === confirm) return 'ok';
    return 'err';
  }

  function handleContinue() {
    setTouched(true);
    if (canContinue) onNext();
  }

  const es = emailStatus();
  const cs = confirmStatus();

  return (
    <>
      <div className="ob-heading-block">
        <h1 className="ob-headline">
          Where should we<br />reach you?
        </h1>
        <p className="ob-subtext">We&apos;ll send your progress reports here.</p>
      </div>

      <form
        className="ob-form"
        noValidate
        onSubmit={e => { e.preventDefault(); handleContinue(); }}
      >
        <div className={`ob-field${touched && !emailOk ? ' has-error' : ''}`}>
          <label className="ob-field-label" htmlFor="s5-email">Email address</label>
          <div className="ob-input-wrap">
            <input
              className={`ob-input${email ? (emailOk ? ' valid' : ' error') : ''}`}
              style={es ? { paddingRight: '40px' } : undefined}
              type="email"
              id="s5-email"
              name="email"
              placeholder="alex@example.com"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={e => setState(s => ({ ...s, email: e.target.value }))}
            />
            <span
              className={`ob-input-status ${es || ''}${es ? ' show' : ''}`}
              aria-hidden="true"
            >
              <i className={`ph-bold ${es === 'ok' ? 'ph-check-circle' : 'ph-x-circle'}`} />
            </span>
          </div>
          {touched && !emailOk && (
            <span className="ob-field-error show" role="alert">
              Enter a valid email address.
            </span>
          )}
        </div>

        <div className={`ob-field${touched && confirm && !confirmOk ? ' has-error' : ''}`}>
          <label className="ob-field-label" htmlFor="s5-confirm">Confirm email</label>
          <div className="ob-input-wrap">
            <input
              className={`ob-input${confirm ? (confirmOk ? ' valid' : ' error') : ''}`}
              style={cs ? { paddingRight: '40px' } : undefined}
              type="email"
              id="s5-confirm"
              name="confirm-email"
              placeholder="alex@example.com"
              autoComplete="email"
              inputMode="email"
              value={confirm}
              onChange={e => setState(s => ({ ...s, confirmEmail: e.target.value }))}
            />
            <span
              className={`ob-input-status ${cs || ''}${cs ? ' show' : ''}`}
              aria-hidden="true"
            >
              <i className={`ph-bold ${cs === 'ok' ? 'ph-check-circle' : 'ph-x-circle'}`} />
            </span>
          </div>
          {touched && confirm && !confirmOk && (
            <span className="ob-field-error show" role="alert">
              Emails don&apos;t match.
            </span>
          )}
        </div>

        <div className="ob-privacy-note" role="note">
          <i className="ph-bold ph-lock-simple" />
          <p>We&apos;ll only email what matters. No spam, ever.</p>
        </div>
      </form>

      <div className="ob-cta-area">
        <button
          type="button"
          className="ob-cta-btn"
          aria-disabled={!canContinue}
          onClick={handleContinue}
        >
          Continue
          <i className="ph-bold ph-arrow-right" />
        </button>
      </div>
    </>
  );
}
