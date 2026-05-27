# Things to Fix — Nook User Flow Audit
*Audited: 2026-05-27*

---

## Critical

- [x] **#1** `src/components/layout/Sidebar.jsx` — `handleLogout()` redirects to `/onboarding` instead of `/login`, causes redirect loop after sign out
- [x] **#2** `src/components/layout/GreetingBanner.jsx` — `useAIContent()` called even when `userId` is null, no auth guard *(false positive — hook already guards on null key)*

---

## High

- [x] **#3** `src/app/(auth)/signup/page.jsx` — Profile `upsert()` has no try-catch; silent failure sends user to onboarding with no DB profile
- [x] **#4** `src/components/home/FinanceColumn.jsx` — `loadWatchlist()` fails silently when user is null *(false positive — line 82 already guards `if (!user)` inside a try/catch)*
- [x] **#5** `src/components/home/LifestyleColumn.jsx` — Empty catch block on checklist load, errors swallowed silently
- [x] **#6** `src/components/home/KnowledgeColumn.jsx` — Retry logic doesn't clear error flag, inconsistent state after retry *(false positive — line 100 clears error at effect start, line 163 clears it on retry click)*
- [x] **#7** `src/hooks/useAIContent.js` — No auth check before POST to `/api/ai-content`; expired sessions cause infinite skeleton
- [x] **#8** `src/app/(app)/settings/page.jsx` — Inputs not disabled during initial load, race condition if user edits before fetch completes
- [x] **#9** `src/app/(app)/settings/page.jsx` — Save button has no loading state, UI freezes during save
- [x] **#10** `src/hooks/useAIContent.js` — `type` and `userContext` missing from `useEffect` dependency array *(intentional — `key` is the cache-bust signal; adding `userContext` (new object each render) would cause infinite refetches)*

---

## Medium

- [x] **#11** `src/components/home/FinanceColumn.jsx` — Stock fetch error kept silently, no toast or stale data indicator
- [x] **#12** `src/app/(app)/settings/page.jsx` — Try-catch swallows all load errors, user sees stale defaults with no explanation
- [x] **#13** `src/components/layout/GreetingBanner.jsx` — Score hardcoded to `72`, stats show hardcoded "5/7" and "Day 3" instead of real data
- [x] **#14** `src/components/home/LifestyleColumn.jsx` — Stress emoji selection updates local state only, never saved to Supabase
- [x] **#15** `src/components/home/FinanceColumn.jsx` — `parseWOD()` failure shows hardcoded fallback, no proper error state
- [x] **#16** `src/components/home/KnowledgeColumn.jsx` — Fallback topics show stale data with no indicator it's cached/offline
- [x] **#17** `src/app/api/news/route.js` — 401 returned silently, frontend has no retry logic
- [x] **#18** `src/app/api/ai-content/route.js` — Cache lookup doesn't validate `user_id` consistency for shared vs. personal content

---

## Low

- [x] **#19** `src/app/api/news/route.js`, `src/app/api/stocks/route.js`, `src/app/api/ai-content/route.js` — `console.error()` left in production API routes
- [x] **#20** `src/components/ui/Modal.jsx` — No focus trap or focus return on open/close, accessibility issue
- [x] **#21** HeroGrid positivity strip — Hardcoded message instead of using `useAIContent`
- [x] **#22** `src/components/home/LifestyleColumn.jsx` — Checklist toggle in home column never persists to Supabase
- [x] **#23** `src/components/layout/Sidebar.jsx` — No logout confirmation, easy to trigger accidentally
- [x] **#24** `src/app/(app)/settings/page.jsx` — Theme `setTheme()` called inside async `.then()`, timing issue on load
- [x] **#25** `src/hooks/useAIContent.js` — Missing `type` and `userContext` in `useEffect` dependency array (duplicate of #10)

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 2 |
| High | 8 |
| Medium | 8 |
| Low | 7 |
| **Total** | **25** |
