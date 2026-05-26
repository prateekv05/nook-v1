'use client';

const FEATURES = [
  { icon: 'ph-brain',         variant: 'accent', title: 'AI Coach',             sub: 'Personalized nudges based on your goals and habits' },
  { icon: 'ph-chart-line-up', variant: 'know',   title: 'Advanced Analytics',   sub: 'Trends, correlations, and weekly progress reports' },
  { icon: 'ph-target',        variant: 'life',   title: 'Custom Goals',         sub: 'Unlimited goal tracking across all life domains' },
  { icon: 'ph-download-simple',variant: 'fin',   title: 'Export Data',          sub: 'Download your full history as CSV or PDF anytime' },
  { icon: 'ph-headset',       variant: 'accent', title: 'Priority Support',     sub: 'Fast responses from our team, 7 days a week' },
];

export default function Step03Signup({ onNext, goToStep }) {
  return (
    <>
      <div className="ob-trial-badge">
        <i className="ph-bold ph-sparkle" />
        Free 7-day trial · No card needed
      </div>

      <div className="ob-heading-block">
        <h1 className="ob-headline">
          Grow with intention.<br />Every single day.
        </h1>
        <p className="ob-subtext">Cancel anytime.</p>
      </div>

      <div className="ob-features-card" role="list">
        {FEATURES.map(({ icon, variant, title, sub }) => (
          <div className="ob-feature-row" role="listitem" key={title}>
            <div className={`ob-feature-icon ${variant}`}>
              <i className={`ph-bold ${icon}`} />
            </div>
            <div className="ob-feature-text">
              <div className="ob-feature-title">{title}</div>
              <div className="ob-feature-sub">{sub}</div>
            </div>
            <div className="ob-feature-check">
              <i className="ph-bold ph-check" />
            </div>
          </div>
        ))}
      </div>

      <div className="ob-social-proof">
        <div className="ob-proof-avatars" aria-hidden="true">
          <div className="ob-proof-avatar">AL</div>
          <div className="ob-proof-avatar alt-1">MK</div>
          <div className="ob-proof-avatar alt-2">JR</div>
        </div>
        <p className="ob-proof-text"><strong>12,400+</strong> people growing with Nook</p>
      </div>

      <div className="ob-cta-area">
        <button type="button" className="ob-cta-btn" onClick={onNext}>
          <i className="ph-bold ph-arrow-right" />
          Start free trial
        </button>
        <button
          type="button"
          className="ob-plans-link"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={() => goToStep(13)}
        >
          See all plans
        </button>
      </div>
    </>
  );
}
