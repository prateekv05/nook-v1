import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

function formatDayLabel(iso) {
  const d = new Date(iso + 'T12:00:00')
  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' })
  const day = d.getDate()
  return `${weekday} ${day}`
}

function dayStatus(total, done) {
  if (total === 0) return 'green'
  if (done === total) return 'green'
  if (done === 0) return 'red'
  return 'amber'
}

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 14)

  const { data: rows, error } = await supabase
    .from('checklist_history')
    .select('item_text, is_done, date, day_score')
    .eq('user_id', session.user.id)
    .gte('date', cutoff.toISOString().slice(0, 10))
    .order('date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Group by date
  const byDate = {}
  for (const row of rows || []) {
    if (!byDate[row.date]) {
      byDate[row.date] = { date: row.date, tasks: [], day_score: row.day_score }
    }
    byDate[row.date].tasks.push({ text: row.item_text, is_done: row.is_done })
  }

  const days = Object.values(byDate).map(day => {
    const total = day.tasks.length
    const done  = day.tasks.filter(t => t.is_done).length
    return {
      date:      day.date,
      label:     formatDayLabel(day.date),
      summary:   `${done}/${total}`,
      status:    dayStatus(total, done),
      day_score: day.day_score,
      tasks:     day.tasks,
    }
  })

  return NextResponse.json({ days })
}
