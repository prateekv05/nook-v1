'use client';
import { useEffect } from 'react';

const FEATURES = [
  'Unlimited stock watchlist',
  'AI sentiment per ticker (Bullish / Neutral / Bearish)',
  'Daily expense log + monthly breakdown',
  'Income goal tracker with AI nudges',
  'All Knowledge, Lifestyle & Tracking Pro features',
];

export default function UpgradeModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="upgrade-modal open"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="upgrade-box">
        <div className="upgrade-icon">
          <i className="ph-bold ph-star" />
        </div>
        <div className="upgrade-title">Unlock Nook Pro</div>
        <p className="upgrade-desc">
          You're on the free plan. Upgrade to Pro to unlock unlimited watchlist stocks, AI
          insights, expense tracking, and every premium feature across all sections.
        </p>

        <div className="upgrade-features">
          {FEATURES.map((feat) => (
            <div className="upgrade-feat-item" key={feat}>
              <i className="ph-bold ph-check upgrade-feat-check" />
              {feat}
            </div>
          ))}
        </div>

        <div className="upgrade-price">
          $6.99<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-3)' }}>/mo</span>
        </div>
        <div className="upgrade-price-sub">or $59.99/yr · save 29%</div>

        <button className="upgrade-cta" onClick={onClose}>
          Start 7-day free trial
        </button>
        <button className="upgrade-dismiss" onClick={onClose}>
          Maybe later
        </button>
      </div>
    </div>
  );
}
