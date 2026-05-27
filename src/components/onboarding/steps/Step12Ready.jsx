'use client';

import { useState } from 'react';
import { createClient } from '../../../lib/supabase';
import { useToast } from '../../../hooks/useToast';

function fmtVal(v) {
  return v.replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\bAi\b/, 'AI')
    .replace(/\bEtfs\b/, 'ETFs')
    .replace(/\bReits\b/, 'REITs');
}

function SummarySection({ icon, label, items, emptyMsg }) {
  return (
    <div className="ob-summary-section">
      <div className="ob-summary-header">
        <i className={`ph-bold ${icon}`} />
        <span className="ob-summary-label">{label}</span>
      </div>
      <div className="ob-summary-pills">
        {items.length === 0 ? (
          <span className="ob-summary-empty">{emptyMsg}</span>
        ) : (
          items.map((v, i) => (
            <span key={v} className={`ob-summary-pill${i === 0 ? ' accent' : ''}`}>
              {fmtVal(v)}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

export default function Step12Ready({ state }) {
  const [loading, setLoading] = useState(false);
  const firstName = state.name?.first || '';
  const { showToast } = useToast();

  async function handleDashboard() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await Promise.all([
          supabase.from('profiles').update({
            first_name:           state.name?.first  || null,
            last_name:            state.name?.last   || null,
            gender:               state.gender       || null,
            onboarding_completed: true,
          }).eq('id', user.id),

          supabase.from('user_preferences').upsert({
            user_id:             user.id,
            news_topics:         state.topics   || [],
            learning_topics:     state.learning || [],
            finance_instruments: state.finance  || [],
            lifestyle_prefs:     ['journal', 'gratitude', 'checklist', 'stress'],
            gender:              state.gender   || null,
            location:            state.location || null,
            field:               state.fieldOther || state.field || null,
          }),
        ]);
      }
    } catch {
      showToast("Couldn't save your preferences — you can update them in Settings", 'error');
    }
    window.location.href = '/dashboard';
  }

  return (
    <>
      <div className="ob-icon-area">
        <div className="ob-icon-ring">
          <div className="ob-icon-circle">
            <i className="ph-bold ph-check" />
          </div>
        </div>
      </div>

      <div className="ob-heading-block" style={{ textAlign: 'center' }}>
        <h1 className="ob-headline" style={{ fontSize: '34px' }}>Your Nook is ready.</h1>
        <p className="ob-subtext" style={{ maxWidth: '300px', margin: '0 auto' }}>
          {firstName ? `${firstName}, your` : 'Your'} corner is set up. A 7-day Pro trial is active — no card needed.
        </p>
        <div className="ob-trial-badge step12" style={{ margin: '12px auto 0' }}>
          <i className="ph-bold ph-star" />
          Pro trial active · 7 days free
        </div>
      </div>

      <div className="ob-summary-card">
        <SummarySection
          icon="ph-newspaper"
          label="News topics"
          items={state.topics || []}
          emptyMsg="No topics selected"
        />
        <SummarySection
          icon="ph-books"
          label="Learning interests"
          items={state.learning || []}
          emptyMsg="No interests selected"
        />
        <SummarySection
          icon="ph-chart-line-up"
          label="Financial interests"
          items={state.finance || []}
          emptyMsg="No instruments selected"
        />
      </div>

      <div className="ob-cta-area">
        <button
          type="button"
          className="ob-cta-btn"
          onClick={handleDashboard}
          disabled={loading}
        >
          {loading ? 'Setting up…' : 'Go to my dashboard'}
          <i className="ph-bold ph-arrow-right" />
        </button>
      </div>
    </>
  );
}
