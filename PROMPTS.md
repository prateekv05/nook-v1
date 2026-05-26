# Nook — Build Prompts
## One prompt per task. Run in order. Never skip ahead.

> **Rule:** After every prompt completes, run the session-end prompt to update CLAUDE.md before starting the next one.
>
> **Session end (run after every task):**
> ```
> Update the Session State and Build Progress Checklist in CLAUDE.md.
> Mark [TASK] as done. Set next task to [NEXT TASK].
> Write the update directly to CLAUDE.md now.
> ```

---

## PHASE 0 — SETUP

### 0.1 — Project Scaffold
```
Read CLAUDE.md fully before doing anything.

Create a new Next.js 14 project called "nook":
- TypeScript: No
- ESLint: Yes
- Tailwind: No
- src/ directory: Yes
- App Router: Yes
- Import alias: No

After scaffolding:
npm install @supabase/supabase-js

I have created a /reference/ folder in the project root.
Also, copied nook-v11.html and nook-onboarding.html into /reference/.

Show me the full folder structure when done.
Do not create any components yet.
```

### 0.2 — globals.css
```
Read CLAUDE.md. Read /reference/nook-v11.html.

Extract the complete <style> block from nook-v11.html and write it into src/app/globals.css.

Then make these improvements:
- Add @keyframes shimmer, fade-up, step-enter, shake (exact values from CLAUDE.md)
- Add transition: all 0.15s ease-out as a base default on all interactive elements: button, a, [role="button"]
- Add :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; } globally
- Add ::-webkit-scrollbar styling (width 4px, transparent track, var(--border-hov) thumb)
- Ensure min-height: 100dvh is used everywhere — replace any height: 100vh

Do not change any CSS custom property names or values.
Do not add Tailwind. Do not create any other CSS files.
Show me the first 80 lines of globals.css when done.
```

### 0.3 — layout.jsx
```
Read CLAUDE.md.

Build src/app/layout.jsx:
- 'use client' is NOT needed here — this is the root server layout
- Add Google Fonts link: Geist (300,400,500,600) + Lora (400,500,italic variants)
- Add Phosphor Icons script: https://unpkg.com/@phosphor-icons/web
- Import ./globals.css
- Set data-theme="calm" on <html> element to prevent theme flash
- Add PWA meta tags: theme-color #F7F3EE, apple-mobile-web-app-capable, apple-mobile-web-app-status-bar-style
- Add <link rel="manifest" href="/manifest.json">
- Wrap children in a ThemeProvider import (placeholder — we build ThemeProvider next)
- Set <body> with font-family var(--font-sans) via className

Keep it clean — no inline styles, no hardcoded colors.
```

### 0.4 — Component Shell Files
```
Read CLAUDE.md. Look at the folder structure section.

Create every component file listed under src/components/ and src/hooks/ and src/lib/ as empty placeholder exports:

export default function ComponentName() {
  return <div data-component="ComponentName">ComponentName placeholder</div>
}

For hooks use:
export function useHookName() { return {} }

For lib files use:
export function placeholder() {}

Do not write any real logic yet — just the placeholder exports.
Create every file in the exact paths listed in CLAUDE.md.
Show me the folder tree when done.
```

### 0.5 — PWA Manifest
```
Create public/manifest.json:
{
  "name": "Nook",
  "short_name": "Nook",
  "description": "Your corner to log, learn and grow",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#F7F3EE",
  "theme_color": "#F7F3EE",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}

Create placeholder icon files: public/icon-192.png and public/icon-512.png (1x1 transparent PNGs are fine for now).
```

### 0.6 — ThemeProvider + useTheme
```
Read CLAUDE.md design system section — theme system rules.

Build src/components/layout/ThemeProvider.jsx:
- 'use client' directive
- On mount: read localStorage key 'nook-theme', default to 'calm'
- Set data-theme on document.documentElement immediately on mount
- Expose setTheme(theme) via React context — valid values: 'calm' | 'regular' | 'dark'
- Save new theme to localStorage and update document.documentElement on every setTheme call
- No flash: set the attribute synchronously in a useLayoutEffect, not useEffect

Build src/hooks/useTheme.js:
- Returns { theme, setTheme } from the ThemeProvider context

Update src/app/layout.jsx to wrap children in <ThemeProvider>.

Test: switching theme should update data-theme instantly with no flash.
```

### 0.7 — Vercel Deploy
```
Help me deploy this Next.js project to Vercel.

Give me step-by-step instructions:
1. Push to GitHub (exact git commands)
2. Connect repo to Vercel (what to click)
3. Which environment variables to add in Vercel dashboard (exact names from CLAUDE.md)
4. How to verify the deploy worked
5. How to set up automatic deploys on push to main

Do not write any code — just the instructions.
```

---

## PHASE 1 — LAYOUT SHELL

### 1.1 — Shell Wrapper
```
Read CLAUDE.md. Read /reference/nook-v11.html — look at the .shell and .main CSS classes and the HTML structure.

Build the app shell in src/app/(app)/dashboard/page.jsx:
- 'use client' directive
- Outer div with className="shell" — flex row, max-width 1440px, the exact shadow from CLAUDE.md
- Left: <Sidebar /> component (import placeholder)
- Right: <div className="main"> containing <Topbar /> and a main content area
- The main content area renders one active view at a time: home-view | expanded-view | settings-view
- Use a useState('home') to track active view — pass setView and currentView as props
- Body has background var(--app-bg), padding 20px, centers the shell

Match the shell CSS exactly from nook-v11.html. No Tailwind classes.
```

### 1.2 — Sidebar
```
Read CLAUDE.md. Read /reference/nook-v11.html — study the entire sidebar CSS and HTML (everything inside .sidebar).

Build src/components/layout/Sidebar.jsx:
- 'use client' directive
- Accept props: currentView, setView, currentSection, setSection
- Logo row: 26×26px mark with Lora N + "Nook" wordmark
- Nav items: Dashboard, Financial, Knowledge, Lifestyle, Tracking
  - Each uses .s-item class with Phosphor icon + label
  - Active state: .s-item.active — left accent bar via ::before pseudo-element
  - Clicking Financial/Knowledge/Lifestyle/Tracking calls setSection and setView('expanded')
  - Clicking Dashboard calls setView('home')
- Spacer + divider
- Theme toggle: 3 buttons (sun/moon/coffee icons) using useTheme hook
  - Active button gets .active class
  - Tooltips on hover: Regular / Dark / Calm
- Divider
- Settings nav item — calls setView('settings')
- User row: avatar with initials "AL", name "Alex Lewis" (hardcoded for now)

Apply ALL hover/active/focus-visible states exactly as in nook-v11.html.
All icon classes use ph-bold weight.
```

### 1.3 — Topbar
```
Read CLAUDE.md. Read /reference/nook-v11.html — study the .topbar and all its child component CSS and HTML.

Build src/components/layout/Topbar.jsx:
- 'use client' directive
- Accept props: currentView, setView, setSection
- Left: date badge — today's date formatted as "Monday, 21 April 2026", uppercase, small, var(--text-3)
- Right cluster (in order):
  1. Search — collapsed to 34px icon by default, expands to 190px on click
     - toggleSearch() opens/closes — use useState
     - collapseSearch() on input blur
  2. Notification bell button — 34px circle, has red dot indicator
  3. Share ghost button (log-btn-ghost style) — calls openShareModal (prop or context, stub for now)
  4. "Log today" primary button (log-btn style) — calls setSection('tracking') + setView('expanded')

Apply ALL interaction states exactly as in nook-v11.html.
Use today's actual date from new Date() — not hardcoded.
```

### 1.4 — Main Wrapper + View Router
```
Read CLAUDE.md.

Update src/app/(app)/dashboard/page.jsx to complete the view routing:

State to manage:
- currentView: 'home' | 'expanded' | 'settings'
- currentSection: 'financial' | 'knowledge' | 'lifestyle' | 'tracking' | null

The main content area renders:
- currentView === 'home' → <div id="home-view"> containing <GreetingBanner /> + <HeroGrid />
- currentView === 'expanded' → <div id="expanded-view"> containing the correct section component based on currentSection
- currentView === 'settings' → <div id="settings-view"> containing <SettingsView />

Pass setView, setSection, currentSection as props down to Sidebar and Topbar.
Each section component receives onBack prop that calls setView('home').

All view transitions: CSS opacity + translateY using the fade-up keyframe (add/remove a .visible class).
```

---

## PHASE 2 — HOME VIEW

### 2.1 — GreetingBanner
```
Read CLAUDE.md. Read /reference/nook-v11.html — study .greeting-banner, .gb-inner, .gb-text, .gb-stats, .gb-stat, .gb-divider, .day-score-ring and all related CSS.

Build src/components/layout/GreetingBanner.jsx:
- 'use client' directive
- Dark background card (.gb-inner) with grain texture overlay (the SVG noise filter from nook-v11.html)
- Left: serif greeting "Good morning, Alex" (h2) + subtext
- Right: glass stat cluster (.gb-stats) with backdrop-filter blur(12px)
  - Stat 1: "5/7" Goals done
  - Divider
  - Stat 2: smiley icon for Mood
  - Divider
  - Stat 3: "Day 3" Streak
  - Divider
  - Day score ring: 52×52px SVG ring, stroke #4ADE80, score "72" centered
- The ring stroke-dashoffset animates from 0 to the correct value on mount (CSS transition 0.7s)
- Greeting text uses time of day: Good morning / Good afternoon / Good evening

Match the exact CSS — glass effect, inner shadow, grain overlay.
All values from nook-v11.html, no invention.
```

### 2.2 — DayScoreRing
```
Read CLAUDE.md — day score ring colors section.
Read /reference/nook-v11.html — .day-score-ring, .ring-bg, .ring-fill, .day-score-val CSS.

Build src/components/ui/DayScoreRing.jsx:
- Accept props: score (number 0–100), size (default 52), strokeWidth (default 4)
- SVG ring with:
  - Background stroke: var(--gb-divider) when inside greeting banner, var(--border) elsewhere
  - Fill stroke color: #4ADE80 (≥80), #F59E0B (60–79), #EF4444 (<60)
  - stroke-dashoffset calculated from score: circumference = 2 * π * r, offset = circumference * (1 - score/100)
  - CSS transition: stroke-dashoffset 0.7s var(--ease-spring) on mount animation from 0 to final value
- Score number centered using absolute positioning
- Rotated -90deg so fill starts at top

This component is used in GreetingBanner (large) and HistoryList rows (small).
```

### 2.3 — HeroGrid
```
Read CLAUDE.md. Read /reference/nook-v11.html — .hero-grid, .hero-col, .hero-header, .hero-body CSS.

Build src/components/home/HeroGrid.jsx as a wrapper:
- 'use client' directive
- Accept props: setView, setSection
- .hero-grid: CSS grid, 3 equal columns, gap 12px, padding 14px 16px 16px
- Renders: <FinanceColumn />, <KnowledgeColumn />, <LifestyleColumn />
- Each column receives: onExpand={() => { setSection('financial'); setView('expanded'); }}
- Staggered fade-up animation on mount: animation-delay 0ms / 80ms / 160ms via CSS nth-child
```

### 2.4 — FinanceColumn
```
Read CLAUDE.md. Read /reference/nook-v11.html — study the entire Finance hero column HTML and CSS: .hero-header.fin, .ticker-row, .word-title, .word-def, .tip-text, .sent-chips, .hero-exp-list, all sub-sections.

Build src/components/home/FinanceColumn.jsx:
- 'use client' directive
- Accept props: onExpand
- Entire card is clickable (calls onExpand)
- Header: green fin icon (ph-currency-dollar) + "Financial" label + expand arrow
- 3 sub-sections (use .sub-section with .sub-label):

  Sub 1 — Watchlist (3 tickers, hardcoded for now):
  AAPL / Apple Inc / $189.42 / +1.2%
  MSFT / Microsoft / $412.18 / -0.4%
  TSLA / Tesla / $185.60 / +3.1%
  Each row: .ticker-row with .t-sym, .t-name, .t-price, .up/.dn

  Sub 2 — Word of the Day:
  "Dollar-Cost Averaging"
  "Investing a fixed amount regularly regardless of price — smoothing out market volatility over time."

  Sub 3 — Today's Tip (italic):
  "Review your subscriptions monthly — the average person forgets 3 active subscriptions."

Apply ALL CSS exactly. Overflow hidden on the card body.
```

### 2.5 — KnowledgeColumn
```
Read CLAUDE.md. Read /reference/nook-v11.html — study the Knowledge hero column: .hero-header.know, .news-item, .news-tag, .news-title, .did-you-know, .concept-name, .concept-def.

Build src/components/home/KnowledgeColumn.jsx:
- 'use client' directive
- Accept props: onExpand
- Header: blue know icon (ph-book-open) + "Knowledge" label + expand arrow
- 3 sub-sections:

  Sub 1 — Top News (3 items, hardcoded):
  [AI] "OpenAI releases new reasoning model with improved coding abilities" · TechCrunch
  [Markets] "Fed signals two rate cuts possible in 2026 as inflation cools" · Reuters
  [Science] "New study links sleep quality directly to decision-making performance" · Nature

  Sub 2 — Did You Know:
  "The human brain processes visual information 60,000× faster than text, yet we spend 90% of learning time reading."

  Sub 3 — Concept of the Day:
  "Compounding" + 2-line definition

All news tags use the correct color coding from nook-v11.html.
```

### 2.6 — LifestyleColumn
```
Read CLAUDE.md. Read /reference/nook-v11.html — study the Lifestyle hero column: .hero-header.life, .cl-progress, .check-item, .cb, .track-chips, .tc, .method-block, .pos-block.

Build src/components/home/LifestyleColumn.jsx:
- 'use client' directive
- Accept props: onExpand
- Header: amber life icon (ph-heart) + "Lifestyle" label + expand arrow
- 3 sub-sections:

  Sub 1 — Checklist (3 items, interactive):
  Morning workout · Review finances · Read 20 minutes
  Ticking a checkbox: updates local state, animates the .cb to .done state (scale + color)
  Progress bar above checklist updates in real time

  Sub 2 — Today's Tracking (3×1 grid of chips):
  Water: 5/8 · Steps: 7,420 · Sleep: 7.5h
  Each chip: .tc with label + value + mini progress bar

  Sub 3 — Method of the Week:
  "Pomodoro Technique" + short quote + 5-day progress dots (day 3 active)

All interaction states on checkboxes exactly as in nook-v11.html.
```

---

## PHASE 3 — EXPANDED SECTIONS

### 3.1 — FinanceSection
```
Read CLAUDE.md. Read /reference/nook-v11.html — study the entire financial expanded section HTML and CSS from #expanded-view when section is financial.

Build src/components/sections/FinanceSection.jsx:
- 'use client' directive
- Accept props: onBack
- Back button at top left
- Two-column layout: left panel (inputs/watchlist) + right panel (charts/expense)
- Left panel:
  - Watchlist with add input (text field + Add button) — local state only for now
  - Sentiment chips for each ticker (Bullish/Neutral badges)
  - Income goal tracker: progress bar, "Log income" form stub
- Right panel:
  - Expense log with 3 tabs: Today / Monthly / 3-Month
  - Today tab: expense list with category + amount, running total, Add expense form
  - Chart tab stubs for Monthly and 3-Month (placeholder canvas elements with shimmer)
  - Word of the Day card (full expanded version with definition)
  - Financial tip card

All CSS from nook-v11.html. No new styles invented.
```

### 3.2 — KnowledgeSection
```
Read CLAUDE.md. Read /reference/nook-v11.html — study the knowledge expanded section.

Build src/components/sections/KnowledgeSection.jsx:
- 'use client' directive
- Accept props: onBack
- Back button at top
- Two-column layout
- Left panel:
  - Full news list (5 articles) with tags, title, summary, source, "Read more" link
  - Filter tabs: All / AI / Markets / Science / other topics
- Right panel:
  - Concept of the Day — full card
  - Did You Know — full card
  - Deep Dive card stub (Pro badge)
  - Learning streak counter

All CSS from nook-v11.html.
```

### 3.3 — LifestyleSection
```
Read CLAUDE.md. Read /reference/nook-v11.html — study the lifestyle expanded section in full.

Build src/components/sections/LifestyleSection.jsx:
- 'use client' directive
- Accept props: onBack
- Back button at top
- Two-column layout
- Left panel:
  - Full checklist: add item, tick items, filter buttons (All / Active / Done), history calendar button
  - Journal: textarea + submit button → switches to read mode with edit button on submit
  - Gratitude log: 3 inputs + save button + "View history" toggle
- Right panel:
  - Stress check-in: dual grid (morning/evening), emoji buttons 1–5
  - Method of the Week: full card with day content, progress dots, mark day done button
  - Feedback section: star rating + reflection textarea
  - Positivity strip at bottom

All interactions local state for now. All CSS from nook-v11.html.
```

### 3.4 — TrackingSection + DailyInputs
```
Read CLAUDE.md. Read /reference/nook-v11.html — study the tracking expanded section.

Build src/components/sections/TrackingSection.jsx as the wrapper.
Build src/components/tracking/DailyInputs.jsx as the main input panel.

DailyInputs layout — 4 grouped sections:

Body group:
- Water: 8 tap-to-fill cups (.e-water-cup), filled cups get .filled class
- Steps: number input
- Sleep: number input, step 0.5, min 0, max 24
- Weight: optional number input

Energy group:
- Exercise: text input (type) + number input (minutes)
- Meals: segmented control — 1 / 2 / 3 / 3+ (.e-meal-btn, active state)
- Rest day toggle: when on, grey out exercise fields

Focus group:
- Productive hours: range slider (0–12), live label: "Getting started"(0–2) / "Focused"(3–5) / "Deep work"(6–8) / "Excellent"(9+)
- Lazy hours: range slider (0–12), live label: "Balanced" / "High rest" / "Too much downtime"

Reflection group:
- Mood morning + evening: emoji buttons (😌😊😐😕😤 = values 1–5)
- Notes: text input

Day score ring (live, updates on every input change):
- Use DayScoreRing component
- calculateDayScore from lib/day-score.js (hardcoded checklist 3/5 for now)
- Score label: "Room to grow" / "Decent day" / "Good day ✓" / "Excellent ✦"

"Lock today's progress" button at bottom:
- Shows completion confirmation: "Day recorded ✓" with brief scale-in animation

All CSS from nook-v11.html. All local state only for now.
```

### 3.5 — AnalyticsTabs
```
Read CLAUDE.md. Read /reference/nook-v11.html — study the analytics section: .chart-tabs, .chart-panel, .chart-mini-card, .chart-legend, .chart-grid-2, .hist-rings-scroll.

Build src/components/tracking/AnalyticsTabs.jsx:
- 'use client' directive
- 3 tabs: Daily / Weekly / Monthly

Daily panel:
- 4 mini stat cards in 2×2 grid: Sleep avg, Steps avg, Water avg, Productive hrs avg
- Day score breakdown: 5 animated bars (Sleep 25%, Water 20%, Steps 15%, Checklist 20%, Mood 20%)
- Each bar animates width on mount

Weekly panel:
- Horizontal scroll ring timeline at top (7 rings for last 7 days, using DayScoreRing small variant)
- Placeholder canvas elements for: Sleep line chart, Productivity bar chart, Steps bar chart
- Each canvas wrapped in a container with .chart-shimmer until chart renders

Monthly panel:
- Placeholder canvases for: Sleep trend, Habit consistency heatmap, Best days
- Monthly averages grid (4 mini cards)

Extract canvas drawing utilities into src/lib/chart-utils.js:
- drawLineChart(canvas, labels, datasets, options)
- drawBarChart(canvas, labels, datasets, options)
Use hardcoded sample data for now. Charts must respond to theme changes via MutationObserver on data-theme.
```

### 3.6 — HistoryList
```
Read CLAUDE.md. Read /reference/nook-v11.html — study .history-list, .history-row, .history-row-head, .history-chip, .history-detail, .history-detail-grid.

Build src/components/tracking/HistoryList.jsx:
- 'use client' directive
- 15 collapsible rows using hardcoded sample data
- Each row header: date label + chips (tasks ✓, water, sleep) + DayScoreRing (small, 36px)
- Expand/collapse: smooth max-height transition (CSS)
- Expanded detail: 4-column grid (water, steps, sleep, score) + checklist tasks
- Today's row: highlighted with soft accent background
- Chips use Phosphor icons (ph-drop for water, ph-moon for sleep) — no emoji
```

---

## PHASE 4 — MODALS + OVERLAYS

### 4.1 — Toast
```
Read CLAUDE.md — .toast CSS values.
Read /reference/nook-v11.html — .toast CSS.

Build src/components/ui/Toast.jsx + src/hooks/useToast.js:

Toast context provider:
- showToast(message, type='success') — adds toast to queue
- Types: 'success' (var(--fin-col)), 'error' (var(--red-col)), 'info' (var(--know-col))
- Auto-dismisses after 2.5s
- Appears with slide-up animation (translateY 8px → 0 + opacity), disappears with reverse

useToast hook returns { showToast }.

Wrap the app in ToastProvider inside layout.jsx.

Position: fixed, bottom 24px, right 24px, z-index var(--z-toast).
Multiple toasts stack vertically with gap.
```

### 4.2 — UpgradeModal
```
Read CLAUDE.md. Read /reference/nook-v11.html — .upgrade-modal, .upgrade-box and all child CSS.

Build src/components/ui/UpgradeModal.jsx:
- Accept props: isOpen, onClose
- Backdrop: fixed inset, blur(8px) + rgba(0,0,0,0.4), z-index var(--z-modal)
- Modal box: 400px wide, border-radius 24px, centered
- Accent icon at top (ph-star)
- Serif title: "Unlock Nook Pro"
- Description text
- Feature list with checkmarks (5 items from CLAUDE.md Pro features)
- Price: "$6.99/mo" in serif, large, accent color
- Sub: "or $59.99/yr · save 29%"
- Primary CTA: "Start 7-day free trial" (upgrade-cta style)
- Dismiss link below
- Close on backdrop click or dismiss

Match every CSS value exactly from nook-v11.html.
```

### 4.3 — ShareModal + ShareableCard
```
Read CLAUDE.md. Read /reference/nook-v11.html — .share-modal, .share-box, .share-card and all child CSS.

Build src/components/ui/ShareableCard.jsx (the dark card inside the modal).
Build src/components/ui/ShareModal.jsx (the modal wrapper).

ShareableCard:
- Dark gradient background: linear-gradient(135deg, #1C1410 0%, #2D2018 100%)
- Decorative circle in bottom-right corner
- Nook logo mark + wordmark in top-left
- User name "Alex Lewis" in serif, 22px
- Date range "Week of May 19–25, 2026"
- 2×2 stats grid: Avg Sleep, Days Active, Days Exercised, Streak
- Day score row at bottom with bar

ShareModal:
- Accept props: isOpen, onClose
- Renders ShareableCard + action buttons
- "Copy link" button: copies window.location.href, shows toast "Link copied ✓"
- "Save image" button: shows toast "Image saved ✓" (stub)
- Close button top-right

Match all CSS exactly from nook-v11.html.
```

### 4.4 — CalendarModal
```
Read CLAUDE.md. Read /reference/nook-v11.html — .cal-modal, .cal-box, .cal-grid, .cal-day CSS.

Build src/components/ui/CalendarModal.jsx:
- Accept props: isOpen, onClose
- 5-column grid of 15 day cells
- Each cell: date, status icon (green/amber/red based on completion), task count
- Colors: green = all done, amber = some done, red = none done
- Click on cell: expands to show individual task list below grid
- Hardcoded sample data for 15 days

Match CSS exactly from nook-v11.html.
```

---

## PHASE 5 — SETTINGS

### 5.1 — Settings View
```
Read CLAUDE.md. Read /reference/nook-v11.html — #settings-view, .sett-card, .sett-card-title, .sett-row, .sett-input, .topic-pills, .topic-pill, .toggle-sw CSS.

Build src/app/(app)/settings/page.jsx (or as a view component, whichever fits your routing):
- 'use client' directive
- Max-width 700px content area, padded, scrollable
- Each section in a .sett-card with serif title

Section 1 — Account:
First name, last name inputs (.sett-input). Timezone dropdown. Save button.

Section 2 — Appearance:
3 theme buttons inline (same as sidebar theme toggle).

Section 3 — News Topics:
Pill grid, max 5 selectable (.topic-pill, .topic-pill.sel). 15 topic options.

Section 4 — Learning Interests:
Pill grid, max 5 (.topic-pill.sel-life). 15 learning options.

Section 5 — Lifestyle Features:
4 toggle rows (Journal, Gratitude, Checklist, Stress check-in). All on by default.

Section 6 — Income Goal:
Amount input + period select (Monthly/Yearly).

Section 7 — Notifications:
3 toggle rows (Daily check-in, Weekly reflection, Streak alerts). Note: UI only for now.

Section 8 — Upgrade card:
Pro features list + "Start free trial" CTA using upgrade card styling from nook-v11.html.

Single "Save changes" button at bottom — shows toast "Settings saved ✓".
All local state for now.
```

---

## PHASE 6 — ONBOARDING

### 6.1 — OnboardingShell
```
Read CLAUDE.md. Read /reference/nook-onboarding.html — study the step system: .ob-step, .ob-step.active, .ob-topnav, .ob-back-btn, .ob-progress, .ob-prog-seg, .ob-cta-area, .ob-cta-btn, step-enter animation.

Build src/components/onboarding/OnboardingShell.jsx:
- 'use client' directive
- Manages step state: currentStep (1–13)
- State object for all collected data:
  const [state, setState] = useState({
    name: { first: '', last: '' },
    email: '', confirmEmail: '',
    gender: '',
    location: { city: '', state: '', zip: '' },
    field: '', fieldOther: '',
    topics: [],
    learning: [],
    finance: []
  })
- Renders the correct step component based on currentStep
- Passes state, setState, onNext, onBack to each step
- onNext increments step, onBack decrements
- Step transition: removes active class, adds it to new step with step-enter animation (0.35s)
- Progress bar: shown on steps 4–12 (9 segments), not on 1–3 or 13
- Back button: shown on steps 2–12, not on 1 or 13
- Step label: "Step X of 9" shown top-right on steps 4–12

Shell layout: full-screen, max-width 430px, centered, min-height 100dvh, padding 28px 24px 0.
Match all CSS from nook-onboarding.html exactly.
```

### 6.2 — Steps 1–6
```
Read CLAUDE.md. Read /reference/nook-onboarding.html — study steps 1–6 HTML and CSS in detail.

Build each step as a separate component in src/components/onboarding/steps/:

Step01Welcome.jsx — step 1:
- Nook logo mark + wordmark centered top
- Orb: 120px circle, radial gradient using var(--accent), glow-pulse animation
- Phosphor icon inside orb: ph-sparkle
- Serif headline: "Your corner to log, learn and grow."
- Subtext: "One place for finances, knowledge, habits and goals."
- 3 feature rows: Log (ph-pencil-line) / Learn (ph-books) / Grow (ph-trend-up)
  Each row: icon in tinted circle + label + description using feat token colors
- CTA button: "Get started →" → onNext
- Text link: "Already have an account? Sign in" → /login

Step02Auth.jsx — step 2:
- Large serif headline: "Welcome." (36px)
- Subtext: "Sign in or create your account."
- 3 auth buttons (ob-auth-btn style): Google / Apple / Email
  Each: icon left-aligned, label centered, white card surface
- Divider "or"
- Link: "New here? Create account" → onNext

Step03Signup.jsx — step 3:
- Small badge: "FREE 7-DAY TRIAL · NO CARD NEEDED" (accent color, uppercase)
- Serif headline: "Grow with intention. Every single day."
- Subtext: "Cancel anytime."
- Feature list card (5 rows with icons + title + subtitle):
  AI Coach / Advanced Analytics / Custom Goals / Export Data / Priority Support
  Icons use feat token colors per category
- Social proof: "12,400+ people growing with Nook"
- CTA: "Start free trial" → onNext
- Link: "See all plans" → jump to step 13

Step04Name.jsx — step 4:
- Headline: "What should we call you?"
- Subtext: "This is how we'll greet you inside Nook."
- Two inputs side by side (ob-form-row): First name, Last name
- Labels uppercase, inputs use .ob-input style with validation states
- Privacy note below: "Your name is only used to personalise your experience."
- CTA: "Continue" → validates non-empty → onNext

Step05Reach.jsx — step 5:
- Headline: "Where should we reach you?"
- Email input with validation (valid email format)
- Confirm email input with match validation
- Inline error messages (.ob-field-error) on mismatch
- Show ✓ / ✗ status icon in input on change
- Privacy note: "We'll only email what matters. No spam, ever."
- CTA: "Continue" → validates → onNext

Step06Gender.jsx — step 6:
- Headline: "How do you identify?"
- Subtext: "Optional — helps us personalise your experience."
- 5 selectable pills (single select): Man / Woman / Non-binary / Prefer not to say / Other
- Selected pill uses .ob-pill.sel style (fin accent)
- "Skip" text link → onNext without saving gender
- CTA: "Continue" → onNext

Match ALL CSS from nook-onboarding.html exactly — every interaction state, every animation.
```

### 6.3 — Steps 7–12
```
Read CLAUDE.md. Read /reference/nook-onboarding.html — study steps 7–12 HTML and CSS.

Build each in src/components/onboarding/steps/:

Step07Location.jsx — step 7:
- Headline: "Where are you based?"
- 3 inputs stacked: City, State, ZIP code (all .ob-input)
- CTA: "Continue" → onNext

Step08Field.jsx — step 8:
- Headline: "What's your field?"
- Subtext: "We'll tailor your financial and knowledge content."
- Single-select pill grid (13 options):
  Technology, Finance, Healthcare, Education, Law, Marketing, Design,
  Engineering, Science, Business, Arts, Government, Other
- "Other" pill: when selected, reveals a text input below with .ob-input style
- CTA: "Continue" → onNext

Step09Topics.jsx — step 9:
- Headline: "What topics interest you?"
- Subtext: "Pick up to 5 — drives your daily news feed."
- Multi-select pills (max 5, 15 options):
  AI & Technology, Business & Markets, Geopolitics, Health & Medicine,
  Science & Space, Environment, Culture & Society, Sports,
  Law & Policy, Psychology, Philosophy, History, Economics, Design, Finance
- Counter: "X of 5 selected" (.ob-count)
- Pills beyond 5 disabled (opacity 0.4, pointer-events none) when max reached
- CTA disabled until ≥1 selected
- CTA: "Continue" → onNext

Step10Learn.jsx — step 10:
- Headline: "What do you want to learn?"
- Subtext: "Shapes your Concept of the Day and reading list."
- Multi-select pills (max 5, 15 options, .ob-pill.sel-know style):
  Personal Development, Philosophy, Psychology, History, Economics,
  Leadership, Science, Writing, Technology & AI, Creativity,
  Ethics & Society, Entrepreneurship, Stoicism, Productivity, Investing
- Counter + max-5 logic same as step 9
- CTA: "Continue" → onNext

Step11Finance.jsx — step 11:
- Headline: "What financial instruments interest you?"
- Subtext: "We'll personalise your Financial dashboard."
- Multi-select pills (no max, .ob-pill.sel-life style):
  Stocks, ETFs, REITs, Real Estate, Crypto, Bonds, Index Funds, No idea yet
- "No idea yet": when selected, deselects all others and locks others as disabled
- CTA: "Continue" → onNext

Step12Ready.jsx — step 12:
- No progress bar, no back button
- Orb with checkmark icon, ring-pulse animation around it
- Serif headline: "Your Nook is ready." (34px)
- Subtext using state.name.first: "[Name], your corner is set up. A 7-day Pro trial is active."
- Summary card (.ob-summary-rows) showing real selections from state:
  - News topics count + comma-separated list
  - Learning interests count + comma-separated list
  - Financial instruments + comma-separated list
- Trial badge: "7-DAY PRO TRIAL ACTIVE · NO CARD NEEDED"
- CTA: "Go to my dashboard →" → navigates to /dashboard

Match ALL CSS from nook-onboarding.html.
```

### 6.4 — Plans Page
```
Read CLAUDE.md. Read /reference/nook-onboarding.html — study step 13 (plans page).

Build src/components/onboarding/steps/Step13Plans.jsx:
- Back button → go back to step 3
- Serif headline: "Simple, honest pricing."
- Subtext: "Start free. Upgrade when you're ready."
- Two plan cards side by side (stack on narrow):

  Free card:
  - "$0" price
  - Feature list: 3 stocks, 5 news topics, Journal, Checklist, Tracking, Day Score
  - CTA: "Continue for free" → jump to step 4

  Pro card (accent background, elevated):
  - "$6.99/mo" + "$59.99/yr · save 29%" toggle
  - Feature list: everything in Free + Unlimited stocks, AI insights, AI Coach,
    Advanced Analytics, Custom Goals, Export Data, Priority Support
  - "Most popular" badge
  - CTA: "Start 7-day free trial" → jump to step 4

- Social proof: "12,400+ people growing with Nook Pro"

Match CSS from nook-onboarding.html. Pro card uses accent color treatment.
```

---

## PHASE 7 — AUTH + SUPABASE

### 7.1 — Supabase Setup
```
Read CLAUDE.md — environment variables section and database schema.

Create src/lib/supabase.js:
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

Create src/lib/supabase-server.js:
// SERVER-SIDE ONLY — never import this in client components
import { createClient } from '@supabase/supabase-js'
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

Create .env.local with all 7 placeholder variables from CLAUDE.md.
Confirm .env.local is in .gitignore.
```

### 7.2 — Database Tables
```
Read CLAUDE.md — full database schema section.

Write a single SQL file: supabase/schema.sql

Include:
1. CREATE TABLE for all 13 tables with exact column definitions from CLAUDE.md
2. All UNIQUE constraints
3. All FK references
4. Row Level Security: ALTER TABLE ... ENABLE ROW LEVEL SECURITY for every table
5. RLS policies for every table: SELECT/INSERT/UPDATE/DELETE — user_id = auth.uid()
6. Special ai_content_cache policy: rows where user_id IS NULL readable by all authenticated
7. Trigger 1: auto-create profiles row on auth.users insert
8. Trigger 2: snapshot checklist_items into checklist_history on daily_tracking upsert

Output the complete SQL. Tell me to paste it into the Supabase SQL Editor.
```

### 7.3 — New DB Columns Migration
```
Write SQL to add 4 new columns to user_preferences (these don't exist in the original v3 schema):

ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS location jsonb,
  ADD COLUMN IF NOT EXISTS field text,
  ADD COLUMN IF NOT EXISTS finance_instruments text[];

Tell me to run this in Supabase SQL Editor after running schema.sql.
```

### 7.4 — Login Page
```
Read CLAUDE.md. Read /reference/nook-v11.html for card/input/button styling reference.

Build src/app/(auth)/login/page.jsx:
- 'use client' directive
- Centered card, max-width 400px, .sett-card style
- Nook logo mark (26px) + wordmark at top
- Serif heading: "Welcome back."
- Email input + password input (.ob-input style)
- Show/hide password toggle button inside input
- Sign in button (accent, full width)
- On submit: supabase.auth.signInWithPassword()
  - Success: router.push('/dashboard')
  - Error: inline error message below button (var(--error-col))
- "Forgot password?" link (stub)
- "New to Nook? Create account" link → /signup
- Loading state: button shows spinner, disabled during request
```

### 7.5 — Signup Page
```
Read CLAUDE.md.

Build src/app/(auth)/signup/page.jsx:
- 'use client' directive
- Same visual treatment as login
- Serif heading: "Create your account."
- Fields: first name, email, password, confirm password
- On submit:
  1. Validate: passwords match, email valid, name non-empty
  2. supabase.auth.signUp({ email, password })
  3. INSERT into profiles: first_name, email,
     timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
     onboarding_completed: false
  4. UPDATE profiles: is_pro: true, pro_trial_ends_at: new Date(Date.now() + 14*24*60*60*1000)
  5. router.push('/onboarding')
- Inline field errors on validation fail
- "Already have an account? Sign in" link → /login
```

### 7.6 — Middleware
```
Read CLAUDE.md — route protection rules.

Create middleware.js in project root using Supabase Auth middleware pattern for Next.js App Router:

Protected routes (require session): /dashboard, /settings, /onboarding
- No session → redirect to /login

Auth routes (redirect if logged in): /login, /signup
- Has session → redirect to /dashboard

Create src/app/page.jsx:
export default function Home() {
  redirect('/dashboard') // next/navigation
}

Also handle: if user has session but onboarding_completed is false → redirect to /onboarding
(Check profiles table in middleware or on dashboard load)
```

---

## PHASE 8 — NEWS + STOCKS

### 8.1 — News API Route
```
Read CLAUDE.md — news API route spec and topic→query mapping.

Create src/app/api/news/route.js:
- GET with ?topics= query param (comma-separated)
- For each topic:
  1. Check ai_content_cache: content_type='news', content_key='news-{topic}-{YYYY-MM-DD}', expires_at > now()
  2. Cache hit → return cached data
  3. Cache miss → call NewsData.io, format, cache until midnight, return
- NewsData.io: https://newsdata.io/api/1/news?apikey={NEWSDATA_API_KEY}&q={query}&language=en&size=5
- Response format per article: { tag, title, summary, source, url }
- Topic→query map (exact from CLAUDE.md v3 prompts):
  ai-tech→"artificial intelligence", business→"business finance",
  geopolitics→"geopolitics world", health→"health medicine",
  science→"science space", environment→"climate environment",
  culture→"culture society", sports→"sports",
  law→"law policy", local→"local news"
- Use NEWSDATA_API_KEY server-side only
- Return 404 with clear message if no topics provided
```

### 8.2 — Stocks API Route
```
Read CLAUDE.md.

Create src/app/api/stocks/route.js:
- GET with ?tickers= param (comma-separated)
- Check ai_content_cache for data less than 30 seconds old
- Cache miss: call FMP https://financialmodelingprep.com/api/v3/quote/{tickers}?apikey={FMP_API_KEY}
- Format: { symbol, name, price, changePercent }
- Cache expires_at: 30 seconds from now
- Use FMP_API_KEY server-side only
- Handle FMP errors gracefully — return last cached data if API fails

In FinanceColumn.jsx and FinanceSection.jsx:
- Add useEffect to fetch /api/stocks?tickers=AAPL,MSFT,TSLA on mount
- Replace hardcoded ticker data with real API response
- Refresh every 30 seconds using setInterval (clear on unmount)
- Show small pulsing dot next to prices while refreshing
- Show skeleton rows while initial load
```

### 8.3 — Watchlist Add/Remove
```
Read CLAUDE.md — watchlist and isPro logic.

In FinanceSection.jsx wire the Add ticker form:
1. Validate: uppercase, A-Z only, max 10 chars
2. Check ticker count — if 3+ and not isPro(profile): show inline upgrade hint, open UpgradeModal
3. If under limit: call /api/stocks?tickers={ticker} to validate
   - Returns data → ticker is valid
   - Returns empty → show "Ticker not found" error
4. Valid: INSERT into watchlist via supabase, optimistically add to UI, toast "Added ✓"

Remove icon click:
- UPDATE watchlist SET is_active=false (soft delete)
- Remove from UI immediately

On load: fetch watchlist from Supabase, then fetch prices for those tickers.

Wire src/lib/isPro.js (exact function from CLAUDE.md).
```

---

## PHASE 9 — LIFESTYLE FEATURES

### 9.1 — Checklist Wired
```
Read CLAUDE.md — checklist carry-forward spec.

Wire LifestyleSection.jsx checklist to Supabase:

On load:
- Fetch checklist_items WHERE user_id = auth and is_active = true ORDER BY position
- Run carry-forward logic:
  - Items with carry_forward=true and is_done=true from yesterday → reset is_done=false
  - Items with carry_forward=false and is_done=true from yesterday → set is_active=false
- Pre-fill any today's data from daily_tracking

Tick: optimistic UI (update state immediately), then UPDATE checklist_items SET is_done=true
Untick: same pattern, set is_done=false
Add: INSERT new item, append to UI, toast "Task added ✓"
Delete: soft delete is_active=false, remove from UI

Progress bar updates in real time.
Ticking animation: .cb scale + color transition (0.2s, already in CSS).
Error: on Supabase failure, revert optimistic update + toast "Couldn't save — try again".
```

### 9.2 — Journal Wired
```
Wire LifestyleSection.jsx journal to Supabase:

On load: fetch today's journal_entries for this user.
- Exists: show in read mode (styled .journal-submitted div with Edit button)
- Not exists: show textarea + Submit button

Submit:
- UPSERT journal_entries: content, word_count = text.split(' ').length, date = today
- Switch to read mode
- Toast "Journal saved ✓"

Edit: switch back to textarea with saved content.

AI journal prompt (Pro only):
- Fetch from /api/ai-content: { type: 'journal-prompt', key: 'journal-prompt-{dayOfWeek}' }
- Show above textarea in highlighted card using know accent colors
- Show Skeleton while loading
- If user is not Pro: show blurred/locked version with upgrade prompt
```

### 9.3 — Gratitude + Stress Wired
```
Wire LifestyleSection.jsx gratitude and stress to Supabase:

Gratitude:
On load: fetch today's gratitude_logs, pre-fill 3 inputs.
Save: UPSERT gratitude_logs for today, toast "Gratitude saved ✓".
"View history": fetch last 14 days ORDER BY date DESC.
Show grouped entries with .grat-day / .grat-item style.
Toggle "View history ↑" / "View history →".

Stress check-in:
On load: fetch today's daily_tracking, pre-select stress_morning and stress_evening emoji buttons.
On tap: update local state immediately, then UPSERT daily_tracking.stress_morning or stress_evening.
Values 1–5 map to emoji buttons.
```

### 9.4 — Checklist Calendar Modal Wired
```
Create src/app/api/checklist-history/route.js:
- GET — reads from checklist_history table (not checklist_items)
- Returns last 15 days grouped by date: { date, tasks: [{text, is_done}], day_score }
- Per-day status: green = all tasks done, amber = some done, red = none done

Wire CalendarModal:
- "History" button in checklist section fetches /api/checklist-history
- Passes data to CalendarModal
- Replace hardcoded sample data with real API response
- Show loading spinner in modal while fetching
```

---

## PHASE 10 — TRACKING + DAY SCORE

### 10.1 — DailyInputs Wired
```
Wire DailyInputs.jsx to Supabase:

On load: fetch today's daily_tracking for this user, pre-fill all inputs.

On "Lock today's progress" click:
1. UPSERT daily_tracking with all current input values
2. Fetch updated checklist state (total items, done items)
3. calculateDayScore from lib/day-score.js
4. UPDATE daily_tracking SET day_score = calculated score
5. Animate ring from current value to new value
6. Completion moment: scale-in "Day recorded ✓" + streak count
7. Toast "Day locked ✓"
8. Call parent to refresh GreetingBanner day score ring

Rest day toggle: when enabled, skip exercise fields in score calculation.
Error: toast "Couldn't save — please try again" on failure.
```

### 10.2 — Live Score Ring
```
In DailyInputs.jsx, make the day score ring update live:
- Recalculate score on every input change using calculateDayScore
- Use hardcoded checklist 3/5 until real data is wired
- Animate ring smoothly to new value on each change (CSS transition on stroke-dashoffset)
- Score label updates: "Room to grow" (<40) / "Decent day" (40–59) / "Good day ✓" (60–79) / "Excellent day ✦" (≥80)
- When score improves: flash score number green for 500ms using CSS animation
```

### 10.3 — Analytics with Real Data
```
Create src/app/api/analytics/route.js:
- GET with ?period=weekly|monthly
- Returns daily_tracking rows for current user for the requested period
- Weekly: last 7 days. Monthly: last 30 days.

Update AnalyticsTabs.jsx:
- Fetch /api/analytics on tab mount
- Daily tab: replace sample data with today's real tracking values
- Weekly tab: pass real data to chart-utils drawLineChart and drawBarChart
- Monthly tab: same with monthly data
- Show Skeleton shimmer while loading

Charts re-render on theme change via MutationObserver watching data-theme on documentElement.
```

### 10.4 — History List Wired
```
Update HistoryList.jsx:
- Fetch last 15 days of daily_tracking from Supabase on mount
- Fetch checklist_history for the same date range
- Merge: each row = tracking data + checklist snapshot for that date
- Replace hardcoded sample data
- Today's row: compare date with today, add accent background
- Show Skeleton rows while loading (3 skeleton rows)
- Empty state if < 1 day: "Keep logging daily — your patterns appear here after a few days"
```

---

## PHASE 11 — AI CONTENT

### 11.1 — AI Content API Route
```
Read CLAUDE.md — AI content cache durations spec.

Create src/app/api/ai-content/route.js:
POST with body { type, key, userContext }

Logic:
1. Check ai_content_cache WHERE content_key = key AND expires_at > now()
2. Cache hit: return { content, cached: true }
3. Cache miss: call Anthropic API (claude-sonnet-4-6), max_tokens 500, save to cache, return

Cache expiry by type:
- daily-tip, word-of-day, did-you-know, concept, positivity → midnight tonight
- journal-prompt → 7 days from now
- method-day → midnight tonight
- ai-insights → midnight tonight (per user, user_id = auth id)

Shared content (word-of-day, did-you-know, concept, daily-tip): user_id = null
Personalised content (ai-insights, positivity): user_id = auth user id

Use ANTHROPIC_API_KEY server-side only.
Handle Anthropic errors: return 500 with clear message (never expose API key in error).
```

### 11.2 — AI Prompts Library
```
Build src/lib/ai-prompts.js with all prompts returning plain text only (no markdown, no bullets):

export const prompts = {
  dailyTip: () =>
    "You are a friendly financial coach. Write one practical money habit in 1-2 sentences. Focus on saving, spending wisely, or growing income. Second person. No markdown.",

  wordOfDay: () =>
    "Choose one financial term and explain it plainly. First sentence: term + one-line definition. Second sentence: real-world example. No labels. No markdown.",

  didYouKnow: () =>
    "Write one surprising fact from science, history, psychology, or nature. 1-2 sentences. Genuinely interesting, not generic. No markdown.",

  conceptOfDay: (topic) =>
    `Explain one concept from ${topic}. Name it clearly in the first sentence. Explain simply in 2-3 more sentences with a real example. No markdown.`,

  journalPrompt: (dayOfWeek) =>
    `Write one thoughtful journaling prompt for a ${dayOfWeek}. One sentence. Encouraging self-reflection. Start with a quote mark, end with a question mark.`,

  methodDay1: (methodName) =>
    `Introduce the ${methodName} method in 4-5 sentences: what it is, why it works psychologically, one concrete way to apply it today. Plain encouraging language. No markdown.`,

  methodDayN: (methodName, dayNumber) =>
    `Write a micro-tip for Day ${dayNumber} of ${methodName}. 1-2 sentences. Specific and actionable for today. No markdown.`,

  positivity: (name, done, total) =>
    `Write warm encouragement for ${name} who completed ${done} of ${total} goals last week. 2-3 sentences. Acknowledge their specific effort. Use their name once. No markdown.`,

  aiInsights: (trackingSummary) =>
    `Based on this 7-day tracking data: ${JSON.stringify(trackingSummary)}. Write 3 specific one-sentence observations about patterns (sleep+exercise correlations, productivity+meals, etc). Separate each with a newline. Be specific with the data. No markdown.`
}
```

### 11.3 — useAIContent Hook
```
Build src/hooks/useAIContent.js:

export function useAIContent({ type, key, userContext }) {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      try {
        const res = await fetch('/api/ai-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, key, userContext })
        })
        const data = await res.json()
        setContent(data.content)
      } catch (e) {
        setError(e)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [key]) // re-fetch only when key changes

  return { content, loading, error }
}
```

### 11.4 — Wire AI Content to Components
```
Wire useAIContent to these components (show Skeleton while loading, silent fail on error):

FinanceColumn + FinanceSection:
- Word of Day: useAIContent({ type: 'word-of-day', key: 'word-of-day-{YYYY-MM-DD}' })
- Daily Tip: useAIContent({ type: 'daily-tip', key: 'daily-tip-{YYYY-MM-DD}' })

KnowledgeColumn + KnowledgeSection:
- Did You Know: useAIContent({ type: 'did-you-know', key: 'did-you-know-{YYYY-MM-DD}' })
- Concept of Day: useAIContent({ type: 'concept', key: 'concept-{firstLearningTopic}-{YYYY-MM-DD}', userContext: { topic: user.learning_topics[0] } })

LifestyleSection — Journal:
- Journal prompt: useAIContent({ type: 'journal-prompt', key: 'journal-prompt-{dayOfWeek}' })
- Pro only — check isPro(profile) before rendering

GreetingBanner:
- Positivity: useAIContent({ type: 'positivity', key: 'positivity-{userId}-{weekStart}', userContext: { name, done, total } })

AnalyticsTabs — AI Insights card (weekly tab):
- After weekly data loads: useAIContent({ type: 'ai-insights', key: 'ai-insights-{userId}-{weekStart}', userContext: trackingSummary })
- Pro only

On error: show neutral placeholder text, never an error state UI to the user.
```

---

## PHASE 12 — EXPENSE + INCOME

### 12.1 — Expense Log Wired
```
Wire FinanceSection.jsx expense log to Supabase:

Today tab:
- Fetch today's expense_entries on mount
- Show list with category icon, name, amount (red)
- Running total at bottom
- Add form: amount (numeric, positive only) + category dropdown + note → INSERT → refresh list + total
- Delete: soft delete is_deleted=true, remove from UI

Monthly tab:
- Fetch this month's expense_entries grouped by category
- Horizontal progress bars with category color dots
- Total spend at top
- Pass data to drawBarChart in chart-utils

3-Month Trend tab:
- Fetch last 3 months grouped by month+category
- Stacked bar chart via chart-utils
- AI insight callout using useAIContent comparing this month vs last month
```

### 12.2 — Income Goal Tracker
```
Wire FinanceSection.jsx income goal tracker to Supabase:

On load:
- Fetch income_goal_amount and income_goal_period from user_preferences
- Fetch and SUM income_entries for current period
- Calculate progress %

Progress bar: green ≥75%, amber 50–74%, red <50%

"Log income" form: amount + source → INSERT income_entries → refresh progress

Income goal setup (if not set):
- Show "Set your income goal" prompt
- Amount input + period select (Monthly/Yearly)
- Save → UPDATE user_preferences
```

---

## PHASE 13 — SETTINGS + SHARE WIRED

### 13.1 — Settings Wired to Supabase
```
Wire src/app/(app)/settings/page.jsx to Supabase:

On load: fetch profiles + user_preferences for current user, pre-fill all fields.

Section 1 — Account: save first_name, last_name, timezone to profiles on save button.
Section 2 — Appearance: save theme to user_preferences.theme AND update localStorage.
Section 3 — News Topics: save to user_preferences.news_topics. Reload news on change.
Section 4 — Learning: save to user_preferences.learning_topics.
Section 5 — Lifestyle: save to user_preferences.lifestyle_prefs jsonb.
Section 6 — Income goal: save to user_preferences.income_goal_amount + income_goal_period.
Section 7 — Notifications: save to user_preferences.notification_preferences jsonb (UI only).

Single "Save changes" button: UPSERT all changed sections in one call.
Toast "Settings saved ✓" on success.
Toast "Couldn't save — please try again" on error.
```

### 13.2 — ShareableCard Wired
```
Wire ShareModal with real data from Supabase:

Fetch on modal open:
- Name from profiles
- Week date range (Mon–Sun of current week)
- Avg sleep from this week's daily_tracking
- Count of days with day_score ≥ 70
- Count of days where exercise_mins > 0
- Current method name from method_of_week
- Today's day_score

Update ShareableCard to render real values.

"Copy link": navigator.clipboard.writeText(window.location.href) → toast "Link copied ✓"
"Save as image": toast "Coming soon" for now
```

---

## PHASE 14 — POLISH

### 14.1 — Skeleton Loading States
```
Read CLAUDE.md. Read /reference/nook-v11.html — .chart-shimmer CSS.

Ensure Skeleton.jsx is built:
Props: width (default '100%'), height, borderRadius (default '8px')
Uses shimmer animation. Respects current theme via CSS custom properties.

Add skeletons to every component that loads data:
- FinanceColumn: 3 skeleton ticker rows + word of day block while loading
- KnowledgeColumn: 4 news item skeletons
- LifestyleColumn: 3 checklist item skeletons
- GreetingBanner: stat value skeletons (3 pills)
- TrackingSection: chart area rectangles
- AnalyticsTabs: chart canvas areas
- HistoryList: 3 row skeletons
- AI content cards: single line skeleton while fetching
```

### 14.2 — Empty States
```
Add empty states to every list/data area. All use muted colors, warm encouraging language:

Watchlist (0 tickers): "Add your first stock to start tracking →" with subtle add prompt
Checklist (0 tasks): "Add your first task to build your day" + add button shown
History (< 1 day): "Keep logging daily — your patterns appear here after a few days"
Analytics weekly (< 7 days): "Log for X more days to see your weekly patterns"
Analytics monthly (< 30 days): "X more days of logging to see monthly trends"
News fetch failed: "Couldn't load today's news" + retry button
Journal (not written today): placeholder text in textarea: "What's on your mind today?"
Expense log (no entries): "No expenses logged today"
```

### 14.3 — Toast Error Handling
```
Wire error toasts globally using useToast hook:

Add showToast('error message', 'error') calls to:
- All Supabase save failures: "Couldn't save — please try again"
- News API failure: "News couldn't load — retrying..."
- Stock API failure: "Prices unavailable — check connection"
- Auth failure on login: "Sign in failed — check your credentials"
- Auth failure on signup: "Signup failed — please try again"
- Watchlist add failure: "Couldn't add ticker — please try again"
- Journal submit failure: "Couldn't save journal — please try again"

All existing showToast stubs replaced with real useToast calls.
```

### 14.4 — Mobile Responsiveness
```
Read CLAUDE.md. Add @media (max-width: 768px) rules to globals.css ONLY.
Do not change any desktop layout.

Changes:
1. Sidebar: hidden on mobile. Hamburger icon in topbar slides sidebar in as overlay (CSS transform).
2. Hero grid: 3-column → single column stacked
3. Topbar: hide "Share" text label (icon only), reduce padding to 10px 16px
4. Expanded sections two-column layout → single column
5. DailyInputs panel → full width, single column groups
6. Greeting banner stats → 2×3 grid wrap
7. Onboarding → full screen, centered, no outer padding
8. Settings sections → full width
9. All tap targets: minimum 44×44px (check every button and interactive element)
10. Shell: remove 20px body padding, remove border-radius on mobile (full bleed)
```

### 14.5 — Security Audit
```
Run a security check across the entire codebase:

1. Search all client components and hooks for any import of supabase-server.js — must be zero
2. Search for any hardcoded API key strings (ANTHROPIC, FMP, NEWSDATA) — must be zero
3. Search for any fetch() calls to external APIs (Anthropic, FMP, NewsData) in client files — must be zero (all must go through /api/ routes)
4. Confirm middleware.js protects: /dashboard, /settings, /onboarding
5. Input validation:
   - Ticker input: A-Z uppercase, max 10 chars
   - Expense amount: positive numbers only, max 2 decimal places
   - Name fields: max 100 chars
   - Email: valid format check
6. Confirm .env.local is in .gitignore
7. List all required Vercel environment variables

Output a checklist: ✓ PASS or ✗ FAIL for each item.
Fix every FAIL immediately.
```

---

## PHASE 15 — ONBOARDING WIRED

### 15.1 — Onboarding Saves to Supabase
```
Wire OnboardingShell.jsx final step to save all collected state to Supabase:

On Step12 "Go to my dashboard" click:
1. UPSERT user_preferences:
   - news_topics: state.topics
   - learning_topics: state.learning
   - finance_instruments: state.finance
   - gender: state.gender
   - location: state.location (jsonb: { city, state, zip })
   - field: state.field or state.fieldOther
   - lifestyle_prefs: ['journal', 'gratitude', 'checklist', 'stress'] (all on by default)
2. UPDATE profiles SET onboarding_completed = true
3. router.push('/dashboard')

Error: toast "Couldn't save your preferences — you can update them in Settings" and still navigate to dashboard (non-blocking).
```

### 15.2 — Post-Signup Redirects
```
Verify the complete auth → onboarding → dashboard flow works end to end:

1. New user signs up → goes to /onboarding (Step 1)
2. Completes onboarding → goes to /dashboard
3. Returning user logs in → goes to /dashboard (skips onboarding)
4. Logged-in user visits /login → redirects to /dashboard
5. Logged-out user visits /dashboard → redirects to /login
6. User with onboarding_completed=false visits /dashboard → redirects to /onboarding

Test all 6 flows manually. Fix any redirect issues.

Also ensure: when user refreshes on any protected page, session is restored correctly without flash to login.
```
