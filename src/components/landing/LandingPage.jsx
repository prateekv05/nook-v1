'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LandingPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')

  function handleCTA(e) {
    e.preventDefault()
    const q = email.trim() ? `?email=${encodeURIComponent(email.trim())}` : ''
    router.push(`/signup${q}`)
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      <div className="lp-root">

        {/* NAV */}
        <nav className="lp-nav">
          <span className="lp-nav-logo">N<span>ook</span></span>
          <div className="lp-nav-links">
            <a href="#features" className="lp-nav-link">Features</a>
            <a href="#philosophy" className="lp-nav-link">Philosophy</a>
            <Link href="/login" className="lp-btn-outline">Log in</Link>
            <Link href="/signup" className="lp-btn-dark">Create account</Link>
          </div>
        </nav>

        {/* HERO */}
        <section className="lp-hero">
          <div className="lp-hero-bg" />
          <div className="lp-eyebrow">Your personal life dashboard</div>
          <h1 className="lp-hero-title">
            One calm corner<br />for <em>everything</em> that matters
          </h1>
          <p className="lp-hero-sub">
            Replace five scattered apps with one warm, focused space. Finance, news, habits, and health — all visible at a glance, every morning.
          </p>
          <div className="lp-hero-cta">
            <Link href="/signup" className="lp-btn-primary">
              Get early access
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
            <a href="#features" className="lp-btn-ghost">
              See what's inside
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2.5V11.5M7 11.5L3 7.5M7 11.5L11 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </a>
          </div>

          {/* MOCKUP */}
          <div className="lp-mockup">
            <div className="lp-mockup-frame">
              <div className="lp-mockup-topbar">
                <div className="lp-dot lp-dot-r" />
                <div className="lp-dot lp-dot-y" />
                <div className="lp-dot lp-dot-g" />
                <div className="lp-mockup-url">nook.app · Good morning, Alex ☀️</div>
              </div>
              <div className="lp-mockup-body">
                <div className="lp-mcell">
                  <div className="lp-mcell-label">Net Worth</div>
                  <div className="lp-mcell-big">$84,200</div>
                  <div className="lp-mcell-sub">across 4 accounts</div>
                  <div className="lp-tag lp-tag-green">▲ 2.4% this month</div>
                </div>
                <div className="lp-mcell">
                  <div className="lp-mcell-label">Spending · May</div>
                  <div className="lp-mcell-big">$1,840</div>
                  <div className="lp-mcell-sub">of $2,200 budget</div>
                  <div className="lp-bars">
                    <div className="lp-bar" style={{ height: '60%', opacity: 0.3 }} />
                    <div className="lp-bar" style={{ height: '80%', opacity: 0.4 }} />
                    <div className="lp-bar" style={{ height: '45%', opacity: 0.3 }} />
                    <div className="lp-bar" style={{ height: '90%', opacity: 0.5 }} />
                    <div className="lp-bar" style={{ height: '70%', opacity: 0.4 }} />
                    <div className="lp-bar" style={{ height: '84%', opacity: 0.7 }} />
                  </div>
                </div>
                <div className="lp-mcell">
                  <div className="lp-mcell-label">Word of the Day</div>
                  <div className="lp-wod-word">Sanguine</div>
                  <div className="lp-wod-def">Optimistic, especially in a difficult situation.</div>
                  <div className="lp-tag lp-tag-amber">AI · Claude</div>
                </div>
                <div className="lp-mockup-insight">
                  <div className="lp-mcell-label">Today's Insight</div>
                  <div className="lp-insight-text">"The Stoics believed that the obstacle is the way — resistance in your path isn't opposing your progress, it <em>is</em> the progress."</div>
                </div>
                <div className="lp-mockup-habits">
                  <div className="lp-mcell-label">Habits · Day 14 🔥</div>
                  <div className="lp-habit-row">
                    <div className="lp-habit-dot" style={{ background: '#4A7C59' }} />
                    <span className="lp-habit-label">Morning journal</span>
                    <span className="lp-habit-check">✓</span>
                  </div>
                  <div className="lp-habit-row">
                    <div className="lp-habit-dot" style={{ background: '#B45309' }} />
                    <span className="lp-habit-label">8,000 steps</span>
                    <span className="lp-habit-check">✓</span>
                  </div>
                  <div className="lp-habit-row">
                    <div className="lp-habit-dot" style={{ background: '#334155' }} />
                    <span className="lp-habit-label">Read 20 min</span>
                    <span className="lp-habit-pending">—</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEM */}
        <section className="lp-problem">
          <div className="lp-section-label" style={{ color: 'rgba(253,230,138,0.8)' }}>The problem</div>
          <h2 className="lp-problem-title">Your mornings are <em>scattered</em> across too many apps</h2>
          <p className="lp-problem-sub">You check five different apps before your coffee is ready — and still feel like something slipped through the cracks.</p>
          <div className="lp-apps-grid">
            {['Bloomberg / News', 'Notion / Notes', 'Fitness tracker', 'Expense app', 'Habit tracker', 'News aggregator'].map(app => (
              <div key={app} className="lp-app-pill">
                <div className="lp-app-cross">×</div>
                {app}
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="lp-features-outer">
          <div className="lp-features-section">
            <div className="lp-features-header">
              <div className="lp-section-label">What's inside</div>
              <h2 className="lp-features-title">Four pillars of a <em>good day</em></h2>
              <p className="lp-features-sub">Each section of Nook tracks a different dimension of your life — together, they paint the whole picture.</p>
            </div>
            <div className="lp-features-grid">
              <div className="lp-feature-card">
                <div className="lp-feature-icon lp-fi-amber">💰</div>
                <div className="lp-feature-name">Finance</div>
                <p className="lp-feature-desc">Net worth, spending trends, budget tracking, and investment snapshots. Calm numbers, not anxiety-inducing dashboards.</p>
              </div>
              <div className="lp-feature-card">
                <div className="lp-feature-icon lp-fi-slate">📰</div>
                <div className="lp-feature-name">Knowledge</div>
                <p className="lp-feature-desc">Curated news, word of the day, concept explainers, and "did you know" moments — powered by Claude, optional by design.</p>
              </div>
              <div className="lp-feature-card">
                <div className="lp-feature-icon lp-fi-sage">🌿</div>
                <div className="lp-feature-name">Habits</div>
                <p className="lp-feature-desc">Daily habit tracking with streaks, day scores, and gentle nudges toward the person you're becoming — not perfection.</p>
              </div>
              <div className="lp-feature-card">
                <div className="lp-feature-icon lp-fi-rust">🫀</div>
                <div className="lp-feature-name">Health</div>
                <p className="lp-feature-desc">Sleep, movement, water, and nutrition — summarized in one glance without needing to open a separate fitness app.</p>
              </div>
            </div>
          </div>
        </section>

        {/* PHILOSOPHY */}
        <section id="philosophy" className="lp-philosophy-outer">
          <div className="lp-philosophy-section">
            <div className="lp-philosophy-grid">
              <div className="lp-philosophy-text">
                <div className="lp-section-label">Our philosophy</div>
                <h2 className="lp-philosophy-title">Calm by default.<br /><em>Kaizen</em> by nature.</h2>
                <p className="lp-philosophy-body">We believe the best tools disappear into the background. Nook isn't trying to capture your attention — it's designed to give you a moment of clarity and send you on your way.</p>
                <div className="lp-principles">
                  {[
                    { n: '1', text: <><strong>Warm, low-contrast design.</strong> The opposite of the anxiety-inducing red-green financial dashboard.</> },
                    { n: '2', text: <><strong>AI-assisted, not AI-dependent.</strong> Claude generates tips and insights — but every feature works without them.</> },
                    { n: '3', text: <><strong>Small wins compound.</strong> We track streaks and scores to nudge continuous improvement, not overnight perfection.</> },
                  ].map(p => (
                    <div key={p.n} className="lp-principle">
                      <div className="lp-principle-num">{p.n}</div>
                      <div className="lp-principle-text">{p.text}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lp-philosophy-visual">
                <div className="lp-daily-card">
                  <div className="lp-daily-date">Thursday, May 28 · Morning</div>
                  <div className="lp-daily-score-row">
                    <div>
                      <div className="lp-daily-score">87</div>
                      <div className="lp-daily-score-label">Today's day score</div>
                    </div>
                    <div className="lp-daily-streak">
                      <div className="lp-streak-num">14 🔥</div>
                      <div className="lp-streak-label">day streak</div>
                    </div>
                  </div>
                  <div className="lp-daily-items">
                    {[
                      { bg: '#D1FAE5', icon: '🌿', title: 'Morning journal', sub: 'Completed at 7:14 am' },
                      { bg: '#FDE68A', icon: '💰', title: 'Under budget this week', sub: '$240 remaining · great pace' },
                      { bg: '#EDE9FE', icon: '🧠', title: 'Word learned: Sanguine', sub: 'Optimistic in difficult moments' },
                      { bg: '#FEE2E2', icon: '🫀', title: '8,240 steps', sub: 'Goal: 8,000 · exceeded' },
                    ].map((item, i) => (
                      <div key={i} className="lp-daily-item">
                        <div className="lp-daily-item-icon" style={{ background: item.bg }}>{item.icon}</div>
                        <div className="lp-daily-item-text">
                          <div className="lp-daily-item-title">{item.title}</div>
                          <div className="lp-daily-item-sub">{item.sub}</div>
                        </div>
                        <div className="lp-check-circle">✓</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TESTIMONIAL */}
        <section className="lp-testimonial">
          <div className="lp-testimonial-mark">"</div>
          <p className="lp-testimonial-text">It feels like a warm cup of coffee for my brain. I open it once in the morning and I actually know how my life is going.</p>
          <div className="lp-testimonial-author"><strong>Maya R.</strong> — Beta user, product designer in NYC</div>
        </section>

        {/* CTA */}
        <section id="create-account" className="lp-cta-outer">
          <div className="lp-cta-section">
            <div className="lp-section-label">Get started</div>
            <h2 className="lp-cta-title">Your <em>corner</em> is waiting</h2>
            <p className="lp-cta-sub">Create your free Nook account and bring calm to your mornings — finances, habits, health, and knowledge in one place.</p>
            <form className="lp-cta-row" onSubmit={handleCTA}>
              <input
                type="email"
                className="lp-email-input"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <button type="submit" className="lp-btn-primary" style={{ whiteSpace: 'nowrap', border: 'none', cursor: 'pointer' }}>
                Create account
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7H11.5M11.5 7L7.5 3M11.5 7L7.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </form>
            <div className="lp-cta-note">
              Already have an account?{' '}
              <Link href="/login" className="lp-cta-login-link">Log in</Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="lp-footer">
          <div className="lp-footer-logo">N<span>ook</span></div>
          <div className="lp-footer-copy">© 2025 Nook. Built with care.</div>
          <div className="lp-footer-links">
            <a href="#" className="lp-footer-link">Privacy</a>
            <a href="#" className="lp-footer-link">Terms</a>
            <a href="#" className="lp-footer-link">Contact</a>
          </div>
        </footer>
      </div>

      <style>{`
        .lp-root {
          font-family: 'DM Sans', sans-serif;
          background: #F7F3EC;
          color: #1C1917;
          overflow-x: hidden;
        }

        /* NAV */
        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem 3rem;
          background: rgba(247,243,236,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(28,25,23,0.12);
        }
        .lp-nav-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem; font-weight: 700;
          letter-spacing: -0.02em; color: #1C1917;
        }
        .lp-nav-logo span { color: #B45309; font-style: italic; }
        .lp-nav-links { display: flex; align-items: center; gap: 1.25rem; }
        .lp-nav-link {
          font-size: 0.875rem; color: #44403C; text-decoration: none;
          font-weight: 400; transition: color 0.2s;
        }
        .lp-nav-link:hover { color: #1C1917; }
        .lp-btn-outline {
          border: 1.5px solid rgba(28,25,23,0.22); color: #1C1917;
          padding: 0.4375rem 1.125rem; border-radius: 100px;
          font-weight: 500; font-size: 0.875rem;
          background: transparent; text-decoration: none;
          transition: border-color 0.2s;
        }
        .lp-btn-outline:hover { border-color: #1C1917; }
        .lp-btn-dark {
          background: #1C1917; color: #F7F3EC;
          padding: 0.5rem 1.25rem; border-radius: 100px;
          font-weight: 500; font-size: 0.875rem;
          text-decoration: none; transition: opacity 0.2s;
        }
        .lp-btn-dark:hover { opacity: 0.8; }

        /* HERO */
        .lp-hero {
          min-height: 100dvh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 7rem 2rem 4rem;
          position: relative; overflow: hidden;
        }
        .lp-hero-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 20% 60%, rgba(180,83,9,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 80% 30%, rgba(74,124,89,0.07) 0%, transparent 60%);
        }
        .lp-eyebrow {
          font-size: 0.75rem; font-weight: 500;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #B45309; margin-bottom: 1.5rem;
          display: flex; align-items: center; gap: 0.5rem;
          animation: lp-fadeup 0.6s ease both;
          position: relative; z-index: 1;
        }
        .lp-eyebrow::before, .lp-eyebrow::after {
          content: ''; display: block; width: 24px; height: 1px;
          background: #B45309; opacity: 0.6;
        }
        .lp-hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(3rem, 7vw, 5.5rem);
          font-weight: 700; line-height: 1.1;
          letter-spacing: -0.03em; text-align: center;
          max-width: 800px; margin-bottom: 1.5rem;
          position: relative; z-index: 1;
          animation: lp-fadeup 0.6s 0.1s ease both;
        }
        .lp-hero-title em { font-style: italic; color: #B45309; }
        .lp-hero-sub {
          font-size: 1.125rem; color: #44403C;
          text-align: center; max-width: 520px;
          line-height: 1.7; margin-bottom: 2.5rem;
          font-weight: 300; position: relative; z-index: 1;
          animation: lp-fadeup 0.6s 0.2s ease both;
        }
        .lp-hero-cta {
          display: flex; gap: 1rem; align-items: center;
          flex-wrap: wrap; justify-content: center;
          margin-bottom: 4rem; position: relative; z-index: 1;
          animation: lp-fadeup 0.6s 0.3s ease both;
        }
        .lp-btn-primary {
          background: #1C1917; color: #F7F3EC;
          padding: 0.875rem 2rem; border-radius: 100px;
          font-size: 0.9375rem; font-weight: 500;
          text-decoration: none; font-family: 'DM Sans', sans-serif;
          transition: transform 0.2s, background 0.2s;
          display: inline-flex; align-items: center; gap: 0.5rem;
        }
        .lp-btn-primary:hover { background: #44403C; transform: translateY(-1px); }
        .lp-btn-ghost {
          color: #44403C; padding: 0.875rem 1.5rem;
          font-size: 0.9375rem; font-weight: 400;
          text-decoration: none;
          display: inline-flex; align-items: center; gap: 0.375rem;
          transition: color 0.2s;
        }
        .lp-btn-ghost:hover { color: #1C1917; }

        /* MOCKUP */
        .lp-mockup {
          width: 100%; max-width: 900px;
          position: relative; z-index: 1;
          animation: lp-fadeup 0.8s 0.4s ease both;
        }
        .lp-mockup-frame {
          background: #FFF8F0;
          border: 1.5px solid rgba(28,25,23,0.22);
          border-radius: 16px; overflow: hidden;
          box-shadow: 0 32px 80px rgba(28,25,23,0.12), 0 4px 16px rgba(28,25,23,0.06);
        }
        .lp-mockup-topbar {
          background: #EDE7DB;
          border-bottom: 1px solid rgba(28,25,23,0.12);
          padding: 0.625rem 1rem;
          display: flex; align-items: center; gap: 0.5rem;
        }
        .lp-dot { width: 10px; height: 10px; border-radius: 50%; }
        .lp-dot-r { background: #F87171; }
        .lp-dot-y { background: #FBBF24; }
        .lp-dot-g { background: #34D399; }
        .lp-mockup-url {
          flex: 1; background: rgba(28,25,23,0.06);
          border-radius: 6px; padding: 0.25rem 0.75rem;
          font-size: 0.6875rem; color: #78716C;
          text-align: center; margin: 0 0.5rem;
        }
        .lp-mockup-body {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1px; background: rgba(28,25,23,0.12);
        }
        .lp-mcell {
          background: #FFF8F0;
          padding: 1rem 1.125rem;
        }
        .lp-mcell-label {
          font-size: 0.5625rem; font-weight: 500;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: #78716C; margin-bottom: 0.5rem;
        }
        .lp-mcell-big {
          font-family: 'Playfair Display', serif;
          font-size: 1.625rem; font-weight: 700;
          color: #1C1917; line-height: 1; margin-bottom: 0.25rem;
        }
        .lp-mcell-sub { font-size: 0.625rem; color: #78716C; }
        .lp-tag {
          display: inline-block; font-size: 0.5625rem;
          font-weight: 500; padding: 0.125rem 0.375rem;
          border-radius: 4px; margin-top: 0.25rem;
        }
        .lp-tag-green { background: #D1FAE5; color: #4A7C59; }
        .lp-tag-amber { background: #FDE68A; color: #B45309; }
        .lp-bars {
          display: flex; align-items: flex-end;
          gap: 3px; height: 36px; margin-top: 0.375rem;
        }
        .lp-bar { flex: 1; border-radius: 2px 2px 0 0; background: #B45309; }
        .lp-wod-word {
          font-family: 'Playfair Display', serif;
          font-style: italic; font-size: 1rem;
          font-weight: 600; color: #1C1917; margin-bottom: 0.25rem;
        }
        .lp-wod-def {
          font-size: 0.5625rem; color: #78716C;
          line-height: 1.5; font-weight: 300;
        }
        .lp-mockup-insight {
          grid-column: span 2;
          background: #FFF8F0;
          padding: 1rem 1.125rem;
          border-top: 1px solid rgba(28,25,23,0.12);
        }
        .lp-insight-text {
          font-size: 0.625rem; color: #44403C;
          line-height: 1.7; font-weight: 300;
        }
        .lp-mockup-habits {
          background: #FFF8F0;
          padding: 1rem 1.125rem;
          border-top: 1px solid rgba(28,25,23,0.12);
        }
        .lp-habit-row {
          display: flex; align-items: center;
          gap: 0.375rem; margin-bottom: 0.3rem;
        }
        .lp-habit-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .lp-habit-label { font-size: 0.5625rem; color: #44403C; }
        .lp-habit-check { margin-left: auto; font-size: 0.5625rem; color: #4A7C59; font-weight: 600; }
        .lp-habit-pending { margin-left: auto; font-size: 0.5625rem; color: #78716C; }

        /* SECTION LABEL */
        .lp-section-label {
          font-size: 0.6875rem; font-weight: 500;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #B45309; margin-bottom: 1rem;
        }

        /* PROBLEM */
        .lp-problem {
          background: #1C1917; color: #F7F3EC;
          padding: 5rem 2rem; text-align: center;
        }
        .lp-problem-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 500; line-height: 1.25;
          max-width: 640px; margin: 0 auto 1.5rem;
        }
        .lp-problem-title em { font-style: italic; color: #FDE68A; }
        .lp-problem-sub {
          color: rgba(247,243,236,0.65); max-width: 480px;
          margin: 0 auto 3rem; line-height: 1.75;
          font-size: 1rem; font-weight: 300;
        }
        .lp-apps-grid {
          display: flex; flex-wrap: wrap; gap: 0.75rem;
          justify-content: center; max-width: 560px; margin: 0 auto;
        }
        .lp-app-pill {
          background: rgba(247,243,236,0.07);
          border: 1px solid rgba(247,243,236,0.12);
          border-radius: 100px; padding: 0.5rem 1rem;
          font-size: 0.8125rem; color: rgba(247,243,236,0.7);
          display: flex; align-items: center; gap: 0.5rem;
        }
        .lp-app-cross {
          width: 14px; height: 14px; border-radius: 50%;
          background: rgba(248,113,113,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; color: #F87171;
          font-weight: 700; flex-shrink: 0;
        }

        /* FEATURES */
        .lp-features-outer { padding: 6rem 2rem; }
        .lp-features-section { max-width: 1100px; margin: 0 auto; }
        .lp-features-header { text-align: center; margin-bottom: 4rem; }
        .lp-features-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 4vw, 2.75rem);
          font-weight: 700; line-height: 1.2;
          letter-spacing: -0.02em; margin-bottom: 1rem;
        }
        .lp-features-title em { font-style: italic; color: #B45309; }
        .lp-features-sub {
          color: #44403C; font-size: 1rem; font-weight: 300;
          max-width: 440px; margin: 0 auto; line-height: 1.7;
        }
        .lp-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5px; background: rgba(28,25,23,0.12);
          border: 1.5px solid rgba(28,25,23,0.12);
          border-radius: 16px; overflow: hidden;
        }
        .lp-feature-card {
          background: #F7F3EC; padding: 2rem;
          transition: background 0.2s;
        }
        .lp-feature-card:hover { background: #FFF8F0; }
        .lp-feature-icon {
          width: 40px; height: 40px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.25rem; font-size: 1.125rem;
        }
        .lp-fi-amber { background: #FDE68A; }
        .lp-fi-slate { background: #E2E8F0; }
        .lp-fi-sage { background: #D1FAE5; }
        .lp-fi-rust { background: #FEE2E2; }
        .lp-feature-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.125rem; font-weight: 600; margin-bottom: 0.5rem;
        }
        .lp-feature-desc {
          font-size: 0.875rem; color: #44403C;
          line-height: 1.65; font-weight: 300;
        }

        /* PHILOSOPHY */
        .lp-philosophy-outer { padding: 6rem 2rem; }
        .lp-philosophy-section { max-width: 1100px; margin: 0 auto; }
        .lp-philosophy-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 4rem; align-items: center;
        }
        .lp-philosophy-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2rem, 3.5vw, 2.5rem);
          font-weight: 700; line-height: 1.2;
          letter-spacing: -0.02em; margin-bottom: 1.5rem;
        }
        .lp-philosophy-title em { font-style: italic; color: #B45309; }
        .lp-philosophy-body {
          font-size: 1rem; color: #44403C;
          line-height: 1.8; font-weight: 300; margin-bottom: 1.5rem;
        }
        .lp-principles { display: flex; flex-direction: column; gap: 0.875rem; margin-top: 2rem; }
        .lp-principle { display: flex; gap: 0.875rem; align-items: flex-start; }
        .lp-principle-num {
          width: 22px; height: 22px; border-radius: 50%;
          border: 1.5px solid rgba(28,25,23,0.22);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.6875rem; font-weight: 500; color: #78716C;
          flex-shrink: 0; margin-top: 1px;
        }
        .lp-principle-text { font-size: 0.875rem; color: #44403C; line-height: 1.6; font-weight: 300; }
        .lp-principle-text strong { color: #1C1917; font-weight: 500; }

        /* DAILY CARD */
        .lp-daily-card {
          background: #FFF8F0;
          border: 1.5px solid rgba(28,25,23,0.22);
          border-radius: 16px; padding: 1.75rem;
          box-shadow: 0 16px 48px rgba(28,25,23,0.08);
        }
        .lp-daily-date {
          font-size: 0.6875rem; font-weight: 500;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: #78716C; margin-bottom: 0.75rem;
        }
        .lp-daily-score-row {
          display: flex; align-items: baseline; gap: 0.5rem;
          margin-bottom: 1.5rem; padding-bottom: 1.25rem;
          border-bottom: 1px solid rgba(28,25,23,0.12);
        }
        .lp-daily-score {
          font-family: 'Playfair Display', serif;
          font-size: 3rem; font-weight: 700; color: #1C1917; line-height: 1;
        }
        .lp-daily-score-label { font-size: 0.75rem; color: #78716C; font-weight: 300; }
        .lp-daily-streak { margin-left: auto; display: flex; flex-direction: column; align-items: flex-end; }
        .lp-streak-num { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: #B45309; line-height: 1; }
        .lp-streak-label { font-size: 0.625rem; color: #78716C; }
        .lp-daily-items { display: flex; flex-direction: column; gap: 0.75rem; }
        .lp-daily-item { display: flex; align-items: center; gap: 0.75rem; }
        .lp-daily-item-icon {
          width: 28px; height: 28px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.875rem; flex-shrink: 0;
        }
        .lp-daily-item-text { flex: 1; }
        .lp-daily-item-title { font-size: 0.75rem; font-weight: 500; color: #1C1917; margin-bottom: 0.125rem; }
        .lp-daily-item-sub { font-size: 0.625rem; color: #78716C; font-weight: 300; }
        .lp-check-circle {
          width: 16px; height: 16px; border-radius: 50%;
          background: #4A7C59; display: flex;
          align-items: center; justify-content: center;
          flex-shrink: 0; font-size: 9px; color: white;
        }

        /* TESTIMONIAL */
        .lp-testimonial {
          background: #EDE7DB;
          border-top: 1px solid rgba(28,25,23,0.12);
          border-bottom: 1px solid rgba(28,25,23,0.12);
          text-align: center; padding: 5rem 2rem;
        }
        .lp-testimonial-mark {
          font-family: 'Playfair Display', serif;
          font-size: 4rem; color: #B45309; line-height: 0.5; margin-bottom: 1.5rem;
        }
        .lp-testimonial-text {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: clamp(1.25rem, 2.5vw, 1.75rem);
          line-height: 1.5; max-width: 680px;
          margin: 0 auto 1.75rem; color: #1C1917; font-weight: 400;
        }
        .lp-testimonial-author { font-size: 0.8125rem; color: #78716C; font-weight: 400; }
        .lp-testimonial-author strong { color: #44403C; font-weight: 500; }

        /* CTA */
        .lp-cta-outer { padding: 7rem 2rem; }
        .lp-cta-section { text-align: center; max-width: 640px; margin: 0 auto; }
        .lp-cta-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.25rem, 4.5vw, 3.5rem);
          font-weight: 700; line-height: 1.1;
          letter-spacing: -0.03em; margin-bottom: 1.25rem;
        }
        .lp-cta-title em { font-style: italic; color: #B45309; }
        .lp-cta-sub {
          font-size: 1rem; color: #44403C; line-height: 1.7;
          margin-bottom: 2.5rem; font-weight: 300;
        }
        .lp-cta-row {
          display: flex; gap: 0.75rem;
          max-width: 420px; margin: 0 auto 1rem;
        }
        .lp-email-input {
          flex: 1; padding: 0.875rem 1.25rem;
          border: 1.5px solid rgba(28,25,23,0.22);
          border-radius: 100px; font-family: 'DM Sans', sans-serif;
          font-size: 0.9375rem; background: white;
          color: #1C1917; outline: none; transition: border-color 0.2s;
        }
        .lp-email-input::placeholder { color: #78716C; }
        .lp-email-input:focus { border-color: #1C1917; }
        .lp-cta-note { font-size: 0.8125rem; color: #78716C; font-weight: 300; }
        .lp-cta-login-link {
          color: #44403C; text-decoration: underline;
          text-underline-offset: 3px;
        }

        /* FOOTER */
        .lp-footer {
          border-top: 1px solid rgba(28,25,23,0.12);
          padding: 2rem 3rem;
          display: flex; align-items: center; justify-content: space-between;
        }
        .lp-footer-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.125rem; font-weight: 700; color: #1C1917;
        }
        .lp-footer-logo span { color: #B45309; font-style: italic; }
        .lp-footer-copy { font-size: 0.8125rem; color: #78716C; font-weight: 300; }
        .lp-footer-links { display: flex; gap: 1.5rem; }
        .lp-footer-link {
          font-size: 0.8125rem; color: #78716C;
          text-decoration: none; font-weight: 300; transition: color 0.2s;
        }
        .lp-footer-link:hover { color: #1C1917; }

        /* ANIMATIONS */
        @keyframes lp-fadeup {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .lp-nav { padding: 1rem 1.5rem; }
          .lp-nav-links { display: none; }
          .lp-philosophy-grid { grid-template-columns: 1fr; }
          .lp-mockup-body { grid-template-columns: 1fr 1fr; }
          .lp-footer { flex-direction: column; gap: 1rem; text-align: center; }
          .lp-cta-row { flex-direction: column; }
          .lp-mockup-insight { grid-column: span 1; }
        }
      `}</style>
    </>
  )
}
