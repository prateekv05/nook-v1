'use client';

const OPTIONS = [
  { value: 'man',        label: 'Man' },
  { value: 'woman',      label: 'Woman' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not', label: 'Prefer not to say' },
  { value: 'other',      label: 'Other' },
];

export default function Step06Gender({ state, setState, onNext }) {
  const selected = state.gender;

  function toggle(value) {
    setState(s => ({ ...s, gender: s.gender === value ? '' : value }));
  }

  function handleSkip() {
    setState(s => ({ ...s, gender: '' }));
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

      <div className="ob-cta-area">
        <button type="button" className="ob-cta-btn" onClick={onNext}>
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
