# Nook — Personal Growth Dashboard

Your corner to log, learn and grow.

---

## What is Nook?

Nook is a personal growth dashboard that brings together your finances, knowledge, habits, and goals in one place. It includes daily tracking, AI-powered insights, a customisable checklist, journal, and a shareable day score.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Vanilla CSS (globals.css) — no Tailwind
- **Auth + Database:** Supabase
- **AI:** Anthropic Claude (claude-sonnet-4-6)
- **Icons:** Phosphor Icons
- **News:** NewsData.io
- **Stock prices:** Financial Modeling Prep (FMP)
- **Deploy:** Vercel

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/nook.git
cd nook
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

Required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=         # From Supabase project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # From Supabase project settings
SUPABASE_SERVICE_ROLE_KEY=        # From Supabase project settings (server only)
ANTHROPIC_API_KEY=                # From console.anthropic.com
NEWSDATA_API_KEY=                 # From newsdata.io
FMP_API_KEY=                      # From financialmodelingprep.com
NEXT_PUBLIC_APP_URL=              # http://localhost:3000 for local
```

### 4. Set up the database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run `supabase/schema.sql` (creates all 13 tables + RLS + triggers)
4. Run the migration SQL for new columns (in `supabase/migrations/001_add_onboarding_columns.sql`)

### 5. Add reference files

Copy your HTML design files into the `/reference/` folder:

```
/reference/nook-v11.html       ← Dashboard design source of truth
/reference/nook-onboarding.html ← Onboarding flow source of truth
```

These are read by Claude Code during development — they are not served to users.

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
  app/              ← Next.js App Router pages + API routes
  components/       ← All UI components
    layout/         ← Shell, Sidebar, Topbar, GreetingBanner
    home/           ← 3 hero column components
    sections/       ← Expanded section views
    tracking/       ← DailyInputs, Charts, History
    onboarding/     ← 13-step onboarding flow
    ui/             ← Shared UI: Toast, Modal, Skeleton, etc
  hooks/            ← useTheme, useAIContent, useToast
  lib/              ← Supabase clients, AI prompts, day score, charts
reference/          ← HTML design files (dev only)
public/             ← Static assets, PWA manifest
middleware.js       ← Route protection
CLAUDE.md           ← Project bible for Claude Code sessions
PROMPTS.md          ← Build prompts, one per task
```

---

## Design System

Nook uses a custom CSS design system defined entirely in `src/app/globals.css`.

- **3 themes:** calm (warm sand), regular (cool slate), dark
- **Fonts:** Geist (UI) + Lora (display/headings)
- **Tokens:** All colors, shadows, spacing defined as CSS custom properties
- **No Tailwind** — all styles in globals.css using var(--token-name)

Switch themes via the sidebar toggle. Theme persists in localStorage.

---

## Building with Claude Code

This project uses Claude Code for development. See `PROMPTS.md` for the full build prompt library and `CLAUDE.md` for the project bible.

**Every session starts with:**
```
Read CLAUDE.md fully. Tell me the current phase, what's done, and the next task.
Do not write any code until I confirm.
```

**Every session ends with:**
```
Update the Session State and Build Progress Checklist in CLAUDE.md.
Write the update directly to CLAUDE.md now.
```

---

## Key Features

| Feature | Status |
|---|---|
| 3-theme design system | ✅ |
| Financial dashboard (stocks, expense log, income) | 🔨 |
| Knowledge hub (news, concepts, deep dives) | 🔨 |
| Lifestyle (checklist, journal, gratitude, stress) | 🔨 |
| Daily tracking + day score | 🔨 |
| Analytics (daily/weekly/monthly charts) | 🔨 |
| AI-powered content + insights | 🔨 |
| 12-step onboarding flow | 🔨 |
| PWA (installable) | 🔨 |
| Mobile responsive | 🔨 |

---

## Environment Variable Reference

| Variable | Where to get it | Used in |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project settings | Client + server |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase project settings | Client + server |
| SUPABASE_SERVICE_ROLE_KEY | Supabase project settings | Server only |
| ANTHROPIC_API_KEY | console.anthropic.com | Server only |
| NEWSDATA_API_KEY | newsdata.io | Server only |
| FMP_API_KEY | financialmodelingprep.com | Server only |
| NEXT_PUBLIC_APP_URL | Your deployment URL | Client |

**Important:** Never put server-only keys in client components. Any key without `NEXT_PUBLIC_` prefix is server-only.

---

## Deploying to Vercel

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables in Vercel project settings
4. Deploy — Vercel auto-deploys on every push to `main`

---

## License

Private project.
