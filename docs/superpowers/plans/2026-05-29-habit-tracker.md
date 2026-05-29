# Habit Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Habit Tracker section to Nook — a new sidebar nav item with a dark summary header, weekly completion grid, streaks, and an add-habit modal backed by two new Supabase tables.

**Architecture:** New `habits` + `habit_completions` Supabase tables. New `/api/habits` route (GET/POST/PATCH/DELETE). New `HabitTrackerSection` component wired into the existing view-router pattern (`SECTION_MAP` in dashboard). Optimistic UI on toggle.

**Tech Stack:** Next.js 14 App Router, Supabase (PostgreSQL + RLS), vanilla CSS in globals.css, Phosphor Icons, existing `Modal`/`Skeleton`/`useToast` primitives.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `src/components/sections/HabitTrackerSection.jsx` | Full habit tracker view — summary header, grid, modal |
| Create | `src/app/api/habits/route.js` | GET / POST / PATCH / DELETE for habits |
| Modify | `src/components/layout/Sidebar.jsx` | Add habits nav item |
| Modify | `src/app/(app)/dashboard/page.jsx` | Add habits to SECTION_MAP |
| Modify | `src/app/globals.css` | Habit tracker CSS (append to end) |
| Modify | `src/lib/day-score.js` | Accept optional habit params |

---

## Task 1: Create Supabase Tables

**Files:** Supabase SQL editor (no project files changed)

- [ ] **Step 1: Run this SQL in the Supabase dashboard SQL editor**

```sql
-- habits table
create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null default '#C2623F',
  contributes_to_score boolean not null default false,
  position int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- habit_completions table
create table if not exists habit_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  habit_id uuid references habits(id) on delete cascade not null,
  date date not null,
  constraint habit_completions_habit_id_date_key unique (habit_id, date)
);

-- RLS on habits
alter table habits enable row level security;
create policy "habits: user owns" on habits
  for all using (user_id = auth.uid());

-- RLS on habit_completions
alter table habit_completions enable row level security;
create policy "habit_completions: user owns" on habit_completions
  for all using (user_id = auth.uid());
```

- [ ] **Step 2: Verify tables exist**

In Supabase dashboard → Table Editor, confirm `habits` and `habit_completions` both appear.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: add habits and habit_completions tables (SQL run in Supabase)"
```

---

## Task 2: API Route — GET

**Files:**
- Create: `src/app/api/habits/route.js`

- [ ] **Step 1: Create the file with GET handler**

```js
import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

function getMondayOfCurrentWeek() {
  const today = new Date()
  const day = today.getDay() // 0=Sun
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(today)
  monday.setDate(today.getDate() + diff)
  return monday
}

function computeStreak(allCompletions, habitId) {
  const dates = allCompletions
    .filter(c => c.habit_id === habitId)
    .map(c => c.date)
    .sort()
    .reverse()

  if (!dates.length) return 0

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  let cursor = dates[0] === today ? today : dates[0] === yesterday ? yesterday : null
  if (!cursor) return 0

  let streak = 0
  const dateSet = new Set(dates)
  while (dateSet.has(cursor)) {
    streak++
    const d = new Date(cursor)
    d.setDate(d.getDate() - 1)
    cursor = d.toISOString().slice(0, 10)
  }
  return streak
}

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const monday = getMondayOfCurrentWeek()
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const weekStart = monday.toISOString().slice(0, 10)
  const weekEnd = sunday.toISOString().slice(0, 10)

  const { data: habits, error: habitsError } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('is_active', true)
    .order('position', { ascending: true })

  if (habitsError) return NextResponse.json({ error: habitsError.message }, { status: 500 })
  if (!habits.length) return NextResponse.json({ habits: [], completions: {}, streaks: {}, weekStart, weekEnd })

  const habitIds = habits.map(h => h.id)

  const { data: weekCompletions, error: wcError } = await supabase
    .from('habit_completions')
    .select('habit_id, date')
    .eq('user_id', session.user.id)
    .in('habit_id', habitIds)
    .gte('date', weekStart)
    .lte('date', weekEnd)

  if (wcError) return NextResponse.json({ error: wcError.message }, { status: 500 })

  const streakCutoff = new Date()
  streakCutoff.setDate(streakCutoff.getDate() - 365)
  const { data: allCompletions } = await supabase
    .from('habit_completions')
    .select('habit_id, date')
    .eq('user_id', session.user.id)
    .in('habit_id', habitIds)
    .gte('date', streakCutoff.toISOString().slice(0, 10))

  // Build completions map: { habitId: ['YYYY-MM-DD', ...] } for the week only
  const completions = {}
  for (const c of (weekCompletions || [])) {
    if (!completions[c.habit_id]) completions[c.habit_id] = []
    completions[c.habit_id].push(c.date)
  }

  const streaks = {}
  for (const h of habits) {
    streaks[h.id] = computeStreak(allCompletions || [], h.id)
  }

  return NextResponse.json({ habits, completions, streaks, weekStart, weekEnd })
}
```

- [ ] **Step 2: Verify the route responds**

Start the dev server (`npm run dev`) and visit `http://localhost:3000/api/habits` while logged in. Expected: `{ habits: [], completions: {}, streaks: {}, weekStart: "...", weekEnd: "..." }`.

---

## Task 3: API Route — POST / PATCH / DELETE

**Files:**
- Modify: `src/app/api/habits/route.js` (append below GET)

- [ ] **Step 1: Append POST, PATCH, DELETE handlers to the same file**

```js
export async function POST(request) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, color, contributes_to_score } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const { count } = await supabase
    .from('habits')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', session.user.id)
    .eq('is_active', true)

  if (count >= 10) return NextResponse.json({ error: 'Maximum 10 habits reached' }, { status: 400 })

  const { data: existing } = await supabase
    .from('habits')
    .select('position')
    .eq('user_id', session.user.id)
    .eq('is_active', true)
    .order('position', { ascending: false })
    .limit(1)

  const position = existing?.length ? existing[0].position + 1 : 0

  const { data, error } = await supabase
    .from('habits')
    .insert({ user_id: session.user.id, name: name.trim(), color: color || '#C2623F', contributes_to_score: !!contributes_to_score, position })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ habit: data })
}

export async function PATCH(request) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { habit_id, date, done } = await request.json()
  if (!habit_id || !date) return NextResponse.json({ error: 'habit_id and date required' }, { status: 400 })

  const today = new Date().toISOString().slice(0, 10)
  if (date !== today) return NextResponse.json({ error: 'Can only toggle today' }, { status: 400 })

  if (done) {
    const { error } = await supabase
      .from('habit_completions')
      .upsert({ user_id: session.user.id, habit_id, date }, { onConflict: 'habit_id,date' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await supabase
      .from('habit_completions')
      .delete()
      .eq('user_id', session.user.id)
      .eq('habit_id', habit_id)
      .eq('date', date)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(request) {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { habit_id } = await request.json()
  if (!habit_id) return NextResponse.json({ error: 'habit_id required' }, { status: 400 })

  const { error } = await supabase
    .from('habits')
    .update({ is_active: false })
    .eq('id', habit_id)
    .eq('user_id', session.user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/habits/route.js
git commit -m "feat: add /api/habits route (GET/POST/PATCH/DELETE)"
```

---

## Task 4: Wire Sidebar + Dashboard Routing

**Files:**
- Modify: `src/components/layout/Sidebar.jsx:7-13`
- Modify: `src/app/(app)/dashboard/page.jsx:1-20`

- [ ] **Step 1: Add nav item to Sidebar.jsx**

In `src/components/layout/Sidebar.jsx`, add to the `NAV_ITEMS` array after the `tracking` entry:

```js
{ id: "habits", label: "Habit Tracker", icon: "ph-checks", view: "expanded", section: "habits" },
```

The full array becomes:
```js
const NAV_ITEMS = [
  { id: "home",      label: "Dashboard",     icon: "ph-house",          view: "home" },
  { id: "financial", label: "Financial",      icon: "ph-currency-dollar", view: "expanded", section: "financial" },
  { id: "knowledge", label: "Knowledge",      icon: "ph-book-open",       view: "expanded", section: "knowledge" },
  { id: "lifestyle", label: "Lifestyle",      icon: "ph-heart",           view: "expanded", section: "lifestyle" },
  { id: "tracking",  label: "Tracking",       icon: "ph-chart-line-up",   view: "expanded", section: "tracking" },
  { id: "habits",    label: "Habit Tracker",  icon: "ph-checks",          view: "expanded", section: "habits" },
];
```

- [ ] **Step 2: Wire SECTION_MAP in dashboard/page.jsx**

Add the import at the top of `src/app/(app)/dashboard/page.jsx` alongside the other section imports:

```js
import HabitTrackerSection from "../../../components/sections/HabitTrackerSection";
```

Add to `SECTION_MAP`:

```js
const SECTION_MAP = {
  financial: FinanceSection,
  knowledge: KnowledgeSection,
  lifestyle: LifestyleSection,
  tracking:  TrackingSection,
  habits:    HabitTrackerSection,
};
```

- [ ] **Step 3: Verify in browser**

`npm run dev`, open the dashboard. "Habit Tracker" should appear in the sidebar. Clicking it should render a blank page (the component doesn't exist yet — Next.js will error). That's expected.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Sidebar.jsx src/app/(app)/dashboard/page.jsx
git commit -m "feat: wire Habit Tracker nav item and SECTION_MAP entry"
```

---

## Task 5: CSS Styles

**Files:**
- Modify: `src/app/globals.css` (append at end)

- [ ] **Step 1: Append these styles to the end of globals.css**

```css
/* ============================================
   HABIT TRACKER
   ============================================ */

.habit-section {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.habit-summary {
  background: var(--gb-bg);
  border-radius: 16px;
  padding: 18px 20px;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.habit-summary-date {
  font-size: 11px;
  color: var(--gb-sub);
  margin-bottom: 4px;
  letter-spacing: 0.6px;
  font-weight: 600;
}

.habit-summary-count {
  font-size: 26px;
  font-weight: 700;
  color: var(--gb-stat);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.habit-summary-total {
  font-size: 15px;
  font-weight: 400;
  color: var(--gb-sub);
}

.habit-summary-sub {
  font-size: 12px;
  color: var(--gb-sub);
  opacity: 0.6;
  margin-top: 4px;
}

.habit-ring {
  position: relative;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
}

.habit-ring-pct {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.habit-grid-wrap {
  background: var(--card-bg);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--card-sh);
  margin-bottom: 12px;
}

.habit-grid-header {
  display: grid;
  grid-template-columns: 160px repeat(7, 1fr) 52px;
  gap: 0;
  padding: 10px 14px 6px;
  border-bottom: 1px solid var(--sub-divider);
}

.habit-grid-col-label {
  font-size: 10px;
  color: var(--text-3);
  text-align: center;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.habit-grid-col-label.today-label {
  color: var(--accent);
}

.habit-row {
  display: grid;
  grid-template-columns: 160px repeat(7, 1fr) 52px;
  gap: 0;
  padding: 9px 14px;
  border-bottom: 1px solid var(--sub-divider);
  align-items: center;
  position: relative;
}

.habit-row:last-child {
  border-bottom: none;
}

.habit-row:hover .habit-delete-btn {
  opacity: 1;
}

.habit-name {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.habit-color-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.habit-name-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.habit-cell-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
}

.habit-cell {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  background: var(--input-bg);
  transition: all 0.2s var(--ease-spring);
}

.habit-cell.future {
  opacity: 0.3;
}

.habit-cell.today {
  cursor: pointer;
  border: 2px dashed;
  background: transparent;
}

.habit-cell.today.done {
  border: none;
  cursor: pointer;
}

.habit-cell.today:not(.future):hover {
  transform: scale(1.15);
}

.habit-cell.today:not(.future):active {
  transform: scale(0.95);
}

.habit-streak {
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.habit-delete-btn {
  position: absolute;
  right: 58px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: var(--error-bg);
  border: 1px solid var(--error-bdr);
  color: var(--error-col);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  min-width: 28px;
  min-height: 28px;
}

.habit-delete-btn:hover {
  background: rgba(239, 68, 68, 0.15);
}

.habit-add-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.habit-add-btn {
  background: var(--accent-bg);
  border: 1.5px dashed var(--accent-bdr);
  color: var(--accent);
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s var(--ease-spring);
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
}

.habit-add-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.habit-add-btn:active:not(:disabled) {
  transform: scale(0.97);
}

.habit-add-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.habit-empty {
  text-align: center;
  padding: 48px 24px;
}

.habit-empty-icon {
  font-size: 32px;
  color: var(--text-3);
  margin-bottom: 12px;
}

.habit-empty-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-2);
  margin-bottom: 6px;
}

.habit-empty-sub {
  font-size: 13px;
  color: var(--text-3);
  margin-bottom: 20px;
}

/* AddHabitModal */
.add-habit-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: 16px;
}

.add-habit-modal {
  background: var(--card-bg);
  border-radius: 24px;
  padding: 28px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
}

.add-habit-modal-title {
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: 500;
  color: var(--text-1);
  margin-bottom: 20px;
}

.add-habit-field {
  margin-bottom: 16px;
}

.add-habit-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-3);
  margin-bottom: 6px;
  letter-spacing: 0.5px;
}

.add-habit-input {
  width: 100%;
  padding: 10px 14px;
  background: var(--input-bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  font-size: 14px;
  color: var(--text-1);
  font-family: var(--font-sans);
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.add-habit-input:focus {
  outline: none;
  border-color: var(--accent);
}

.habit-color-swatches {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.habit-color-swatch {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s var(--ease-spring);
  border: 3px solid transparent;
  box-sizing: border-box;
  min-width: 32px;
  min-height: 32px;
}

.habit-color-swatch:hover {
  transform: scale(1.1);
}

.habit-color-swatch:active {
  transform: scale(0.95);
}

.habit-color-swatch.selected {
  border-color: var(--text-1);
  transform: scale(1.12);
}

.add-habit-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: var(--input-bg);
  border-radius: 10px;
  margin-bottom: 20px;
  gap: 12px;
}

.add-habit-toggle-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-1);
}

.add-habit-toggle-sub {
  font-size: 11px;
  color: var(--text-3);
  margin-top: 2px;
}

.add-habit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.add-habit-cancel {
  padding: 10px 18px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-2);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;
}

.add-habit-cancel:hover {
  background: var(--input-bg);
}

.add-habit-save {
  padding: 10px 18px;
  border-radius: 10px;
  background: var(--accent);
  border: none;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s var(--ease-spring);
  min-height: 44px;
}

.add-habit-save:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.add-habit-save:active:not(:disabled) {
  transform: scale(0.97);
}

.add-habit-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .habit-grid-header,
  .habit-row {
    grid-template-columns: 120px repeat(7, 1fr) 44px;
  }

  .habit-cell {
    width: 18px;
    height: 18px;
  }

  .habit-summary-count {
    font-size: 22px;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add habit tracker CSS"
```

---

## Task 6: HabitTrackerSection Component

**Files:**
- Create: `src/components/sections/HabitTrackerSection.jsx`

- [ ] **Step 1: Create the component**

```jsx
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
        <button
          className={`toggle-btn${contributesToScore ? ' on' : ''}`}
          onClick={() => setContributesToScore(p => !p)}
          aria-pressed={contributesToScore}
          aria-label="Toggle contribute to Day Score"
        />
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
```

- [ ] **Step 2: Verify in browser**

Open Habit Tracker from sidebar. Expected:
- Dark summary header shows "0 / 0 habits" with 0% ring
- Empty state shows "No habits yet" with Add habit button
- Click Add habit → modal opens with name input, 8 color swatches, Day Score toggle
- Add a habit → it appears in the grid
- Today's cell has dashed border — click it to fill with color
- Hover a habit row → delete icon appears on the right
- Streak column shows fire icon + count when > 0

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/HabitTrackerSection.jsx
git commit -m "feat: add HabitTrackerSection with grid, toggle, modal, and delete"
```

---

## Task 7: Day Score Integration (Optional — only if user has opted-in habits)

**Files:**
- Modify: `src/lib/day-score.js`
- Modify: `src/app/api/habits/route.js` (PATCH handler)

- [ ] **Step 1: Update calculateDayScore to accept habit params**

Replace the contents of `src/lib/day-score.js` with:

```js
export function calculateDayScore(tracking, checklistTotal, checklistDone, habitTotal = 0, habitDone = 0) {
  const sleep     = Math.min((tracking.sleep || 0) / 8, 1.0)
  const water     = Math.min((tracking.water || 0) / 8, 1.0)
  const steps     = Math.min((tracking.steps || 0) / 10000, 1.0)
  const checklist = checklistTotal > 0 ? checklistDone / checklistTotal : 0
  const mood      = ((tracking.mood_morning || 3) + (tracking.mood_evening || 3)) / 10
  const habits    = habitTotal > 0 ? habitDone / habitTotal : 0

  if (habitTotal > 0) {
    // Scale existing weights by 0.85 to make room for habits at 15%
    return Math.round(
      (sleep * 0.2125 + water * 0.17 + steps * 0.1275 + checklist * 0.17 + mood * 0.17 + habits * 0.15) * 100
    )
  }

  return Math.round((sleep * 0.25 + water * 0.20 + steps * 0.15 + checklist * 0.20 + mood * 0.20) * 100)
}
```

- [ ] **Step 2: Update PATCH in /api/habits/route.js to recompute day_score**

Find the `export async function PATCH` in `src/app/api/habits/route.js`. After the completion upsert/delete succeeds, add this block before the final `return NextResponse.json({ ok: true })`:

```js
  // Recompute day_score for today if any habit contributes_to_score
  try {
    const { data: optedIn } = await supabase
      .from('habits')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .eq('contributes_to_score', true)

    if (optedIn?.length) {
      const { calculateDayScore } = await import('@/lib/day-score')

      const { data: tracking } = await supabase
        .from('daily_tracking')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('date', today)
        .single()

      if (tracking) {
        const optedInIds = optedIn.map(h => h.id)
        const { count: doneCount } = await supabase
          .from('habit_completions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .in('habit_id', optedInIds)
          .eq('date', today)

        const { count: checklistTotal } = await supabase
          .from('checklist_items')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .eq('is_active', true)

        const { count: checklistDone } = await supabase
          .from('checklist_items')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .eq('is_done', true)

        const newScore = calculateDayScore(
          tracking,
          checklistTotal || 0,
          checklistDone || 0,
          optedIn.length,
          doneCount || 0
        )

        await supabase
          .from('daily_tracking')
          .update({ day_score: newScore })
          .eq('user_id', session.user.id)
          .eq('date', today)
      }
    }
  } catch {
    // Non-critical: day score update failure doesn't break habit toggle
  }
```

- [ ] **Step 3: Verify in browser**

1. Add a habit, check "Contribute to Day Score"
2. Navigate to Tracking → observe current day score
3. Toggle the habit as done
4. Navigate back to Tracking → day score should have changed

- [ ] **Step 4: Commit**

```bash
git add src/lib/day-score.js src/app/api/habits/route.js
git commit -m "feat: integrate opted-in habits into Day Score calculation"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** Nav item ✓, dark summary header ✓, compact grid ✓, today toggle ✓, streak ✓, color tags ✓, 10-habit cap ✓, add modal ✓, delete ✓, Day Score integration ✓, skeleton loading ✓, empty state ✓, error toasts ✓, optimistic UI ✓
- [x] **No placeholders:** All steps have complete code
- [x] **Type consistency:** `habit_id` / `date` / `done` used consistently across PATCH call in component and handler. `completions` map shape `{ [habitId]: string[] }` consistent throughout. `streaks` map shape `{ [habitId]: number }` consistent throughout.
- [x] **Toggle-btn class:** `toggle-btn` and `toggle-btn.on` are used in AddHabitModal — these classes already exist in globals.css (used by DailyInputs and Settings). No new CSS needed for them.
