-- ============================================================
-- Nook — Supabase Schema
-- Paste this entire file into the Supabase SQL Editor and run.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                   uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name           text,
  last_name            text,
  email                text,
  avatar_url           text,
  phone_number         text,
  gender               text,
  pronouns             text,
  date_of_birth        date,
  timezone             text NOT NULL DEFAULT 'UTC',
  country              text,
  is_pro               boolean NOT NULL DEFAULT false,
  pro_trial_ends_at    timestamptz,
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  deleted_at           timestamptz
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: select own" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles: insert own" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles: update own" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles: delete own" ON profiles
  FOR DELETE USING (id = auth.uid());


-- ─────────────────────────────────────────────────────────────
-- 2. USER_PREFERENCES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_preferences (
  id                               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                          uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  theme                            text NOT NULL DEFAULT 'calm',
  news_topics                      text[],
  learning_topics                  text[],
  financial_goals                  text,
  lifestyle_prefs                  text[],
  dashboard_section_visibility     jsonb,
  checklist_carry_forward_default  boolean NOT NULL DEFAULT true,
  notification_preferences         jsonb,
  income_goal_amount               numeric,
  income_goal_period               text,
  currency                         text NOT NULL DEFAULT 'USD',
  updated_at                       timestamptz NOT NULL DEFAULT now(),
  gender                           text,
  location                         jsonb,
  field                            text,
  finance_instruments              text[]
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_preferences: select own" ON user_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_preferences: insert own" ON user_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_preferences: update own" ON user_preferences
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "user_preferences: delete own" ON user_preferences
  FOR DELETE USING (user_id = auth.uid());


-- ─────────────────────────────────────────────────────────────
-- 3. WATCHLIST
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS watchlist (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ticker         varchar(10) NOT NULL,
  display_order  integer,
  is_active      boolean NOT NULL DEFAULT true,
  added_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, ticker)
);

ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "watchlist: select own" ON watchlist
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "watchlist: insert own" ON watchlist
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "watchlist: update own" ON watchlist
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "watchlist: delete own" ON watchlist
  FOR DELETE USING (user_id = auth.uid());


-- ─────────────────────────────────────────────────────────────
-- 4. JOURNAL_ENTRIES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS journal_entries (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content         text,
  ai_prompt       text,
  mood_at_writing integer,
  word_count      integer,
  date            date NOT NULL,
  UNIQUE (user_id, date)
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "journal_entries: select own" ON journal_entries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "journal_entries: insert own" ON journal_entries
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "journal_entries: update own" ON journal_entries
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "journal_entries: delete own" ON journal_entries
  FOR DELETE USING (user_id = auth.uid());


-- ─────────────────────────────────────────────────────────────
-- 5. GRATITUDE_LOGS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gratitude_logs (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entry_1  text,
  entry_2  text,
  entry_3  text,
  date     date NOT NULL,
  UNIQUE (user_id, date)
);

ALTER TABLE gratitude_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gratitude_logs: select own" ON gratitude_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "gratitude_logs: insert own" ON gratitude_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "gratitude_logs: update own" ON gratitude_logs
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "gratitude_logs: delete own" ON gratitude_logs
  FOR DELETE USING (user_id = auth.uid());


-- ─────────────────────────────────────────────────────────────
-- 6. CHECKLIST_ITEMS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS checklist_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text          text NOT NULL,
  is_done       boolean NOT NULL DEFAULT false,
  carry_forward boolean NOT NULL DEFAULT true,
  position      integer,
  category      text,
  streak_count  integer NOT NULL DEFAULT 0,
  completed_at  timestamptz,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checklist_items: select own" ON checklist_items
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "checklist_items: insert own" ON checklist_items
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "checklist_items: update own" ON checklist_items
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "checklist_items: delete own" ON checklist_items
  FOR DELETE USING (user_id = auth.uid());


-- ─────────────────────────────────────────────────────────────
-- 7. CHECKLIST_HISTORY
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS checklist_history (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_id    uuid REFERENCES checklist_items(id) ON DELETE SET NULL,
  item_text  text NOT NULL,
  is_done    boolean NOT NULL DEFAULT false,
  date       date NOT NULL,
  day_score  integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE checklist_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checklist_history: select own" ON checklist_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "checklist_history: insert own" ON checklist_history
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "checklist_history: update own" ON checklist_history
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "checklist_history: delete own" ON checklist_history
  FOR DELETE USING (user_id = auth.uid());


-- ─────────────────────────────────────────────────────────────
-- 8. DAILY_TRACKING
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_tracking (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date            date NOT NULL,
  water           integer,
  steps           integer,
  sleep           numeric(4,1),
  exercise_type   text,
  exercise_mins   integer,
  meals           integer,
  productive_hrs  numeric(4,1),
  lazy_hrs        numeric(4,1),
  mood_morning    integer,
  mood_evening    integer,
  stress_morning  integer,
  stress_evening  integer,
  weight          numeric(5,1),
  notes           text,
  is_rest_day     boolean NOT NULL DEFAULT false,
  day_score       integer,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

ALTER TABLE daily_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_tracking: select own" ON daily_tracking
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "daily_tracking: insert own" ON daily_tracking
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "daily_tracking: update own" ON daily_tracking
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "daily_tracking: delete own" ON daily_tracking
  FOR DELETE USING (user_id = auth.uid());


-- ─────────────────────────────────────────────────────────────
-- 9. EXPENSE_ENTRIES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expense_entries (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount         numeric(10,2) NOT NULL,
  currency       text NOT NULL DEFAULT 'USD',
  category       text,
  payment_method text,
  note           text,
  is_recurring   boolean NOT NULL DEFAULT false,
  date           date NOT NULL,
  is_deleted     boolean NOT NULL DEFAULT false,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE expense_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expense_entries: select own" ON expense_entries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "expense_entries: insert own" ON expense_entries
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "expense_entries: update own" ON expense_entries
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "expense_entries: delete own" ON expense_entries
  FOR DELETE USING (user_id = auth.uid());


-- ─────────────────────────────────────────────────────────────
-- 10. INCOME_ENTRIES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS income_entries (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount     numeric(10,2) NOT NULL,
  currency   text NOT NULL DEFAULT 'USD',
  source     text,
  note       text,
  date       date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE income_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "income_entries: select own" ON income_entries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "income_entries: insert own" ON income_entries
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "income_entries: update own" ON income_entries
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "income_entries: delete own" ON income_entries
  FOR DELETE USING (user_id = auth.uid());


-- ─────────────────────────────────────────────────────────────
-- 11. AI_CONTENT_CACHE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_content_cache (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content_type  text NOT NULL,
  content_key   text NOT NULL,
  content       text NOT NULL,
  model_version text,
  token_count   integer,
  generated_at  timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz,
  UNIQUE (content_key) -- applies where user_id IS NULL (shared cache rows)
);

ALTER TABLE ai_content_cache ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read shared rows (user_id IS NULL) or their own rows
CREATE POLICY "ai_content_cache: select" ON ai_content_cache
  FOR SELECT USING (
    (user_id IS NULL AND auth.role() = 'authenticated')
    OR user_id = auth.uid()
  );

-- Only service_role can insert or update (never the client)
CREATE POLICY "ai_content_cache: insert service_role" ON ai_content_cache
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "ai_content_cache: update service_role" ON ai_content_cache
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "ai_content_cache: delete service_role" ON ai_content_cache
  FOR DELETE USING (auth.role() = 'service_role');


-- ─────────────────────────────────────────────────────────────
-- 12. METHOD_OF_WEEK
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS method_of_week (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  method_name   text NOT NULL,
  method_slug   text NOT NULL,
  week_start    date NOT NULL,
  current_day   integer NOT NULL DEFAULT 1,
  day_content   text[],
  is_completed  boolean NOT NULL DEFAULT false,
  skipped_days  integer[],
  rating        integer,
  reflection    text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE method_of_week ENABLE ROW LEVEL SECURITY;

CREATE POLICY "method_of_week: select own" ON method_of_week
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "method_of_week: insert own" ON method_of_week
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "method_of_week: update own" ON method_of_week
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "method_of_week: delete own" ON method_of_week
  FOR DELETE USING (user_id = auth.uid());


-- ─────────────────────────────────────────────────────────────
-- 13. NOTIFICATIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        text,
  title       text,
  message     text,
  is_read     boolean NOT NULL DEFAULT false,
  action_url  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications: select own" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications: insert own" ON notifications
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "notifications: update own" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "notifications: delete own" ON notifications
  FOR DELETE USING (user_id = auth.uid());


-- ============================================================
-- TRIGGER 1 — Auto-create profiles row on new auth.users insert
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, now(), now())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- TRIGGER 2 — Snapshot active checklist_items → checklist_history
--             on daily_tracking INSERT or UPDATE (upsert)
-- ============================================================
CREATE OR REPLACE FUNCTION public.snapshot_checklist_on_tracking_upsert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.checklist_history (user_id, item_id, item_text, is_done, date, day_score)
  SELECT
    NEW.user_id,
    ci.id,
    ci.text,
    ci.is_done,
    NEW.date,
    NEW.day_score
  FROM public.checklist_items ci
  WHERE ci.user_id = NEW.user_id
    AND ci.is_active = true
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_daily_tracking_upsert ON daily_tracking;
CREATE TRIGGER on_daily_tracking_upsert
  AFTER INSERT OR UPDATE ON daily_tracking
  FOR EACH ROW EXECUTE FUNCTION public.snapshot_checklist_on_tracking_upsert();
