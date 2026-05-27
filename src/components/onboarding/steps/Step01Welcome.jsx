'use client';

export default function Step01Welcome({ onNext, setState }) {
  return (
    <>
      <header className="ob-logo-row">
        <div className="ob-logo-mark">N</div>
        <span className="ob-wordmark">Nook</span>
      </header>

      <section className="ob-hero">
        <div className="ob-icon-wrap">
          <div className="ob-icon-glow" />
          <div className="ob-icon-bg">
            <i className="ph-bold ph-compass-rose" />
          </div>
        </div>
        <h1 className="ob-headline" style={{ fontSize: '30px' }}>
          Your corner to log, learn and grow.
        </h1>
        <p className="ob-subtext" style={{ color: 'var(--text-2)' }}>
          One place for finances, knowledge, habits and goals.
        </p>
      </section>

      <div className="ob-features">
        <div className="ob-feat-row">
          <div className="ob-feat-icon log">
            <i className="ph-bold ph-pencil-simple" />
          </div>
          <div className="ob-feat-text">
            <div className="ob-feat-title">Log</div>
            <div className="ob-feat-desc">Track spending, habits, moods and meals daily.</div>
          </div>
        </div>
        <div className="ob-feat-row">
          <div className="ob-feat-icon learn">
            <i className="ph-bold ph-books" />
          </div>
          <div className="ob-feat-text">
            <div className="ob-feat-title">Learn</div>
            <div className="ob-feat-desc">Stay sharp with curated news, words and concepts.</div>
          </div>
        </div>
        <div className="ob-feat-row">
          <div className="ob-feat-icon grow">
            <i className="ph-bold ph-trend-up" />
          </div>
          <div className="ob-feat-text">
            <div className="ob-feat-title">Grow</div>
            <div className="ob-feat-desc">Build goals, streaks and a richer financial picture.</div>
          </div>
        </div>
      </div>

      <div className="ob-cta-area">
        <button type="button" className="ob-cta-btn" onClick={onNext}>
          Get started
          <i className="ph-bold ph-arrow-right" />
        </button>
        <button
          type="button"
          className="ob-signin-link"
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          onClick={() => { setState(s => ({ ...s, authMode: 'signin' })); onNext(); }}
        >
          Already have an account? <span>Sign in</span>
        </button>
      </div>
    </>
  );
}
