'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import DayScoreRing from '../ui/DayScoreRing'
import { calculateDayScore } from '../../lib/day-score'
import { createClient } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'

const EMOJIS = ['😌', '🙂', '😐', '😕', '😤']

function productiveLabel(v) {
  if (v <= 2) return 'Getting started'
  if (v <= 5) return 'Focused'
  if (v <= 8) return 'Deep work'
  return 'Excellent'
}

function lazyLabel(v) {
  if (v <= 3) return 'Balanced'
  if (v <= 7) return 'High rest'
  return 'Too much downtime'
}

function scoreLabel(s) {
  if (s >= 80) return 'Excellent day ✦'
  if (s >= 60) return 'Good day ✓'
  if (s >= 40) return 'Decent day'
  return 'Room to grow'
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function DailyInputs({ onDayScoreUpdate }) {
  const supabase = createClient()
  const { showToast } = useToast()

  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [locked,    setLocked]    = useState(false)
  const [streak,    setStreak]    = useState(0)
  const [flashing,  setFlashing]  = useState(false)

  const prevScoreRef = useRef(0)

  const [water,        setWater]        = useState(0)
  const [sleep,        setSleep]        = useState('')
  const [calories,     setCalories]     = useState('')
  const [meals,        setMeals]        = useState(null)
  const [exerciseType, setExerciseType] = useState('')
  const [exerciseMins, setExerciseMins] = useState('')
  const [steps,        setSteps]        = useState('')
  const [calsBurnt,    setCalsBurnt]    = useState('')
  const [isRestDay,    setIsRestDay]    = useState(false)
  const [productive,   setProductive]   = useState(0)
  const [lazy,         setLazy]         = useState(0)
  const [moodMorning,  setMoodMorning]  = useState(null)
  const [moodEvening,  setMoodEvening]  = useState(null)
  const [notes,        setNotes]        = useState('')

  const [checklistTotal, setChecklistTotal] = useState(0)
  const [checklistDone,  setChecklistDone]  = useState(0)

  const liveScore = calculateDayScore(
    {
      sleep:        parseFloat(sleep) || 0,
      water,
      steps:        isRestDay ? 0 : (parseInt(steps) || 0),
      mood_morning: moodMorning !== null ? moodMorning + 1 : 3,
      mood_evening: moodEvening !== null ? moodEvening + 1 : 3,
    },
    checklistTotal,
    checklistDone,
  )

  useEffect(() => {
    if (liveScore > prevScoreRef.current && prevScoreRef.current > 0) {
      setFlashing(true)
      const id = setTimeout(() => setFlashing(false), 500)
      prevScoreRef.current = liveScore
      return () => clearTimeout(id)
    }
    prevScoreRef.current = liveScore
  }, [liveScore])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const today = todayISO()

      const [trackRes, clRes] = await Promise.all([
        supabase
          .from('daily_tracking')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .maybeSingle(),
        supabase
          .from('checklist_items')
          .select('id, is_done')
          .eq('user_id', user.id)
          .eq('is_active', true),
      ])

      if (clRes.data) {
        setChecklistTotal(clRes.data.length)
        setChecklistDone(clRes.data.filter(i => i.is_done).length)
      }

      const t = trackRes.data
      if (t) {
        setWater(t.water ?? 0)
        setSleep(t.sleep != null ? String(t.sleep) : '')
        setCalories(t.meals != null ? '' : '')
        setMeals(t.meals != null ? String(t.meals) : null)
        setExerciseType(t.exercise_type ?? '')
        setExerciseMins(t.exercise_mins != null ? String(t.exercise_mins) : '')
        setSteps(t.steps != null ? String(t.steps) : '')
        setIsRestDay(t.is_rest_day ?? false)
        setProductive(t.productive_hrs ?? 0)
        setLazy(t.lazy_hrs ?? 0)
        setMoodMorning(t.mood_morning != null ? t.mood_morning - 1 : null)
        setMoodEvening(t.mood_evening != null ? t.mood_evening - 1 : null)
        setNotes(t.notes ?? '')
        if (t.day_score) prevScoreRef.current = t.day_score
      }

      setLoading(false)
    }
    load()
  }, [])

  const toggleWater = useCallback((idx) => {
    setWater(prev => idx < prev ? idx : idx + 1)
  }, [])

  async function handleLock() {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const today = todayISO()

      // Fetch fresh checklist counts before calculating score
      const { data: clData } = await supabase
        .from('checklist_items')
        .select('id, is_done')
        .eq('user_id', user.id)
        .eq('is_active', true)

      const total = clData?.length ?? checklistTotal
      const done  = clData?.filter(i => i.is_done).length ?? checklistDone
      setChecklistTotal(total)
      setChecklistDone(done)

      const finalScore = calculateDayScore(
        {
          sleep:        parseFloat(sleep) || 0,
          water,
          steps:        isRestDay ? 0 : (parseInt(steps) || 0),
          mood_morning: moodMorning !== null ? moodMorning + 1 : 3,
          mood_evening: moodEvening !== null ? moodEvening + 1 : 3,
        },
        total,
        done,
      )

      const payload = {
        user_id:        user.id,
        date:           today,
        water,
        sleep:          parseFloat(sleep) || null,
        meals:          meals ? parseInt(meals) || null : null,
        exercise_type:  isRestDay ? null : (exerciseType || null),
        exercise_mins:  isRestDay ? null : (parseInt(exerciseMins) || null),
        steps:          isRestDay ? null : (parseInt(steps) || null),
        productive_hrs: productive,
        lazy_hrs:       lazy,
        mood_morning:   moodMorning !== null ? moodMorning + 1 : null,
        mood_evening:   moodEvening !== null ? moodEvening + 1 : null,
        notes:          notes || null,
        is_rest_day:    isRestDay,
        day_score:      finalScore,
        updated_at:     new Date().toISOString(),
      }

      const { error: upsertErr } = await supabase
        .from('daily_tracking')
        .upsert(payload, { onConflict: 'user_id,date' })

      if (upsertErr) throw upsertErr

      setLocked(true)
      showToast('Day locked ✓', 'success')
      onDayScoreUpdate?.(finalScore)

      setTimeout(() => setLocked(false), 3000)
    } catch {
      showToast("Couldn't save — please try again", 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <DailyInputsSkeleton />

  return (
    <div>
      {/* Summary bar */}
      <div className="ec di-summary-bar">
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>Today's summary</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        <div className="di-stat-row">
          <StatPill icon="ph-moon"       val={sleep ? `${sleep}h` : '—'}                     label="Sleep" />
          <div className="di-stat-div" />
          <StatPill icon="ph-sneaker"    val={steps ? Number(steps).toLocaleString() : '—'}   label="Steps" />
          <div className="di-stat-div" />
          <StatPill icon="ph-drop"       val={`${water}/8`}                                   label="Water" />
          <div className="di-stat-div" />
          <StatPill icon="ph-fork-knife" val={meals !== null ? meals : '—'}                   label="Meals" />
          <div className="di-stat-div" />
          <StatPill icon="ph-lightning"  val={exerciseMins ? `${exerciseMins}m` : '—'}        label="Active" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'right', marginBottom: 2 }}>
              {scoreLabel(liveScore)}
            </div>
            <DayScoreRing score={liveScore} size={52} strokeWidth={4} bgStroke="var(--border)" flashing={flashing} />
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="eg2">
        {/* Left column */}
        <div className="ecol">
          {/* BODY */}
          <div className="ec">
            <GroupHeader icon="ph-person" label="Body" color="var(--life-col)" />

            <div style={{ marginBottom: 12 }}>
              <div className="e-field-label">Water intake</div>
              <div className="e-water-row">
                {Array.from({ length: 8 }, (_, i) => (
                  <button
                    key={i}
                    className={`e-water-cup${i < water ? ' filled' : ''}`}
                    onClick={() => toggleWater(i)}
                    aria-label={`${i + 1} cup${i > 0 ? 's' : ''}`}
                  >
                    <i className={i < water ? 'ph-bold ph-drop' : 'ph-fill ph-drop'} style={i < water ? {} : { opacity: 0.25 }} />
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <div className="e-field-label">Sleep</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number"
                    className="e-input"
                    placeholder="7.5"
                    step="0.5"
                    min="0"
                    max="24"
                    value={sleep}
                    onChange={e => setSleep(e.target.value)}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>hrs</span>
                </div>
              </div>
              <div>
                <div className="e-field-label">Calories in</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number"
                    className="e-input"
                    placeholder="2100"
                    value={calories}
                    onChange={e => setCalories(e.target.value)}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>kcal</span>
                </div>
              </div>
            </div>

            <div>
              <div className="e-field-label">Meals today</div>
              <div className="e-meal-seg">
                {['1', '2', '3', '3+'].map(v => (
                  <button
                    key={v}
                    className={`e-meal-btn${meals === v ? ' active' : ''}`}
                    onClick={() => setMeals(meals === v ? null : v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FOCUS */}
          <div className="ec">
            <GroupHeader icon="ph-brain" label="Focus" color="var(--know-col)" />

            <div className="e-range-wrap">
              <div className="e-range-head">
                <span className="e-rl2">Productive hours</span>
                <span className="e-rv2">{productive}h — {productiveLabel(productive)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="1"
                value={productive}
                onChange={e => setProductive(Number(e.target.value))}
              />
            </div>

            <div className="e-range-wrap" style={{ marginBottom: 0 }}>
              <div className="e-range-head">
                <span className="e-rl2">Lazy hours</span>
                <span className="e-rv2">{lazy}h — {lazyLabel(lazy)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="1"
                value={lazy}
                onChange={e => setLazy(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="ecol">
          {/* ENERGY */}
          <div className="ec">
            <GroupHeader icon="ph-lightning" label="Energy" color="var(--fin-col)" />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Rest day</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Skip exercise metrics</div>
              </div>
              <label className="toggle-sw">
                <input
                  type="checkbox"
                  checked={isRestDay}
                  onChange={e => setIsRestDay(e.target.checked)}
                />
                <span className="toggle-slider" />
              </label>
            </div>

            <div style={{ opacity: isRestDay ? 0.35 : 1, pointerEvents: isRestDay ? 'none' : 'auto', transition: 'opacity 0.25s' }}>
              <div style={{ marginBottom: 12 }}>
                <div className="e-field-label">Exercise</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    className="e-input"
                    placeholder="e.g. Running, Yoga…"
                    style={{ flex: 1 }}
                    value={exerciseType}
                    onChange={e => setExerciseType(e.target.value)}
                  />
                  <input
                    type="number"
                    className="e-input"
                    placeholder="mins"
                    style={{ width: 60, fontVariantNumeric: 'tabular-nums' }}
                    value={exerciseMins}
                    onChange={e => setExerciseMins(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div className="e-field-label">Steps</div>
                  <input
                    type="number"
                    className="e-input"
                    placeholder="0"
                    value={steps}
                    onChange={e => setSteps(e.target.value)}
                    style={{ fontVariantNumeric: 'tabular-nums', width: '100%' }}
                  />
                </div>
                <div>
                  <div className="e-field-label">Cals burnt</div>
                  <input
                    type="number"
                    className="e-input"
                    placeholder="380"
                    value={calsBurnt}
                    onChange={e => setCalsBurnt(e.target.value)}
                    style={{ fontVariantNumeric: 'tabular-nums', width: '100%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* REFLECTION */}
          <div className="ec grow">
            <GroupHeader icon="ph-spiral" label="Reflection" color="var(--pink-col)" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 7, fontWeight: 600 }}>
                  Morning mood
                </div>
                <div className="e-emoji-row">
                  {EMOJIS.map((e, i) => (
                    <button
                      key={i}
                      className={`e-emoji-btn${moodMorning === i ? ' sel' : ''}`}
                      onClick={() => setMoodMorning(moodMorning === i ? null : i)}
                      aria-label={`Morning mood ${e}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 7, fontWeight: 600 }}>
                  Evening mood
                </div>
                <div className="e-emoji-row">
                  {EMOJIS.map((e, i) => (
                    <button
                      key={i}
                      className={`e-emoji-btn${moodEvening === i ? ' sel' : ''}`}
                      onClick={() => setMoodEvening(moodEvening === i ? null : i)}
                      aria-label={`Evening mood ${e}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div className="e-field-label">Notes</div>
              <textarea
                className="e-input"
                rows={3}
                placeholder="Anything to note today…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {locked ? (
              <div
                className="di-lock-confirm"
                style={{ animation: 'scale-in 0.35s var(--ease-spring) both' }}
              >
                <i className="ph-bold ph-check-circle" style={{ fontSize: 16 }} />
                Day recorded ✓
                {streak > 0 && (
                  <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-3)' }}>
                    {streak}-day streak
                  </span>
                )}
              </div>
            ) : (
              <button
                className="e-btn-g di-lock-btn"
                onClick={handleLock}
                disabled={saving}
                style={{ opacity: saving ? 0.6 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
              >
                {saving ? (
                  <>
                    <i className="ph-bold ph-circle-notch" style={{ animation: 'spin 0.8s linear infinite' }} />
                    Saving…
                  </>
                ) : (
                  <>
                    <i className="ph-bold ph-lock-key" />
                    Lock today's progress
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DailyInputsSkeleton() {
  return (
    <div>
      <div className="ec di-summary-bar" style={{ marginBottom: 14 }}>
        <div className="shimmer" style={{ width: 140, height: 36, borderRadius: 8 }} />
        <div style={{ display: 'flex', gap: 16 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="shimmer" style={{ width: 40, height: 36, borderRadius: 8 }} />
          ))}
        </div>
        <div className="shimmer" style={{ width: 52, height: 52, borderRadius: '50%' }} />
      </div>
      <div className="eg2">
        {[0, 1].map(col => (
          <div className="ecol" key={col}>
            <div className="ec">
              <div className="shimmer" style={{ height: 120, borderRadius: 10 }} />
            </div>
            <div className="ec">
              <div className="shimmer" style={{ height: 80, borderRadius: 10 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GroupHeader({ icon, label, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14, paddingBottom: 10, borderBottom: '0.5px solid var(--sub-divider)' }}>
      <i className={`ph-bold ${icon}`} style={{ fontSize: 15, color }} />
      <span style={{ fontSize: 11, fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '.09em' }}>{label}</span>
    </div>
  )
}

function StatPill({ icon, val, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{val}</div>
      <div style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginTop: 3, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
        <i className={`ph-bold ${icon}`} style={{ fontSize: 9 }} />
        {label}
      </div>
    </div>
  )
}
