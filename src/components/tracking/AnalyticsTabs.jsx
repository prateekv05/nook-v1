'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import DayScoreRing from '../ui/DayScoreRing'
import { drawLineChart, drawBarChart } from '../../lib/chart-utils'

/* ── sample data ──────────────────────────────────────── */
const WEEK_DAYS   = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_WEEKS = ['W1', 'W2', 'W3', 'W4']

const WEEK_RINGS = [
  { day: 'Mon', date: '19', score: 65 },
  { day: 'Tue', date: '20', score: 82 },
  { day: 'Wed', date: '21', score: 54 },
  { day: 'Thu', date: '22', score: 91 },
  { day: 'Fri', date: '23', score: 78 },
  { day: 'Sat', date: '24', score: 63 },
  { day: 'Sun', date: '25', score: 75 },
]

const SCORE_BREAKDOWN = [
  { label: 'Sleep',     pct: 94, color: 'var(--know-col)',  weight: '25%' },
  { label: 'Water',     pct: 62, color: 'var(--accent)',    weight: '20%' },
  { label: 'Steps',     pct: 42, color: '#22C55E',          weight: '15%' },
  { label: 'Checklist', pct: 60, color: 'var(--life-col)',  weight: '20%' },
  { label: 'Mood',      pct: 70, color: 'var(--pink-col)',  weight: '20%' },
]

const HABIT_SCORES = [
  0,  0,  0,  0,  0,  0,  88,
  82, 54, 91, 78, 63, 83, 76,
  71, 60, 88, 75, 69, 84, 90,
  65, 72, 81, 58, 77, 88, 0,
]

/* ── main component ───────────────────────────────────── */
export default function AnalyticsTabs() {
  const [tab, setTab] = useState('daily')

  return (
    <div>
      <div className="chart-tabs">
        {['daily', 'weekly', 'monthly'].map(t => (
          <button
            key={t}
            className={`chart-tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'daily'   && <DailyPanel   />}
      {tab === 'weekly'  && <WeeklyPanel  />}
      {tab === 'monthly' && <MonthlyPanel />}
    </div>
  )
}

/* ── daily panel ──────────────────────────────────────── */
function DailyPanel() {
  const [bars, setBars] = useState(false)
  useEffect(() => { const id = requestAnimationFrame(() => setBars(true)); return () => cancelAnimationFrame(id) }, [])

  return (
    <div className="at-panel-enter">
      <div className="chart-section-title" style={{ marginTop: 0 }}>Today at a glance</div>
      <div className="chart-grid-2" style={{ marginBottom: 14 }}>
        <MiniCard label="Sleep"      val="7.5h"  sub="Goal 8h · 94%"     />
        <MiniCard label="Steps"      val="4,230" sub="Goal 10k · 42%"    />
        <MiniCard label="Water"      val="5/8"   sub="3 cups remaining"  />
        <MiniCard label="Productive" val="5h"    sub="vs 2h rest"        />
      </div>

      <div className="chart-section-title">Day score breakdown</div>
      <div style={{ background: 'var(--input-bg)', borderRadius: 10, padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>75 / 100</span>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Good day</span>
        </div>
        {SCORE_BREAKDOWN.map(({ label, pct, color, weight }) => (
          <div key={label} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-2)', marginBottom: 3 }}>
              <span>{label} <span style={{ fontSize: 10, color: 'var(--text-3)' }}>({weight})</span></span>
              <span style={{ fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
            </div>
            <div className="e-prog">
              <div
                className="e-progb"
                style={{ width: bars ? `${pct}%` : '0%', background: color, transition: 'width 0.6s var(--ease-spring)' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── weekly panel ─────────────────────────────────────── */
function WeeklyPanel() {
  const [selected, setSelected] = useState(6)
  const sleepRef  = useRef(null)
  const prodRef   = useRef(null)
  const stepsRef  = useRef(null)

  const renderCharts = useCallback(() => {
    requestAnimationFrame(() => {
      drawLineChart(sleepRef.current, WEEK_DAYS,
        [{ color: '#1D6FA8', data: [6.5, 7, 7.5, 8.5, 6.5, 7, 7.5] }],
        { yMax: 10 })
      drawBarChart(prodRef.current, WEEK_DAYS,
        [
          { color: '#2D6A4F', data: [5, 6, 4, 7, 3, 5, 5] },
          { color: '#EF4444', data: [2, 1, 3, 1, 4, 2, 2] },
        ],
        { yMax: 12 })
      drawBarChart(stepsRef.current, WEEK_DAYS,
        [{ color: '#22C55E', data: [4.2, 6.8, 5.1, 10.2, 3.2, 8.5, 6.1] }],
        { yMax: 12 })
    })
  }, [])

  useEffect(() => {
    renderCharts()
    const obs = new MutationObserver(renderCharts)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [renderCharts])

  const ring = WEEK_RINGS[selected]

  return (
    <div className="at-panel-enter">
      {/* Ring timeline */}
      <div className="hist-rings-scroll" style={{ marginBottom: 14 }}>
        {WEEK_RINGS.map((r, i) => (
          <button
            key={i}
            className={`hist-ring-item${selected === i ? ' selected' : ''}`}
            onClick={() => setSelected(i)}
            aria-label={`${r.day} ${r.date} — score ${r.score}`}
          >
            <DayScoreRing score={r.score} size={40} strokeWidth={3} bgStroke="var(--border)" />
            <div style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{r.day}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>{r.score}</div>
          </button>
        ))}
      </div>

      {/* Selected day callout */}
      <div style={{ background: 'var(--input-bg)', borderRadius: 10, padding: '8px 12px', marginBottom: 14, border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{WEEK_LABELS[selected]}, May {ring.date}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>Score {ring.score}</span>
      </div>

      <div className="chart-section-title" style={{ marginTop: 0 }}>Sleep — last 7 days (hrs)</div>
      <div style={{ marginBottom: 14 }}><canvas ref={sleepRef} className="chart-c" height="100" /></div>

      <div className="chart-section-title">Productivity vs Rest hours</div>
      <div style={{ marginBottom: 14 }}><canvas ref={prodRef} className="chart-c" height="100" /></div>

      <div className="chart-section-title">Steps — last 7 days</div>
      <div><canvas ref={stepsRef} className="chart-c" height="80" /></div>

      <div className="chart-legend" style={{ marginTop: 10 }}>
        <LegendItem color="#1D6FA8" label="Sleep"      />
        <LegendItem color="#2D6A4F" label="Productive" />
        <LegendItem color="#EF4444" label="Rest"       />
        <LegendItem color="#22C55E" label="Steps"      />
      </div>
    </div>
  )
}

/* ── monthly panel ────────────────────────────────────── */
function MonthlyPanel() {
  const sleepRef   = useRef(null)
  const bestRef    = useRef(null)

  const renderCharts = useCallback(() => {
    requestAnimationFrame(() => {
      drawLineChart(sleepRef.current, MONTH_WEEKS,
        [
          { color: '#1D6FA8',               data: [7.0, 7.3, 7.1, 7.5] },
          { color: 'rgba(29,111,168,.25)',   data: [8, 8, 8, 8] },
        ],
        { yMax: 10 })
      drawBarChart(bestRef.current,
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        [{ color: '#2D6A4F', data: [65, 72, 68, 91, 58, 82, 88] }],
        { yMax: 100 })
    })
  }, [])

  useEffect(() => {
    renderCharts()
    const obs = new MutationObserver(renderCharts)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [renderCharts])

  return (
    <div className="at-panel-enter">
      <div className="chart-section-title" style={{ marginTop: 0 }}>Sleep average vs target</div>
      <div style={{ marginBottom: 14 }}><canvas ref={sleepRef} className="chart-c" height="90" /></div>

      <div className="chart-section-title">Habit consistency — May 2026</div>
      <HabitCal scores={HABIT_SCORES} />

      <div className="chart-section-title">Best days of the week</div>
      <div style={{ marginBottom: 14 }}><canvas ref={bestRef} className="chart-c" height="80" /></div>

      <div className="chart-section-title">Monthly averages</div>
      <div className="chart-grid-2">
        <MiniCard label="Avg sleep"      val="7.2h"   sub="+0.3h vs last month"  />
        <MiniCard label="Avg steps"      val="6,840"  sub="+420 vs last month"   />
        <MiniCard label="Water goal hit" val="18/21"  sub="86% success rate"     />
        <MiniCard label="Avg day score"  val="71"     sub="+4pts vs last month"  />
      </div>
    </div>
  )
}

/* ── habit calendar ───────────────────────────────────── */
function HabitCal({ scores }) {
  const DAY_HDRS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {DAY_HDRS.map((d, i) => (
          <div key={i} style={{ fontSize: 9, color: 'var(--text-3)', textAlign: 'center', padding: '2px 0', fontFamily: 'var(--font-sans)' }}>
            {d}
          </div>
        ))}
        {scores.map((s, i) => {
          const col     = s === 0 ? 'var(--input-bg)' : s >= 80 ? '#22C55E' : s >= 60 ? '#F59E0B' : '#EF4444'
          const opacity = s === 0 ? 0.3 : s >= 80 ? 1 : s >= 60 ? 0.8 : 0.7
          return (
            <div
              key={i}
              title={s ? `Score ${s}` : ''}
              style={{
                height: 22,
                borderRadius: 5,
                background: col,
                opacity,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 9,
                color: s === 0 ? 'transparent' : '#fff',
                fontWeight: 600,
                fontFamily: 'var(--font-sans)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {s || ''}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── helpers ──────────────────────────────────────────── */
function MiniCard({ label, val, sub }) {
  return (
    <div className="chart-mini-card">
      <div className="chart-mini-label">{label}</div>
      <div className="chart-mini-val">{val}</div>
      <div className="chart-mini-sub">{sub}</div>
    </div>
  )
}

function LegendItem({ color, label }) {
  return (
    <div className="chart-legend-item">
      <div className="chart-legend-dot" style={{ background: color }} />
      {label}
    </div>
  )
}
