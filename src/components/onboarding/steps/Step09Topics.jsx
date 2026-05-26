'use client';

import { useState } from 'react';

const MAX = 5;
const OPTIONS = [
  { value: 'ai-technology',   label: 'AI & Technology' },
  { value: 'business-markets', label: 'Business & Markets' },
  { value: 'geopolitics',     label: 'Geopolitics' },
  { value: 'health-medicine', label: 'Health & Medicine' },
  { value: 'science-space',   label: 'Science & Space' },
  { value: 'environment',     label: 'Environment' },
  { value: 'culture-society', label: 'Culture & Society' },
  { value: 'sports',          label: 'Sports' },
  { value: 'law-policy',      label: 'Law & Policy' },
  { value: 'psychology',      label: 'Psychology' },
  { value: 'philosophy',      label: 'Philosophy' },
  { value: 'history',         label: 'History' },
  { value: 'economics',       label: 'Economics' },
  { value: 'design',          label: 'Design' },
  { value: 'finance',         label: 'Finance' },
];

export default function Step09Topics({ state, setState, onNext }) {
  const [selected, setSelected] = useState(new Set(state.topics || []));

  const count = selected.size;
  const atLimit = count === MAX;
  const canContinue = count >= 1;

  function toggle(value) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        if (next.size >= MAX) return prev;
        next.add(value);
      }
      return next;
    });
  }

  function handleContinue() {
    if (!canContinue) return;
    setState(s => ({ ...s, topics: [...selected] }));
    onNext();
  }

  return (
    <>
      <div className="ob-heading-block" style={{ marginBottom: '24px' }}>
        <h1 className="ob-headline">What topics interest you?</h1>
        <p className="ob-subtext">Pick up to 5 — drives your daily news feed.</p>
      </div>

      <div className="ob-pill-grid" role="group" aria-label="Topics of interest">
        {OPTIONS.map(({ value, label }) => {
          const isSelected = selected.has(value);
          const isDimmed = atLimit && !isSelected;
          return (
            <button
              key={value}
              type="button"
              className={`ob-pill${isDimmed ? ' dimmed' : ''}`}
              aria-pressed={isSelected}
              onClick={() => toggle(value)}
            >
              <span className="ob-pill-dot" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>

      <div className="ob-counter-row">
        <span
          className={`ob-counter${atLimit ? ' at-limit' : ''}`}
          aria-live="polite"
          aria-atomic="true"
        >
          {count} of {MAX} selected
        </span>
        <div className="ob-counter-pips" aria-hidden="true">
          {Array.from({ length: MAX }, (_, i) => (
            <div key={i} className={`ob-pip${i < count ? ' filled' : ''}`} />
          ))}
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
