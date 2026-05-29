# Design Spec: Income History + Goal Celebration + Blog Page
**Date:** 2026-05-29  
**Status:** Approved

---

## Overview

Three connected features:
1. Show income log history inline in the Income Goal Tracker card
2. Celebrate when the user hits their income goal (toast + banner + confetti)
3. New `/blog` page with category sidebar, reachable via "Know more" buttons on AI content cards

---

## 1. Income History (Inline)

### Location
Below the Log button row inside the Income Goal Tracker card in `FinanceSection.jsx`.

### Data Source
Extend `loadIncomeTotal()` to fetch full rows (`amount`, `source`, `date`, `created_at`) from `income_entries` in addition to the sum. Same date range filter (current month or year depending on goal period). Store in `incomeEntries` state array.

### UI
- Scrollable list, max ~8 entries visible (`overflow-y: auto`, `max-height: ~220px`)
- Most recent first (`order('created_at', { ascending: false })`)
- Each row: green `+$500`, source label (or "—" if null), date (e.g. "May 28")
- Empty state: `ph-coins` icon + "No income logged yet this period."
- Skeleton: 3 placeholder rows while loading
- No delete action (out of scope for now)

### State
```js
const [incomeEntries, setIncomeEntries] = useState([])
```

---

## 2. Goal Reached Celebration

### Trigger
After `logIncome()` resolves successfully, check if the new total crossed 100%:
```js
const wasBelow = prevTotal < incomeGoal.amount
const nowAt    = newTotal >= incomeGoal.amount
if (wasBelow && nowAt) fireCelebration()
```
Track `prevTotal` before the optimistic update.

### Effects

**Toast**
```js
toast.success(`Goal reached! You crushed your ${monthLabel} goal!`)
```

**Banner**
- Replaces the status message `<div>` when `pct >= 100`
- Green panel: `ph-trophy` icon + "You crushed your [Month/Year] goal!" text
- Colors: `var(--fin-col)` text, `var(--fin-bg)` background, `var(--fin-bdr)` border

**Confetti**
- On `fireCelebration()`, set `showConfetti: true` state
- Render 28 `<span>` elements absolutely positioned inside the income card (relative container)
- Each span: random color from a small palette (`#22C55E`, `#F59E0B`, `#60A5FA`, `#A78BFA`, `#F87171`), random `left` %, random size (4–8px), CSS animation `confetti-fall` using `transform: translateY + rotate` + `opacity: 0`
- Auto-clean: `setTimeout(() => setShowConfetti(false), 2500)`
- Animation: defined in `globals.css` as `@keyframes confetti-fall`

---

## 3. Blog Page

### Route
`src/app/(app)/blog/page.jsx`

Protected by existing middleware (inside `(app)` group).

### URL
`/blog?category=<slug>`

### Layout
Two-column flex layout:
- **Left sidebar:** 200px fixed, scrollable category list
- **Right content:** flex-1, centered "coming soon" state

### Sidebar Categories

| Display Label | Slug |
|---|---|
| Method of the Week | `method-of-week` |
| Financial of the Day | `financial-of-day` |
| Daily Financial Tip | `daily-financial-tip` |
| Deep Dive of the Week | `deep-dive` |
| Did you Know | `did-you-know` |
| Concept of the Day | `concept-of-day` |

Active category: highlighted with `var(--accent-bg)`, `var(--accent)` left border.

### Content Area (all categories)
```
[ph-article icon, 40px, var(--text-3)]
BLOG COMING SOON
"We're working on something great. Check back soon."
```

### Default Behavior
- Read `?category` from `useSearchParams()`
- Default to first category (`method-of-week`) if param is absent or invalid

### Styling
All styles go in `globals.css` under a `/* Blog */` section.

---

## 4. "Know More" Buttons

### Style
Small text-link button, right-aligned, below card content:
```
Know more →
```
Font: 12px, color matches section accent (`var(--fin-col)` for Finance, `var(--know-col)` for Knowledge, `var(--life-col)` for Lifestyle). No border, no background. Hover: `opacity: 0.75`. Uses Next.js `<Link>`.

### Wiring

| Card | Section file | Blog slug |
|---|---|---|
| Word of the Day | `FinanceSection.jsx` | `financial-of-day` |
| Daily Financial Tip | `FinanceSection.jsx` | `daily-financial-tip` |
| Concept of the Day (if present) | `KnowledgeSection.jsx` | `concept-of-day` |
| Did you Know (if present) | `KnowledgeSection.jsx` | `did-you-know` |
| Deep Dive of the Week (if present) | `KnowledgeSection.jsx` | `deep-dive` |
| Method of the Week (if present) | `LifestyleSection.jsx` | `method-of-week` |

Exact card names in Knowledge/Lifestyle sections confirmed during implementation by reading those files.

---

## Files Changed

| File | Change |
|---|---|
| `src/components/sections/FinanceSection.jsx` | Income history list, celebration logic, Know More buttons |
| `src/components/sections/KnowledgeSection.jsx` | Know More buttons on relevant AI cards |
| `src/components/sections/LifestyleSection.jsx` | Know More buttons on relevant AI cards |
| `src/app/(app)/blog/page.jsx` | **New** — blog page |
| `src/app/globals.css` | Blog layout, confetti animation, income history row styles |

---

## Quality Rules Applied
- All interactive elements: hover + active + focus-visible
- Skeleton on every fetch
- Empty state on income history
- try/catch + error toast on all Supabase writes
- No hardcoded colors — CSS variables only
- Confetti uses transform + opacity only (no top/left animation)
- Minimum 44×44px tap targets on Know More buttons
