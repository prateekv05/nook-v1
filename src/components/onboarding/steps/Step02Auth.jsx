'use client';

export default function Step02Auth({ onNext }) {
  return (
    <>
      <div className="ob-heading-block">
        <h1 className="ob-headline" style={{ fontSize: '36px', lineHeight: '1.1' }}>
          Welcome.
        </h1>
        <p className="ob-subtext">Sign in or create your account.</p>
      </div>

      <div className="ob-auth-col">
        <button type="button" className="ob-auth-btn google" onClick={onNext}>
          <i className="ph-bold ph-google-logo" />
          <span className="ob-auth-label">Continue with Google</span>
        </button>
        <button type="button" className="ob-auth-btn apple" onClick={onNext}>
          <i className="ph-bold ph-apple-logo" />
          <span className="ob-auth-label">Continue with Apple</span>
        </button>
        <button type="button" className="ob-auth-btn email" onClick={onNext}>
          <i className="ph-bold ph-envelope" />
          <span className="ob-auth-label">Continue with Email</span>
        </button>
      </div>

      <div className="ob-divider">
        <div className="ob-divider-line" />
        <span className="ob-divider-text">or</span>
        <div className="ob-divider-line" />
      </div>

      <div className="ob-cta-area" style={{ paddingTop: '0' }}>
        <button
          type="button"
          className="ob-bottom-link"
          style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: 'auto' }}
          onClick={onNext}
        >
          New here? <span>Create account</span>
        </button>
      </div>
    </>
  );
}
