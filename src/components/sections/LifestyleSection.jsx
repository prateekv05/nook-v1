'use client'

import { useState } from 'react'

const INITIAL_ITEMS = [
  { id: 1, text: 'Morning walk',        cat: 'home',   done: true  },
  { id: 2, text: 'Read for 20 minutes', cat: 'home',   done: false },
  { id: 3, text: 'Review weekly goals', cat: 'office', done: false },
  { id: 4, text: 'Call mum',            cat: 'home',   done: false },
  { id: 5, text: 'Meditation — 10 min', cat: 'home',   done: false },
]

const CAT_STYLE = {
  home:   { bg: 'var(--life-bg)',  bdr: 'var(--life-bdr)',  col: 'var(--life-col)',  icon: 'ph-house',     label: 'Home'   },
  office: { bg: 'var(--know-bg)', bdr: 'var(--know-bdr)', col: 'var(--know-col)', icon: 'ph-briefcase', label: 'Office' },
  trip:   { bg: 'var(--fin-bg)',  bdr: 'var(--fin-bdr)',  col: 'var(--fin-col)',  icon: 'ph-airplane',  label: 'Trip'   },
}

const GRAT_HISTORY = [
  { date: 'Sunday, 20 April',   items: ['A quiet morning with good coffee', 'Making progress on a hard project', 'A long call with an old friend'] },
  { date: 'Saturday, 19 April', items: ['The walk in the park after lunch', 'Getting 8 hours of sleep', 'My health and energy today'] },
  { date: 'Friday, 18 April',   items: ['Finishing the week on a high', 'My team\'s support at work', 'Having dinner with family'] },
]

const EMOJIS = ['😌', '🙂', '😐', '😕', '😤']
const METHOD_DAYS = 7
const METHOD_DONE = 3

export default function LifestyleSection({ onBack }) {
  // Checklist
  const [items, setItems]         = useState(INITIAL_ITEMS)
  const [clFilter, setClFilter]   = useState('all')
  const [newTask, setNewTask]     = useState('')

  // Journal
  const [journal, setJournal]     = useState('')
  const [submitted, setSubmitted] = useState(false)

  // Gratitude
  const [grat, setGrat]           = useState(['', '', ''])
  const [gratSaved, setGratSaved] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  // Stress
  const [morningStress, setMorningStress] = useState(1)
  const [eveningStress, setEveningStress] = useState(null)

  // Method
  const [doneDays, setDoneDays]   = useState(METHOD_DONE)
  const [stars, setStars]         = useState(3)
  const [reflection, setReflection] = useState('')

  // Checklist helpers
  function toggle(id) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i))
  }

  function addTask() {
    const text = newTask.trim()
    if (!text) return
    setItems(prev => [...prev, { id: Date.now(), text, cat: 'home', done: false }])
    setNewTask('')
  }

  const filtered = items.filter(i => {
    if (clFilter === 'active') return !i.done
    if (clFilter === 'done')   return i.done
    return true
  })

  const doneCount = items.filter(i => i.done).length

  // Gratitude update
  function setGratItem(idx, val) {
    setGrat(prev => prev.map((v, i) => i === idx ? val : v))
    setGratSaved(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Topbar */}
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

      {/* Content */}
      <div className="exp-content" style={{ overflow: 'auto' }}>
        <div className="eg2" style={{ gridTemplateColumns: '1.2fr 1fr' }}>

          {/* ── LEFT COLUMN ── */}
          <div className="ecol">

            {/* Checklist */}
            <div className="ec">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div className="e-label life" style={{ marginBottom: 0 }}>Daily checklist</div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--know-col)', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <i className="ph-bold ph-calendar" /> History
                </button>
              </div>

              {/* Filter tabs */}
              <div style={{ display: 'flex', gap: 5, marginBottom: 10, flexWrap: 'wrap' }}>
                {[['all', 'ph-list', 'All'], ['active', 'ph-circle', 'Active'], ['done', 'ph-check-circle', 'Done']].map(([f, icon, label]) => (
                  <button
                    key={f}
                    className={`cl-filter-btn${clFilter === f ? ' active' : ''}`}
                    style={clFilter === f ? { background: 'var(--life-col)', borderColor: 'var(--life-col)', color: '#fff' } : {}}
                    onClick={() => setClFilter(f)}
                  >
                    <i className={`ph-bold ${icon}`} /> {label}
                  </button>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)', alignSelf: 'center' }}>
                  {doneCount}/{items.length}
                </span>
              </div>

              {/* Items */}
              {filtered.map(item => {
                const cs = CAT_STYLE[item.cat] || CAT_STYLE.home
                return (
                  <div key={item.id} className="e-check" onClick={() => toggle(item.id)}>
                    <div className={`e-cb${item.done ? ' done' : ''}`}>
                      <svg viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2.5" /></svg>
                    </div>
                    <span className={`e-ct${item.done ? ' done' : ''}`} style={{ flex: 1 }}>{item.text}</span>
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 6, background: cs.bg, border: `0.5px solid ${cs.bdr}`, color: cs.col, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <i className={`ph-bold ${cs.icon}`} /> {cs.label}
                    </span>
                  </div>
                )
              })}

              {/* Add task */}
              <div className="e-add" style={{ marginTop: 10 }}>
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
            </div>

            {/* Journal */}
            <div className="ec">
              <div className="e-label life">Journal</div>
              {submitted ? (
                <>
                  <div className="journal-submitted" style={{ display: 'block' }}>{journal}</div>
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
                  <div style={{ fontSize: 11, color: 'var(--text-3)', margin: '10px 0 6px' }}>AI prompt for today</div>
                  <div style={{ background: 'var(--life-bg)', border: '0.5px solid var(--life-bdr)', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: 'var(--life-col)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 10 }}>
                    &ldquo;Describe a moment this week where you surprised yourself. What did it reveal about who you&rsquo;re becoming?&rdquo;
                  </div>
                  <div className="journal-btn-row">
                    <button className="e-btn-g" onClick={() => journal.trim() && setSubmitted(true)}>Submit</button>
                  </div>
                </>
              )}
            </div>

            {/* Gratitude log */}
            <div className="ec grow">
              <div className="e-label life">Gratitude log</div>
              {grat.map((v, i) => (
                <input
                  key={i}
                  className="e-input"
                  placeholder="I'm grateful for..."
                  style={{ marginBottom: 8 }}
                  value={v}
                  onChange={e => setGratItem(i, e.target.value)}
                />
              ))}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="e-btn-g" onClick={() => setGratSaved(true)}>
                  {gratSaved ? 'Saved ✓' : 'Save'}
                </button>
                <button className="e-btn-outline" onClick={() => setShowHistory(h => !h)}>
                  {showHistory ? 'Hide history' : 'View history'}
                </button>
              </div>
              {showHistory && (
                <div className="grat-history" style={{ display: 'block' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8 }}>Last 14 days</div>
                  {GRAT_HISTORY.map(day => (
                    <div key={day.date} className="grat-day">
                      <div className="grat-date">{day.date}</div>
                      {day.items.map(item => <div key={item} className="grat-item">{item}</div>)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="ecol">

            {/* Stress check-in */}
            <div className="ec">
              <div className="e-label life">Stress check-in</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 12 }}>How are you feeling right now?</div>

              {[['Morning', morningStress, setMorningStress], ['Evening', eveningStress, setEveningStress]].map(([label, val, setter]) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>{label}</div>
                  <div className="stress-row" style={{ justifyContent: 'flex-start', gap: 8 }}>
                    {EMOJIS.map((emoji, i) => (
                      <button
                        key={i}
                        className={`s-emoji-btn${val === i ? ' sel' : ''}`}
                        onClick={() => setter(i)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Check in whenever — morning, midday or evening.</div>
            </div>

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

              {/* Feedback */}
              <div className="method-feedback">
                <div className="method-feedback-title">How&rsquo;s it going?</div>
                <div className="star-row">
                  {[1, 2, 3, 4, 5].map(n => (
                    <span
                      key={n}
                      className={`star-btn${n <= stars ? ' active' : ''}`}
                      onClick={() => setStars(n)}
                    >★</span>
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
          </div>
        </div>

        {/* Positivity strip */}
        <div className="positivity-strip" style={{ marginTop: 12 }}>
          <div className="positivity-inner">
            <i className="ph-bold ph-sparkle positivity-icon" />
            <div>
              <div className="positivity-label">Positivity booster</div>
              <div className="positivity-text">
                &ldquo;Alex, you completed 5 of 7 goals last week. Your consistency is quietly building something real — progress compounds just like interest.&rdquo;
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
