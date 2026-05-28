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

function getWeekStart() {
  const d = new Date()
  const diff = (d.getDay() + 6) % 7
  const monday = new Date(d)
  monday.setDate(d.getDate() - diff)
  return monday.toISOString().slice(0, 10)
}

/* ── main component ──────────────────────────────────────── */
export default function AnalyticsTabs() {
  const [tab,         setTab]         = useState('daily')
  const [weeklyData,  setWeeklyData]  = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [userId,      setUserId]      = useState(null)
  const [profile,     setProfile]     = useState(null)
  const [selectedRing, setSelectedRing] = useState(null)

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

  const today      = weeklyData.find(r => r.date === todayISO()) || null
  const isUserPro  = profile ? isPro(profile) : false
  const weekStart  = getWeekStart()

  const trackingSummary = useMemo(() => {
    if (!weeklyData.length) return {}
    const avg = arr => arr.length ? +(arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1) : null
    return {
      days:       weeklyData.length,
      avgSleep:   avg(weeklyData.filter(r => r.sleep         != null).map(r => r.sleep)),
      avgSteps:   avg(weeklyData.filter(r => r.steps         != null).map(r => r.steps)),
      avgWater:   avg(weeklyData.filter(r => r.water         != null).map(r => r.water)),
      avgScore:   avg(weeklyData.filter(r => r.day_score).map(r => r.day_score)),
      avgProdHrs: avg(weeklyData.filter(r => r.productive_hrs != null).map(r => r.productive_hrs)),
    }
  }, [weeklyData])

  const { content: insights, loading: insightsLoading } = useAIContent({
    type: 'ai-insights',
    key: isUserPro && userId ? `ai-insights-${userId}-${weekStart}` : null,
    userContext: trackingSummary,
  })

  // Build history rings from last 7 days
  const weekDates   = lastNDays(7)
  const byDate      = Object.fromEntries(weeklyData.map(r => [r.date, r]))
  const historyRings = weekDates.map(date => ({
    date,
    day:     isoAbbr(date),
    dateNum: String(new Date(date + 'T12:00:00').getDate()),
    row:     byDate[date] || null,
    score:   byDate[date]?.day_score ?? 0,
  }))

  return (
    <div>
      {/* Two-column: AI Insights left, Charts right */}
      <div className="eg2" style={{ marginBottom: 14 }}>
        {/* ── Left: AI Insights ── */}
        <div className="ec tb">
          <div className="e-label know">AI insights</div>
          <AIInsightsPanel isUserPro={isUserPro} insights={insights} insightsLoading={insightsLoading} />
        </div>

        {/* ── Right: Chart Tabs ── */}
        <div className="ec" style={{ flex: 1, minWidth: 0 }}>
          <div className="e-label know">Charts</div>
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
          {tab === 'weekly'  && <WeeklyPanel  data={weeklyData}  loading={loading} />}
          {tab === 'monthly' && <MonthlyPanel data={monthlyData} loading={loading} />}
        </div>
      </div>

      {/* ── Day Score History Rings ── */}
      <div className="ec">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="e-label know" style={{ marginBottom: 0 }}>Day Score History</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Tap a ring to expand</div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', gap: 8 }}>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="shimmer" style={{ width: 58, height: 88, borderRadius: 10, flexShrink: 0 }} />
            ))}
          </div>
        ) : (
          <>
            <div className="hist-rings-scroll">
              {historyRings.map((r, i) => (
                <button
                  key={i}
                  className={`hist-ring-item${selectedRing === i ? ' selected' : ''}`}
                  onClick={() => setSelectedRing(selectedRing === i ? null : i)}
                  aria-label={`${r.day} ${r.dateNum} — score ${r.score}`}
                >
                  <DayScoreRing score={r.score} size={56} strokeWidth={4} bgStroke="var(--border)" />
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>
                    {r.score || '—'}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{r.day}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>{r.dateNum}</div>
                </button>
              ))}
            </div>

            {selectedRing !== null && historyRings[selectedRing].row && (
              <HistoryRingDetail ring={historyRings[selectedRing]} />
            )}
            {selectedRing !== null && !historyRings[selectedRing].row && (
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-3)', padding: '10px 12px', background: 'var(--input-bg)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
                No data logged for this day.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/* ── AI insights panel ───────────────────────────────────── */
function AIInsightsPanel({ isUserPro, insights, insightsLoading }) {
  if (!isUserPro) {
    return (
      <div>
        <div style={{ padding: '9px 10px', background: 'var(--know-bg)', borderRadius: 9, border: '0.5px solid var(--know-bdr)', marginBottom: 6 }}>
          <div style={{ fontSize: 12, color: 'var(--know-col)', lineHeight: 1.6, fontStyle: 'italic' }}>
            "Upgrade to Pro to get personalised pattern insights from your 7-day tracking data."
          </div>
        </div>
        <div style={{ padding: '9px 10px', background: 'var(--know-bg)', borderRadius: 9, border: '0.5px solid var(--know-bdr)', marginBottom: 6 }}>
          <div style={{ fontSize: 12, color: 'var(--know-col)', lineHeight: 1.6, fontStyle: 'italic' }}>
            "Log daily for 7 days to unlock sleep, steps and mood correlation insights."
          </div>
        </div>
        <div style={{ padding: '9px 10px', background: 'var(--know-bg)', borderRadius: 9, border: '0.5px solid var(--know-bdr)' }}>
          <div style={{ fontSize: 12, color: 'var(--know-col)', lineHeight: 1.6, fontStyle: 'italic' }}>
            "Your best days and habit patterns will surface here once you upgrade."
          </div>
        </div>
      </div>
    )
  }

  if (insightsLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[72, 60, 80].map((w, i) => (
          <div key={i} className="shimmer" style={{ height: 50, borderRadius: 9 }} />
        ))}
      </div>
    )
  }

  const lines = (insights || '').split('\n').filter(Boolean)
  if (!lines.length) {
    return (
      <div style={{ padding: '9px 10px', background: 'var(--know-bg)', borderRadius: 9, border: '0.5px solid var(--know-bdr)', fontSize: 12, color: 'var(--know-col)', lineHeight: 1.6 }}>
        Keep logging daily — insights will appear once you have 7 days of data.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {lines.map((line, i) => (
        <div key={i} style={{ padding: '9px 10px', background: 'var(--know-bg)', borderRadius: 9, border: '0.5px solid var(--know-bdr)' }}>
          <div style={{ fontSize: 12, color: 'var(--know-col)', lineHeight: 1.6 }}>{line}</div>
        </div>
      ))}
    </div>
  )
}

/* ── history ring detail ─────────────────────────────────── */
function HistoryRingDetail({ ring }) {
  const [bars, setBars] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setBars(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const r     = ring.row
  const score = r.day_score ?? 0
  const col   = score >= 80 ? '#4ADE80' : score >= 60 ? '#F59E0B' : '#EF4444'
  const label = score >= 85 ? 'Excellent day' : score >= 75 ? 'Great day' : score >= 65 ? 'Good day' : score >= 55 ? 'OK day' : 'Tough day'

  const breakdown = [
    { l: 'Sleep',  v: Math.round(Math.min((r.sleep  ?? 0) / 8,     1) * 100), col: 'var(--know-col)' },
    { l: 'Water',  v: Math.round(Math.min((r.water  ?? 0) / 8,     1) * 100), col: 'var(--accent)'   },
    { l: 'Steps',  v: Math.min(100, Math.round((r.steps ?? 0) / 10000 * 100)), col: '#22C55E'         },
    { l: 'Mood',   v: Math.round(((r.mood_morning ?? 3) + (r.mood_evening ?? 3)) / 10 * 100), col: 'var(--pink-col)' },
  ]

  return (
    <div style={{ marginTop: 12, background: 'var(--input-bg)', borderRadius: 14, padding: 16, border: '0.5px solid var(--border)', animation: 'fade-up 0.2s var(--ease-spring)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{ring.day}, {ring.dateNum}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{label}</div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: col, fontVariantNumeric: 'tabular-nums' }}>{score}</div>
      </div>

      <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600, marginBottom: 8 }}>Score breakdown</div>
      {breakdown.map(b => (
        <div key={b.l} style={{ marginBottom: 7 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-2)', marginBottom: 3 }}>
            <span>{b.l}</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{b.v}%</span>
          </div>
          <div className="e-prog">
            <div className="e-progb" style={{ width: bars ? `${b.v}%` : '0%', background: b.col, transition: 'width 0.5s var(--ease-spring)' }} />
          </div>
        </div>
      ))}

      <div className="chart-grid-2" style={{ marginTop: 12 }}>
        <MiniCard label="Sleep"  val={r.sleep != null ? `${r.sleep}h` : '—'}             sub="logged" />
        <MiniCard label="Steps"  val={r.steps != null ? Number(r.steps).toLocaleString() : '—'} sub="logged" />
        <MiniCard label="Water"  val={`${r.water ?? 0}/8`}                                sub="cups"   />
        <MiniCard label="Mood"   val={r.mood_morning != null ? `${r.mood_morning}↑ ${r.mood_evening ?? '?'}↓` : '—'} sub="AM / PM" />
      </div>
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
  const checklistPct = 60
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

/* ── weekly panel ────────────────────────────────────────── */
function WeeklyPanel({ data, loading }) {
  const sleepRef = useRef(null)
  const prodRef  = useRef(null)
  const stepsRef = useRef(null)

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

  return (
    <div className="at-panel-enter">
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

  const chunks   = [monthRows.slice(0, 7), monthRows.slice(7, 14), monthRows.slice(14, 21), monthRows.slice(21)]
  const avgSleep = chunks.map(ch => {
    const vals = ch.filter(w => w.row?.sleep != null).map(w => w.row.sleep)
    return vals.length ? +(vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(1) : 0
  })

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

  const startOffset = (new Date(monthDates[0] + 'T12:00:00').getDay() + 6) % 7
  const calScores   = [...Array(startOffset).fill(0), ...monthRows.map(w => w.row?.day_score ?? 0)]

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
        <MiniCard label="Avg sleep"      val={agg.sleep  != null ? `${agg.sleep}h`              : '—'} sub="Target 8h"    />
        <MiniCard label="Avg steps"      val={agg.steps  != null ? agg.steps.toLocaleString()    : '—'} sub="Target 10,000" />
        <MiniCard label="Water goal"     val={agg.waterLabel}                                          sub={agg.waterSub}  />
        <MiniCard label="Avg day score"  val={agg.score  != null ? String(agg.score)             : '—'} sub="out of 100"   />
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
