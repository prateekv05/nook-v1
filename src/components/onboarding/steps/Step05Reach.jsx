'use client';

import { useState } from 'react';

export default function Step05Reach({ state, setState, onNext }) {
  const [touched, setTouched] = useState(false);

  const username = state.username || '';
  const dob      = state.dob || '';

  const usernameOk = username.trim().length >= 2;
  const canContinue = usernameOk;

  const maxDate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 13);
    return d.toISOString().split('T')[0];
  })();

  function handleContinue() {
    setTouched(true);
    if (canContinue) onNext();
  }

  return (
    <>
      <div className="ob-heading-block">
        <h1 className="ob-headline">
          Tell us a bit<br />more about you.
        </h1>
        <p className="ob-subtext">Choose a display name and, optionally, your date of birth.</p>
      </div>

      <form
        className="ob-form"
        noValidate
        onSubmit={e => { e.preventDefault(); handleContinue(); }}
      >
        <div className={`ob-field${touched && !usernameOk ? ' has-error' : ''}`}>
          <label className="ob-field-label" htmlFor="s5-username">Display name</label>
          <input
            className={`ob-input${username ? (usernameOk ? ' valid' : ' error') : ''}`}
            type="text"
            id="s5-username"
            name="username"
            placeholder="e.g. alex_nook"
            autoComplete="nickname"
            autoCapitalize="none"
            value={username}
            onChange={e => setState(s => ({ ...s, username: e.target.value }))}
          />
          {touched && !usernameOk && (
            <span className="ob-field-error show" role="alert">
              Enter a display name (at least 2 characters).
            </span>
          )}
        </div>

        <div className="ob-field">
          <label className="ob-field-label" htmlFor="s5-dob">
            Date of birth
            <span style={{ color: 'var(--text-3)', fontWeight: 400, marginLeft: '6px' }}>· optional</span>
          </label>
          <input
            className="ob-input"
            type="date"
            id="s5-dob"
            name="dob"
            autoComplete="bday"
            max={maxDate}
            value={dob}
            onChange={e => setState(s => ({ ...s, dob: e.target.value }))}
          />
        </div>

        <div className="ob-privacy-note" role="note">
          <i className="ph-bold ph-lock-simple" />
          <p>Your date of birth is never shared publicly — used only to personalise your experience.</p>
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
