import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export async function POST(request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { opened, clicked } = body
  const date = todayKey()

  const update = {}
  if (opened) update.knowledge_opened = true
  if (clicked) update.news_clicked = true

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ ok: true })
  }

  const { error } = await supabase
    .from('daily_tracking')
    .upsert({ user_id: user.id, date, ...update }, { onConflict: 'user_id,date' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function GET(request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: rows, error } = await supabase
    .from('daily_tracking')
    .select('date, knowledge_opened, news_clicked')
    .eq('user_id', user.id)
    .eq('knowledge_opened', true)
    .eq('news_clicked', true)
    .order('date', { ascending: false })
    .limit(90)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const doneDates = new Set((rows || []).map(r => r.date))

  // Count consecutive days ending today or yesterday
  let streak = 0
  let best = 0
  let current = 0
  const today = todayKey()
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  // Start from today; if today not done yet, allow starting from yesterday
  const startDate = doneDates.has(today) ? today : yesterday

  let d = new Date(startDate)
  while (true) {
    const key = d.toISOString().slice(0, 10)
    if (doneDates.has(key)) {
      current++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  streak = current

  // Calculate best streak across all data
  const sortedDates = [...doneDates].sort()
  let run = 0
  for (let i = 0; i < sortedDates.length; i++) {
    if (i === 0) { run = 1; continue }
    const prev = new Date(sortedDates[i - 1])
    const curr = new Date(sortedDates[i])
    const diff = (curr - prev) / 86400000
    run = diff === 1 ? run + 1 : 1
    if (run > best) best = run
  }
  if (streak > best) best = streak

  // Last 7 days for the week bar
  const week = []
  for (let i = 6; i >= 0; i--) {
    const d2 = new Date(Date.now() - i * 86400000)
    week.push(doneDates.has(d2.toISOString().slice(0, 10)))
  }

  return NextResponse.json({ streak, best, week })
}
