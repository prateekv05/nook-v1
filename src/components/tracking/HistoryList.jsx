'use client'

import { useState } from 'react'
import DayScoreRing from '../ui/DayScoreRing'

/* ── sample data — 15 days ending today (26 May 2026) ─── */
const HISTORY = [
  {
    label:   'Today — Mon, 26 May',
    isToday: true,
    score:   75,
    water:   5,
    sleep:   7.5,
    steps:   4230,
    tasks:   { done: 3, total: 5 },
    checklist: [
      { text: 'Morning walk',           done: true  },
      { text: 'Read for 20 minutes',    done: false },
      { text: 'Review weekly goals',    done: true  },
      { text: 'Call mum',              done: false },
      { text: 'Meditation — 10 min',   done: true  },
    ],
  },
  {
    label: 'Sun, 25 May',
    score: 88, water: 7, sleep: 8.5, steps: 9100,
    tasks: { done: 5, total: 5 },
    checklist: [
      { text: 'Morning walk',           done: true },
      { text: 'Read for 20 minutes',    done: true },
      { text: 'Meal prep for the week', done: true },
      { text: 'Evening run',            done: true },
      { text: 'Journaling',            done: true },
    ],
  },
  {
    label: 'Sat, 24 May',
    score: 63, water: 4, sleep: 6.5, steps: 3200,
    tasks: { done: 2, total: 4 },
    checklist: [
      { text: 'Morning walk',           done: false },
      { text: 'Read for 20 minutes',    done: true  },
      { text: 'Grocery shopping',       done: true  },
      { text: 'Meditation — 10 min',   done: false },
    ],
  },
  {
    label: 'Fri, 23 May',
    score: 91, water: 8, sleep: 8.0, steps: 11200,
    tasks: { done: 6, total: 6 },
    checklist: [
      { text: 'Morning walk',           done: true },
      { text: 'Gym session',            done: true },
      { text: 'Read for 20 minutes',    done: true },
      { text: 'Deep work block — 3h',  done: true },
      { text: 'Call mum',              done: true },
      { text: 'Journaling',            done: true },
    ],
  },
  {
    label: 'Thu, 22 May',
    score: 78, water: 6, sleep: 7.0, steps: 7800,
    tasks: { done: 4, total: 5 },
    checklist: [
      { text: 'Morning walk',           done: true  },
      { text: 'Read for 20 minutes',    done: true  },
      { text: 'Review weekly goals',    done: true  },
      { text: 'Call mum',              done: false },
      { text: 'Meditation — 10 min',   done: true  },
    ],
  },
  {
    label: 'Wed, 21 May',
    score: 54, water: 3, sleep: 5.5, steps: 2900,
    tasks: { done: 1, total: 5 },
    checklist: [
      { text: 'Morning walk',           done: false },
      { text: 'Read for 20 minutes',    done: true  },
      { text: 'Review weekly goals',    done: false },
      { text: 'Call mum',              done: false },
      { text: 'Meditation — 10 min',   done: false },
    ],
  },
  {
    label: 'Tue, 20 May',
    score: 82, water: 6, sleep: 7.5, steps: 8400,
    tasks: { done: 4, total: 5 },
    checklist: [
      { text: 'Morning walk',           done: true  },
      { text: 'Read for 20 minutes',    done: true  },
      { text: 'Gym session',            done: true  },
      { text: 'Call mum',              done: true  },
      { text: 'Meditation — 10 min',   done: false },
    ],
  },
  {
    label: 'Mon, 19 May',
    score: 65, water: 4, sleep: 6.5, steps: 5100,
    tasks: { done: 3, total: 5 },
    checklist: [
      { text: 'Morning walk',           done: true  },
      { text: 'Read for 20 minutes',    done: false },
      { text: 'Review weekly goals',    done: true  },
      { text: 'Call mum',              done: false },
      { text: 'Meditation — 10 min',   done: true  },
    ],
  },
  {
    label: 'Sun, 18 May',
    score: 84, water: 7, sleep: 8.0, steps: 6700,
    tasks: { done: 4, total: 4 },
    checklist: [
      { text: 'Morning walk',           done: true },
      { text: 'Meal prep for the week', done: true },
      { text: 'Read for 20 minutes',    done: true },
      { text: 'Evening stretch',        done: true },
    ],
  },
  {
    label: 'Sat, 17 May',
    score: 71, water: 5, sleep: 7.0, steps: 4600,
    tasks: { done: 3, total: 5 },
    checklist: [
      { text: 'Morning walk',           done: true  },
      { text: 'Read for 20 minutes',    done: true  },
      { text: 'Grocery shopping',       done: true  },
      { text: 'Gym session',            done: false },
      { text: 'Meditation — 10 min',   done: false },
    ],
  },
  {
    label: 'Fri, 16 May',
    score: 88, water: 8, sleep: 7.5, steps: 10300,
    tasks: { done: 5, total: 5 },
    checklist: [
      { text: 'Morning walk',           done: true },
      { text: 'Read for 20 minutes',    done: true },
      { text: 'Deep work block — 3h',  done: true },
      { text: 'Gym session',            done: true },
      { text: 'Journaling',            done: true },
    ],
  },
  {
    label: 'Thu, 15 May',
    score: 60, water: 4, sleep: 6.0, steps: 3800,
    tasks: { done: 2, total: 5 },
    checklist: [
      { text: 'Morning walk',           done: false },
      { text: 'Read for 20 minutes',    done: true  },
      { text: 'Review weekly goals',    done: false },
      { text: 'Call mum',              done: true  },
      { text: 'Meditation — 10 min',   done: false },
    ],
  },
  {
    label: 'Wed, 14 May',
    score: 77, water: 6, sleep: 7.5, steps: 7200,
    tasks: { done: 3, total: 4 },
    checklist: [
      { text: 'Morning walk',           done: true  },
      { text: 'Read for 20 minutes',    done: true  },
      { text: 'Deep work block — 3h',  done: true  },
      { text: 'Meditation — 10 min',   done: false },
    ],
  },
  {
    label: 'Tue, 13 May',
    score: 69, water: 5, sleep: 6.5, steps: 5500,
    tasks: { done: 3, total: 5 },
    checklist: [
      { text: 'Morning walk',           done: true  },
      { text: 'Read for 20 minutes',    done: false },
      { text: 'Gym session',            done: true  },
      { text: 'Call mum',              done: true  },
      { text: 'Meditation — 10 min',   done: false },
    ],
  },
  {
    label: 'Mon, 12 May',
    score: 58, water: 3, sleep: 6.0, steps: 2800,
    tasks: { done: 2, total: 5 },
    checklist: [
      { text: 'Morning walk',           done: false },
      { text: 'Read for 20 minutes',    done: true  },
      { text: 'Review weekly goals',    done: false },
      { text: 'Call mum',              done: false },
      { text: 'Meditation — 10 min',   done: true  },
    ],
  },
]

export default function HistoryList() {
  const [openIdx, setOpenIdx] = useState(0)

  function toggle(i) {
    setOpenIdx(prev => prev === i ? null : i)
  }

  return (
    <div className="history-list">
      {HISTORY.map((row, i) => {
        const isOpen = openIdx === i
        return (
          <div key={i} className={`history-row${row.isToday ? ' today' : ''}`}>
            <div
              className="history-row-head"
              role="button"
              tabIndex={0}
              aria-expanded={isOpen}
              onClick={() => toggle(i)}
              onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && toggle(i)}
            >
              {/* Left: date + chips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div className="history-row-date">
                  {row.label}
                  {row.isToday && (
                    <span style={{
                      marginLeft: 8,
                      fontSize: 10,
                      fontWeight: 600,
                      color: 'var(--accent)',
                      background: 'var(--accent-bg)',
                      border: '0.5px solid var(--accent-bdr)',
                      borderRadius: 5,
                      padding: '1px 6px',
                      letterSpacing: '.04em',
                    }}>
                      Today
                    </span>
                  )}
                </div>
                <div className="history-row-chips">
                  <span className="history-chip">
                    <i className="ph-bold ph-check-square" />
                    {row.tasks.done}/{row.tasks.total}
                  </span>
                  <span className="history-chip">
                    <i className="ph-bold ph-drop" />
                    {row.water}/8
                  </span>
                  <span className="history-chip">
                    <i className="ph-bold ph-moon" />
                    {row.sleep}h
                  </span>
                </div>
              </div>

              {/* Right: ring + chevron */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <DayScoreRing score={row.score} size={36} strokeWidth={3} bgStroke="var(--border)" />
                <i className={`ph-bold ph-caret-down history-expand-icon${isOpen ? ' open' : ''}`} />
              </div>
            </div>

            {/* Collapsible detail */}
            <div className={`history-detail${isOpen ? ' open' : ''}`}>
              <div className="history-detail-grid">
                <HdItem label="Water" value={`${row.water}/8`} />
                <HdItem label="Steps" value={row.steps.toLocaleString()} />
                <HdItem label="Sleep" value={`${row.sleep}h`} />
                <HdItem
                  label="Score"
                  value={row.score}
                  color={row.score >= 80 ? '#4ADE80' : row.score >= 60 ? '#F59E0B' : '#EF4444'}
                />
              </div>

              <div className="hl-task-list">
                {row.checklist.map((t, j) => (
                  <div key={j} className={`hl-task${t.done ? ' done' : ''}`}>
                    <i
                      className={`ph-bold ${t.done ? 'ph-check-circle' : 'ph-circle'}`}
                      style={{ color: t.done ? 'var(--fin-col)' : 'var(--text-3)' }}
                    />
                    {t.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function HdItem({ label, value, color }) {
  return (
    <div className="hd-item">
      <div className="hd-label">{label}</div>
      <div className="hd-value" style={color ? { color } : undefined}>{value}</div>
    </div>
  )
}
