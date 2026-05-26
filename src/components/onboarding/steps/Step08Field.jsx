'use client';

import { useState, useRef } from 'react';

const FIELDS = [
  'Technology', 'Finance', 'Healthcare', 'Education', 'Law',
  'Marketing', 'Design', 'Engineering', 'Science', 'Business',
  'Arts', 'Government', 'Other',
];

export default function Step08Field({ state, setState, onNext }) {
  const [selected, setSelected] = useState(state.field || '');
  const [otherText, setOtherText] = useState(state.fieldOther || '');
  const otherInputRef = useRef(null);

  const isOther = selected === 'Other';
  const canContinue = selected !== '' && (!isOther || otherText.trim().length > 0);

  function toggle(value) {
    if (selected === value) {
      setSelected('');
      if (value === 'Other') setOtherText('');
    } else {
      setSelected(value);
      if (value === 'Other') {
        setTimeout(() => otherInputRef.current?.focus(), 50);
      } else {
        setOtherText('');
      }
    }
  }

  function handleContinue() {
    if (!canContinue) return;
    setState(s => ({ ...s, field: isOther ? otherText.trim() : selected, fieldOther: otherText }));
    onNext();
  }

  return (
    <>
      <div className="ob-heading-block" style={{ marginBottom: '28px' }}>
        <h1 className="ob-headline">What&apos;s your field?</h1>
        <p className="ob-subtext">We&apos;ll tailor your financial and knowledge content.</p>
      </div>

      <div className="ob-pill-grid" role="group" aria-label="Professional field">
        {FIELDS.map(f => (
          <button
            key={f}
            type="button"
            className="ob-pill"
            aria-pressed={selected === f}
            onClick={() => toggle(f)}
          >
            <span className="ob-pill-dot" aria-hidden="true" />
            {f}
          </button>
        ))}
      </div>

      <div className={`ob-other-reveal${isOther ? ' open' : ''}`} aria-hidden={!isOther}>
        <div className="ob-other-inner">
          <label
            className="ob-field-label"
            htmlFor="s8-other-input"
            style={{ display: 'block', marginTop: '4px', marginBottom: '6px' }}
          >
            Your field
          </label>
          <input
            ref={otherInputRef}
            className="ob-input"
            type="text"
            id="s8-other-input"
            name="other-field"
            placeholder="e.g. Architecture, Real Estate…"
            autoCapitalize="words"
            tabIndex={isOther ? 0 : -1}
            value={otherText}
            onChange={e => setOtherText(e.target.value)}
          />
        </div>
      </div>

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
