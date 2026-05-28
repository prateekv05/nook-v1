# Prompt: Build Nook Home Page

Use this verbatim when starting a new Claude chat session.

---

I'm building **Nook** — a personal life dashboard app. I need you to build the **home page** (the main dashboard view a user sees after logging in). Here is the complete spec:

---

## Tech Stack
- Next.js 14, App Router, no TypeScript
- Vanilla CSS (no Tailwind, no CSS modules — all styles go in a single `globals.css`)
- Supabase for auth + database
- Anthropic claude-sonnet-4-6 for AI content
- NewsData.io for news, Finnhub for stock quotes
- Phosphor Icons via CDN (`ph-bold` weight class only)
- Fonts: Geist (UI) + Lora (serif headings) via Google Fonts
- No emojis in HTML — Phosphor icons instead

---

## Design System

### Themes
The app has 3 themes set as `data-theme` attribute on `<html>`. Default is `calm`.

```css
[data-theme="calm"] {
  --app-bg: #F7F3EE; --main-bg: #F0EAE1; --card-bg: #FDFCFA;
  --input-bg: #EDE7DE; --sidebar-bg: #EDE7DE;
  --sb-active: rgba(194,98,63,0.10); --sb-accent: #C2623F;
  --sb-icon: #9A8C82; --sb-icon-on: #1C1410;
  --border: rgba(28,20,16,0.10); --border-hov: rgba(28,20,16,0.18);
  --text-1: #1C1410; --text-2: #6B5E54; --text-3: #A8998E;
  --topbar-bg: #F7F3EE; --topbar-bdr: rgba(28,20,16,0.08);
  --accent: #C2623F; --accent-bg: rgba(194,98,63,0.08); --accent-bdr: rgba(194,98,63,0.20);
  --gb-bg: #1C1410; --gb-title: #F7F3EE; --gb-sub: rgba(247,243,238,0.55);
  --gb-stat: #F7F3EE; --gb-stat-l: rgba(247,243,238,0.5); --gb-divider: rgba(247,243,238,0.12);
  --sub-divider: rgba(28,20,16,0.06); --card-sh: 0 20px 40px -15px rgba(28,20,16,0.07);
  --fin-col: #2D6A4F; --fin-bg: rgba(45,106,79,0.07); --fin-bdr: rgba(45,106,79,0.18);
  --know-col: #1D6FA8; --know-bg: rgba(29,111,168,0.07); --know-bdr: rgba(29,111,168,0.18);
  --life-col: #A05C20; --life-bg: rgba(160,92,32,0.07); --life-bdr: rgba(160,92,32,0.18);
  --error-col: #B91C1C; --error-bg: rgba(239,68,68,0.07); --error-bdr: rgba(239,68,68,0.18);
}
```

### Global Tokens
```css
:root {
  --font-sans: 'Geist', sans-serif;
  --font-serif: 'Lora', serif;
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
  --z-base: 1; --z-sticky: 10; --z-modal: 100; --z-toast: 200;
}
```

### Rules (NEVER break these)
- NEVER hardcode colors — CSS custom properties only
- NEVER `font-family: Inter/system-ui/Roboto`
- NEVER `height: 100vh` → use `min-height: 100dvh`
- NEVER `z-index: 50` → use `var(--z-*)`
- ALWAYS `font-variant-numeric: tabular-nums` on numbers
- ALWAYS hover + active + focus-visible on every interactive element
- Animations: `transform` + `opacity` only, spring easing
- All transitions: `all 0.3s var(--ease-spring)`
- Tap targets: min 44×44px
- Button active: `transform: scale(0.97)`

---

## Layout

```
┌────────────────────────────────────────────────────────┐
│ Sidebar 200px  │              Main Area                 │
│ border-r       │  Topbar (height ~52px)                 │
│                │  ────────────────────────────────────  │
│  Logo          │  Greeting Banner (dark card)           │
│  ─────         │  ────────────────────────────────────  │
│  Home          │  Hero Grid: 3 equal columns, gap 12px  │
│  Finance       │  [Finance Col] [Knowledge Col] [Life]  │
│  Knowledge     │                                        │
│  Lifestyle     │                                        │
│  Tracking      │                                        │
│  ─────         │                                        │
│  Settings      │                                        │
└────────────────────────────────────────────────────────┘
```

**Shell:** max-width 1440px, border-radius 24px, padding 10px, gap 10px, box-shadow `0 40px 120px rgba(0,0,0,0.16), 0 8px 32px rgba(0,0,0,0.08)`

**Sidebar:** width 200px, border-radius 16px, padding `16px 10px`, background `var(--sidebar-bg)`
- Logo: 26×26px square, border-radius 8px, background `var(--sb-logo-bg)`, Lora 14px, fg `var(--sb-logo-fg)` — shows "N"
- App name "nook" in Lora italic below logo
- Nav items: padding `8px 12px`, border-radius 10px, gap 8px. Active state: background `var(--sb-active)`, left 2px accent bar `var(--sb-accent)`, icon/text `var(--sb-icon-on)`. Inactive icon: `var(--sb-icon)`.
- Nav items: Home (ph-house), Finance (ph-currency-dollar), Knowledge (ph-book-open), Lifestyle (ph-heart), Tracking (ph-chart-line), Settings (ph-gear)

**Topbar:** padding `13px 22px`, border-bottom `0.5px solid var(--topbar-bdr)`, background `var(--topbar-bg)`
- Left: current view title in Lora
- Right: Share button (ph-share-network), user avatar circle

---

## Greeting Banner

Dark card, background `var(--gb-bg)`, border-radius 20px, padding `20px 24px`.
- Left: `<h2>` in Lora — "Good morning, [Name]". Below: AI positivity message in `var(--gb-sub)` text.
- Right: 4 stats in a row, separated by 0.5px dividers
  1. **Goals done** — e.g. "3/7" — `var(--gb-stat)`, label below in `var(--gb-stat-l)`
  2. **Mood** — ph-smiley icon
  3. **Kaizen** — "Day 12" (consecutive day streak)
  4. **Day Score Ring** — SVG circle ring, 52×52px, animated stroke-dashoffset on mount
     - Score ≥80: stroke `#4ADE80`, 60–79: `#F59E0B`, <60: `#EF4444`
     - Score number centered inside ring in `var(--gb-stat)` color

---

## Hero Grid — 3 Columns

Grid: `grid-template-columns: 1fr 1fr 1fr`, gap 12px, padding `14px 16px 16px`

Each column is a card: background `var(--card-bg)`, border-radius 20px, box-shadow `var(--card-sh)`, `overflow: hidden`. Clicking anywhere on the card navigates to the expanded section. The expand icon (ph-arrows-out) in the header also navigates.

### Column Header pattern
```
[Icon] Finance                             [ph-arrows-out]
```
Background: Finance → `var(--fin-bg)`, border-bottom `var(--fin-bdr)`
Knowledge → `var(--know-bg)` / `var(--know-bdr)`
Lifestyle → `var(--life-bg)` / `var(--life-bdr)`
Title color: Finance `var(--fin-col)`, Knowledge `var(--know-col)`, Lifestyle `var(--life-col)`

### Sub-section pattern
Each sub-section has a small uppercase label (`sub-label`) in `var(--text-3)`, font-size 10px, letter-spacing 0.06em, followed by content.

---

## Finance Column — Sub-sections

**1. Watchlist**
- Loads user's active tickers from Supabase `watchlist` table
- Fetches prices from `/api/stocks?tickers=AAPL,MSFT` (Finnhub)
- Auto-refreshes every 30 seconds
- Each row: ticker symbol (bold, 13px) + company name (10px, `var(--text-3)`) on left; price + % change on right
- % change: green if up, red if down. Use CSS class `up` / `dn`
- Skeleton loading state: 3 placeholder rows with shimmer animation
- Empty state: "No stocks yet — add tickers in the Finance tab."

**2. Word of the Day**
- Fetches from `/api/ai-content` with `type=word-of-day`
- Response format: `WORD: Ephemeral\nDEFINITION: Lasting for a very short time.`
- Word in bold 14px Lora, definition in 12px `var(--text-2)`
- Shimmer skeleton while loading

**3. Daily Tip**
- Fetches from `/api/ai-content` with `type=daily-tip`
- Shown in quotes, italic, 12px `var(--text-2)`

**4. Expense Log**
- Loads today's expenses from Supabase `expense_entries` table (limit 4)
- Shows: note or category / category badge / amount with minus sign
- Running total: "Today: −$47.50"
- Quick-add form: number input ($0.00) + category `<select>` + note input + Add button
- On submit: optimistic UI insert then save to Supabase
- Categories: Food, Transport, Entertainment, Health, Shopping, Utilities, Education, Other

---

## Knowledge Column — Sub-sections

**1. Today's News**
- Loads user's `news_topics` from `user_preferences` table (fallback: technology,science,business)
- Fetches from `/api/news?topics=technology,science`
- Groups by topic. Each group:
  - Color-coded topic tag (pill badge)
  - Article title (clickable link if URL available)
  - Source name (10px, `var(--text-3)`)
  - Dot navigation between 3 articles per topic
- Skeleton: 4 placeholder groups
- Retry button on error

**2. Did You Know?**
- From `/api/ai-content` with `type=did-you-know`
- Shown in quotes, 12px

**3. Concept of the Day**
- From `/api/ai-content` with `type=concept` and user's first learning topic as context
- Shown as 12px paragraph

---

## Lifestyle Column — Sub-sections

**1. Method of the Week**
- Static display for now (no DB wiring needed yet)
- Shows: method name in Lora 14px, a quote in 11px italic, 7-day dot strip (filled dots = completed days)
- Label: "Start in the Lifestyle tab"

**2. Daily Checklist**
- Loads top 3 active items from Supabase `checklist_items` table
- Progress bar: filled to `doneCount/total * 100%`, label "X of Y"
- Each item: checkbox (custom SVG checkmark) + label. Click toggles `is_done` in DB (optimistic UI)
- Skeleton: 3 shimmer rows
- Empty state: "No tasks yet — add them in the Lifestyle tab."

**3. Stress Check-in**
- 5 emoji buttons: 😌🙂😐😕😤 (rendered as text since no Phosphor icon for these)
- Selected button gets accent ring
- Saves to `daily_tracking.stress_morning` or `stress_evening` based on `new Date().getHours() >= 12`
- Uses Supabase upsert with `onConflict: 'user_id,date'`

**4. Tracking Today**
- Static chip grid for now showing: Water, Sleep, Steps, Productive, Meals, Mood
- Each chip: label + value + optional mini progress bar
- Wire to real data if easy, static is fine

---

## AI Content API (`/api/ai-content/route.js`)

```js
// POST body: { type, key, userContext }
// Checks ai_content_cache table first (SELECT WHERE content_key = key)
// If hit and not expired: return cached content
// If miss: call Anthropic claude-sonnet-4-6
// Save to cache with expires_at = next midnight

// Prompts per type:
// word-of-day: "Give exactly one vocabulary word. Format:\nWORD: [word]\nDEFINITION: [one sentence]"
// daily-tip: "One actionable tip for today. Under 20 words. No bullet points."
// did-you-know: "One surprising fact. Start with the fact itself. Under 30 words."
// concept: "Explain [topic] in one sentence a curious non-expert would find interesting."
// positivity: "Write an encouraging 1-sentence message for [name]. Warm, not cheesy."
```

---

## Supabase Tables Needed (already exist)

- `profiles` — id, first_name, last_name
- `user_preferences` — user_id, news_topics (text[]), learning_topics (text[])
- `watchlist` — user_id, ticker, is_active, display_order
- `expense_entries` — user_id, amount, category, note, date, is_deleted
- `checklist_items` — user_id, text, is_done, is_active, position
- `daily_tracking` — user_id, date, day_score, stress_morning, stress_evening
- `ai_content_cache` — content_key (unique), content_type, content, expires_at

All tables have RLS: `user_id = auth.uid()`. `ai_content_cache` rows where `user_id IS NULL` are readable by all authenticated users.

---

## Animations

```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  from { background-position: -400px 0; }
  to { background-position: 400px 0; }
}
```

Shimmer skeleton pattern:
```css
.shimmer {
  background: var(--input-bg);
  background-image: linear-gradient(90deg, var(--input-bg) 0%, var(--border) 50%, var(--input-bg) 100%);
  background-size: 400px 100%;
  animation: shimmer 1.4s infinite linear;
}
```

The entire home view should `animation: fade-up 0.4s var(--ease-spring) both` on mount.

---

## File Structure to Create

```
src/
  app/
    (app)/dashboard/page.jsx     ← view router (Home / Expanded / Settings)
    api/
      news/route.js              ← GET /api/news?topics=...
      stocks/route.js            ← GET /api/stocks?tickers=...
      ai-content/route.js        ← POST /api/ai-content
    globals.css                  ← ALL styles
    layout.jsx                   ← fonts, ThemeProvider, PWA meta
  components/
    layout/
      Sidebar.jsx
      Topbar.jsx
      GreetingBanner.jsx
      ThemeProvider.jsx
    home/
      HeroGrid.jsx               ← 3-column grid wrapper
      FinanceColumn.jsx
      KnowledgeColumn.jsx
      LifestyleColumn.jsx
    ui/
      DayScoreRing.jsx           ← SVG ring component
      Toast.jsx                  ← global toast context
      Skeleton.jsx               ← reusable shimmer block
  hooks/
    useAIContent.js              ← fetches from /api/ai-content, caches in state
    useTheme.js                  ← reads/writes localStorage + data-theme attribute
  lib/
    supabase.js                  ← createClient() for client components
    supabase-server.js           ← createServerClient() for API routes
    day-score.js                 ← calculateDayScore() formula
    ai-prompts.js                ← prompt strings per content type
```

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
NEWSDATA_API_KEY=
FMP_API_KEY=
NEXT_PUBLIC_APP_URL=
```

---

## What I want you to build

Build the complete home page described above. Start with:
1. `globals.css` — full token system (all 3 themes) + all component styles
2. `layout.jsx` — Geist + Lora fonts, ThemeProvider, PWA meta
3. `Sidebar.jsx` + `Topbar.jsx` — navigation shell
4. `GreetingBanner.jsx` + `DayScoreRing.jsx`
5. `HeroGrid.jsx` with all 3 columns (FinanceColumn, KnowledgeColumn, LifestyleColumn)
6. All API routes (`/api/news`, `/api/stocks`, `/api/ai-content`)
7. `useAIContent.js` hook
8. `dashboard/page.jsx` — view router

Quality rules (apply to every component without being asked):
- Every interactive element: hover + active + focus-visible states
- Every data fetch: loading skeleton + error state + empty state
- Every Supabase write: try/catch + error toast
- Optimistic UI on all toggles (update state first, save second)
- No hardcoded colors — CSS custom properties only
- No inline styles except dynamic values (ring stroke width, chart widths)
- All numbers: `font-variant-numeric: tabular-nums`

Do NOT add features beyond what I described. Do NOT use TypeScript. Do NOT use Tailwind.
