'use client';

import { useState } from 'react';

export default function Step04Name({ state, setState, onNext }) {
  const [touched, setTouched] = useState(false);

  const first = state.name.first;
  const last  = state.name.last;
  const canContinue = first.trim().length > 0;

  function handleContinue() {
    setTouched(true);
    if (canContinue) onNext();
  }

  return (
    <>
      <div className="ob-heading-block">
        <h1 className="ob-headline">
          What should we<br />call you?
        </h1>
        <p className="ob-subtext">This is how we&apos;ll greet you inside Nook.</p>
      </div>

      <form className="ob-form" noValidate onSubmit={e => { e.preventDefault(); handleContinue(); }}>
        <div className="ob-form-row">
          <div className={`ob-field${touched && !first.trim() ? ' has-error' : ''}`}>
            <label className="ob-field-label" htmlFor="s4-first">First name</label>
            <input
              className={`ob-input${touched && !first.trim() ? ' error' : first.trim() ? ' valid' : ''}`}
              type="text"
              id="s4-first"
              name="first-name"
              placeholder="Alex"
              autoComplete="given-name"
              autoCapitalize="words"
              value={first}
              onChange={e => setState(s => ({ ...s, name: { ...s.name, first: e.target.value } }))}
            />
          </div>
          <div className="ob-field">
            <label className="ob-field-label" htmlFor="s4-last">Last name</label>
            <input
              className="ob-input"
              type="text"
              id="s4-last"
              name="last-name"
              placeholder="Lewis"
              autoComplete="family-name"
              autoCapitalize="words"
              value={last}
              onChange={e => setState(s => ({ ...s, name: { ...s.name, last: e.target.value } }))}
            />
          </div>
        </div>

        <div className="ob-privacy-note" role="note">
          <i className="ph-bold ph-lock-simple" />
          <p>Your name is only used to personalise your experience.</p>
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
