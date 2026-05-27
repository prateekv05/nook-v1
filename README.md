# Nook — Personal Dashboard

A personal life-management dashboard built with Next.js 14 and Supabase.

---

## What Is Nook?

Nook is a daily personal dashboard that combines finance tracking, knowledge/news feeds, lifestyle logging, habit scoring, and AI-generated insights into one cohesive interface. It supports multiple visual themes (Calm, Regular, Dark) and is deployable as a PWA.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14, App Router, JavaScript (no TypeScript) |
| Styling | Vanilla CSS with a full design-token system in `globals.css` |
| Auth + DB | Supabase (Auth + PostgreSQL with RLS) |
| AI | Anthropic `claude-sonnet-4-6` |
| Charts | Vanilla Canvas (`lib/chart-utils.js`) |
| Icons | Phosphor Icons via CDN |
| News | NewsData.io API |
| Stocks | Financial Modeling Prep (FMP) API |
| Deploy | Vercel |

---

## Build History — What Each Phase Did

### Phase 0 — Project Setup
Scaffolded the Next.js project, wired up the full CSS design-token system (colors, typography, spacing, animations), set up the app layout with font imports and PWA meta tags, created empty placeholder component files, added a PWA manifest, built the ThemeProvider + `useTheme` hook, and deployed to Vercel.

### Phase 1 — Layout Shell
Built the outer app shell wrapper, the sidebar (with navigation items and logo), the topbar, and the main content wrapper with a view router that switches between dashboard sections.

### Phase 2 — Home View (Static)
Added the GreetingBanner, the DayScoreRing SVG component, the HeroGrid layout, and the three home-view columns — Finance, Knowledge, and Lifestyle — each with static placeholder content.

### Phase 3 — Expanded Sections
Built out the full expanded views for each column: FinanceSection, KnowledgeSection, LifestyleSection. Added TrackingSection with DailyInputs form, static analytics charts (AnalyticsTabs), and a 15-day HistoryList.

### Phase 4 — Modals + Overlays
Built the global Toast notification system, the UpgradeModal (Pro paywall), the ShareModal + ShareableCard (for sharing weekly stats), and the CalendarModal (shows checklist completion history by date).

### Phase 5 — Settings (Static)
Built the full settings page with all sections (profile, preferences, notifications, appearance) as static UI — no backend wiring yet.

### Phase 6 — Onboarding Flow
Built a 13-step onboarding flow: Welcome → Auth gate → Signup → Name → Reach → Gender → Location → Field → Topics → Learn → Finance → Ready → Plans (pricing). Each step is its own component with animated transitions.

### Phase 7 — Auth + Supabase
Set up Supabase client and server helpers, wrote SQL for all 13 database tables with RLS policies, built the Login and Signup pages, and added route-protection middleware (dashboard/settings/onboarding require session; login/signup redirect to dashboard if already logged in).

### Phase 8 — News + Stocks
Built `/api/news` (NewsData.io) and `/api/stocks` (FMP) API routes. Wired up the Finance column with a live watchlist — users can add/remove tickers stored in Supabase.

### Phase 9 — Lifestyle Features
Wired up the Checklist (tick off, add items, carry-forward to next day), Journal (write/edit/save with AI prompt), Gratitude log with history view, Stress check-in slider, and the CalendarModal showing day-by-day checklist history from the DB.

### Phase 10 — Tracking + Day Score
Connected DailyInputs to Supabase (water, steps, sleep, exercise, meals, mood, stress). The DayScoreRing updates live as values change. Analytics charts pull real historical data. The 15-day history list shows actual DB records.

### Phase 11 — AI Content
Built the `/api/ai-content` route (calls Anthropic), created the AI prompts library (`lib/ai-prompts.js`) with prompts tailored per section and user preferences, built the `useAIContent` hook with caching, and wired AI-generated content into all three section columns.

### Phase 12 — Expense + Income
Built the expense log with Today / Monthly / 3-Month tabs, expense entry form, and category breakdown. Added the income goal tracker with progress visualization.

### Phase 13 — Settings + Share Wired to DB
**Settings:** On mount, parallel-fetches `profiles` + `user_preferences` to pre-fill all fields. Save does parallel upsert of profile fields (name, timezone) and preferences (theme, news/learning topics, lifestyle prefs, income goal). Theme applies immediately on click; DB-saved on Save button. Toast on success/error.

**ShareModal:** On open, fetches real data — user's name, weekly sleep average, days with high score, exercise days, and current Method of the Week. Skeleton shown during load. Copy link wired to clipboard.

### Phase 14 — Polish (in progress)
- **14.1 ✅** Skeleton loading states added across all components — shimmer placeholders shown while data fetches.
- **14.2** Empty states (next up)
- **14.3** Global error toast wiring
- **14.4** Mobile responsiveness
- **14.5** Security audit

### Phase 15 — Onboarding Wired (upcoming)
Save all onboarding answers to Supabase. Correct post-signup redirect to dashboard.

---

## Database Tables (13 total)

`profiles`, `user_preferences`, `watchlist`, `journal_entries`, `gratitude_logs`, `checklist_items`, `checklist_history`, `daily_tracking`, `expense_entries`, `income_entries`, `ai_content_cache`, `method_of_week`, `notifications`

---

## Key Files

| File | Purpose |
|---|---|
| `src/app/globals.css` | Entire design system — all tokens, themes, animations |
| `src/lib/day-score.js` | Day score formula (sleep 25%, water 20%, steps 15%, checklist 20%, mood 20%) |
| `src/lib/ai-prompts.js` | All AI prompt templates per section |
| `src/hooks/useAIContent.js` | AI content fetching + caching hook |
| `src/lib/isPro.js` | Pro/trial check — always use this, never inline |
| `middleware.js` | Route protection |

---

## Current Status

**Phase 14 — Polish**, task 14.2 (empty states) is next.
