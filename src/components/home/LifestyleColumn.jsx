'use client'

import { useState } from 'react'

const INITIAL_ITEMS = [
  { id: 1, label: 'Morning workout',   done: false },
  { id: 2, label: 'Review finances',   done: false },
  { id: 3, label: 'Read 20 minutes',   done: false },
]

const TRACK = [
  { label: 'Water',  value: '5/8',   pct: 62,  color: 'var(--know-col)' },
  { label: 'Steps',  value: '7,420', pct: 74,  color: 'var(--accent)'   },
  { label: 'Sleep',  value: '7.5h',  pct: 94,  color: 'var(--life-col)' },
]

const METHOD_DAYS = 7
const METHOD_DONE = 3

const STRESS_EMOJIS = ['😌', '🙂', '😐', '😕', '😤']

export default function LifestyleColumn({ onExpand }) {
  const [items, setItems] = useState(INITIAL_ITEMS)
  const [stress, setStress] = useState(1)

  const doneCount = items.filter(i => i.done).length
  const total = items.length
  const progPct = total > 0 ? Math.round((doneCount / total) * 100) : 0

  function toggle(id, e) {
    e.stopPropagation()
    setItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i))
  }

  return (
    <div className="hero-col" onClick={onExpand}>
      <div className="hero-header life">
        <div className="hero-title life">
          <i className="ph-bold ph-heart" />
          Lifestyle
        </div>
        <div
          className="expand-icon life"
          onClick={e => { e.stopPropagation(); onExpand() }}
        >
          <i className="ph-bold ph-arrows-out" />
        </div>
      </div>

      <div className="hero-body">
        {/* Method of the Week */}
        <div className="sub-section">
          <div className="sub-label">Method of the week</div>
          <div className="method-block">
            <div className="method-name">Pomodoro Technique</div>
            <div className="method-quote">&ldquo;Work in focused 25-min sprints — then rest. Protect your energy, not just your time.&rdquo;</div>
            <div className="method-days">
              {Array.from({ length: METHOD_DAYS }, (_, i) => (
                <div key={i} className={`md${i < METHOD_DONE ? ' done' : ''}`} />
              ))}
            </div>
            <div className="method-day-label">Day {METHOD_DONE} of {METHOD_DAYS} — {METHOD_DAYS - METHOD_DONE} days remaining</div>
          </div>
        </div>

        {/* Daily Checklist */}
        <div className="sub-section">
          <div className="sub-label">Daily checklist</div>
          <div className="cl-progress">
            <div className="cl-prog-track">
              <div className="cl-prog-fill" style={{ width: `${progPct}%` }} />
            </div>
            <span className="cl-prog-label">{doneCount} of {total}</span>
          </div>
          {items.map(item => (
            <div
              key={item.id}
              className="check-item"
              onClick={e => toggle(item.id, e)}
            >
              <div className={`cb${item.done ? ' done' : ''}`}>
                <svg viewBox="0 0 10 10">
                  <polyline points="1.5,5 4,7.5 8.5,2.5" />
                </svg>
              </div>
              <span className={`ct${item.done ? ' done' : ''}`}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Stress Check-in */}
        <div className="sub-section">
          <div className="sub-label">Stress check-in</div>
          <div style={{ display: 'flex', gap: '4px', marginTop: '5px' }}>
            {STRESS_EMOJIS.map((emoji, i) => (
              <button
                key={i}
                className={`s-emoji-btn${stress === i ? ' sel' : ''}`}
                style={{ width: 26, height: 26, fontSize: 13, borderRadius: 6 }}
                onClick={e => { e.stopPropagation(); setStress(i) }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Tracking Today */}
        <div className="sub-section">
          <div className="sub-label">Tracking today</div>
          <div className="track-chips">
            {TRACK.map(t => (
              <div className="tc" key={t.label}>
                <div className="tc-l">{t.label}</div>
                <div className="tc-v">{t.value}</div>
                <div className="tc-bar">
                  <div className="tc-bar-fill" style={{ width: `${t.pct}%`, background: t.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
