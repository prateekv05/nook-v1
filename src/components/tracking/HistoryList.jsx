'use client'

import { useState, useEffect } from 'react'
import DayScoreRing from '../ui/DayScoreRing'
import { createClient } from '@/lib/supabase'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function formatLabel(iso) {
  const d = new Date(iso + 'T12:00:00')
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' })
  const day     = d.getDate()
  const month   = d.toLocaleDateString('en-US', { month: 'short' })
  return `${weekday}, ${day} ${month}`
}

export default function HistoryList() {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [openIdx, setOpenIdx] = useState(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const today    = todayISO()
      const cutoff   = new Date()
      cutoff.setDate(cutoff.getDate() - 14)
      const cutoffISO  = cutoff.toISOString().slice(0, 10)
      const signupISO  = user.created_at ? user.created_at.slice(0, 10) : cutoffISO
      const fromISO    = signupISO > cutoffISO ? signupISO : cutoffISO

      const [trackRes, clRes] = await Promise.all([
        supabase
          .from('daily_tracking')
          .select('date, sleep, water, steps, productive_hrs, lazy_hrs, mood_morning, mood_evening, day_score, is_rest_day')
          .eq('user_id', user.id)
          .gte('date', fromISO)
          .order('date', { ascending: false }),
        supabase
          .from('checklist_history')
          .select('item_text, is_done, date')
          .eq('user_id', user.id)
          .gte('date', fromISO)
          .order('date', { ascending: false }),
      ])

      // Group checklist rows by date
      const clByDate = {}
      for (const item of (clRes.data || [])) {
        if (!clByDate[item.date]) clByDate[item.date] = []
        clByDate[item.date].push({ text: item.item_text, done: item.is_done })
      }

      const merged = (trackRes.data || []).map(t => {
        const cl      = clByDate[t.date] || []
        const isToday = t.date === today
        return {
          date:      t.date,
          isToday,
          label:     formatLabel(t.date),
          score:     t.day_score      ?? 0,
          water:     t.water          ?? 0,
          sleep:     t.sleep          ?? null,
          steps:     t.steps          ?? null,
          productive: t.productive_hrs ?? null,
          lazy:      t.lazy_hrs       ?? null,
          tasks:     { done: cl.filter(c => c.done).length, total: cl.length },
          checklist: cl,
        }
      })

      setRows(merged)
      setLoading(false)
    }
    load()
  }, [])

  function toggle(i) {
    setOpenIdx(prev => prev === i ? null : i)
  }

  if (loading) return <HistorySkeleton />

  if (rows.length === 0) {
    return (
      <div className="history-empty">
        <i className="ph-bold ph-chart-line-up" style={{ fontSize: 28, color: 'var(--text-3)', marginBottom: 10, display: 'block' }} />
        <p style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center', maxWidth: 240, margin: 0, lineHeight: 1.6 }}>
          Keep logging daily — your patterns appear here after a few days
        </p>
      </div>
    )
  }

  return (
    <div className="history-list">
      {rows.map((row, i) => {
        const isOpen = openIdx === i
        return (
          <div key={row.date} className={`history-row${row.isToday ? ' today' : ''}`}>
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
                  {row.isToday ? `Today — ${row.label}` : row.label}
                  {row.isToday && (
                    <span style={{
                      marginLeft: 8, fontSize: 10, fontWeight: 600,
                      color: 'var(--accent)', background: 'var(--accent-bg)',
                      border: '0.5px solid var(--accent-bdr)', borderRadius: 5,
                      padding: '1px 6px', letterSpacing: '.04em',
                    }}>
                      Today
                    </span>
                  )}
                </div>
                <div className="history-row-chips">
                  {row.tasks.total > 0 && (
                    <span className="history-chip">
                      <i className="ph-bold ph-check-square" />
                      {row.tasks.done}/{row.tasks.total}
                    </span>
                  )}
                  <span className="history-chip">
                    <i className="ph-bold ph-drop" />
                    {row.water}/8
                  </span>
                  {row.sleep != null && (
                    <span className="history-chip">
                      <i className="ph-bold ph-moon" />
                      {row.sleep}h
                    </span>
                  )}
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
                <HdItem label="Steps" value={row.steps != null ? Number(row.steps).toLocaleString() : '—'} />
                <HdItem label="Sleep" value={row.sleep != null ? `${row.sleep}h` : '—'} />
                <HdItem
                  label="Score"
                  value={row.score || '—'}
                  color={row.score >= 80 ? '#4ADE80' : row.score >= 60 ? '#F59E0B' : row.score > 0 ? '#EF4444' : undefined}
                />
              </div>

              {row.checklist.length > 0 ? (
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
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-3)', padding: '6px 0 2px', fontStyle: 'italic' }}>
                  No checklist snapshot for this day
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function HistorySkeleton() {
  return (
    <div className="history-list">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="history-row">
          <div className="history-row-head" style={{ pointerEvents: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div className="shimmer" style={{ width: 140, height: 13, borderRadius: 6 }} />
              <div style={{ display: 'flex', gap: 6 }}>
                <div className="shimmer" style={{ width: 44, height: 20, borderRadius: 6 }} />
                <div className="shimmer" style={{ width: 44, height: 20, borderRadius: 6 }} />
                <div className="shimmer" style={{ width: 44, height: 20, borderRadius: 6 }} />
              </div>
            </div>
            <div className="shimmer" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }} />
          </div>
        </div>
      ))}
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
