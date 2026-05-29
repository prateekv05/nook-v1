'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import { isPro } from '@/lib/isPro'
import CalendarModal from '@/components/ui/CalendarModal'
import JournalHistoryModal from '@/components/ui/JournalHistoryModal'
import { useAIContent } from '@/hooks/useAIContent'
import { drawLineChart } from '@/lib/chart-utils'
import Link from 'next/link'

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

const CUSTOM_PALETTE = [
  { bg: 'rgba(168,85,247,0.07)',  bdr: 'rgba(168,85,247,0.18)',  col: '#7C3AED' },
  { bg: 'rgba(236,72,153,0.07)', bdr: 'rgba(236,72,153,0.18)', col: '#BE185D' },
  { bg: 'rgba(14,165,233,0.07)', bdr: 'rgba(14,165,233,0.18)', col: '#0284C7' },
  { bg: 'rgba(234,179,8,0.07)',  bdr: 'rgba(234,179,8,0.18)',  col: '#A16207' },
  { bg: 'rgba(239,68,68,0.07)',  bdr: 'rgba(239,68,68,0.18)',  col: '#B91C1C' },
]

const EMOJIS = ['😌', '🙂', '😐', '😕', '😤']

function formatHistoryDate(iso) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })
}
const METHOD_DAYS = 7

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayISO() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

function getWeekStart() {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(new Date().setDate(diff)).toISOString().slice(0, 10)
}

export default function LifestyleSection({ onBack }) {
  const supabase = createClient()
  const { showToast: addToast } = useToast()

  // Checklist
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [clFilter, setClFilter] = useState('all')
  const [newTask, setNewTask]   = useState('')
  const [newTaskCat, setNewTaskCat] = useState('home')
  const [showCatPicker, setShowCatPicker] = useState(false)
  const [customCats, setCustomCats] = useState([])
  const [newCatInput, setNewCatInput] = useState('')
  const [showNewCatInput, setShowNewCatInput] = useState(false)

  // Journal
  const [journal, setJournal]             = useState('')
  const [journalSaving, setJournalSaving] = useState(false)
  const [journalLoading, setJournalLoading] = useState(true)
  const [todayEntryCount, setTodayEntryCount] = useState(0)
  const [profile, setProfile]             = useState(null)
  const [showJournalModal, setShowJournalModal]           = useState(false)
  const [journalEntries, setJournalEntries]               = useState([])
  const [journalEntriesLoading, setJournalEntriesLoading] = useState(false)
  const [journalEntriesLoaded, setJournalEntriesLoaded]   = useState(false)

  const DOW = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
  const dayOfWeek = DOW[new Date().getDay()]
  const { content: aiPrompt, loading: aiPromptLoading } = useAIContent({ type: 'journal-prompt', key: `journal-prompt-${dayOfWeek}` })

  // Gratitude
  const [grat, setGrat]                     = useState(['', '', ''])
  const [gratId, setGratId]                 = useState(null)
  const [gratLoading, setGratLoading]       = useState(true)
  const [gratSaving, setGratSaving]         = useState(false)
  const [gratSaved, setGratSaved]           = useState(false)
  const [showHistory, setShowHistory]             = useState(false)
  const [gratHistory, setGratHistory]             = useState([])
  const [gratHistoryLoading, setGratHistoryLoading] = useState(false)
  const [gratHistoryLoaded, setGratHistoryLoaded] = useState(false)

  // Stress — single check-in per day, any time
  const [stress, setStress]                       = useState(null)
  const [stressFlipped, setStressFlipped]         = useState(false)
  const [stressHistory, setStressHistory]         = useState([])
  const [stressHistoryLoading, setStressHistoryLoading] = useState(false)
  const stressChartRef = useRef(null)

  // Calendar modal
  const [calOpen, setCalOpen]       = useState(false)
  const [calDays, setCalDays]       = useState([])
  const [calLoading, setCalLoading] = useState(false)

  // Method
  const [doneDays, setDoneDays]       = useState(0)
  const [stars, setStars]             = useState(0)
  const [reflection, setReflection]   = useState('')
  const [methodId, setMethodId]       = useState(null)
  const [methodLoading, setMethodLoading] = useState(true)
  const [markedToday, setMarkedToday] = useState(false)
  const [isFlipped, setIsFlipped]     = useState(false)
  const [methodExpanded, setMethodExpanded] = useState(false)

  // ── Load method of the week ─────────────────────────────────────────────
  useEffect(() => {
    async function loadMethod() {
      setMethodLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setMethodLoading(false); return }

      const { data } = await supabase
        .from('method_of_week')
        .select('id, current_day, rating, reflection')
        .eq('user_id', user.id)
        .eq('method_slug', 'pomodoro')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (data) {
        setMethodId(data.id)
        setDoneDays(data.current_day || 0)
        setStars(data.rating || 0)
        setReflection(data.reflection || '')
      }

      const lastMarked = localStorage.getItem('nook-method-last-marked')
      setMarkedToday(lastMarked === todayISO())
      setMethodLoading(false)
    }
    loadMethod()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

  // ── Load custom categories from localStorage ────────────────────────────
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('nook-checklist-custom-cats') || '[]')
      if (Array.isArray(stored)) setCustomCats(stored)
    } catch {}
  }, [])

  function addCustomCat() {
    const name = newCatInput.trim()
    if (!name) return
    const id = name.toLowerCase().replace(/\s+/g, '-')
    if (CAT_STYLE[id] || customCats.some(c => c.id === id)) {
      setNewTaskCat(id)
      setShowNewCatInput(false)
      setNewCatInput('')
      setShowCatPicker(false)
      return
    }
    const updated = [...customCats, { id, label: name }]
    setCustomCats(updated)
    try { localStorage.setItem('nook-checklist-custom-cats', JSON.stringify(updated)) } catch {}
    setNewTaskCat(id)
    setNewCatInput('')
    setShowNewCatInput(false)
    setShowCatPicker(false)
  }

  // ── Load journal + profile ──────────────────────────────────────────────
  useEffect(() => {
    async function loadJournal() {
      setJournalLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setJournalLoading(false); return }

      const [{ count }, { data: prof }] = await Promise.all([
        supabase
          .from('journal_entries')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('date', todayISO()),
        supabase
          .from('profiles')
          .select('is_pro, pro_trial_ends_at')
          .eq('id', user.id)
          .single(),
      ])

      setTodayEntryCount(count || 0)
      setProfile(prof)
      setJournalLoading(false)
    }
    loadJournal()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Submit journal (insert — multiple entries per day allowed) ─────────
  async function submitJournal() {
    const text = journal.trim()
    if (!text) return
    setJournalSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setJournalSaving(false); return }

    const wordCount = text.split(/\s+/).filter(Boolean).length
    const { error } = await supabase
      .from('journal_entries')
      .insert({ user_id: user.id, content: text, word_count: wordCount, date: todayISO() })

    setJournalSaving(false)
    if (error) {
      addToast("Couldn't save journal — try again", 'error')
      return
    }
    setJournal('')
    setTodayEntryCount(c => c + 1)
    setJournalEntriesLoaded(false) // invalidate cached list
    addToast('Journal entry saved ✓', 'success')
  }

  // ── Open journal history modal ──────────────────────────────────────────
  async function loadJournalHistory() {
    setShowJournalModal(true)
    if (journalEntriesLoaded) return
    setJournalEntriesLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setJournalEntriesLoading(false); return }

    const { data } = await supabase
      .from('journal_entries')
      .select('id, date, content, word_count, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setJournalEntries(data || [])
    setJournalEntriesLoaded(true)
    setJournalEntriesLoading(false)
  }

  // ── Edit journal entry ─────────────────────────────────────────────────
  async function editJournalEntry(id, content) {
    const wordCount = content.split(/\s+/).filter(Boolean).length
    const { error } = await supabase
      .from('journal_entries')
      .update({ content, word_count: wordCount })
      .eq('id', id)

    if (error) { addToast("Couldn't update entry — try again", 'error'); return }
    setJournalEntries(prev => prev.map(e => e.id === id ? { ...e, content, word_count: wordCount } : e))
    addToast('Entry updated ✓', 'success')
  }

  // ── Delete journal entry ───────────────────────────────────────────────
  async function deleteJournalEntry(id) {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)

    if (error) { addToast("Couldn't delete entry — try again", 'error'); return }
    setJournalEntries(prev => prev.filter(e => e.id !== id))
    setTodayEntryCount(prev => Math.max(0, prev - 1))
    addToast('Entry deleted', 'success')
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

  // ── Load today's stress ────────────────────────────────────────────────
  useEffect(() => {
    async function loadStress() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('daily_tracking')
        .select('stress_morning')
        .eq('user_id', user.id)
        .eq('date', todayISO())
        .maybeSingle()

      if (data?.stress_morning != null) setStress(data.stress_morning - 1)
    }
    loadStress()
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

    // Refresh history in-place if panel is open; otherwise just invalidate cache
    if (showHistory) {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - 14)
      const { data: fresh } = await supabase
        .from('gratitude_logs')
        .select('date, entry_1, entry_2, entry_3')
        .eq('user_id', user.id)
        .gte('date', cutoff.toISOString().slice(0, 10))
        .order('date', { ascending: false })
      setGratHistory(fresh || [])
      setGratHistoryLoaded(true)
    } else {
      setGratHistoryLoaded(false)
    }
  }

  // ── Load gratitude history ──────────────────────────────────────────────
  async function loadGratHistory() {
    if (gratHistoryLoaded) { setShowHistory(h => !h); return }
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
    setGratHistoryLoaded(true)
    setGratHistoryLoading(false)
  }

  // ── Save stress ─────────────────────────────────────────────────────────
  async function tapStress(idx) {
    setStress(idx)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase
      .from('daily_tracking')
      .upsert(
        { user_id: user.id, date: todayISO(), stress_morning: idx + 1 },
        { onConflict: 'user_id,date' }
      )
  }

  // ── Load stress history + draw chart ──────────────────────────────────
  async function openStressHistory() {
    if (stressHistory.length) { setStressFlipped(true); return }
    setStressHistoryLoading(true)
    setStressFlipped(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setStressHistoryLoading(false); return }

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 13)

    const { data } = await supabase
      .from('daily_tracking')
      .select('date, stress_morning')
      .eq('user_id', user.id)
      .gte('date', cutoff.toISOString().slice(0, 10))
      .not('stress_morning', 'is', null)
      .order('date', { ascending: true })

    setStressHistory(data || [])
    setStressHistoryLoading(false)
  }

  // ── Draw stress chart when history panel is visible ────────────────────
  useEffect(() => {
    if (!stressFlipped || stressHistoryLoading || !stressHistory.length) return
    const canvas = stressChartRef.current
    if (!canvas) return
    const labels = stressHistory.map(r => {
      const d = new Date(r.date + 'T12:00:00')
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    })
    const values = stressHistory.map(r => r.stress_morning)
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--life-col').trim() || '#A05C20'
    drawLineChart(canvas, labels, [{ color: accentColor, data: values }], { yMax: 5 })
  }, [stressFlipped, stressHistoryLoading, stressHistory])

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

  // ── Mark method day done (once per day) ────────────────────────────────
  async function markMethodDone() {
    if (markedToday || doneDays >= METHOD_DAYS) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const nextDay = doneDays + 1
    setDoneDays(nextDay)
    setMarkedToday(true)
    localStorage.setItem('nook-method-last-marked', todayISO())

    try {
      if (methodId) {
        await supabase
          .from('method_of_week')
          .update({ current_day: nextDay, is_completed: nextDay >= METHOD_DAYS })
          .eq('id', methodId)
      } else {
        const { data } = await supabase
          .from('method_of_week')
          .insert({
            user_id: user.id,
            method_name: 'Pomodoro Technique',
            method_slug: 'pomodoro',
            week_start: getWeekStart(),
            current_day: nextDay,
            is_completed: nextDay >= METHOD_DAYS,
          })
          .select('id')
          .single()
        if (data) setMethodId(data.id)
      }
    } catch {
      addToast("Couldn't save progress — try again", 'error')
    }
  }

  // ── Save method feedback (stars + reflection) ───────────────────────────
  async function saveMethodFeedback(newStars, newReflection) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (methodId) {
      await supabase
        .from('method_of_week')
        .update({ rating: newStars, reflection: newReflection })
        .eq('id', methodId)
    } else {
      const { data } = await supabase
        .from('method_of_week')
        .insert({
          user_id: user.id,
          method_name: 'Pomodoro Technique',
          method_slug: 'pomodoro',
          week_start: getWeekStart(),
          current_day: 0,
          is_completed: false,
          rating: newStars,
          reflection: newReflection,
        })
        .select('id')
        .single()
      if (data) setMethodId(data.id)
    }
  }

  // ── Tick / Untick ───────────────────────────────────────────────────────
  async function toggle(id) {
    const item = items.find(i => i.id === id)
    if (!item) return
    const next = !item.done

    // Optimistic
    setItems(prev => prev.map(i => i.id === id ? { ...i, done: next } : i))

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('checklist_items')
      .update({ is_done: next, completed_at: next ? new Date().toISOString() : null })
      .eq('id', id)

    if (error) {
      setItems(prev => prev.map(i => i.id === id ? { ...i, done: item.done } : i))
      addToast("Couldn't save — try again", 'error')
      return
    }

    // Write to history so the calendar view reflects ticked tasks
    if (user) {
      const today = todayISO()
      const { data: existing } = await supabase
        .from('checklist_history')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_id', id)
        .eq('date', today)
        .maybeSingle()

      if (existing) {
        await supabase
          .from('checklist_history')
          .update({ is_done: next, item_text: item.text })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('checklist_history')
          .insert({ user_id: user.id, item_id: id, item_text: item.text, is_done: next, date: today })
      }
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
    setItems(prev => [...prev, { id: optimisticId, text, cat: newTaskCat, done: false, carry_forward: true, position: maxPos + 1 }])
    setNewTask('')
    setShowCatPicker(false)

    const { data, error } = await supabase
      .from('checklist_items')
      .insert({
        user_id: user.id,
        text,
        category: newTaskCat,
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

  const allCatStyle = {
    ...CAT_STYLE,
    ...Object.fromEntries(
      customCats.map((c, i) => [c.id, { ...CUSTOM_PALETTE[i % CUSTOM_PALETTE.length], icon: 'ph-tag', label: c.label }])
    ),
  }

  const allCatFilters = [
    ...CAT_FILTERS,
    ...customCats.map(c => ({ id: c.id, icon: 'ph-tag', label: c.label })),
  ]

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
            <div className="ec ta" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div className="e-label life" style={{ marginBottom: 0 }}>Method of the week</div>
                <button
                  onClick={() => setIsFlipped(f => !f)}
                  style={{ background: 'none', border: '0.5px solid var(--life-bdr)', borderRadius: 7, padding: '5px 9px', cursor: 'pointer', color: 'var(--life-col)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s', fontFamily: 'var(--font-sans)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--life-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  title={isFlipped ? 'Show progress' : 'Learn more'}
                >
                  <i className={`ph-bold ph-${isFlipped ? 'arrow-u-up-left' : 'cards'}`} />
                  {isFlipped ? 'Back' : 'Details'}
                </button>
              </div>

              {/* Front face */}
              {!isFlipped && (
                <div className="method-face-enter">
                  <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--life-col)', marginBottom: 6, fontFamily: 'var(--font-serif)' }}>
                    Pomodoro Technique — Day {doneDays} of {METHOD_DAYS}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--life-col)', opacity: 0.85, lineHeight: 1.65, marginBottom: 14 }}>
                    &ldquo;Work in focused 25-min sprints — then rest. Protect your energy, not just your time.&rdquo;
                  </div>
                  {methodLoading ? (
                    <div style={{ height: 5, borderRadius: 4, background: 'var(--life-bdr)', marginBottom: 14, animation: 'shimmer 1.4s infinite linear', backgroundSize: '400px 100%', backgroundImage: 'linear-gradient(90deg, var(--life-bdr) 0%, var(--life-bg) 50%, var(--life-bdr) 100%)' }} />
                  ) : (
                    <>
                      <div className="e-mday-row">
                        {Array.from({ length: METHOD_DAYS }, (_, i) => (
                          <div key={i} className={`e-mday${i < doneDays ? ' done' : ''}`} />
                        ))}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--life-col)', opacity: 0.7, marginTop: 6 }}>
                        Day {doneDays} of {METHOD_DAYS} — {METHOD_DAYS - doneDays} days remaining
                      </div>
                    </>
                  )}
                  <button
                    className="e-btn-g"
                    style={{ marginTop: 12, width: '100%' }}
                    onClick={markMethodDone}
                    disabled={doneDays >= METHOD_DAYS || markedToday || methodLoading}
                  >
                    {doneDays >= METHOD_DAYS ? 'All days complete!' : markedToday ? 'Already marked today ✓' : 'Mark today done'}
                  </button>

                  <div className="method-feedback">
                    <div className="method-feedback-title">How&rsquo;s it going?</div>
                    <div className="star-row">
                      {[1, 2, 3, 4, 5].map(n => (
                        <span
                          key={n}
                          className={`star-btn${n <= stars ? ' active' : ''}`}
                          onClick={() => {
                            setStars(n)
                            saveMethodFeedback(n, reflection)
                          }}
                        >★</span>
                      ))}
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Any notes on your progress..."
                      value={reflection}
                      onChange={e => setReflection(e.target.value)}
                      onBlur={() => saveMethodFeedback(stars, reflection)}
                    />
                  </div>
                </div>
              )}

              {/* Back face — technique details */}
              {isFlipped && (
                <div className="method-face-enter">
                  <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--life-col)', marginBottom: 8, fontFamily: 'var(--font-serif)' }}>
                    About the Pomodoro Technique
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 14 }}>
                    Developed by Francesco Cirillo in the late 1980s, Pomodoro breaks work into 25-minute focused intervals separated by short breaks. The name comes from the tomato-shaped timer he used as a student.
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--life-col)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>How to practice</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                    {[
                      { step: '1', text: 'Choose one task to focus on completely.' },
                      { step: '2', text: 'Set a timer for 25 minutes — your Pomodoro.' },
                      { step: '3', text: 'Work with full focus until the timer rings. No switching.' },
                      { step: '4', text: 'Take a 5-minute break. Move, breathe, rest your eyes.' },
                      { step: '5', text: 'After 4 Pomodoros, take a longer 20–30 min break.' },
                    ].map(({ step, text }) => (
                      <div key={step} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--life-bg)', border: '0.5px solid var(--life-bdr)', color: 'var(--life-col)', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{step}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{text}</div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              <Link href="/blog?category=method-of-week" className="know-more-link know-more-life" style={{ marginTop: 8 }}>
                Know more <i className="ph-bold ph-arrow-right" style={{ fontSize: 11 }} />
              </Link>
            </div>

            {/* Journal */}
            <div className="ec">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div className="e-label life" style={{ marginBottom: 0 }}>Journal</div>
                {!journalLoading && todayEntryCount > 0 && (
                  <span style={{ fontSize: 11, color: 'var(--know-col)', background: 'var(--know-bg)', border: '0.5px solid var(--know-bdr)', borderRadius: 20, padding: '2px 9px', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                    {todayEntryCount} {todayEntryCount === 1 ? 'entry' : 'entries'} today
                  </span>
                )}
              </div>

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

              {journalLoading ? (
                <div style={{ height: 96, borderRadius: 10, background: 'var(--input-bg)', backgroundImage: 'linear-gradient(90deg, var(--input-bg) 0%, var(--border) 50%, var(--input-bg) 100%)', backgroundSize: '400px 100%', animation: 'shimmer 1.4s infinite linear' }} />
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
                      {journalSaving ? 'Saving…' : 'Add entry'}
                    </button>
                    <button className="e-btn-outline" onClick={loadJournalHistory}>
                      History →
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
                {allCatFilters.map(f => (
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
                const cs = allCatStyle[item.cat] || allCatStyle.home
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
              <div style={{ marginTop: 10 }}>
                <div className="e-add" style={{ marginTop: 0 }}>
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
                <div style={{ marginTop: 6, position: 'relative' }}>
                  <button
                    onClick={() => { setShowCatPicker(p => !p); setShowNewCatInput(false); setNewCatInput('') }}
                    style={{ fontSize: 11, padding: '3px 10px', borderRadius: 7, border: `0.5px solid ${(allCatStyle[newTaskCat] || allCatStyle.home).bdr}`, background: (allCatStyle[newTaskCat] || allCatStyle.home).bg, color: (allCatStyle[newTaskCat] || allCatStyle.home).col, cursor: 'pointer', fontFamily: 'var(--font-sans)', display: 'inline-flex', alignItems: 'center', gap: 4, transition: 'all 0.2s' }}
                  >
                    <i className={`ph-bold ${(allCatStyle[newTaskCat] || allCatStyle.home).icon}`} />
                    {(allCatStyle[newTaskCat] || allCatStyle.home).label}
                    <i className={`ph-bold ph-caret-${showCatPicker ? 'up' : 'down'}`} style={{ fontSize: 9 }} />
                  </button>
                  {showCatPicker && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: 'var(--card-bg)', border: '0.5px solid var(--border)', borderRadius: 10, padding: 6, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 'var(--z-sticky)', boxShadow: 'var(--card-sh)', minWidth: 140 }}>
                      {Object.entries(allCatStyle).map(([key, s]) => (
                        <button
                          key={key}
                          onClick={() => { setNewTaskCat(key); setShowCatPicker(false) }}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 7, border: 'none', background: newTaskCat === key ? s.bg : 'transparent', color: s.col, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 12, textAlign: 'left', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = s.bg}
                          onMouseLeave={e => { if (newTaskCat !== key) e.currentTarget.style.background = 'transparent' }}
                        >
                          <i className={`ph-bold ${s.icon}`} /> {s.label}
                        </button>
                      ))}
                      <div style={{ height: '0.5px', background: 'var(--border)', margin: '2px 0' }} />
                      {!showNewCatInput ? (
                        <button
                          onClick={() => setShowNewCatInput(true)}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 7, border: 'none', background: 'transparent', color: 'var(--text-3)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 12, textAlign: 'left', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--input-bg)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <i className="ph-bold ph-plus" /> New category
                        </button>
                      ) : (
                        <div style={{ display: 'flex', gap: 4, padding: '4px 6px' }}>
                          <input
                            autoFocus
                            value={newCatInput}
                            onChange={e => setNewCatInput(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') addCustomCat()
                              if (e.key === 'Escape') { setShowNewCatInput(false); setNewCatInput('') }
                            }}
                            placeholder="Name..."
                            style={{ flex: 1, fontSize: 12, padding: '4px 8px', borderRadius: 6, border: '0.5px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-1)', fontFamily: 'var(--font-sans)', outline: 'none' }}
                          />
                          <button
                            onClick={addCustomCat}
                            style={{ fontSize: 11, padding: '4px 8px', borderRadius: 6, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-sans)', flexShrink: 0 }}
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stress check-in */}
            <div className="ec">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div className="e-label life" style={{ marginBottom: 0 }}>Stress check-in</div>
                <button
                  onClick={() => stressFlipped ? setStressFlipped(false) : openStressHistory()}
                  style={{ background: 'none', border: '0.5px solid var(--life-bdr)', borderRadius: 7, padding: '5px 9px', cursor: 'pointer', color: 'var(--life-col)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s', fontFamily: 'var(--font-sans)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--life-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  title={stressFlipped ? 'Back to check-in' : 'View history'}
                >
                  <i className={`ph-bold ph-${stressFlipped ? 'arrow-u-up-left' : 'chart-line'}`} />
                  {stressFlipped ? 'Back' : 'History'}
                </button>
              </div>

              {!stressFlipped ? (
                <div className="method-face-enter">
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10 }}>
                    How are you feeling right now?
                  </div>
                  <div className="stress-row" style={{ justifyContent: 'space-between', gap: 6 }}>
                    {EMOJIS.map((emoji, i) => (
                      <button
                        key={i}
                        className={`s-emoji-btn${stress === i ? ' sel' : ''}`}
                        onClick={() => tapStress(i)}
                        style={{ flex: 1 }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 4px 0', marginTop: 2 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Calm</span>
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Stressed</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 10 }}>
                    {stress !== null ? 'Saved automatically.' : 'Tap to check in — saves instantly.'}
                  </div>
                </div>
              ) : (
                <div className="method-face-enter">
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 10 }}>
                    Last 14 days — stress level (1 = calm, 5 = stressed)
                  </div>
                  {stressHistoryLoading ? (
                    <div style={{ height: 110, borderRadius: 10, background: 'var(--input-bg)', backgroundImage: 'linear-gradient(90deg, var(--input-bg) 0%, var(--border) 50%, var(--input-bg) 100%)', backgroundSize: '400px 100%', animation: 'shimmer 1.4s infinite linear' }} />
                  ) : stressHistory.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '24px 0' }}>
                      <i className="ph-bold ph-chart-line" style={{ fontSize: 22, color: 'var(--text-3)' }} />
                      <div style={{ fontSize: 13, color: 'var(--text-2)', textAlign: 'center' }}>
                        No history yet — check in a few days to see your trend.
                      </div>
                    </div>
                  ) : (
                    <canvas
                      ref={stressChartRef}
                      style={{ width: '100%', height: 110, display: 'block' }}
                      height={110}
                    />
                  )}
                </div>
              )}
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

        <JournalHistoryModal
          isOpen={showJournalModal}
          onClose={() => setShowJournalModal(false)}
          entries={journalEntries}
          loading={journalEntriesLoading}
          onEdit={editJournalEntry}
          onDelete={deleteJournalEntry}
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
