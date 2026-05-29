# Habit Tracker — Design Spec
_Date: 2026-05-29_

## Summary

Add a Habit Tracker as a new top-level section in Nook. Users create up to 10 yes/no daily habits, track their completion on a weekly grid, and build streaks. Habits can optionally contribute to the Day Score.

---

## Decisions Made During Brainstorming

| Question | Decision |
|---|---|
| Habit type | Yes/No only (no quantitative tracking) |
| Motivation hook | Streaks + weekly completion grid |
| Habit cap | 10 per user |
| Day Score integration | Optional per habit (user toggle) |
| Visual grouping | Color tags (8 preset swatches) |
| Architecture | New section + new DB tables (Approach B) |
| Layout | Dark summary header + compact grid |

---

## Section 1 — Routing & Navigation

Add to `NAV_ITEMS` in `src/components/layout/Sidebar.jsx`:
```js
{ id: "habits", label: "Habit Tracker", icon: "ph-checks", view: "expanded", section: "habits" }
```

Add to `SECTION_MAP` in `src/app/(app)/dashboard/page.jsx`:
```js
habits: HabitTrackerSection
```

New component: `src/components/sections/HabitTrackerSection.jsx`

---

## Section 2 — Database Schema

### Table: `habits`
| column | type | notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid FK | → auth.users, RLS: user_id = auth.uid() |
| name | text NOT NULL | |
| color | text NOT NULL | hex string e.g. `#C2623F` |
| contributes_to_score | boolean | default false |
| position | int | for ordering |
| is_active | boolean | default true (soft delete) |
| created_at | timestamptz | default now() |

### Table: `habit_completions`
| column | type | notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid FK | RLS: user_id = auth.uid() |
| habit_id | uuid FK | → habits.id ON DELETE CASCADE |
| date | date NOT NULL | |
| UNIQUE | (habit_id, date) | prevents double-marking |

### RLS Policies
Both tables: `user_id = auth.uid()` for all operations.

### Notes
- Streak is computed on read (walk backwards from today through consecutive completion rows) — not stored
- No trigger needed; completions are managed directly via API

---

## Section 3 — Component Structure

### `src/components/sections/HabitTrackerSection.jsx`
Top-level section component. Owns state: habits list, completions, loading, modal open/closed.

**Sub-components (inline or split as needed):**

**`HabitSummaryHeader`**
- Dark card (`var(--gb-bg)` background)
- Today's date, `X / Y habits` completion count, motivational sub-text
- Progress ring (same canvas/SVG approach as DayScoreRing) — ring color follows Day Score color scale (≥80% green, 60–79% amber, <60% red)

**`HabitGrid`**
- Day-label header row: Mon–Sun for current week
- One row per active habit: color dot + name | 7 day cells | streak column
- Today's cell: dashed border, clickable to toggle
- Past cells: read-only (filled or empty, no interaction)
- Future cells: dimmed, non-interactive
- Optimistic UI on toggle: flip cell state immediately, persist async, revert + toast on error

**`AddHabitModal`**
- Reuses `src/components/ui/Modal.jsx`
- Fields: name (text input), color (8 preset swatches), "Contribute to Day Score" toggle
- Validation: name required, max 10 habits enforced (button disabled + toast if at limit)
- Save → POST /api/habits → refetch habits

**Habit row actions**
- Desktop: hover on row reveals delete icon (right side)
- Mobile: long-press reveals delete button
- Delete → PATCH is_active=false → remove from local state optimistically

### `src/app/api/habits/route.js`
| Method | Action |
|---|---|
| GET | Fetch active habits + current week completions, compute streaks, return merged |
| POST | Create new habit (enforce 10-habit cap server-side) |
| PATCH | Toggle completion: upsert or delete habit_completions row for given habit_id + date |
| DELETE | Soft-delete habit: set is_active = false |

---

## Section 4 — Data Flow & Interactions

**On load**
`HabitTrackerSection` mounts → `GET /api/habits` → returns `{ habits: [...], completions: {...}, streaks: {...} }` → render grid.

**Toggling today**
1. User clicks today cell
2. Optimistic UI: flip cell immediately
3. `PATCH /api/habits` with `{ habit_id, date, done: true/false }`
4. On error: revert cell state + show error toast

**Streak computation (server-side)**
For each habit, walk backwards from today through `habit_completions` rows. Count consecutive days. Return integer. Recomputed on every GET.

**Summary header**
Derived client-side from fetched data: `doneTodayCount = completions where date = today`. No extra fetch.

**Day Score integration**
`/api/analytics/route.js` extended:
- Query `habits` where `contributes_to_score = true` for the user
- Query `habit_completions` for those habits on the requested date
- Compute `habitScore = completedOptedIn / totalOptedIn` (0 if no opted-in habits)
- Blend into day score: existing weights scaled down proportionally to make room for habits at 15% weight when ≥1 habit opted in; 0% weight when none opted in

**Adding a habit**
Modal save → POST → re-fetch habits list → close modal → grid re-renders.

**Deleting a habit**
Optimistic remove from local list → PATCH is_active=false → on error revert + toast.

---

## Color Presets (8 swatches)

```js
const HABIT_COLORS = [
  '#C2623F', // accent/calm
  '#3D6BE8', // blue
  '#2D6A4F', // green
  '#A05C20', // amber
  '#7C3AED', // purple
  '#1D6FA8', // teal
  '#B91C1C', // red
  '#5A6070', // slate
]
```

---

## Files Changed / Created

| File | Change |
|---|---|
| `src/components/layout/Sidebar.jsx` | Add habits nav item to NAV_ITEMS |
| `src/app/(app)/dashboard/page.jsx` | Add habits to SECTION_MAP, import HabitTrackerSection |
| `src/components/sections/HabitTrackerSection.jsx` | **New** — full habit tracker view |
| `src/app/api/habits/route.js` | **New** — GET / POST / PATCH / DELETE |
| `src/app/api/analytics/route.js` | Extend to include opted-in habits in day score |
| Supabase | Add `habits` and `habit_completions` tables with RLS |

---

## Quality Rules Applied

- Every toggle: optimistic UI + revert on error
- Every fetch: skeleton loading state
- Empty state: "No habits yet — add your first one" with add button
- All tap targets: minimum 44×44px
- No hardcoded colors — color swatches stored as values, applied via inline style only on dynamic color elements
- `font-variant-numeric: tabular-nums` on streak counts and progress numbers
