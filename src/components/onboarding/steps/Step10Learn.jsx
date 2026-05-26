'use client';

import { useState } from 'react';

const MAX = 5;
const OPTIONS = [
  { value: 'personal-development', label: 'Personal Development' },
  { value: 'philosophy',           label: 'Philosophy' },
  { value: 'psychology',           label: 'Psychology' },
  { value: 'history',              label: 'History' },
  { value: 'economics',            label: 'Economics' },
  { value: 'leadership',           label: 'Leadership' },
  { value: 'science',              label: 'Science' },
  { value: 'writing',              label: 'Writing' },
  { value: 'technology-ai',        label: 'Technology & AI' },
  { value: 'creativity',           label: 'Creativity' },
  { value: 'ethics-society',       label: 'Ethics & Society' },
  { value: 'entrepreneurship',     label: 'Entrepreneurship' },
  { value: 'stoicism',             label: 'Stoicism' },
  { value: 'productivity',         label: 'Productivity' },
  { value: 'investing',            label: 'Investing' },
];

export default function Step10Learn({ state, setState, onNext }) {
  const [selected, setSelected] = useState(new Set(state.learning || []));

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
    setState(s => ({ ...s, learning: [...selected] }));
    onNext();
  }

  return (
    <>
      <div className="ob-heading-block" style={{ marginBottom: '24px' }}>
        <h1 className="ob-headline">What do you want to learn?</h1>
        <p className="ob-subtext">Shapes your Concept of the Day and reading list.</p>
      </div>

      <div className="ob-pill-grid" role="group" aria-label="Learning interests">
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
