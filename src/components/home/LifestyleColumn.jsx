'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

const METHOD_DAYS = 7

const STRESS_EMOJIS = ['😌', '🙂', '😐', '😕', '😤']

function ChecklistSkeleton() {
  return (
    <>
      {[80, 110, 95].map((w, i) => (
        <div key={i} className="check-item" style={{ pointerEvents: 'none', gap: 10 }}>
          <div className="shimmer" style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0 }} />
          <div className="shimmer" style={{ width: w, height: 13, borderRadius: 5 }} />
        </div>
      ))}
    </>
  )
}

export default function LifestyleColumn({ onExpand }) {
  const [items, setItems] = useState([])
  const [stress, setStress] = useState(null)
  const [trackingData, setTrackingData] = useState(null)
  const [checklistLoading, setChecklistLoading] = useState(true)
  const [checklistError, setChecklistError] = useState(false)
  const [userId, setUserId] = useState(null)
  const [methodName, setMethodName] = useState(null)
  const [doneDays, setDoneDays] = useState(0)

  useEffect(() => {
    let mounted = true
    async function loadChecklist() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { if (mounted) setChecklistLoading(false); return }
        if (mounted) setUserId(user.id)

        const today = new Date().toISOString().slice(0, 10)
        const isEvening = new Date().getHours() >= 12

        const [{ data }, { data: tracking }, { data: method }] = await Promise.all([
          supabase.from('checklist_items').select('id, text, is_done, is_active').eq('user_id', user.id).eq('is_active', true).order('position').limit(3),
          supabase.from('daily_tracking').select('stress_morning, stress_evening, water, sleep, steps, productive_hrs, meals, mood_morning, mood_evening').eq('user_id', user.id).eq('date', today).single(),
          supabase.from('method_of_week').select('method_name, current_day').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        ])

        if (!mounted) return
        setItems((data || []).map(i => ({ id: i.id, label: i.text, done: i.is_done })))
        const saved = isEvening ? tracking?.stress_evening : tracking?.stress_morning
        if (saved != null) setStress(saved)
        if (tracking) setTrackingData(tracking)
        if (method) { setMethodName(method.method_name); setDoneDays(method.current_day || 0) }
      } catch {
        if (mounted) setChecklistError(true)
      } finally {
        if (mounted) setChecklistLoading(false)
      }
    }
    loadChecklist()
    return () => { mounted = false }
  }, [])

  const doneCount = items.filter(i => i.done).length
  const total = items.length
  const progPct = total > 0 ? Math.round((doneCount / total) * 100) : 0

  async function toggle(id, e) {
    e.stopPropagation()
    let newDone
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i
      newDone = !i.done
      return { ...i, done: newDone }
    }))
    if (!userId) return
    const supabase = createClient()
    await supabase.from('checklist_items').update({ is_done: newDone }).eq('id', id).eq('user_id', userId)
  }

  async function handleStress(i, e) {
    e.stopPropagation()
    setStress(i)
    if (!userId) return
    const supabase = createClient()
    const today = new Date().toISOString().slice(0, 10)
    const field = new Date().getHours() >= 12 ? 'stress_evening' : 'stress_morning'
    await supabase.from('daily_tracking').upsert({ user_id: userId, date: today, [field]: i }, { onConflict: 'user_id,date' })
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
            <div className="method-name">{methodName || 'Pomodoro Technique'}</div>
            <div className="method-days">
              {Array.from({ length: METHOD_DAYS }, (_, i) => (
                <div key={i} className={`md${i < doneDays ? ' done' : ''}`} />
              ))}
            </div>
            <div className="method-day-label">{doneDays > 0 ? `Day ${doneDays} of ${METHOD_DAYS}` : 'Start in the Lifestyle tab'}</div>
          </div>
        </div>

        {/* Daily Checklist */}
        <div className="sub-section">
          <div className="sub-label">Daily checklist</div>
          {checklistLoading ? (
            <>
              <div className="cl-progress" style={{ pointerEvents: 'none' }}>
                <div className="cl-prog-track">
                  <div className="cl-prog-fill" style={{ width: '0%' }} />
                </div>
                <div className="shimmer" style={{ width: 32, height: 12, borderRadius: 4 }} />
              </div>
              <ChecklistSkeleton />
            </>
          ) : checklistError ? (
            <div style={{ fontSize: 12, color: 'var(--error-col)', padding: '6px 0', lineHeight: 1.5 }}>
              Couldn't load checklist. Try refreshing.
            </div>
          ) : items.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text-3)', padding: '6px 0', lineHeight: 1.5 }}>
              No tasks yet — add them in the Lifestyle tab.
            </div>
          ) : (
            <>
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
            </>
          )}
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
                onClick={e => handleStress(i, e)}
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
            {[
              { label: 'Water',      value: trackingData?.water != null ? `${trackingData.water}/8` : '—',    pct: trackingData?.water != null ? Math.min((trackingData.water / 8) * 100, 100) : 0,  color: 'var(--know-col)' },
              { label: 'Sleep',      value: trackingData?.sleep != null ? `${trackingData.sleep}h` : '—',     pct: trackingData?.sleep != null ? Math.min((trackingData.sleep / 8) * 100, 100) : 0,  color: 'var(--life-col)' },
              { label: 'Steps',      value: trackingData?.steps != null ? trackingData.steps >= 1000 ? `${(trackingData.steps / 1000).toFixed(1)}k` : String(trackingData.steps) : '—', pct: trackingData?.steps != null ? Math.min((trackingData.steps / 10000) * 100, 100) : 0, color: 'var(--accent)' },
              { label: 'Productive', value: trackingData?.productive_hrs != null ? `${trackingData.productive_hrs} hrs` : '—', pct: trackingData?.productive_hrs != null ? Math.min((trackingData.productive_hrs / 8) * 100, 100) : 0, color: 'var(--accent)' },
              { label: 'Meals',      value: trackingData?.meals != null ? String(trackingData.meals) : '—',   pct: null, color: null },
              { label: 'Mood',       value: null, pct: null, color: null },
            ].map(t => (
              <div className="tc" key={t.label}>
                <div className="tc-l">{t.label}</div>
                {t.label === 'Mood' ? (
                  <div className="tc-v" style={{ fontSize: 16, lineHeight: 1.2 }}>
                    <i className="ph-bold ph-smiley" style={{ color: 'var(--life-col)' }} />
                  </div>
                ) : (
                  <div className="tc-v">{t.value}</div>
                )}
                {t.pct !== null && (
                  <div className="tc-bar">
                    <div className="tc-bar-fill" style={{ width: `${t.pct}%`, background: t.color }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
