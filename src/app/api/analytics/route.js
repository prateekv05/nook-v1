import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') === 'monthly' ? 'monthly' : 'weekly'
  const days   = period === 'monthly' ? 30 : 7

  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const from = new Date()
  from.setDate(from.getDate() - days + 1)
  const fromISO = from.toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('daily_tracking')
    .select('date, sleep, water, steps, exercise_type, exercise_mins, productive_hrs, lazy_hrs, mood_morning, mood_evening, is_rest_day, day_score')
    .eq('user_id', session.user.id)
    .gte('date', fromISO)
    .order('date', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data || [] })
}
