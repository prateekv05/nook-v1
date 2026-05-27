'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import DayScoreRing from '../ui/DayScoreRing'
import { drawLineChart, drawBarChart } from '../../lib/chart-utils'
import { createClient } from '@/lib/supabase'
import { isPro } from '@/lib/isPro'
import { useAIContent } from '@/hooks/useAIContent'

/* ── helpers ─────────────────────────────────────────────── */
function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function lastNDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return d.toISOString().slice(0, 10)
  })
}

const DOW_ABBR   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DOW_LETTER = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function isoAbbr(iso)   { return DOW_ABBR[new Date(iso + 'T12:00:00').getDay()] }
function isoLetter(iso) { return DOW_LETTER[new Date(iso + 'T12:00:00').getDay()] }

/* ── main component ──────────────────────────────────────── */
export default function AnalyticsTabs() {
  const [tab,         setTab]         = useState('daily')
  const [weeklyData,  setWeeklyData]  = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [userId,      setUserId]      = useState(null)
  const [profile,     setProfile]     = useState(null)

  useEffect(() => {
    async function fetchAll() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const [[w, m], profResult] = await Promise.all([
          Promise.all([
            fetch('/api/analytics?period=weekly').then(r => r.json()),
            fetch('/api/analytics?period=monthly').then(r => r.json()),
          ]),
          user
            ? supabase.from('profiles').select('is_pro, pro_trial_ends_at').eq('id', user.id).single()
            : Promise.resolve({ data: null }),
        ])

        setWeeklyData(w.data  || [])
        setMonthlyData(m.data || [])
        if (user) {
          setUserId(user.id)
          if (profResult.data) setProfile(profResult.data)
        }
      } catch {
        // leave empty arrays — panels show "no data" state
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const today = weeklyData.find(r => r.date === todayISO()) || null

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

      {tab === 'daily'   && <DailyPanel   today={today} loading={loading} />}
      {tab === 'weekly'  && <WeeklyPanel  data={weeklyData}  loading={loading} userId={userId} profile={profile} />}
      {tab === 'monthly' && <MonthlyPanel data={monthlyData} loading={loading} />}
    </div>
  )
}

/* ── daily panel ─────────────────────────────────────────── */
function DailyPanel({ today, loading }) {
  const [bars, setBars] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setBars(true))
    return () => cancelAnimationFrame(id)
  }, [])

  if (loading) return <AnalyticsSkeleton rows={2} />

  const sleep   = today?.sleep          ?? null
  const steps   = today?.steps          ?? null
  const water   = today?.water          ?? 0
  const prod    = today?.productive_hrs ?? null
  const lazy    = today?.lazy_hrs       ?? null
  const score   = today?.day_score      ?? 0
  const moodAM  = today?.mood_morning   ?? 3
  const moodPM  = today?.mood_evening   ?? 3

  const sleepPct     = Math.round(Math.min((sleep || 0) / 8, 1) * 100)
  const waterPct     = Math.round(Math.min(water / 8, 1) * 100)
  const stepsPct     = Math.round(Math.min((steps || 0) / 10000, 1) * 100)
  const checklistPct = 60 // hardcoded — wired in phase 10.4
  const moodPct      = Math.round((moodAM + moodPM) / 10 * 100)

  const scoreLine =
    score >= 80 ? 'Excellent day' :
    score >= 60 ? 'Good day' :
    score >= 40 ? 'Decent day' :
    score >  0  ? 'Room to grow' : 'Log today to see score'

  const breakdown = [
    { label: 'Sleep',     pct: sleepPct,     color: 'var(--know-col)', weight: '25%' },
    { label: 'Water',     pct: waterPct,     color: 'var(--accent)',   weight: '20%' },
    { label: 'Steps',     pct: stepsPct,     color: '#22C55E',         weight: '15%' },
    { label: 'Checklist', pct: checklistPct, color: 'var(--life-col)', weight: '20%' },
    { label: 'Mood',      pct: moodPct,      color: 'var(--pink-col)', weight: '20%' },
  ]

  return (
    <div className="at-panel-enter">
      <div className="chart-section-title" style={{ marginTop: 0 }}>Today at a glance</div>
      <div className="chart-grid-2" style={{ marginBottom: 14 }}>
        <MiniCard
          label="Sleep"
          val={sleep != null ? `${sleep}h` : '—'}
          sub={sleep != null ? `Goal 8h · ${sleepPct}%` : 'Not logged'}
        />
        <MiniCard
          label="Steps"
          val={steps != null ? Number(steps).toLocaleString() : '—'}
          sub={steps != null ? `Goal 10k · ${stepsPct}%` : 'Not logged'}
        />
        <MiniCard
          label="Water"
          val={`${water}/8`}
          sub={water >= 8 ? 'Goal reached!' : `${8 - water} cup${8 - water === 1 ? '' : 's'} remaining`}
        />
        <MiniCard
          label="Productive"
          val={prod != null ? `${prod}h` : '—'}
          sub={lazy != null ? `vs ${lazy}h rest` : 'Not logged'}
        />
      </div>

      <div className="chart-section-title">Day score breakdown</div>
      <div style={{ background: 'var(--input-bg)', borderRadius: 10, padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>
            {score} / 100
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{scoreLine}</span>
        </div>
        {breakdown.map(({ label, pct, color, weight }) => (
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

function getWeekStart() {
  const d = new Date()
  const diff = (d.getDay() + 6) % 7
  const monday = new Date(d)
  monday.setDate(d.getDate() - diff)
  return monday.toISOString().slice(0, 10)
}

/* ── weekly panel ────────────────────────────────────────── */
function WeeklyPanel({ data, loading, userId, profile }) {
  const [selected, setSelected] = useState(6)
  const sleepRef = useRef(null)
  const prodRef  = useRef(null)
  const stepsRef = useRef(null)

  const isUserPro = profile ? isPro(profile) : false
  const weekStart = getWeekStart()

  const trackingSummary = useMemo(() => {
    if (!data.length) return {}
    const avg = arr => arr.length ? +(arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1) : null
    return {
      days:        data.length,
      avgSleep:    avg(data.filter(r => r.sleep         != null).map(r => r.sleep)),
      avgSteps:    avg(data.filter(r => r.steps         != null).map(r => r.steps)),
      avgWater:    avg(data.filter(r => r.water         != null).map(r => r.water)),
      avgScore:    avg(data.filter(r => r.day_score).map(r => r.day_score)),
      avgProdHrs:  avg(data.filter(r => r.productive_hrs != null).map(r => r.productive_hrs)),
    }
  }, [data])

  const { content: insights, loading: insightsLoading } = useAIContent({
    type: 'ai-insights',
    key: isUserPro && userId ? `ai-insights-${userId}-${weekStart}` : null,
    userContext: trackingSummary,
  })

  const weekDates   = lastNDays(7)
  const byDate      = Object.fromEntries(data.map(r => [r.date, r]))
  const weekRows    = weekDates.map(date => ({ date, row: byDate[date] || null }))
  const chartLabels = weekRows.map(w => isoLetter(w.date))
  const sleepData   = weekRows.map(w => w.row?.sleep          ?? 0)
  const prodData    = weekRows.map(w => w.row?.productive_hrs ?? 0)
  const lazyData    = weekRows.map(w => w.row?.lazy_hrs       ?? 0)
  const stepsData   = weekRows.map(w => (w.row?.steps         ?? 0) / 1000)

  useEffect(() => {
    if (loading) return
    function render() {
      requestAnimationFrame(() => {
        drawLineChart(sleepRef.current, chartLabels,
          [{ color: '#1D6FA8', data: sleepData }],
          { yMax: 10 })
        drawBarChart(prodRef.current, chartLabels,
          [
            { color: '#2D6A4F', data: prodData },
            { color: '#EF4444', data: lazyData },
          ],
          { yMax: 12 })
        drawBarChart(stepsRef.current, chartLabels,
          [{ color: '#22C55E', data: stepsData }],
          { yMax: 15 })
      })
    }
    render()
    const obs = new MutationObserver(render)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [loading, data]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <AnalyticsSkeleton rows={3} />

  const rings = weekRows.map(w => ({
    day:   isoAbbr(w.date),
    date:  String(new Date(w.date + 'T12:00:00').getDate()),
    score: w.row?.day_score ?? 0,
  }))

  const selDate  = weekRows[selected]
  const selLabel = new Date(selDate.date + 'T12:00:00')
    .toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })

  return (
    <div className="at-panel-enter">
      <div className="hist-rings-scroll" style={{ marginBottom: 14 }}>
        {rings.map((r, i) => (
          <button
            key={i}
            className={`hist-ring-item${selected === i ? ' selected' : ''}`}
            onClick={() => setSelected(i)}
            aria-label={`${r.day} ${r.date} — score ${r.score}`}
          >
            <DayScoreRing score={r.score} size={40} strokeWidth={3} bgStroke="var(--border)" />
            <div style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{r.day}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>
              {r.score || '—'}
            </div>
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--input-bg)', borderRadius: 10, padding: '8px 12px', marginBottom: 14, border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{selLabel}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>
          {rings[selected].score ? `Score ${rings[selected].score}` : 'No data'}
        </span>
      </div>

      {data.length < 7 && (
        <div style={{ fontSize: 12, color: 'var(--text-3)', padding: '8px 12px', background: 'var(--input-bg)', borderRadius: 10, border: '0.5px solid var(--border)', marginBottom: 14, lineHeight: 1.5 }}>
          Log for {7 - data.length} more day{7 - data.length === 1 ? '' : 's'} to see your full weekly patterns
        </div>
      )}

      <div className="chart-section-title" style={{ marginTop: 0 }}>Sleep — last 7 days (hrs)</div>
      <div style={{ marginBottom: 14 }}><canvas ref={sleepRef} className="chart-c" height="100" /></div>

      <div className="chart-section-title">Productivity vs Rest hours</div>
      <div style={{ marginBottom: 14 }}><canvas ref={prodRef} className="chart-c" height="100" /></div>

      <div className="chart-section-title">Steps — last 7 days (thousands)</div>
      <div><canvas ref={stepsRef} className="chart-c" height="80" /></div>

      <div className="chart-legend" style={{ marginTop: 10 }}>
        <LegendItem color="#1D6FA8" label="Sleep"      />
        <LegendItem color="#2D6A4F" label="Productive" />
        <LegendItem color="#EF4444" label="Rest"       />
        <LegendItem color="#22C55E" label="Steps"      />
      </div>

      {/* AI Insights — Pro only */}
      <div className="chart-section-title" style={{ marginTop: 14 }}>
        AI insights
        {!isUserPro && <span className="pro-badge" style={{ marginLeft: 6 }}>Pro</span>}
      </div>
      {!isUserPro ? (
        <div style={{ fontSize: 12, color: 'var(--text-3)', padding: '10px 12px', background: 'var(--input-bg)', borderRadius: 10, border: '0.5px solid var(--border)', lineHeight: 1.6 }}>
          Upgrade to Pro to get personalised pattern insights from your 7-day data.
        </div>
      ) : insightsLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[72, 60, 80].map((w, i) => (
            <div key={i} style={{ height: 14, width: `${w}%`, borderRadius: 6, background: 'var(--input-bg)', backgroundImage: 'linear-gradient(90deg, var(--input-bg) 0%, var(--border) 50%, var(--input-bg) 100%)', backgroundSize: '400px 100%', animation: 'shimmer 1.4s infinite linear' }} />
          ))}
        </div>
      ) : (
        <div style={{ background: 'var(--input-bg)', borderRadius: 10, padding: '10px 12px', border: '0.5px solid var(--border)' }}>
          {(insights || '').split('\n').filter(Boolean).map((line, i) => (
            <div key={i} style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, paddingBottom: i < 2 ? 6 : 0, borderBottom: i < 2 ? '0.5px solid var(--sub-divider)' : 'none', marginBottom: i < 2 ? 6 : 0 }}>
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── monthly panel ───────────────────────────────────────── */
function MonthlyPanel({ data, loading }) {
  const sleepRef = useRef(null)
  const bestRef  = useRef(null)

  const monthDates = lastNDays(30)
  const byDate     = Object.fromEntries(data.map(r => [r.date, r]))
  const monthRows  = monthDates.map(date => ({ date, row: byDate[date] || null }))

  // Weekly avg sleep for 4 chunks
  const chunks   = [monthRows.slice(0, 7), monthRows.slice(7, 14), monthRows.slice(14, 21), monthRows.slice(21)]
  const avgSleep = chunks.map(ch => {
    const vals = ch.filter(w => w.row?.sleep != null).map(w => w.row.sleep)
    return vals.length ? +(vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1) : 0
  })

  // Average day score per day of week (Sun=0 … Sat=6)
  const scoresByDow = Array.from({ length: 7 }, () => [])
  monthRows.forEach(w => {
    if (w.row?.day_score) {
      const dow = new Date(w.date + 'T12:00:00').getDay()
      scoresByDow[dow].push(w.row.day_score)
    }
  })
  const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const avgByDow   = scoresByDow.map(arr =>
    arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 0
  )

  // Habit calendar — leading blank cells for Mon-start grid
  const startOffset = (new Date(monthDates[0] + 'T12:00:00').getDay() + 6) % 7
  const calScores   = [...Array(startOffset).fill(0), ...monthRows.map(w => w.row?.day_score ?? 0)]

  // Monthly aggregates
  const daysLogged   = monthRows.filter(w => w.row)
  const withSleep    = daysLogged.filter(w => w.row.sleep  != null)
  const withSteps    = daysLogged.filter(w => w.row.steps  != null)
  const withScore    = daysLogged.filter(w => w.row.day_score)
  const waterHitDays = daysLogged.filter(w => (w.row.water ?? 0) >= 8).length

  const agg = {
    sleep: withSleep.length
      ? +(withSleep.reduce((s, w) => s + w.row.sleep, 0) / withSleep.length).toFixed(1) : null,
    steps: withSteps.length
      ? Math.round(withSteps.reduce((s, w) => s + w.row.steps, 0) / withSteps.length) : null,
    waterLabel: daysLogged.length > 0 ? `${waterHitDays}/${daysLogged.length}` : '—',
    waterSub:   daysLogged.length > 0 ? `${Math.round(waterHitDays / daysLogged.length * 100)}% success rate` : 'No data',
    score: withScore.length
      ? Math.round(withScore.reduce((s, w) => s + w.row.day_score, 0) / withScore.length) : null,
  }

  const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  useEffect(() => {
    if (loading) return
    function render() {
      requestAnimationFrame(() => {
        drawLineChart(sleepRef.current, ['W1', 'W2', 'W3', 'W4'],
          [
            { color: '#1D6FA8',               data: avgSleep },
            { color: 'rgba(29,111,168,.25)',   data: [8, 8, 8, 8] },
          ],
          { yMax: 10 })
        drawBarChart(bestRef.current, DOW_LABELS,
          [{ color: '#2D6A4F', data: avgByDow }],
          { yMax: 100 })
      })
    }
    render()
    const obs = new MutationObserver(render)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [loading, data]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <AnalyticsSkeleton rows={3} />

  return (
    <div className="at-panel-enter">
      <div className="chart-section-title" style={{ marginTop: 0 }}>Sleep average vs target (hrs)</div>
      <div style={{ marginBottom: 14 }}><canvas ref={sleepRef} className="chart-c" height="90" /></div>

      <div className="chart-section-title">Habit consistency — {monthName}</div>
      <HabitCal scores={calScores} />

      <div className="chart-section-title">Best days of the week</div>
      <div style={{ marginBottom: 14 }}><canvas ref={bestRef} className="chart-c" height="80" /></div>

      <div className="chart-section-title">30-day averages</div>
      {daysLogged.length < 30 && (
        <div style={{ fontSize: 12, color: 'var(--text-3)', padding: '8px 12px', background: 'var(--input-bg)', borderRadius: 10, border: '0.5px solid var(--border)', marginBottom: 14, lineHeight: 1.5 }}>
          {30 - daysLogged.length} more day{30 - daysLogged.length === 1 ? '' : 's'} of logging to see full monthly trends
        </div>
      )}
      <div className="chart-grid-2">
        <MiniCard
          label="Avg sleep"
          val={agg.sleep  != null ? `${agg.sleep}h`                  : '—'}
          sub="Target 8h"
        />
        <MiniCard
          label="Avg steps"
          val={agg.steps  != null ? agg.steps.toLocaleString()        : '—'}
          sub="Target 10,000"
        />
        <MiniCard
          label="Water goal"
          val={agg.waterLabel}
          sub={agg.waterSub}
        />
        <MiniCard
          label="Avg day score"
          val={agg.score  != null ? String(agg.score)                 : '—'}
          sub="out of 100"
        />
      </div>
    </div>
  )
}

/* ── habit calendar ──────────────────────────────────────── */
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
                height: 22, borderRadius: 5, background: col, opacity,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, color: s === 0 ? 'transparent' : '#fff',
                fontWeight: 600, fontFamily: 'var(--font-sans)', fontVariantNumeric: 'tabular-nums',
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

/* ── skeleton ────────────────────────────────────────────── */
function AnalyticsSkeleton({ rows = 2 }) {
  return (
    <div className="at-panel-enter">
      <div className="shimmer" style={{ height: 14, width: 130, borderRadius: 6, marginBottom: 12 }} />
      <div className="chart-grid-2" style={{ marginBottom: 14 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="shimmer" style={{ height: 62, borderRadius: 10 }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i}>
          <div className="shimmer" style={{ height: 14, width: 160, borderRadius: 6, marginBottom: 8 }} />
          <div className="shimmer" style={{ height: 100, borderRadius: 10, marginBottom: 14 }} />
        </div>
      ))}
    </div>
  )
}

/* ── helpers ─────────────────────────────────────────────── */
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
