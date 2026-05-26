# CLAUDE.md — Nook
## Project Bible + Session State Tracker

> **Every session must start with:**
> "Read CLAUDE.md fully. Tell me the current phase, what's done, and the next task. Do not write any code until I confirm."
>
> **Every session must end with:**
> "Update the Session State section in CLAUDE.md with what we completed, what's in progress, and what's next."

---

## SESSION STATE
*(Claude updates this block at the end of every session)*

**Current Phase:** 0 — Setup in progress
**Last completed task:** 0.6 — ThemeProvider + useTheme hook
**In progress:** None
**Next task:** Phase 0.7 — Vercel deploy
**Decisions made this session:** Next.js 14.2.35 (not 16), React 18, plain JS (no TypeScript), @supabase/supabase-js installed. globals.css is 1817 lines — full nook-v11 style block + step-enter/shake keyframes + interactive defaults + focus-visible + scrollbar.
**Blockers:** None

---

## BUILD PROGRESS CHECKLIST
*(Claude checks off items as they are completed — never skip ahead)*

### Phase 0 — Setup
- [x] 0.1 Next.js project scaffold
- [x] 0.2 globals.css — full token system from nook-v11.html
- [x] 0.3 layout.jsx — fonts, ThemeProvider, PWA meta
- [x] 0.4 Component shell files created (empty placeholders)
- [x] 0.5 PWA manifest
- [x] 0.6 ThemeProvider + useTheme hook
- [ ] 0.7 Vercel deploy

### Phase 1 — Layout Shell
- [ ] 1.1 Shell wrapper
- [ ] 1.2 Sidebar
- [ ] 1.3 Topbar
- [ ] 1.4 Main wrapper + view router

### Phase 2 — Home View
- [ ] 2.1 GreetingBanner (static)
- [ ] 2.2 DayScoreRing component
- [ ] 2.3 HeroGrid wrapper
- [ ] 2.4 FinanceColumn (static)
- [ ] 2.5 KnowledgeColumn (static)
- [ ] 2.6 LifestyleColumn (static)

### Phase 3 — Expanded Sections
- [ ] 3.1 FinanceSection
- [ ] 3.2 KnowledgeSection
- [ ] 3.3 LifestyleSection
- [ ] 3.4 TrackingSection + DailyInputs
- [ ] 3.5 AnalyticsTabs (static charts)
- [ ] 3.6 HistoryList

### Phase 4 — Modals + Overlays
- [ ] 4.1 Toast (global context)
- [ ] 4.2 UpgradeModal
- [ ] 4.3 ShareModal + ShareableCard
- [ ] 4.4 CalendarModal (checklist history)

### Phase 5 — Settings
- [ ] 5.1 Settings view — all sections static

### Phase 6 — Onboarding
- [ ] 6.1 OnboardingShell + step router
- [ ] 6.2 Steps 1–6 (Welcome → Auth → Signup → Name → Reach → Gender)
- [ ] 6.3 Steps 7–12 (Location → Field → Topics → Learn → Finance → Ready)
- [ ] 6.4 Plans page (Step 13)

### Phase 7 — Auth + Supabase
- [ ] 7.1 Supabase client + server setup
- [ ] 7.2 Database tables SQL (all 13 tables)
- [ ] 7.3 DB migration — 4 new columns on user_preferences
- [ ] 7.4 Login page
- [ ] 7.5 Signup page
- [ ] 7.6 Route protection middleware

### Phase 8 — News + Stocks
- [ ] 8.1 /api/news route
- [ ] 8.2 /api/stocks route
- [ ] 8.3 Watchlist add/remove wired

### Phase 9 — Lifestyle Features
- [ ] 9.1 Checklist (tick, add, carry-forward)
- [ ] 9.2 Journal (write, edit, save)
- [ ] 9.3 Gratitude log + history
- [ ] 9.4 Stress check-in
- [ ] 9.5 Checklist calendar history modal

### Phase 10 — Tracking + Day Score
- [ ] 10.1 DailyInputs wired to Supabase
- [ ] 10.2 Day score calculation (lib/day-score.js)
- [ ] 10.3 Live score ring updates
- [ ] 10.4 Analytics charts with real data
- [ ] 10.5 15-day history list

### Phase 11 — AI Content
- [ ] 11.1 /api/ai-content route
- [ ] 11.2 AI prompts library (lib/ai-prompts.js)
- [ ] 11.3 useAIContent hook
- [ ] 11.4 AI content wired to all components

### Phase 12 — Expense + Income
- [ ] 12.1 Expense log (Today / Monthly / 3-Month tabs)
- [ ] 12.2 Income goal tracker

### Phase 13 — Settings + Share Wired
- [ ] 13.1 Settings all sections saved to Supabase
- [ ] 13.2 ShareableCard with real data

### Phase 14 — Polish
- [ ] 14.1 Skeleton loading states everywhere
- [ ] 14.2 Empty states everywhere
- [ ] 14.3 Toast error handling globally wired
- [ ] 14.4 Mobile responsiveness
- [ ] 14.5 Security audit

### Phase 15 — Onboarding Wired
- [ ] 15.1 Onboarding saves all state to Supabase
- [ ] 15.2 Correct redirects post-signup

---

## TECH STACK

| Layer | Choice |
|---|---|
| Framework | Next.js 14, App Router, no TypeScript |
| Styling | Vanilla CSS in globals.css — no Tailwind, no CSS modules |
| Auth | Supabase Auth |
| Database | Supabase (PostgreSQL) |
| AI | Anthropic claude-sonnet-4-6 |
| Charts | Vanilla Canvas (chart-utils.js) |
| Icons | Phosphor Icons via CDN |
| News | NewsData.io |
| Stocks | Financial Modeling Prep (FMP) |
| Deploy | Vercel |

---

## DESIGN SYSTEM

### Fonts
- **UI:** `'Geist', sans-serif` — all body, labels, buttons, inputs
- **Serif:** `'Lora', serif` — headings, greeting, modal titles, logo, card titles
- Google Fonts: `https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Lora:ital,wght@0,400;0,500;1,400&display=swap`
- Icons CDN: `https://unpkg.com/@phosphor-icons/web` — use `ph-bold` weight class

### Theme System
- Default: `calm` — set on `<html data-theme="calm">` before hydration
- Switch: `document.documentElement.setAttribute('data-theme', theme)`
- Persist: `localStorage` key `nook-theme`
- Valid values: `calm` | `regular` | `dark`

### CSS Tokens — calm theme
```css
[data-theme="calm"] {
  --app-bg: #F7F3EE; --main-bg: #F0EAE1; --card-bg: #FDFCFA;
  --input-bg: #EDE7DE; --sidebar-bg: #EDE7DE;
  --sb-active: rgba(194,98,63,0.10); --sb-accent: #C2623F;
  --sb-icon: #9A8C82; --sb-icon-on: #1C1410;
  --sb-logo-bg: #1C1410; --sb-logo-fg: #F7F3EE;
  --sb-name: #1C1410; --sb-user: #7A6B61;
  --border: rgba(28,20,16,0.10); --border-hov: rgba(28,20,16,0.18);
  --text-1: #1C1410; --text-2: #6B5E54; --text-3: #A8998E;
  --topbar-bg: #F7F3EE; --topbar-bdr: rgba(28,20,16,0.08);
  --accent: #C2623F; --accent-bg: rgba(194,98,63,0.08); --accent-bdr: rgba(194,98,63,0.20);
  --gb-bg: #1C1410; --gb-title: #F7F3EE;
  --gb-sub: rgba(247,243,238,0.55); --gb-stat: #F7F3EE;
  --gb-stat-l: rgba(247,243,238,0.5); --gb-divider: rgba(247,243,238,0.12);
  --hero-hov-sh: 0 20px 40px -15px rgba(28,20,16,0.10);
  --sub-divider: rgba(28,20,16,0.06); --card-sh: 0 20px 40px -15px rgba(28,20,16,0.07);
  --pro-bg: rgba(194,98,63,0.08); --pro-text: #C2623F;
  --feat-know-bg: rgba(45,106,79,0.08); --feat-know-fg: #2D6A4F;
  --feat-life-bg: rgba(61,107,232,0.08); --feat-life-fg: #3D6BE8;
  --feat-fin-bg: rgba(194,98,63,0.08); --feat-fin-fg: #C2623F;
  --error-col: #B91C1C; --error-bg: rgba(239,68,68,0.07); --error-bdr: rgba(239,68,68,0.18);
}
```

### CSS Tokens — regular theme
```css
[data-theme="regular"] {
  --app-bg: #EEF0F5; --main-bg: #E4E7F0; --card-bg: #F8F9FC;
  --input-bg: #E4E7F0; --sidebar-bg: #E4E7F0;
  --sb-active: rgba(61,107,232,0.10); --sb-accent: #3D6BE8;
  --sb-icon: #8B93A6; --sb-icon-on: #151820;
  --sb-logo-bg: #151820; --sb-logo-fg: #EEF0F5;
  --sb-name: #151820; --sb-user: #6B7280;
  --border: rgba(21,24,32,0.10); --border-hov: rgba(21,24,32,0.18);
  --text-1: #151820; --text-2: #5A6070; --text-3: #939BAA;
  --topbar-bg: #EEF0F5; --topbar-bdr: rgba(21,24,32,0.08);
  --accent: #3D6BE8; --accent-bg: rgba(61,107,232,0.08); --accent-bdr: rgba(61,107,232,0.20);
  --gb-bg: #151820; --gb-title: #EEF0F5;
  --gb-sub: rgba(238,240,245,0.50); --gb-stat: #EEF0F5;
  --gb-stat-l: rgba(238,240,245,0.5); --gb-divider: rgba(238,240,245,0.12);
  --hero-hov-sh: 0 20px 40px -15px rgba(21,24,32,0.12);
  --sub-divider: rgba(21,24,32,0.06); --card-sh: 0 20px 40px -15px rgba(21,24,32,0.08);
  --pro-bg: rgba(61,107,232,0.08); --pro-text: #3D6BE8;
  --feat-know-bg: rgba(45,106,79,0.08); --feat-know-fg: #2D6A4F;
  --feat-life-bg: rgba(232,160,85,0.10); --feat-life-fg: #C07820;
  --feat-fin-bg: rgba(61,107,232,0.08); --feat-fin-fg: #3D6BE8;
  --error-col: #B91C1C; --error-bg: rgba(239,68,68,0.07); --error-bdr: rgba(239,68,68,0.18);
}
```

### CSS Tokens — dark theme
```css
[data-theme="dark"] {
  --app-bg: #0E0F13; --main-bg: #111318; --card-bg: #181B22;
  --input-bg: #1E2230; --sidebar-bg: #111318;
  --sb-active: rgba(232,160,85,0.12); --sb-accent: #E8A055;
  --sb-icon: #4A5165; --sb-icon-on: #F2F0EC;
  --sb-logo-bg: #E8A055; --sb-logo-fg: #0E0F13;
  --sb-name: #F2F0EC; --sb-user: #5A6070;
  --border: rgba(242,240,236,0.08); --border-hov: rgba(242,240,236,0.15);
  --text-1: #F2F0EC; --text-2: #8A8880; --text-3: #555350;
  --topbar-bg: #111318; --topbar-bdr: rgba(242,240,236,0.06);
  --accent: #E8A055; --accent-bg: rgba(232,160,85,0.10); --accent-bdr: rgba(232,160,85,0.22);
  --gb-bg: #0A0B0E; --gb-title: #F2F0EC;
  --gb-sub: rgba(242,240,236,0.45); --gb-stat: #F2F0EC;
  --gb-stat-l: rgba(242,240,236,0.45); --gb-divider: rgba(242,240,236,0.10);
  --hero-hov-sh: 0 20px 40px -15px rgba(0,0,0,0.40);
  --sub-divider: rgba(242,240,236,0.05); --card-sh: 0 20px 40px -15px rgba(0,0,0,0.30);
  --pro-bg: rgba(232,160,85,0.10); --pro-text: #E8A055;
  --feat-know-bg: rgba(45,106,79,0.12); --feat-know-fg: #4CAF80;
  --feat-life-bg: rgba(232,160,85,0.10); --feat-life-fg: #E8A055;
  --feat-fin-bg: rgba(61,107,232,0.10); --feat-fin-fg: #6B8FEE;
  --error-col: #FCA5A5; --error-bg: rgba(239,68,68,0.12); --error-bdr: rgba(239,68,68,0.25);
}
```

### Global Tokens
```css
:root {
  --z-base: 1; --z-sticky: 10; --z-modal: 100; --z-toast: 200;
  --fin-col: #2D6A4F; --fin-bg: rgba(45,106,79,0.07);
  --fin-bdr: rgba(45,106,79,0.18); --fin-hdr: rgba(45,106,79,0.05);
  --know-col: #1D6FA8; --know-bg: rgba(29,111,168,0.07);
  --know-bdr: rgba(29,111,168,0.18); --know-hdr: rgba(29,111,168,0.05);
  --life-col: #A05C20; --life-bg: rgba(160,92,32,0.07);
  --life-bdr: rgba(160,92,32,0.18); --life-hdr: rgba(160,92,32,0.05);
  --red-bg: rgba(239,68,68,0.07); --red-bdr: rgba(239,68,68,0.18); --red-col: #B91C1C;
  --pink-bg: rgba(168,85,247,0.06); --pink-bdr: rgba(168,85,247,0.15); --pink-col: #7C3AED;
  --font-sans: 'Geist', sans-serif;
  --font-serif: 'Lora', serif;
  --ease-spring: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Key Dimensions
- Shell: `max-width 1440px`, `border-radius 24px`, `padding 10px`, `gap 10px`
- Shell shadow: `0 40px 120px rgba(0,0,0,0.16), 0 8px 32px rgba(0,0,0,0.08)`
- Sidebar: `width 200px`, `border-radius 16px`, `padding 16px 10px`
- Logo mark: `26×26px`, `border-radius 8px`, Lora 14px
- Nav item: `padding 8px 12px`, `border-radius 10px`, `2px` left accent bar on active
- Topbar: `padding 13px 22px`, `border-bottom 0.5px solid var(--topbar-bdr)`
- Hero grid: `grid-template-columns 1fr 1fr 1fr`, `gap 12px`, `padding 14px 16px 16px`
- Hero card: `border-radius 20px`, `box-shadow var(--card-sh)`
- Modal: `border-radius 24px`, backdrop `blur(8px) + rgba(0,0,0,0.4)`
- Onboarding: `max-width 430px`, `min-height 100dvh`, `padding 28px 24px 0`
- Toast: `bottom 24px right 24px`, `border-radius 12px`

### Animations
```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  from { background-position: -400px 0; }
  to   { background-position: 400px 0; }
}
@keyframes step-enter {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-5px); }
  40% { transform: translateX(5px); }
  60% { transform: translateX(-4px); }
  80% { transform: translateX(4px); }
}
```

### Interaction Rules
- All transitions: `all 0.3s var(--ease-spring)`
- Hover: always visible feedback
- Active: `transform: scale(0.97)` for buttons, `scale(0.95)` for small controls
- Focus-visible: `outline: 2px solid var(--accent); outline-offset: 2px`

### Hard Rules
- NEVER: `font-family: Inter/DM Sans/Roboto/system-ui`
- NEVER: `#000000`
- NEVER: `height: 100vh` → use `min-height: 100dvh`
- NEVER: `z-index: 50` → use `var(--z-*)`
- NEVER: emoji in HTML → Phosphor icons
- NEVER: external CSS files → all styles in globals.css
- ALWAYS: `font-variant-numeric: tabular-nums` on numbers
- ALWAYS: hover + active + focus-visible on every interactive element

---

## REFERENCE FILES
Place both in `/reference/` at project root before starting:
- `/reference/nook-v11.html` — dashboard source of truth
- `/reference/nook-onboarding.html` — onboarding source of truth

---

## FOLDER STRUCTURE
```
src/
  app/
    (auth)/login/page.jsx
    (auth)/signup/page.jsx
    (app)/dashboard/page.jsx
    (app)/settings/page.jsx
    onboarding/page.jsx
    api/news/route.js
    api/stocks/route.js
    api/ai-content/route.js
    api/analytics/route.js
    api/checklist-history/route.js
    layout.jsx
    page.jsx
    globals.css
  components/
    layout/Sidebar.jsx
    layout/Topbar.jsx
    layout/ThemeProvider.jsx
    layout/GreetingBanner.jsx
    home/FinanceColumn.jsx
    home/KnowledgeColumn.jsx
    home/LifestyleColumn.jsx
    sections/FinanceSection.jsx
    sections/KnowledgeSection.jsx
    sections/LifestyleSection.jsx
    sections/TrackingSection.jsx
    tracking/DailyInputs.jsx
    tracking/AnalyticsTabs.jsx
    tracking/HistoryList.jsx
    onboarding/OnboardingShell.jsx
    onboarding/steps/Step01Welcome.jsx ... Step13Plans.jsx
    ui/DayScoreRing.jsx
    ui/ShareableCard.jsx
    ui/UpgradeModal.jsx
    ui/Toast.jsx
    ui/Skeleton.jsx
    ui/Modal.jsx
    ui/CalendarModal.jsx
  hooks/useTheme.js
  hooks/useAIContent.js
  hooks/useToast.js
  lib/supabase.js
  lib/supabase-server.js
  lib/ai-prompts.js
  lib/day-score.js
  lib/chart-utils.js
  lib/isPro.js
reference/
  nook-v11.html
  nook-onboarding.html
public/manifest.json
middleware.js
CLAUDE.md
```

---

## DATABASE SCHEMA

**profiles** — id (uuid PK), first_name, last_name, email, avatar_url, phone_number, gender, pronouns, date_of_birth, timezone (default 'UTC'), country, is_pro (default false), pro_trial_ends_at, onboarding_completed (default false), created_at, updated_at, deleted_at

**user_preferences** — id, user_id (unique FK), theme (default 'calm'), news_topics (text[]), learning_topics (text[]), financial_goals, lifestyle_prefs (text[]), dashboard_section_visibility (jsonb), checklist_carry_forward_default (default true), notification_preferences (jsonb), income_goal_amount, income_goal_period, currency (default 'USD'), updated_at, **gender (text)**, **location (jsonb)**, **field (text)**, **finance_instruments (text[])**

**watchlist** — id, user_id, ticker (varchar 10), display_order, is_active, added_at — UNIQUE(user_id, ticker)

**journal_entries** — id, user_id, content, ai_prompt, mood_at_writing, word_count, date — UNIQUE(user_id, date)

**gratitude_logs** — id, user_id, entry_1, entry_2, entry_3, date — UNIQUE(user_id, date)

**checklist_items** — id, user_id, text, is_done, carry_forward, position, category, streak_count, completed_at, is_active, created_at, updated_at

**checklist_history** — id, user_id, item_id, item_text, is_done, date, day_score, created_at

**daily_tracking** — id, user_id, date UNIQUE(user_id,date), water, steps, sleep (numeric 4,1), exercise_type, exercise_mins, meals, productive_hrs, lazy_hrs, mood_morning, mood_evening, stress_morning, stress_evening, weight, notes, is_rest_day, day_score, created_at, updated_at

**expense_entries** — id, user_id, amount (numeric 10,2), currency, category, payment_method, note, is_recurring, date, is_deleted, created_at, updated_at

**income_entries** — id, user_id, amount, currency, source, note, date, created_at

**ai_content_cache** — id, user_id (nullable), content_type, content_key, content, model_version, token_count, generated_at, expires_at — UNIQUE(content_key) where user_id is null

**method_of_week** — id, user_id, method_name, method_slug, week_start, current_day, day_content (text[]), is_completed, skipped_days (int[]), rating, reflection, created_at, updated_at

**notifications** — id, user_id, type, title, message, is_read, action_url, created_at

RLS: every table — `user_id = auth.uid()`. Exception: ai_content_cache where user_id IS NULL readable by all authenticated users.

Triggers:
1. Auto-create profiles row on auth.users insert
2. Snapshot checklist_items into checklist_history on daily_tracking upsert

---

## ENVIRONMENT VARIABLES
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
NEWSDATA_API_KEY=
FMP_API_KEY=
NEXT_PUBLIC_APP_URL=
```
Server-only (never in client): SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, NEWSDATA_API_KEY, FMP_API_KEY

---

## KEY BUSINESS LOGIC

```js
// lib/isPro.js — always use this, never inline
export function isPro(profile) {
  return profile.is_pro ||
    (profile.pro_trial_ends_at && new Date(profile.pro_trial_ends_at) > new Date())
}

// lib/day-score.js
export function calculateDayScore(tracking, checklistTotal, checklistDone) {
  const sleep = Math.min((tracking.sleep || 0) / 8, 1.0)
  const water = Math.min((tracking.water || 0) / 8, 1.0)
  const steps = Math.min((tracking.steps || 0) / 10000, 1.0)
  const checklist = checklistTotal > 0 ? checklistDone / checklistTotal : 0
  const mood = ((tracking.mood_morning || 3) + (tracking.mood_evening || 3)) / 10
  return Math.round((sleep*0.25 + water*0.20 + steps*0.15 + checklist*0.20 + mood*0.20) * 100)
}
```

Day score ring colors: ≥80 → `#4ADE80` | 60–79 → `#F59E0B` | <60 → `#EF4444`

Free tier limits: 3 watchlist tickers, 5 news topics, 5 learning interests

Route protection: `/dashboard /settings /onboarding` require session. `/login /signup` redirect to `/dashboard` if session exists.

---

## QUALITY RULES (applied to every component without being asked)

1. Every interactive element: hover + active + focus-visible states
2. Every data fetch: loading skeleton + empty state
3. Every Supabase write: try/catch + error toast
4. Every number display: `font-variant-numeric: tabular-nums`
5. No hardcoded colors — CSS custom properties only
6. No inline styles except dynamic values (chart widths, ring stroke)
7. No console.log in production code
8. Optimistic UI on all toggles/checkboxes — update UI first, save second
9. Animations: transform + opacity only, never top/left/width/height
10. All tap targets: minimum 44×44px

---

## UTILITY PROMPTS

**Session start (use every time):**
```
Read CLAUDE.md fully. Tell me the current phase, what's done, and the next task.
Do not write any code until I confirm.
```

**Session end (use every time):**
```
Update the Session State and Build Progress Checklist in CLAUDE.md.
Include: completed tasks with file names, in-progress work, decisions made, next task.
Write the update directly to CLAUDE.md now.
```

**Debug:**
```
Error: [PASTE]
Happens when: [DESCRIBE]
Read relevant files. Tell me what's wrong. Show fix before applying.
```

**Visual fix:**
```
[COMPONENT] doesn't match /reference/nook-v11.html.
Issue: [DESCRIBE]
Show the diff before applying. Don't touch JS logic.
```

**Design drift check:**
```
Compare [COMPONENT] against its equivalent in /reference/nook-v11.html.
List every visual difference. Fix them without touching any JS logic.
```

**Add feature:**
```
Add [FEATURE]. It should [BEHAVIOUR]. Lives in [LOCATION].
Tell me: which files change, new DB columns, new API routes.
Show the plan. Wait for my confirmation before writing code.
```

# context-mode — MANDATORY routing rules

You have context-mode MCP tools available. These rules are NOT optional — they protect your context window from flooding. A single unrouted command can dump 56 KB into context and waste the entire session.

## BLOCKED commands — do NOT attempt these

### curl / wget — BLOCKED
Any Bash command containing `curl` or `wget` is intercepted and replaced with an error message. Do NOT retry.
Instead use:
- `ctx_fetch_and_index(url, source)` to fetch and index web pages
- `ctx_execute(language: "javascript", code: "const r = await fetch(...)")` to run HTTP calls in sandbox

### Inline HTTP — BLOCKED
Any Bash command containing `fetch('http`, `requests.get(`, `requests.post(`, `http.get(`, or `http.request(` is intercepted and replaced with an error message. Do NOT retry with Bash.
Instead use:
- `ctx_execute(language, code)` to run HTTP calls in sandbox — only stdout enters context

### WebFetch — BLOCKED
WebFetch calls are denied entirely. The URL is extracted and you are told to use `ctx_fetch_and_index` instead.
Instead use:
- `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` to query the indexed content

## REDIRECTED tools — use sandbox equivalents

### Bash (>20 lines output)
Bash is ONLY for: `git`, `mkdir`, `rm`, `mv`, `cd`, `ls`, `npm install`, `pip install`, and other short-output commands.
For everything else, use:
- `ctx_batch_execute(commands, queries)` — run multiple commands + search in ONE call
- `ctx_execute(language: "shell", code: "...")` — run in sandbox, only stdout enters context

### Read (for analysis)
If you are reading a file to **Edit** it → Read is correct (Edit needs content in context).
If you are reading to **analyze, explore, or summarize** → use `ctx_execute_file(path, language, code)` instead. Only your printed summary enters context. The raw file content stays in the sandbox.

### Grep (large results)
Grep results can flood context. Use `ctx_execute(language: "shell", code: "grep ...")` to run searches in sandbox. Only your printed summary enters context.

## Tool selection hierarchy

1. **GATHER**: `ctx_batch_execute(commands, queries)` — Primary tool. Runs all commands, auto-indexes output, returns search results. ONE call replaces 30+ individual calls.
2. **FOLLOW-UP**: `ctx_search(queries: ["q1", "q2", ...])` — Query indexed content. Pass ALL questions as array in ONE call.
3. **PROCESSING**: `ctx_execute(language, code)` | `ctx_execute_file(path, language, code)` — Sandbox execution. Only stdout enters context.
4. **WEB**: `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` — Fetch, chunk, index, query. Raw HTML never enters context.
5. **INDEX**: `ctx_index(content, source)` — Store content in FTS5 knowledge base for later search.

## Subagent routing

When spawning subagents (Agent/Task tool), the routing block is automatically injected into their prompt. Bash-type subagents are upgraded to general-purpose so they have access to MCP tools. You do NOT need to manually instruct subagents about context-mode.

## Output constraints

- Keep responses under 500 words.
- Write artifacts (code, configs, PRDs) to FILES — never return them as inline text. Return only: file path + 1-line description.
- When indexing content, use descriptive source labels so others can `ctx_search(source: "label")` later.

## ctx commands

| Command | Action |
|---------|--------|
| `ctx stats` | Call the `ctx_stats` MCP tool and display the full output verbatim |
| `ctx doctor` | Call the `ctx_doctor` MCP tool, run the returned shell command, display as checklist |
| `ctx upgrade` | Call the `ctx_upgrade` MCP tool, run the returned shell command, display as checklist |
