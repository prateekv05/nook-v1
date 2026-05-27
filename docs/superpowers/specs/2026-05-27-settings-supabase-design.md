# Settings → Supabase — Design Spec
**Phase 13.1 | Date: 2026-05-27**

## Goal
Wire `src/app/(app)/settings/page.jsx` to Supabase so all settings persist to the database and are pre-filled on load.

## Data Flow

### On mount
1. Get session via `createClient().auth.getSession()`
2. Parallel fetch: `profiles` row + `user_preferences` row for `user_id`
3. Pre-fill all state from DB; fall back to current defaults if no row yet
4. Show loading skeleton (disable Save button) until both fetches resolve

### On Save (single button)
Two parallel UPSERTs:
- `profiles`: `{ first_name, last_name, timezone }` — update by `id`
- `user_preferences`: `{ theme, news_topics, learning_topics, lifestyle_prefs, income_goal_amount, income_goal_period, notification_preferences }` — upsert on `user_id`

Toast "Settings saved ✓" on success. Toast "Couldn't save — please try again" on error.

## Section Mapping

| Section | DB table | Column(s) |
|---------|----------|-----------|
| Account | profiles | first_name, last_name, timezone |
| Appearance | user_preferences | theme |
| News Topics | user_preferences | news_topics (text[]) |
| Learning Interests | user_preferences | learning_topics (text[]) |
| Lifestyle Features | user_preferences | lifestyle_prefs (jsonb: {journal,gratitude,checklist,stress}) |
| Income Goal | user_preferences | income_goal_amount, income_goal_period |
| Notifications | user_preferences | notification_preferences (jsonb: {morning,evening,weekly}) |

## Behaviour Details

- **Theme**: button click still applies immediately via `useTheme` (updates `<html>` attr + localStorage). DB persist happens on Save only.
- **News reload**: page refresh is sufficient after save — no in-session re-fetch needed.
- **Loading state**: `loading` boolean disables Save button and shows shimmer on inputs.
- **Error handling**: try/catch around both UPSERTs; any error shows error toast.

## Files Changed
- `src/app/(app)/settings/page.jsx` — sole file modified
