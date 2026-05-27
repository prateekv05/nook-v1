'use client';
import { useState, useEffect } from 'react';
import { createClient } from '../../../lib/supabase';
import { useTheme } from '../../../hooks/useTheme';
import { useToast } from '../../../hooks/useToast';

/* ── Data ── */
const NEWS_TOPICS = [
  'AI & Technology', 'Business & Markets', 'Geopolitics', 'Health & Medicine',
  'Science & Space', 'Environment & Climate', 'Culture & Society', 'Sports',
  'Law & Policy', 'Local & Regional', 'Finance & Economy', 'Politics',
  'Food & Lifestyle', 'Travel', 'Education',
];
const LEARN_TOPICS = [
  'Personal Development', 'Philosophy', 'Psychology', 'History', 'Economics',
  'Leadership', 'Science', 'Writing', 'Technology & AI', 'Creativity',
  'Ethics & Society', 'Entrepreneurship', 'Design', 'Mathematics', 'Language',
];
const TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Kolkata', 'Asia/Tokyo',
  'Asia/Singapore', 'Australia/Sydney',
];
const THEMES = [
  { id: 'calm',    label: 'Calm' },
  { id: 'regular', label: 'Regular' },
  { id: 'dark',    label: 'Dark' },
];

/* ── Helpers ── */
function Toggle({ checked, onChange }) {
  return (
    <label className="toggle-sw">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  );
}

function SettRow({ label, sub, children }) {
  return (
    <div className="sett-row">
      <div>
        <div className="sett-row-label">{label}</div>
        {sub && <div className="sett-row-sub">{sub}</div>}
      </div>
      {children}
    </div>
  );
}

/* ── Page ── */
export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [firstName, setFirstName]     = useState('Alex');
  const [lastName, setLastName]       = useState('Lewis');
  const [timezone, setTimezone]       = useState('UTC');

  const [newsTopics, setNewsTopics]   = useState(new Set(['AI & Technology', 'Business & Markets', 'Geopolitics', 'Health & Medicine', 'Science & Space']));
  const [learnTopics, setLearnTopics] = useState(new Set(['Personal Development', 'Philosophy', 'Psychology']));

  const [lifestyle, setLifestyle] = useState({ journal: true, gratitude: true, checklist: true, stress: true });
  const [incomeAmt, setIncomeAmt]   = useState('');
  const [incomePeriod, setIncomePeriod] = useState('Monthly');
  const [notifs, setNotifs] = useState({ morning: false, evening: false, weekly: false });

  const [loading, setLoading] = useState(true);
  const [userId, setUserId]   = useState(null);

  function togglePill(set, setFn, val, max) {
    setFn((prev) => {
      const next = new Set(prev);
      if (next.has(val)) { next.delete(val); }
      else if (next.size < max) { next.add(val); }
      return next;
    });
  }

  function handleTheme(t) {
    setTheme(t);
    showToast('Theme updated', 'info');
  }

  function handleSave() {
    showToast('Settings saved ✓', 'success');
  }

  return (
    <div className="settings-content">
      <div className="settings-sections">

        {/* 1 — Account */}
        <div className="sett-card">
          <div className="sett-card-title">Account Details</div>
          <SettRow label="First name">
            <input className="sett-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
          </SettRow>
          <SettRow label="Last name">
            <input className="sett-input" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
          </SettRow>
          <SettRow label="Timezone" sub="Used for day score resets and reminders">
            <select className="sett-input" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </SettRow>
        </div>

        {/* 2 — Appearance */}
        <div className="sett-card">
          <div className="sett-card-title">Appearance</div>
          <SettRow label="Theme" sub="Choose your preferred visual style">
            <div style={{ display: 'flex', gap: 8 }}>
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTheme(t.id)}
                  style={{
                    fontSize: 12, padding: '6px 14px', borderRadius: 8,
                    border: theme === t.id ? '0.5px solid var(--accent)' : '0.5px solid var(--border)',
                    background: theme === t.id ? 'var(--accent-bg)' : 'var(--input-bg)',
                    color: theme === t.id ? 'var(--accent)' : 'var(--text-2)',
                    fontWeight: theme === t.id ? 500 : 400,
                    cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    transition: 'all 0.2s var(--ease-spring)',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </SettRow>
        </div>

        {/* 3 — News Topics */}
        <div className="sett-card">
          <div className="sett-card-title">News Topics</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>
            Select up to 5 topics for your daily news feed
          </div>
          <div className="topic-pills">
            {NEWS_TOPICS.map((t) => (
              <button
                key={t}
                className={`topic-pill${newsTopics.has(t) ? ' sel' : ''}`}
                onClick={() => togglePill(newsTopics, setNewsTopics, t, 5)}
              >
                {t}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>
            {newsTopics.size} of 5 selected
          </div>
        </div>

        {/* 4 — Learning Interests */}
        <div className="sett-card">
          <div className="sett-card-title">Learning Interests</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>
            Choose topics that drive your Concept of the Day, Deep Dive, and Comfort Zone cards
          </div>
          <div className="topic-pills">
            {LEARN_TOPICS.map((t) => (
              <button
                key={t}
                className={`topic-pill${learnTopics.has(t) ? ' sel-life' : ''}`}
                onClick={() => togglePill(learnTopics, setLearnTopics, t, 5)}
              >
                {t}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>
            {learnTopics.size} of 5 selected
          </div>
        </div>

        {/* 5 — Lifestyle Features */}
        <div className="sett-card">
          <div className="sett-card-title">Lifestyle Features</div>
          <SettRow label="Journal" sub="Daily free-write with AI prompts">
            <Toggle checked={lifestyle.journal} onChange={(v) => setLifestyle((p) => ({ ...p, journal: v }))} />
          </SettRow>
          <SettRow label="Gratitude Log" sub="Three daily gratitude entries">
            <Toggle checked={lifestyle.gratitude} onChange={(v) => setLifestyle((p) => ({ ...p, gratitude: v }))} />
          </SettRow>
          <SettRow label="Daily Checklist" sub="Task tracking with calendar history">
            <Toggle checked={lifestyle.checklist} onChange={(v) => setLifestyle((p) => ({ ...p, checklist: v }))} />
          </SettRow>
          <SettRow label="Stress Check-in" sub="Check in anytime — morning, midday or evening">
            <Toggle checked={lifestyle.stress} onChange={(v) => setLifestyle((p) => ({ ...p, stress: v }))} />
          </SettRow>
        </div>

        {/* 6 — Income Goal */}
        <div className="sett-card">
          <div className="sett-card-title">Income Goal</div>
          <SettRow label="Target amount" sub="Used to calculate your income progress bar">
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="sett-input"
                type="number"
                min="0"
                placeholder="e.g. 5000"
                value={incomeAmt}
                onChange={(e) => setIncomeAmt(e.target.value)}
                style={{ minWidth: 110, fontVariantNumeric: 'tabular-nums' }}
              />
              <select className="sett-input" value={incomePeriod} onChange={(e) => setIncomePeriod(e.target.value)} style={{ minWidth: 100 }}>
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </div>
          </SettRow>
        </div>

        {/* 7 — Notifications */}
        <div className="sett-card">
          <div className="sett-card-title">Notifications</div>
          <SettRow label="Daily check-in" sub="Morning reminder to log your day">
            <Toggle checked={notifs.morning} onChange={(v) => setNotifs((p) => ({ ...p, morning: v }))} />
          </SettRow>
          <SettRow label="Weekly reflection" sub="New content alert every Monday">
            <Toggle checked={notifs.weekly} onChange={(v) => setNotifs((p) => ({ ...p, weekly: v }))} />
          </SettRow>
          <SettRow label="Streak alerts" sub="Get notified when your streak is at risk">
            <Toggle checked={notifs.evening} onChange={(v) => setNotifs((p) => ({ ...p, evening: v }))} />
          </SettRow>
        </div>

        {/* 8 — Upgrade card */}
        <div className="sett-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,var(--accent-bg) 0%,transparent 60%)', pointerEvents: 'none', borderRadius: 16 }} />
          <div className="sett-card-title" style={{ color: 'var(--accent)', position: 'relative' }}>Upgrade to Pro</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18, position: 'relative' }}>
            <div style={{ background: 'var(--input-bg)', borderRadius: 12, padding: 16, border: '0.5px solid var(--border)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8, fontWeight: 600 }}>Free</div>
              <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-1)', marginBottom: 8, fontFamily: 'var(--font-serif)', fontVariantNumeric: 'tabular-nums' }}>$0</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.8 }}>3 stocks · 5 news topics · Journal · Checklist · Tracking · Day Score</div>
            </div>
            <div style={{ background: 'var(--accent)', borderRadius: 12, padding: 16, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', width: 120, height: 120, background: 'rgba(255,255,255,0.07)', borderRadius: '50%', bottom: -40, right: -40 }} />
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8, fontWeight: 600 }}>Pro</div>
              <div style={{ fontSize: 24, fontWeight: 600, color: '#fff', marginBottom: 2, fontFamily: 'var(--font-serif)', fontVariantNumeric: 'tabular-nums' }}>
                $6.99<span style={{ fontSize: 13, fontWeight: 400, opacity: 0.7 }}>/mo</span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 10 }}>or $59.99/yr — save 29%</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8 }}>Unlimited stocks · AI sentiment · Expense charts · AI insights · All features</div>
            </div>
          </div>
          <button className="sett-save-btn" style={{ position: 'relative' }} onClick={() => showToast('Redirecting to checkout', 'info')}>
            Start 7-day free trial
          </button>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8, textAlign: 'center', position: 'relative' }}>No card required · Cancel any time</div>
        </div>

        {/* Global save */}
        <button className="sett-save-btn" onClick={handleSave}>Save changes</button>

      </div>
    </div>
  );
}
