'use client';

import { useState, useRef } from 'react';

const OPTIONS = [
  { value: 'man',        label: 'Man' },
  { value: 'woman',      label: 'Woman' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not', label: 'Prefer not to say' },
  { value: 'other',      label: 'Other' },
];

export default function Step06Gender({ state, setState, onNext }) {
  const selected = state.gender;
  const [otherText, setOtherText] = useState(state.genderOther || '');
  const otherInputRef = useRef(null);

  const isOther = selected === 'other';

  function toggle(value) {
    if (selected === value) {
      setState(s => ({ ...s, gender: '' }));
      if (value === 'other') setOtherText('');
    } else {
      setState(s => ({ ...s, gender: value }));
      if (value === 'other') {
        setTimeout(() => otherInputRef.current?.focus(), 50);
      } else {
        setOtherText('');
        setState(s => ({ ...s, genderOther: '' }));
      }
    }
  }

  function handleSkip() {
    setState(s => ({ ...s, gender: '', genderOther: '' }));
    onNext();
  }

  function handleContinue() {
    if (isOther) {
      setState(s => ({ ...s, genderOther: otherText.trim() }));
    }
    onNext();
  }

  return (
    <>
      <div className="ob-heading-block">
        <h1 className="ob-headline">How do you identify?</h1>
        <p className="ob-subtext">Optional — helps us personalise your experience.</p>
      </div>

      <div className="ob-pill-group" role="group" aria-label="Gender identity">
        {OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className="ob-pill"
            aria-pressed={selected === value}
            onClick={() => toggle(value)}
          >
            <span className="ob-pill-label">{label}</span>
            <span className="ob-pill-check" aria-hidden="true">
              <i className="ph-bold ph-check" />
            </span>
          </button>
        ))}
      </div>

      <div className={`ob-other-reveal${isOther ? ' open' : ''}`} aria-hidden={!isOther}>
        <div className="ob-other-inner">
          <label
            className="ob-field-label"
            htmlFor="s6-other-input"
            style={{ display: 'block', marginTop: '4px', marginBottom: '6px' }}
          >
            Your identity
          </label>
          <input
            ref={otherInputRef}
            className="ob-input"
            type="text"
            id="s6-other-input"
            name="gender-other"
            placeholder="e.g. Genderqueer, Agender…"
            autoCapitalize="words"
            tabIndex={isOther ? 0 : -1}
            value={otherText}
            onChange={e => setOtherText(e.target.value)}
          />
        </div>
      </div>

      <div className="ob-cta-area">
        <button type="button" className="ob-cta-btn" onClick={handleContinue}>
          Continue
          <i className="ph-bold ph-arrow-right" />
        </button>
        <button
          type="button"
          className="ob-skip-link"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={handleSkip}
        >
          Skip for now
        </button>
      </div>
    </>
  );
}
