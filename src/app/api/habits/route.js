import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

function getMondayOfCurrentWeek() {
  const today = new Date()
  const day = today.getDay() // 0=Sun
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(today)
  monday.setDate(today.getDate() + diff)
  return monday
}

function computeStreak(allCompletions, habitId) {
  const dates = allCompletions
    .filter(c => c.habit_id === habitId)
    .map(c => c.date)
    .sort()
    .reverse()

  if (!dates.length) return 0

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  let cursor = dates[0] === today ? today : dates[0] === yesterday ? yesterday : null
  if (!cursor) return 0

  let streak = 0
  const dateSet = new Set(dates)
  while (dateSet.has(cursor)) {
    streak++
    const d = new Date(cursor)
    d.setDate(d.getDate() - 1)
    cursor = d.toISOString().slice(0, 10)
  }
  return streak
}

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const monday = getMondayOfCurrentWeek()
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const weekStart = monday.toISOString().slice(0, 10)
  const weekEnd = sunday.toISOString().slice(0, 10)

  const { data: habits, error: habitsError } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('is_active', true)
    .order('position', { ascending: true })

  if (habitsError) return NextResponse.json({ error: habitsError.message }, { status: 500 })
  if (!habits.length) return NextResponse.json({ habits: [], completions: {}, streaks: {}, weekStart, weekEnd })

  const habitIds = habits.map(h => h.id)

  const { data: weekCompletions, error: wcError } = await supabase
    .from('habit_completions')
    .select('habit_id, date')
    .eq('user_id', session.user.id)
    .in('habit_id', habitIds)
    .gte('date', weekStart)
    .lte('date', weekEnd)

  if (wcError) return NextResponse.json({ error: wcError.message }, { status: 500 })

  const streakCutoff = new Date()
  streakCutoff.setDate(streakCutoff.getDate() - 365)
  const { data: allCompletions } = await supabase
    .from('habit_completions')
    .select('habit_id, date')
    .eq('user_id', session.user.id)
    .in('habit_id', habitIds)
    .gte('date', streakCutoff.toISOString().slice(0, 10))

  const completions = {}
  for (const c of (weekCompletions || [])) {
    if (!completions[c.habit_id]) completions[c.habit_id] = []
    completions[c.habit_id].push(c.date)
  }

  const streaks = {}
  for (const h of habits) {
    streaks[h.id] = computeStreak(allCompletions || [], h.id)
  }

  return NextResponse.json({ habits, completions, streaks, weekStart, weekEnd })
}
