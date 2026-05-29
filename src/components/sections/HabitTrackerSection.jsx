'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '../../hooks/useToast'
import Modal from '../ui/Modal'
import Skeleton from '../ui/Skeleton'

const HABIT_COLORS = [
  '#C2623F', '#3D6BE8', '#2D6A4F', '#A05C20',
  '#7C3AED', '#1D6FA8', '#B91C1C', '#5A6070',
]

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getWeekDates() {
  const today = new Date()
  const day = today.getDay() // 0=Sun
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(today)
  monday.setDate(today.getDate() + diff)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

function getRingColor(pct) {
  if (pct >= 80) return '#4ADE80'
  if (pct >= 60) return '#F59E0B'
  return '#EF4444'
}

export default function HabitTrackerSection({ onBack }) {
  const { showToast } = useToast()
  const [habits, setHabits] = useState([])
  const [completions, setCompletions] = useState({})
  const [streaks, setStreaks] = useState({})
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const weekDates = getWeekDates()
  const today = new Date().toISOString().slice(0, 10)

  const fetchHabits = useCallback(async () => {
    try {
      const res = await fetch('/api/habits')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setHabits(data.habits || [])
      setCompletions(data.completions || {})
      setStreaks(data.streaks || {})
    } catch {
      showToast('Failed to load habits', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { fetchHabits() }, [fetchHabits])

  async function toggleToday(habitId) {
    const current = completions[habitId] || []
    const isDone = current.includes(today)

    // Optimistic update
    setCompletions(prev => ({
      ...prev,
      [habitId]: isDone ? current.filter(d => d !== today) : [...current, today],
    }))

    try {
      const res = await fetch('/api/habits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habit_id: habitId, date: today, done: !isDone }),
      })
      if (!res.ok) throw new Error()
      // Refetch streaks (streak may have changed)
      const fresh = await fetch('/api/habits')
      if (fresh.ok) {
        const data = await fresh.json()
        setStreaks(data.streaks || {})
      }
    } catch {
      // Revert
      setCompletions(prev => ({
        ...prev,
        [habitId]: isDone ? [...current] : current.filter(d => d !== today),
      }))
      showToast('Failed to update habit', 'error')
    }
  }

  async function deleteHabit(habitId) {
    setHabits(prev => prev.filter(h => h.id !== habitId))
    try {
      const res = await fetch('/api/habits', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habit_id: habitId }),
      })
      if (!res.ok) throw new Error()
    } catch {
      showToast('Failed to delete habit', 'error')
      fetchHabits()
    }
  }

  async function addHabit(name, color, contributesToScore) {
    try {
      const res = await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color, contributes_to_score: contributesToScore }),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error || 'Failed to add habit', 'error')
        return false
      }
      await fetchHabits()
      return true
    } catch {
      showToast('Failed to add habit', 'error')
      return false
    }
  }

  const doneToday = habits.filter(h => (completions[h.id] || []).includes(today)).length
  const total = habits.length
  const pct = total > 0 ? Math.round((doneToday / total) * 100) : 0
  const ringColor = getRingColor(pct)
  const circumference = 2 * Math.PI * 23
  const strokeOffset = circumference - (pct / 100) * circumference

  return (
    <div className="habit-section">
      <div className="exp-topbar">
        <button className="back-btn" onClick={onBack}>
          <i className="ph-bold ph-caret-left" />
          Dashboard
        </button>
        <div className="exp-label">
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
          Habit Tracker
        </div>
      </div>

      <div className="exp-content" style={{ overflow: 'auto' }}>
        {loading ? (
          <>
            <Skeleton height="96px" borderRadius="16px" style={{ marginBottom: 14 }} />
            <Skeleton height="200px" borderRadius="14px" style={{ marginBottom: 12 }} />
          </>
        ) : (
          <>
            <div className="habit-summary">
              <div>
                <div className="habit-summary-date">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
                </div>
                <div className="habit-summary-count">
                  {doneToday} <span className="habit-summary-total">/ {total} habits</span>
                </div>
                <div className="habit-summary-sub">
                  {pct === 100 ? 'All done — great work!' : total === 0 ? 'Add your first habit below' : 'Keep going!'}
                </div>
              </div>
              <div className="habit-ring">
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="23" fill="none" stroke="var(--gb-divider)" strokeWidth="5" />
                  <circle
                    cx="28" cy="28" r="23" fill="none"
                    stroke={ringColor} strokeWidth="5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    transform="rotate(-90 28 28)"
                    style={{ transition: 'stroke-dashoffset 0.5s var(--ease-spring)' }}
                  />
                </svg>
                <div className="habit-ring-pct" style={{ color: ringColor }}>{pct}%</div>
              </div>
            </div>

            {habits.length === 0 ? (
              <div className="habit-empty">
                <div className="habit-empty-icon"><i className="ph-bold ph-checks" /></div>
                <div className="habit-empty-title">No habits yet</div>
                <div className="habit-empty-sub">Add your first habit to start tracking your streak</div>
                <button className="habit-add-btn" onClick={() => setModalOpen(true)}>
                  <i className="ph-bold ph-plus" /> Add habit
                </button>
              </div>
            ) : (
              <>
                <div className="habit-grid-wrap">
                  <div className="habit-grid-header">
                    <div />
                    {weekDates.map((date, i) => (
                      <div
                        key={date}
                        className={`habit-grid-col-label${date === today ? ' today-label' : ''}`}
                      >
                        {DAY_LABELS[i]}
                      </div>
                    ))}
                    <div className="habit-grid-col-label">Streak</div>
                  </div>

                  {habits.map(habit => {
                    const habitDone = completions[habit.id] || []
                    return (
                      <div key={habit.id} className="habit-row">
                        <div className="habit-name">
                          <div className="habit-color-dot" style={{ background: habit.color }} />
                          <span className="habit-name-text">{habit.name}</span>
                        </div>

                        {weekDates.map(date => {
                          const isFuture = date > today
                          const isToday = date === today
                          const isDone = habitDone.includes(date)
                          return (
                            <div key={date} className="habit-cell-wrap">
                              <div
                                className={[
                                  'habit-cell',
                                  isDone ? 'done' : '',
                                  isToday ? 'today' : '',
                                  isFuture ? 'future' : '',
                                ].filter(Boolean).join(' ')}
                                style={{
                                  background: isDone ? habit.color : undefined,
                                  borderColor: isToday && !isDone ? habit.color : undefined,
                                  boxShadow: isToday && isDone ? `0 0 0 3px ${habit.color}33` : undefined,
                                }}
                                onClick={isToday && !isFuture ? () => toggleToday(habit.id) : undefined}
                                role={isToday ? 'button' : undefined}
                                tabIndex={isToday ? 0 : undefined}
                                onKeyDown={isToday ? (e) => e.key === 'Enter' && toggleToday(habit.id) : undefined}
                                aria-label={isToday ? `Mark ${habit.name} as ${isDone ? 'not done' : 'done'}` : undefined}
                              />
                            </div>
                          )
                        })}

                        <div
                          className="habit-streak"
                          style={{ color: (streaks[habit.id] || 0) > 0 ? habit.color : 'var(--text-3)' }}
                        >
                          {(streaks[habit.id] || 0) > 0 && (
                            <i className="ph-bold ph-fire" style={{ fontSize: 11 }} />
                          )}
                          {streaks[habit.id] || 0}
                        </div>

                        <button
                          className="habit-delete-btn"
                          onClick={() => deleteHabit(habit.id)}
                          aria-label={`Delete ${habit.name}`}
                        >
                          <i className="ph-bold ph-trash" />
                        </button>
                      </div>
                    )
                  })}
                </div>

                <div className="habit-add-row">
                  <button
                    className="habit-add-btn"
                    onClick={() => setModalOpen(true)}
                    disabled={habits.length >= 10}
                    title={habits.length >= 10 ? 'Maximum 10 habits reached' : undefined}
                  >
                    <i className="ph-bold ph-plus" /> Add habit
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <AddHabitModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={addHabit}
      />
    </div>
  )
}

function AddHabitModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(HABIT_COLORS[0])
  const [contributesToScore, setContributesToScore] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setName('')
      setColor(HABIT_COLORS[0])
      setContributesToScore(false)
    }
  }, [isOpen])

  async function handleSave() {
    if (!name.trim() || saving) return
    setSaving(true)
    const ok = await onSave(name, color, contributesToScore)
    setSaving(false)
    if (ok) onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      backdropClass="add-habit-modal-backdrop"
      className="add-habit-modal"
    >
      <div className="add-habit-modal-title">New habit</div>

      <div className="add-habit-field">
        <div className="add-habit-label">NAME</div>
        <input
          className="add-habit-input"
          placeholder="e.g. Meditate, Read 30 mins…"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          maxLength={50}
          autoFocus
        />
      </div>

      <div className="add-habit-field">
        <div className="add-habit-label">COLOR</div>
        <div className="habit-color-swatches">
          {HABIT_COLORS.map(c => (
            <div
              key={c}
              className={`habit-color-swatch${color === c ? ' selected' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setColor(c)}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
      </div>

      <div className="add-habit-toggle-row">
        <div>
          <div className="add-habit-toggle-label">Contribute to Day Score</div>
          <div className="add-habit-toggle-sub">Affects your daily wellness score</div>
        </div>
        <label className="toggle-sw">
          <input
            type="checkbox"
            checked={contributesToScore}
            onChange={() => setContributesToScore(p => !p)}
            aria-label="Toggle contribute to Day Score"
          />
          <span className="toggle-slider" />
        </label>
      </div>

      <div className="add-habit-actions">
        <button className="add-habit-cancel" onClick={onClose}>Cancel</button>
        <button
          className="add-habit-save"
          onClick={handleSave}
          disabled={!name.trim() || saving}
        >
          {saving ? 'Saving…' : 'Add habit'}
        </button>
      </div>
    </Modal>
  )
}
