# Nook — Concept Note

## What is Nook?

Nook is a **personal life dashboard** — a single-screen app that combines financial tracking, curated news, lifestyle habits, and daily health metrics into one calm, focused space. The goal is to replace a morning routine spread across 5+ apps (Bloomberg, Notion, fitness tracker, news aggregator, expense app) with a single beautiful dashboard screen you open every day.

---

## Core Philosophy

- **Calm by default.** The design language is warm, low-contrast, serif-accented — the opposite of the anxiety-inducing red/green financial dashboard.
- **One place for everything that matters.** Finance, knowledge, lifestyle, and body — all visible at a glance without switching context.
- **AI-assisted, not AI-dependent.** Claude generates daily tips, word of the day, "did you know" facts, and concept explanations — but the app works without them.
- **Kaizen mindset.** The app tracks streaks, day scores, and progress to nudge continuous self-improvement, not perfection.

---

## App Structure

### Layout
```
┌────────────────────────────────────────────────┐
│ Sidebar (200px) │        Main Area              │
│                 │  Topbar                       │
│  Home           │  ─────────────────────────── │
│  Finance        │  Greeting Banner              │
│  Knowledge      │  ─────────────────────────── │
│  Lifestyle      │  Hero Grid (3 columns)        │
│  Tracking       │   Finance │ Knowledge │ Life  │
│  Settings       │                               │
└────────────────────────────────────────────────┘
```

### Views
| View | Route | Description |
|------|-------|-------------|
| Home | `/dashboard` | Hero grid + greeting banner |
| Finance (expanded) | same page, section swap | Full finance management |
| Knowledge (expanded) | same page, section swap | Full news + learning |
| Lifestyle (expanded) | same page, section swap | Journal, gratitude, checklist |
| Tracking (expanded) | same page, section swap | Daily inputs + analytics |
| Settings | `/settings` within app | All user preferences |
| Onboarding | `/onboarding` | Multi-step setup flow |

---

## Home View — The Heart of the App

### Greeting Banner (dark strip, Lora font)
- Personalized greeting: "Good morning, Prateek"
- AI-generated weekly positivity message from Claude
- 4 stats in a row:
  - **Goals done** — checklist X/Y
  - **Mood** — smiley icon
  - **Kaizen** — consecutive day streak ("Day 12")
  - **Day Score Ring** — animated SVG ring (green ≥80, amber 60–79, red <60)

### Hero Grid (3 equal columns, cards)

#### Finance Column
1. **Watchlist** — live stock prices from Finnhub, auto-refreshes every 30s. Shows ticker, company name, price, % change (color-coded up/down). Skeleton loading state.
2. **Word of the Day** — AI-generated via Claude. Word + definition.
3. **Daily Tip** — AI-generated finance/life tip, shown in quotes.
4. **Sentiment** — hardcoded bullish/neutral badges for key tickers (AAPL, MSFT, TSLA).
5. **Expense Log** — Today's expenses (amount, category, note). Inline quick-add form (amount + category dropdown + note → Add button). Shows running today's total.

#### Knowledge Column
1. **Today's News** — fetched from NewsData.io per user's selected topics (up to 5). Each topic shows as a card with a color-coded tag, article title (clickable link), source, and dot-navigation between 3 articles.
2. **Did You Know?** — AI-generated daily curiosity fact from Claude.
3. **Concept of the Day** — AI-generated explanation of a concept from the user's learning topics.

#### Lifestyle Column
1. **Method of the Week** — displays the active productivity/habit method (e.g. Pomodoro Technique) with a 7-day progress strip. Placeholder if none active.
2. **Daily Checklist** — top 3 active tasks from the user's checklist. Progress bar (done/total). Click to toggle done. Empty state if no tasks.
3. **Stress Check-in** — 5 emoji buttons (😌🙂😐😕😤). Tapping one saves to `daily_tracking.stress_morning` or `stress_evening` depending on time of day. Persists across sessions.
4. **Tracking Today** — static chip grid showing Water, Sleep, Steps, Productive hours, Meals, Mood — visual progress bars per metric.

---

## Expanded Sections (drill-down from home columns)

### Finance Section
- Tabs: **Stocks**, **Expenses** (Today / Monthly / 3-Month), **Income**
- Full watchlist management (add/remove tickers, free tier = 3)
- Full expense log with category filters
- Income goal tracker with progress ring

### Knowledge Section
- Full news feed, all topics
- Reading list / bookmarks
- Learning path tracker

### Lifestyle Section
- Full journal (write, edit, multiple entries per day, history modal)
- Gratitude log (3 lines per day)
- Full checklist management (add, reorder, carry-forward, streak)
- Checklist calendar history modal
- Method of the Week management

### Tracking Section
- **DailyInputs** — comprehensive form: water (0–8 glasses), sleep (hours slider), steps, exercise type + minutes, meals, productive hours, lazy hours, mood morning/evening (1–5 scale), weight, notes, rest day toggle
- **AnalyticsTabs** — charts for water, sleep, steps, mood trends over 7/14/30 days (vanilla Canvas)
- **HistoryList** — 15-day history table with day scores

---

## Day Score Formula
```
score = sleep(25%) + water(20%) + steps(15%) + checklist(20%) + mood(20%)
- sleep: min(hours/8, 1.0)
- water: min(glasses/8, 1.0)
- steps: min(count/10000, 1.0)
- checklist: done/total (0 if no items)
- mood: (morning + evening) / 10
→ multiply by 100, round to integer
```
Ring color: ≥80 green, 60–79 amber, <60 red.

---

## AI Features (Claude Sonnet 4.6)
All content is cached in `ai_content_cache` table by content_key (e.g. `word-of-day-2026-05-28`). Cache is shared across all users for global keys, per-user for personalized keys. Expires daily.

| Content Type | Key Pattern | Notes |
|---|---|---|
| Word of Day | `word-of-day-{date}` | Global |
| Daily Tip | `daily-tip-{date}` | Global |
| Did You Know | `did-you-know-{date}` | Global |
| Concept of Day | `concept-{topic}-{date}` | Per learning topic |
| Positivity Message | `positivity-{userId}-{weekStart}` | Per user, weekly |

---

## Auth & Onboarding
- Supabase Auth (email/password)
- 13-step onboarding flow: Welcome → Auth → Signup → Name → Reach → Gender → Location → Field → Topics → Learn → Finance → Ready → Plans
- Onboarding saves to `profiles` + `user_preferences` tables
- After signup → redirects to `/onboarding` → after completion → `/dashboard`
- Free tier: 3 watchlist tickers, 5 news topics, 5 learning interests. Pro unlocks more.

---

## Design System (Critical for any UI work)
- **Fonts:** Geist (UI), Lora (headings/logo/serif accents)
- **Themes:** `calm` (warm terracotta), `regular` (blue), `dark` (amber-on-dark)
- **Icons:** Phosphor Icons `ph-bold` weight only
- **All colors** via CSS custom properties — never hex hardcoded
- **Animations:** transform+opacity only, `cubic-bezier(0.16,1,0.3,1)` spring easing
- **Tap targets:** min 44×44px
- **Numbers:** always `font-variant-numeric: tabular-nums`

---

## Tech Stack
- Next.js 14, App Router, no TypeScript
- Supabase (PostgreSQL + Auth)
- Anthropic claude-sonnet-4-6
- NewsData.io (news), Finnhub (stocks)
- Vanilla CSS in globals.css (no Tailwind, no modules)
- Vanilla Canvas for charts
- Vercel deployment
