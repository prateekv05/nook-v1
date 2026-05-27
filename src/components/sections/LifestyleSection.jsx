'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import { isPro } from '@/lib/isPro'
import CalendarModal from '@/components/ui/CalendarModal'
import { useAIContent } from '@/hooks/useAIContent'

const CAT_STYLE = {
  home:   { bg: 'var(--life-bg)',  bdr: 'var(--life-bdr)',  col: 'var(--life-col)',  icon: 'ph-house',     label: 'Home'   },
  office: { bg: 'var(--know-bg)', bdr: 'var(--know-bdr)', col: 'var(--know-col)', icon: 'ph-briefcase', label: 'Office' },
  trip:   { bg: 'var(--fin-bg)',  bdr: 'var(--fin-bdr)',  col: 'var(--fin-col)',  icon: 'ph-airplane',  label: 'Trip'   },
}

const CAT_FILTERS = [
  { id: 'all',    icon: 'ph-list',       label: 'All'    },
  { id: 'home',   icon: 'ph-house',      label: 'Home'   },
  { id: 'office', icon: 'ph-briefcase',  label: 'Office' },
  { id: 'trip',   icon: 'ph-airplane',   label: 'Trip'   },
]

const EMOJIS = ['😌', '🙂', '😐', '😕', '😤']

function formatHistoryDate(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })
}
const METHOD_DAYS = 7
const METHOD_DONE = 3

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayISO() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export default function LifestyleSection({ onBack }) {
  const supabase = createClient()
  const { showToast: addToast } = useToast()

  // Checklist
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [clFilter, setClFilter] = useState('all')
  const [newTask, setNewTask]   = useState('')

  // Journal
  const [journal, setJournal]       = useState('')
  const [journalId, setJournalId]   = useState(null)
  const [submitted, setSubmitted]   = useState(false)
  const [journalSaving, setJournalSaving] = useState(false)
  const [journalLoading, setJournalLoading] = useState(true)
  const [profile, setProfile]       = useState(null)

  const DOW = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
  const dayOfWeek = DOW[new Date().getDay()]
  const { content: aiPrompt, loading: aiPromptLoading } = useAIContent({ type: 'journal-prompt', key: `journal-prompt-${dayOfWeek}` })

  // Gratitude
  const [grat, setGrat]                     = useState(['', '', ''])
  const [gratId, setGratId]                 = useState(null)
  const [gratLoading, setGratLoading]       = useState(true)
  const [gratSaving, setGratSaving]         = useState(false)
  const [gratSaved, setGratSaved]           = useState(false)
  const [showHistory, setShowHistory]       = useState(false)
  const [gratHistory, setGratHistory]       = useState([])
  const [gratHistoryLoading, setGratHistoryLoading] = useState(false)

  // Stress (1–5 maps to emoji index 0–4)
  const [stressMorning, setStressMorning]   = useState(null)
  const [stressEvening, setStressEvening]   = useState(null)
  const [trackingId, setTrackingId]         = useState(null)

  // Calendar modal
  const [calOpen, setCalOpen]       = useState(false)
  const [calDays, setCalDays]       = useState([])
  const [calLoading, setCalLoading] = useState(false)

  // Method
  const [doneDays, setDoneDays]     = useState(METHOD_DONE)
  const [stars, setStars]           = useState(3)
  const [reflection, setReflection] = useState('')

  // ── Load + carry-forward ────────────────────────────────────────────────
  const loadChecklist = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const today = todayISO()
    const yesterday = yesterdayISO()

    // Fetch active items
    const { data: rows, error } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('position', { ascending: true })

    if (error) {
      setLoading(false)
      addToast('Failed to load checklist', 'error')
      return
    }

    // Fetch yesterday's history to determine which items were done yesterday
    const { data: hist } = await supabase
      .from('checklist_history')
      .select('item_id, is_done')
      .eq('user_id', user.id)
      .eq('date', yesterday)

    const doneYesterday = new Set((hist || []).filter(h => h.is_done).map(h => h.item_id))

    // Carry-forward logic on items done yesterday
    const toReset = []   // carry_forward=true, done yesterday → reset is_done=false
    const toDeactivate = [] // carry_forward=false, done yesterday → soft delete

    for (const item of rows) {
      if (!doneYesterday.has(item.id)) continue
      if (item.carry_forward) {
        toReset.push(item.id)
      } else {
        toDeactivate.push(item.id)
      }
    }

    if (toReset.length) {
      await supabase
        .from('checklist_items')
        .update({ is_done: false })
        .in('id', toReset)
    }

    if (toDeactivate.length) {
      await supabase
        .from('checklist_items')
        .update({ is_active: false })
        .in('id', toDeactivate)
    }

    // Reload after mutations
    const { data: fresh } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('position', { ascending: true })

    setItems(
      (fresh || []).map(r => ({
        id: r.id,
        text: r.text,
        cat: r.category || 'home',
        done: r.is_done,
        carry_forward: r.carry_forward,
        position: r.position,
      }))
    )
    setLoading(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadChecklist() }, [loadChecklist])

  // ── Load journal + profile ──────────────────────────────────────────────
  useEffect(() => {
    async function loadJournal() {
      setJournalLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setJournalLoading(false); return }

      const [{ data: entry }, { data: prof }] = await Promise.all([
        supabase
          .from('journal_entries')
          .select('id, content')
          .eq('user_id', user.id)
          .eq('date', todayISO())
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('is_pro, pro_trial_ends_at')
          .eq('id', user.id)
          .single(),
      ])

      if (entry) {
        setJournal(entry.content)
        setJournalId(entry.id)
        setSubmitted(true)
      }
      setProfile(prof)
      setJournalLoading(false)
    }
    loadJournal()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Submit journal ──────────────────────────────────────────────────────
  async function submitJournal() {
    const text = journal.trim()
    if (!text) return
    setJournalSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setJournalSaving(false); return }

    const wordCount = text.split(/\s+/).filter(Boolean).length
    const { data, error } = await supabase
      .from('journal_entries')
      .upsert(
        { user_id: user.id, content: text, word_count: wordCount, date: todayISO() },
        { onConflict: 'user_id,date' }
      )
      .select('id')
      .single()

    setJournalSaving(false)
    if (error) {
      addToast("Couldn't save journal — try again", 'error')
      return
    }
    setJournalId(data.id)
    setSubmitted(true)
    addToast('Journal saved ✓', 'success')
  }

  // ── Load gratitude ─────────────────────────────────────────────────────
  useEffect(() => {
    async function loadGratitude() {
      setGratLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setGratLoading(false); return }

      const { data } = await supabase
        .from('gratitude_logs')
        .select('id, entry_1, entry_2, entry_3')
        .eq('user_id', user.id)
        .eq('date', todayISO())
        .maybeSingle()

      if (data) {
        setGrat([data.entry_1 || '', data.entry_2 || '', data.entry_3 || ''])
        setGratId(data.id)
        setGratSaved(true)
      }
      setGratLoading(false)
    }
    loadGratitude()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load stress (daily_tracking) ───────────────────────────────────────
  useEffect(() => {
    async function loadTracking() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('daily_tracking')
        .select('id, stress_morning, stress_evening')
        .eq('user_id', user.id)
        .eq('date', todayISO())
        .maybeSingle()

      if (data) {
        setTrackingId(data.id)
        if (data.stress_morning != null) setStressMorning(data.stress_morning - 1)
        if (data.stress_evening != null) setStressEvening(data.stress_evening - 1)
      }
    }
    loadTracking()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save gratitude ─────────────────────────────────────────────────────
  async function saveGratitude() {
    const filled = grat.some(v => v.trim())
    if (!filled) return
    setGratSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setGratSaving(false); return }

    const { data, error } = await supabase
      .from('gratitude_logs')
      .upsert(
        { user_id: user.id, entry_1: grat[0].trim(), entry_2: grat[1].trim(), entry_3: grat[2].trim(), date: todayISO() },
        { onConflict: 'user_id,date' }
      )
      .select('id')
      .single()

    setGratSaving(false)
    if (error) { addToast("Couldn't save — try again", 'error'); return }
    setGratId(data.id)
    setGratSaved(true)
    addToast('Gratitude saved ✓', 'success')
  }

  // ── Load gratitude history ──────────────────────────────────────────────
  async function loadGratHistory() {
    if (gratHistory.length) { setShowHistory(h => !h); return }
    setGratHistoryLoading(true)
    setShowHistory(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setGratHistoryLoading(false); return }

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 14)

    const { data } = await supabase
      .from('gratitude_logs')
      .select('date, entry_1, entry_2, entry_3')
      .eq('user_id', user.id)
      .gte('date', cutoff.toISOString().slice(0, 10))
      .order('date', { ascending: false })

    setGratHistory(data || [])
    setGratHistoryLoading(false)
  }

  // ── Save stress ─────────────────────────────────────────────────────────
  async function saveStress(field, emojiIdx) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const dbValue = emojiIdx + 1 // 0-based emoji → 1-based DB value
    await supabase
      .from('daily_tracking')
      .upsert(
        { user_id: user.id, date: todayISO(), [field]: dbValue },
        { onConflict: 'user_id,date' }
      )
  }

  function tapStress(field, idx) {
    if (field === 'stress_morning') setStressMorning(idx)
    else setStressEvening(idx)
    saveStress(field, idx)
  }

  // ── Open calendar history modal ────────────────────────────────────────
  async function openCalendar() {
    setCalOpen(true)
    setCalLoading(true)
    try {
      const res = await fetch('/api/checklist-history')
      if (res.ok) {
        const data = await res.json()
        setCalDays(data.days || [])
      } else {
        addToast('Failed to load history', 'error')
      }
    } catch {
      addToast('Failed to load history', 'error')
    }
    setCalLoading(false)
  }

  // ── Tick / Untick ───────────────────────────────────────────────────────
  async function toggle(id) {
    const item = items.find(i => i.id === id)
    if (!item) return
    const next = !item.done

    // Optimistic
    setItems(prev => prev.map(i => i.id === id ? { ...i, done: next } : i))

    const { error } = await supabase
      .from('checklist_items')
      .update({ is_done: next, completed_at: next ? new Date().toISOString() : null })
      .eq('id', id)

    if (error) {
      // Revert
      setItems(prev => prev.map(i => i.id === id ? { ...i, done: item.done } : i))
      addToast("Couldn't save — try again", 'error')
    }
  }

  // ── Add task ────────────────────────────────────────────────────────────
  async function addTask() {
    const text = newTask.trim()
    if (!text) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const maxPos = items.length ? Math.max(...items.map(i => i.position || 0)) : 0
    const optimisticId = `opt-${Date.now()}`

    // Optimistic
    setItems(prev => [...prev, { id: optimisticId, text, cat: 'home', done: false, carry_forward: true, position: maxPos + 1 }])
    setNewTask('')

    const { data, error } = await supabase
      .from('checklist_items')
      .insert({
        user_id: user.id,
        text,
        category: 'home',
        is_done: false,
        carry_forward: true,
        position: maxPos + 1,
        is_active: true,
        streak_count: 0,
      })
      .select()
      .single()

    if (error) {
      setItems(prev => prev.filter(i => i.id !== optimisticId))
      addToast("Couldn't add task — try again", 'error')
      return
    }

    // Replace optimistic entry with real row
    setItems(prev => prev.map(i =>
      i.id === optimisticId
        ? { id: data.id, text: data.text, cat: data.category || 'home', done: data.is_done, carry_forward: data.carry_forward, position: data.position }
        : i
    ))
    addToast('Task added ✓', 'success')
  }

  // ── Delete (soft) ───────────────────────────────────────────────────────
  async function removeItem(id) {
    // Optimistic
    setItems(prev => prev.filter(i => i.id !== id))

    const { error } = await supabase
      .from('checklist_items')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      addToast("Couldn't remove task — try again", 'error')
      loadChecklist()
    }
  }

  const filtered  = clFilter === 'all' ? items : items.filter(i => i.cat === clFilter)
  const doneCount = items.filter(i => i.done).length
  const pct       = items.length ? Math.round((doneCount / items.length) * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div className="exp-topbar">
        <button className="back-btn" onClick={onBack}>
          <i className="ph-bold ph-caret-left" />
          Dashboard
        </button>
        <div className="exp-label">
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--life-col)', flexShrink: 0 }} />
          Lifestyle
        </div>
      </div>

      <div className="exp-content" style={{ overflow: 'auto' }}>
        <div className="eg2" style={{ gridTemplateColumns: '1.2fr 1fr' }}>

          {/* ── LEFT COLUMN — Method + Journal ── */}
          <div className="ecol">

            {/* Method of the Week */}
            <div className="ec ta">
              <div className="e-label life">Method of the week</div>
              <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--life-col)', marginBottom: 6, fontFamily: 'var(--font-serif)' }}>
                Pomodoro Technique — Day {doneDays} of {METHOD_DAYS}
              </div>
              <div style={{ fontSize: 13, color: 'var(--life-col)', opacity: 0.85, lineHeight: 1.65, marginBottom: 14 }}>
                &ldquo;Work in focused 25-min sprints — then rest. Protect your energy, not just your time.&rdquo;
              </div>
              <div className="e-mday-row">
                {Array.from({ length: METHOD_DAYS }, (_, i) => (
                  <div key={i} className={`e-mday${i < doneDays ? ' done' : ''}`} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--life-col)', opacity: 0.7, marginTop: 6 }}>
                Day {doneDays} of {METHOD_DAYS} — {METHOD_DAYS - doneDays} days remaining
              </div>
              <button
                className="e-btn-g"
                style={{ marginTop: 12, width: '100%' }}
                onClick={() => setDoneDays(d => Math.min(d + 1, METHOD_DAYS))}
                disabled={doneDays >= METHOD_DAYS}
              >
                {doneDays >= METHOD_DAYS ? 'All days complete!' : 'Mark today done'}
              </button>

              <div className="method-feedback">
                <div className="method-feedback-title">How&rsquo;s it going?</div>
                <div className="star-row">
                  {[1, 2, 3, 4, 5].map(n => (
                    <span key={n} className={`star-btn${n <= stars ? ' active' : ''}`} onClick={() => setStars(n)}>★</span>
                  ))}
                </div>
                <textarea
                  rows={2}
                  placeholder="Any notes on your progress..."
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                />
              </div>
            </div>

            {/* Journal */}
            <div className="ec">
              <div className="e-label life">Journal</div>

              {/* AI prompt */}
              <div style={{ fontSize: 11, color: 'var(--text-3)', margin: '0 0 6px' }}>AI prompt for today</div>
              {aiPromptLoading ? (
                <div style={{ height: 52, borderRadius: 10, marginBottom: 10, background: 'var(--input-bg)', backgroundImage: 'linear-gradient(90deg, var(--input-bg) 0%, var(--border) 50%, var(--input-bg) 100%)', backgroundSize: '400px 100%', animation: 'shimmer 1.4s infinite linear' }} />
              ) : isPro(profile || {}) ? (
                <div style={{ background: 'var(--know-bg)', border: '0.5px solid var(--know-bdr)', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: 'var(--know-col)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 10 }}>
                  &ldquo;{aiPrompt || 'Describe a moment this week where you surprised yourself. What did it reveal about who you\'re becoming?'}&rdquo;
                </div>
              ) : (
                <div style={{ position: 'relative', marginBottom: 10 }}>
                  <div style={{ background: 'var(--know-bg)', border: '0.5px solid var(--know-bdr)', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: 'var(--know-col)', lineHeight: 1.6, fontStyle: 'italic', filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none' }}>
                    A personalised prompt that shifts with every day of the week, crafted to spark deeper reflection.
                  </div>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 10, background: 'rgba(var(--know-bg-raw, 29,111,168), 0.04)' }}>
                    <i className="ph-bold ph-lock" style={{ fontSize: 14, color: 'var(--know-col)' }} />
                    <span style={{ fontSize: 10, color: 'var(--know-col)', fontWeight: 500 }}>Pro feature — <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Upgrade</span></span>
                  </div>
                </div>
              )}

              {/* Skeleton while loading today's entry */}
              {journalLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ height: 96, borderRadius: 10, background: 'var(--input-bg)', backgroundImage: 'linear-gradient(90deg, var(--input-bg) 0%, var(--border) 50%, var(--input-bg) 100%)', backgroundSize: '400px 100%', animation: 'shimmer 1.4s infinite linear' }} />
                </div>
              ) : submitted ? (
                <>
                  <div className="journal-submitted" style={{ display: 'block', whiteSpace: 'pre-wrap' }}>{journal}</div>
                  <div className="journal-btn-row">
                    <button className="e-btn-outline" onClick={() => setSubmitted(false)}>Edit</button>
                  </div>
                </>
              ) : (
                <>
                  <textarea
                    className="e-input"
                    rows={5}
                    placeholder="What's on your mind today?"
                    value={journal}
                    onChange={e => setJournal(e.target.value)}
                  />
                  <div className="journal-btn-row">
                    <button
                      className="e-btn-g"
                      onClick={submitJournal}
                      disabled={journalSaving || !journal.trim()}
                    >
                      {journalSaving ? 'Saving…' : 'Submit'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN — Checklist + Stress + Gratitude ── */}
          <div className="ecol">

            {/* Daily Checklist */}
            <div className="ec">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div className="e-label life" style={{ marginBottom: 0 }}>Daily checklist</div>
                <button
                  onClick={openCalendar}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--know-col)', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 7, transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--know-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <i className="ph-bold ph-calendar" /> History
                </button>
              </div>

              {/* Progress bar */}
              {items.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ height: 4, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      borderRadius: 4,
                      background: 'var(--life-col)',
                      width: `${pct}%`,
                      transition: 'width 0.3s var(--ease-spring)',
                    }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
                    {doneCount}/{items.length} — {pct}% complete
                  </div>
                </div>
              )}

              {/* Category filter tabs */}
              <div style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                {CAT_FILTERS.map(f => (
                  <button
                    key={f.id}
                    className={`cl-filter-btn${clFilter === f.id ? ' active' : ''}`}
                    style={clFilter === f.id ? { background: 'var(--life-col)', borderColor: 'var(--life-col)', color: '#fff' } : {}}
                    onClick={() => setClFilter(f.id)}
                  >
                    <i className={`ph-bold ${f.icon}`} /> {f.label}
                  </button>
                ))}
              </div>

              {/* Loading skeleton */}
              {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[1, 2, 3].map(n => (
                    <div key={n} style={{ height: 36, borderRadius: 10, background: 'var(--input-bg)', animation: 'shimmer 1.4s infinite linear', backgroundSize: '400px 100%', backgroundImage: 'linear-gradient(90deg, var(--input-bg) 0%, var(--border) 50%, var(--input-bg) 100%)' }} />
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!loading && filtered.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '20px 0 10px' }}>
                  <i className="ph-bold ph-check-square" style={{ fontSize: 24, color: 'var(--text-3)' }} />
                  <div style={{ fontSize: 13, color: 'var(--text-2)', textAlign: 'center', lineHeight: 1.6 }}>
                    Add your first task to build your day
                  </div>
                </div>
              )}

              {/* Items */}
              {!loading && filtered.map(item => {
                const cs = CAT_STYLE[item.cat] || CAT_STYLE.home
                return (
                  <div key={item.id} className="e-check" style={{ position: 'relative' }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, cursor: 'pointer' }}
                      onClick={() => toggle(item.id)}
                    >
                      <div className={`e-cb${item.done ? ' done' : ''}`}>
                        <svg viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2.5" /></svg>
                      </div>
                      <span className={`e-ct${item.done ? ' done' : ''}`} style={{ flex: 1 }}>{item.text}</span>
                      <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 6, background: cs.bg, border: `0.5px solid ${cs.bdr}`, color: cs.col, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <i className={`ph-bold ${cs.icon}`} /> {cs.label}
                      </span>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); removeItem(item.id) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 12, padding: '4px 6px', borderRadius: 6, flexShrink: 0, display: 'flex', alignItems: 'center', opacity: 0.5, transition: 'opacity 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                      aria-label="Remove task"
                    >
                      <i className="ph-bold ph-x" />
                    </button>
                  </div>
                )
              })}

              {/* Add task */}
              <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
                <div className="e-add" style={{ flex: 1, marginTop: 0 }}>
                  <input
                    className="e-input"
                    placeholder="Add a task..."
                    style={{ flex: 1 }}
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTask()}
                  />
                  <button className="e-btn-g" onClick={addTask}>Add</button>
                </div>
                <button style={{ fontSize: 11, padding: '3px 10px', borderRadius: 7, border: '0.5px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-3)', cursor: 'pointer', fontFamily: 'var(--font-sans)', flexShrink: 0 }}>
                  + Category
                </button>
              </div>
            </div>

            {/* Stress check-in */}
            <div className="ec">
              <div className="e-label life">Stress check-in</div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>Morning</div>
                <div className="stress-row" style={{ justifyContent: 'flex-start', gap: 8 }}>
                  {EMOJIS.map((emoji, i) => (
                    <button
                      key={i}
                      className={`s-emoji-btn${stressMorning === i ? ' sel' : ''}`}
                      onClick={() => tapStress('stress_morning', i)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>Evening</div>
                <div className="stress-row" style={{ justifyContent: 'flex-start', gap: 8 }}>
                  {EMOJIS.map((emoji, i) => (
                    <button
                      key={i}
                      className={`s-emoji-btn${stressEvening === i ? ' sel' : ''}`}
                      onClick={() => tapStress('stress_evening', i)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 10 }}>
                {(stressMorning !== null || stressEvening !== null) ? 'Saved automatically.' : 'Tap to check in — saves instantly.'}
              </div>
            </div>

            {/* Gratitude log */}
            <div className="ec grow">
              <div className="e-label life">Gratitude log</div>

              {gratLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                  {[1, 2, 3].map(n => (
                    <div key={n} style={{ height: 36, borderRadius: 10, background: 'var(--input-bg)', backgroundImage: 'linear-gradient(90deg, var(--input-bg) 0%, var(--border) 50%, var(--input-bg) 100%)', backgroundSize: '400px 100%', animation: 'shimmer 1.4s infinite linear' }} />
                  ))}
                </div>
              ) : (
                <>
                  {grat.map((v, i) => (
                    <input
                      key={i}
                      className="e-input"
                      placeholder="I'm grateful for..."
                      style={{ marginBottom: 8 }}
                      value={v}
                      onChange={e => {
                        setGrat(prev => prev.map((x, j) => j === i ? e.target.value : x))
                        setGratSaved(false)
                      }}
                    />
                  ))}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="e-btn-g"
                      onClick={saveGratitude}
                      disabled={gratSaving}
                    >
                      {gratSaving ? 'Saving…' : gratSaved ? 'Saved ✓' : 'Save'}
                    </button>
                    <button className="e-btn-outline" onClick={loadGratHistory}>
                      {showHistory ? 'View history ↑' : 'View history →'}
                    </button>
                  </div>
                </>
              )}

              {showHistory && (
                <div className="grat-history" style={{ display: 'block', marginTop: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>Last 14 days</div>
                  {gratHistoryLoading ? (
                    <div style={{ height: 60, borderRadius: 10, background: 'var(--input-bg)', backgroundImage: 'linear-gradient(90deg, var(--input-bg) 0%, var(--border) 50%, var(--input-bg) 100%)', backgroundSize: '400px 100%', animation: 'shimmer 1.4s infinite linear' }} />
                  ) : gratHistory.length === 0 ? (
                    <div style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', padding: '12px 0' }}>No entries yet</div>
                  ) : (
                    gratHistory.map(day => {
                      const dayItems = [day.entry_1, day.entry_2, day.entry_3].filter(Boolean)
                      if (!dayItems.length) return null
                      return (
                        <div key={day.date} className="grat-day">
                          <div className="grat-date">{formatHistoryDate(day.date)}</div>
                          {dayItems.map((item, idx) => <div key={idx} className="grat-item">{item}</div>)}
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <CalendarModal
          isOpen={calOpen}
          onClose={() => setCalOpen(false)}
          days={calDays}
          loading={calLoading}
        />

        {/* Positivity strip */}
        <div className="positivity-strip" style={{ marginTop: 12 }}>
          <div className="positivity-inner">
            <i className="ph-bold ph-sparkle positivity-icon" />
            <div>
              <div className="positivity-label">Positivity booster</div>
              <div className="positivity-text">
                &ldquo;You completed 5 of 7 goals last week. Your consistency is quietly building something real — progress compounds just like interest.&rdquo;
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
