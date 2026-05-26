'use client';

import { useState } from 'react';

const FREE_FEATURES = [
  { icon: 'ph-chart-line-up', label: '3 stocks in watchlist' },
  { icon: 'ph-newspaper',     label: '5 news topics' },
  { icon: 'ph-notebook',      label: 'Journal' },
  { icon: 'ph-check-square',  label: 'Checklist' },
  { icon: 'ph-activity',      label: 'Tracking' },
  { icon: 'ph-star',          label: 'Day Score' },
];

const PRO_FEATURES = [
  { icon: 'ph-check',           label: 'Everything in Free' },
  { icon: 'ph-chart-line-up',   label: 'Unlimited stocks' },
  { icon: 'ph-sparkle',         label: 'AI insights' },
  { icon: 'ph-brain',           label: 'AI Coach' },
  { icon: 'ph-chart-bar',       label: 'Advanced Analytics' },
  { icon: 'ph-target',          label: 'Custom Goals' },
  { icon: 'ph-download-simple', label: 'Export Data' },
  { icon: 'ph-headset',         label: 'Priority Support' },
];

export default function Step13Plans({ goToStep }) {
  const [billing, setBilling] = useState('monthly');
  const isAnnual = billing === 'annual';

  return (
    <>
      <div className="ob-plans-topnav">
        <button
          type="button"
          className="ob-back-btn"
          aria-label="Go back"
          onClick={() => goToStep(3)}
        >
          <i className="ph-bold ph-arrow-left" />
        </button>
      </div>

      <div className="ob-heading-block" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 className="ob-headline">Simple, honest pricing.</h1>
        <p className="ob-subtext">Start free. Upgrade when you&apos;re ready.</p>
      </div>

      <div className="ob-billing-toggle" role="group" aria-label="Billing period">
        <button
          type="button"
          className={`ob-billing-tab${!isAnnual ? ' active' : ''}`}
          onClick={() => setBilling('monthly')}
        >
          Monthly
        </button>
        <button
          type="button"
          className={`ob-billing-tab${isAnnual ? ' active' : ''}`}
          onClick={() => setBilling('annual')}
        >
          Annual
          <span className="ob-billing-save">Save 29%</span>
        </button>
      </div>

      <div className="ob-plan-grid">
        <div className="ob-plan-card">
          <div className="ob-plan-name">Free</div>
          <div className="ob-plan-price-row">
            <span className="ob-plan-price">$0</span>
            <span className="ob-plan-period">forever</span>
          </div>
          <div className="ob-plan-price-alt">&nbsp;</div>
          <ul className="ob-plan-feat-list" role="list">
            {FREE_FEATURES.map(({ icon, label }) => (
              <li key={label} className="ob-plan-feat-item">
                <span className="ob-plan-feat-check">
                  <i className={`ph-bold ${icon}`} />
                </span>
                {label}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="ob-plan-cta"
            onClick={() => goToStep(4)}
          >
            Continue for free
          </button>
        </div>

        <div className="ob-plan-card pro">
          <div className="ob-plan-badge">
            <i className="ph-bold ph-star" />
            Most popular
          </div>
          <div className="ob-plan-name pro">Pro</div>
          <div className="ob-plan-price-row">
            <span className="ob-plan-price pro">{isAnnual ? '$4.99' : '$6.99'}</span>
            <span className="ob-plan-period pro">/mo</span>
          </div>
          <div className="ob-plan-price-alt pro">
            {isAnnual ? '$59.99/yr · save 29%' : 'billed monthly'}
          </div>
          <ul className="ob-plan-feat-list" role="list">
            {PRO_FEATURES.map(({ icon, label }) => (
              <li key={label} className="ob-plan-feat-item pro">
                <span className="ob-plan-feat-check pro">
                  <i className={`ph-bold ${icon}`} />
                </span>
                {label}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="ob-plan-cta pro"
            onClick={() => goToStep(4)}
          >
            Start 7-day free trial
            <i className="ph-bold ph-arrow-right" />
          </button>
        </div>
      </div>

      <div className="ob-social-proof" style={{ justifyContent: 'center', marginTop: '20px', marginBottom: '32px' }}>
        <div className="ob-proof-avatars" aria-hidden="true">
          <div className="ob-proof-avatar">AL</div>
          <div className="ob-proof-avatar alt-1">MK</div>
          <div className="ob-proof-avatar alt-2">JR</div>
        </div>
        <p className="ob-proof-text"><strong>12,400+</strong> people growing with Nook Pro</p>
      </div>
    </>
  );
}
