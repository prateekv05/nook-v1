# Settings → Supabase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire `src/app/(app)/settings/page.jsx` to Supabase so all settings load from and persist to the database.

**Architecture:** On mount, fetch `profiles` + `user_preferences` in parallel and pre-fill all form state. A single Save button does two parallel UPSERTs — one to `profiles`, one to `user_preferences`. Theme applies immediately via `useTheme` on click but is DB-persisted only on Save.

**Tech Stack:** Next.js 14 App Router, Supabase JS (`@supabase/ssr`), `createClient` from `src/lib/supabase.js`, existing `useTheme` + `useToast` hooks.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/app/(app)/settings/page.jsx` | All changes live here — fetch on mount, form state, save handler |

No new files needed.

---

### Task 1: Add Supabase import + loading state

**Files:**
- Modify: `src/app/(app)/settings/page.jsx:1-5`

- [ ] **Step 1: Add import for `createClient` and a `loading` state**

Replace the top of the file (imports + `useState` line) with:

```jsx
'use client';
import { useState, useEffect } from 'react';
import { createClient } from '../../../lib/supabase';
import { useTheme } from '../../../hooks/useTheme';
import { useToast } from '../../../hooks/useToast';
```

Inside `SettingsPage()`, add a `loading` state alongside the existing state declarations:

```jsx
const [loading, setLoading] = useState(true);
const [userId, setUserId]   = useState(null);
```

- [ ] **Step 2: Verify the file still compiles**

Run: `cd /Users/prateekvangari/Downloads/nook && npm run build 2>&1 | tail -20`

Expected: No new errors (existing errors are fine — we're mid-edit).

- [ ] **Step 3: Commit**

```bash
git add src/app/\(app\)/settings/page.jsx
git commit -m "feat(settings): add supabase import and loading state"
```

---

### Task 2: Fetch profile + preferences on mount

**Files:**
- Modify: `src/app/(app)/settings/page.jsx` — add `useEffect` after state declarations

- [ ] **Step 1: Add `useEffect` to fetch data on mount**

Add this block immediately after all the `useState` declarations (after the `notifs` state line, before `togglePill`):

```jsx
useEffect(() => {
  async function load() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const uid = session.user.id;
    setUserId(uid);

    const [{ data: profile }, { data: prefs }] = await Promise.all([
      supabase.from('profiles').select('first_name,last_name,timezone').eq('id', uid).single(),
      supabase.from('user_preferences').select('theme,news_topics,learning_topics,lifestyle_prefs,income_goal_amount,income_goal_period,notification_preferences').eq('user_id', uid).single(),
    ]);

    if (profile) {
      if (profile.first_name) setFirstName(profile.first_name);
      if (profile.last_name)  setLastName(profile.last_name);
      if (profile.timezone)   setTimezone(profile.timezone);
    }

    if (prefs) {
      if (prefs.theme) setTheme(prefs.theme);
      if (prefs.news_topics?.length)    setNewsTopics(new Set(prefs.news_topics));
      if (prefs.learning_topics?.length) setLearnTopics(new Set(prefs.learning_topics));
      if (prefs.lifestyle_prefs)        setLifestyle(prefs.lifestyle_prefs);
      if (prefs.income_goal_amount)     setIncomeAmt(String(prefs.income_goal_amount));
      if (prefs.income_goal_period)     setIncomePeriod(prefs.income_goal_period);
      if (prefs.notification_preferences) setNotifs(prefs.notification_preferences);
    }

    setLoading(false);
  }
  load();
}, []);
```

- [ ] **Step 2: Verify the shape of the data you're reading**

Open Supabase dashboard → Table Editor → `user_preferences`. Confirm column names match exactly: `news_topics`, `learning_topics`, `lifestyle_prefs`, `income_goal_amount`, `income_goal_period`, `notification_preferences`.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(app\)/settings/page.jsx
git commit -m "feat(settings): fetch profile and preferences on mount"
```

---

### Task 3: Disable Save button while loading + add loading UX

**Files:**
- Modify: `src/app/(app)/settings/page.jsx` — the global Save button at the bottom

- [ ] **Step 1: Make the global Save button reflect loading state**

Find this line near the bottom of the JSX (around line 256):

```jsx
<button className="sett-save-btn" onClick={handleSave}>Save changes</button>
```

Replace it with:

```jsx
<button
  className="sett-save-btn"
  onClick={handleSave}
  disabled={loading}
  style={{ opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
>
  {loading ? 'Loading…' : 'Save changes'}
</button>
```

- [ ] **Step 2: Open the app in a browser and verify the button shows "Loading…" briefly on first load**

Run: `npm run dev` — navigate to `/settings`. The button should flash "Loading…" then show "Save changes" once data arrives.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(app\)/settings/page.jsx
git commit -m "feat(settings): disable save button while fetching initial data"
```

---

### Task 4: Wire the Save handler to Supabase

**Files:**
- Modify: `src/app/(app)/settings/page.jsx` — replace `handleSave`

- [ ] **Step 1: Replace the stub `handleSave` with a real implementation**

Find and remove this existing stub:

```jsx
function handleSave() {
  showToast('Settings saved ✓', 'success');
}
```

Replace with:

```jsx
async function handleSave() {
  if (!userId) return;
  const supabase = createClient();
  try {
    const [profileRes, prefsRes] = await Promise.all([
      supabase
        .from('profiles')
        .update({ first_name: firstName, last_name: lastName, timezone })
        .eq('id', userId),
      supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          theme,
          news_topics: [...newsTopics],
          learning_topics: [...learnTopics],
          lifestyle_prefs: lifestyle,
          income_goal_amount: incomeAmt ? Number(incomeAmt) : null,
          income_goal_period: incomePeriod,
          notification_preferences: notifs,
        }, { onConflict: 'user_id' }),
    ]);

    if (profileRes.error) throw profileRes.error;
    if (prefsRes.error)   throw prefsRes.error;

    showToast('Settings saved ✓', 'success');
  } catch (err) {
    console.error('Settings save error:', err);
    showToast('Couldn\'t save — please try again', 'error');
  }
}
```

- [ ] **Step 2: Verify `handleSave` is still async-safe if called before `userId` is set**

The early return `if (!userId) return;` guards this. Confirm the Save button is also `disabled={loading}` from Task 3 — double protection.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(app\)/settings/page.jsx
git commit -m "feat(settings): wire save button to supabase upsert"
```

---

### Task 5: Save theme to DB on Save (not on click)

**Files:**
- Modify: `src/app/(app)/settings/page.jsx` — `handleTheme` function

- [ ] **Step 1: Verify `handleTheme` still applies theme immediately but does NOT write to DB**

Find the existing `handleTheme`:

```jsx
function handleTheme(t) {
  setTheme(t);
  showToast('Theme updated', 'info');
}
```

Remove the toast — the theme will be confirmed by the global save toast instead:

```jsx
function handleTheme(t) {
  setTheme(t);
}
```

The `theme` variable from `useTheme` is already tracked in state (and in the `handleSave` upsert payload from Task 4). No further changes needed — clicking a theme button updates `theme` state, which `handleSave` will persist.

- [ ] **Step 2: Manual test in browser**

1. Click "Dark" theme → UI switches immediately ✓
2. Refresh → theme reverts (not saved yet) ✓
3. Click "Dark" again → click "Save changes" → toast "Settings saved ✓" ✓
4. Refresh → theme persists ✓

- [ ] **Step 3: Commit**

```bash
git add src/app/\(app\)/settings/page.jsx
git commit -m "feat(settings): theme persists to db on save, still applies immediately on click"
```

---

### Task 6: End-to-end manual verification

**Files:** None (verification only)

- [ ] **Step 1: Verify Account section**

1. Change First name, Last name, Timezone → Save → toast ✓
2. Refresh page → fields pre-filled with saved values ✓

- [ ] **Step 2: Verify News Topics**

1. Select different topics (max 5) → Save ✓
2. Refresh → correct topics pre-selected ✓

- [ ] **Step 3: Verify Learning Interests**

1. Toggle topics → Save → refresh → correct topics pre-selected ✓

- [ ] **Step 4: Verify Lifestyle Features**

1. Toggle off "Journal" → Save → refresh → toggle still off ✓

- [ ] **Step 5: Verify Income Goal**

1. Enter amount + period → Save → refresh → pre-filled ✓
2. Cross-check: open Finance section — income goal tracker should show updated goal

- [ ] **Step 6: Verify Notifications**

1. Toggle "Daily check-in" on → Save → refresh → still on ✓

- [ ] **Step 7: Verify error state**

Temporarily break the Supabase URL in `.env.local` → click Save → toast "Couldn't save — please try again" ✓. Restore URL.

- [ ] **Step 8: Final commit — update CLAUDE.md**

Update `CLAUDE.md` session state: Phase 13.1 complete, next task is 13.2.

```bash
git add CLAUDE.md
git commit -m "docs: mark phase 13.1 complete in CLAUDE.md"
```
