'use client';

import { useState } from 'react';

const REGULAR = [
  { value: 'stocks',       label: 'Stocks' },
  { value: 'etfs',         label: 'ETFs' },
  { value: 'reits',        label: 'REITs' },
  { value: 'real-estate',  label: 'Real Estate' },
  { value: 'crypto',       label: 'Crypto' },
  { value: 'bonds',        label: 'Bonds' },
  { value: 'index-funds',  label: 'Index Funds' },
];

const NO_IDEA = 'no-idea';

export default function Step11Finance({ state, setState, onNext }) {
  const [selected, setSelected] = useState(new Set(state.finance || []));

  const noIdeaSelected = selected.has(NO_IDEA);
  const canContinue = selected.size > 0;

  function toggleRegular(value) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.delete(NO_IDEA);
        next.add(value);
      }
      return next;
    });
  }

  function toggleNoIdea() {
    setSelected(prev => {
      if (prev.has(NO_IDEA)) {
        return new Set();
      }
      return new Set([NO_IDEA]);
    });
  }

  function handleContinue() {
    if (!canContinue) return;
    setState(s => ({ ...s, finance: [...selected] }));
    onNext();
  }

  return (
    <>
      <div className="ob-heading-block">
        <h1 className="ob-headline">What financial instruments<br />interest you?</h1>
        <p className="ob-subtext">We&apos;ll personalise your Financial dashboard.</p>
      </div>

      <div className="ob-pill-grid" role="group" aria-label="Financial instruments">
        {REGULAR.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            className={`ob-pill${noIdeaSelected ? ' dimmed' : ''}`}
            aria-pressed={selected.has(value)}
            onClick={() => toggleRegular(value)}
          >
            <span className="ob-pill-dot" aria-hidden="true" />
            {label}
          </button>
        ))}

        <div className="ob-pill-divider" role="separator" aria-hidden="true" />

        <button
          type="button"
          className="ob-pill exclusive"
          aria-pressed={noIdeaSelected}
          onClick={toggleNoIdea}
        >
          <span className="ob-pill-dot" aria-hidden="true" />
          No idea yet
        </button>
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
