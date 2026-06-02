'use client'

import { useState, useEffect } from 'react'
import DayScoreRing from '../ui/DayScoreRing'
import { useAIContent } from '@/hooks/useAIContent'
import { createClient } from '@/lib/supabase'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function getWeekStart() {
  const d = new Date()
  const diff = (d.getDay() + 6) % 7
  const monday = new Date(d)
  monday.setDate(d.getDate() - diff)
  return monday.toISOString().slice(0, 10)
}

export default function GreetingBanner({ done = 0, total = 0 }) {
  const [userId, setUserId] = useState(null)
  const [firstName, setFirstName] = useState('')
  const [statsLoading, setStatsLoading] = useState(true)
  const [dayScore, setDayScore] = useState(0)
  const [streak, setStreak] = useState(null)

  useEffect(() => {
    let mounted = true
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!mounted) return
      if (user) {
        setUserId(user.id)
        const today = new Date().toISOString().slice(0, 10)
        const thirtyAgo = new Date()
        thirtyAgo.setDate(thirtyAgo.getDate() - 30)

        const [{ data: profile }, { data: tracking }, { data: history }] = await Promise.all([
          supabase.from('profiles').select('first_name').eq('id', user.id).single(),
          supabase.from('daily_tracking').select('day_score').eq('user_id', user.id).eq('date', today).single(),
          supabase.from('daily_tracking').select('date').eq('user_id', user.id).gte('date', thirtyAgo.toISOString().slice(0, 10)).order('date', { ascending: false }),
        ])

        if (!mounted) return
        if (profile?.first_name) setFirstName(profile.first_name)
        if (tracking?.day_score != null) setDayScore(tracking.day_score)
        if (history) {
          const dateSet = new Set(history.map(r => r.date))
          let count = 0
          const cursor = new Date()
          while (dateSet.has(cursor.toISOString().slice(0, 10))) {
            count++
            cursor.setDate(cursor.getDate() - 1)
          }
          setStreak(count)
        }
      }
      if (mounted) setStatsLoading(false)
    })
    return () => { mounted = false }
  }, [])

  const todayKey = new Date().toISOString().slice(0, 10)
  const { content: positivity } = useAIContent({
    type: 'positivity',
    key: userId ? `positivity-${todayKey}` : null,
    userContext: { name: firstName, done, total },
  })

  return (
    <div className="greeting-banner">
      <div className="gb-inner">
        <div className="gb-text">
          <h2>{getGreeting()}, {firstName || '...'}</h2>
          <p>{positivity || "Here’s your daily overview — everything you need in one place."}</p>
        </div>

        <div className="gb-stats">
          <div className="gb-stat">
            {statsLoading
              ? <div className="gb-skel" style={{ width: 36, height: 20 }} />
              : <div className="gb-stat-val">{total > 0 ? `${done}/${total}` : '—'}</div>
            }
            <div className="gb-stat-label">Goals done</div>
          </div>

          <div className="gb-divider" />

          <div className="gb-stat">
            {statsLoading
              ? <div className="gb-skel" style={{ width: 28, height: 20 }} />
              : <div className="gb-stat-val" style={{ fontSize: '20px', lineHeight: 1 }}>
                  <i className="ph-bold ph-smiley" style={{ color: 'inherit' }} />
                </div>
            }
            <div className="gb-stat-label">Mood</div>
          </div>

          <div className="gb-divider" />

          <div className="gb-stat">
            {statsLoading
              ? <div className="gb-skel" style={{ width: 42, height: 20 }} />
              : <div className="gb-stat-val">{streak != null ? `Day ${streak}` : '—'}</div>
            }
            <div className="gb-stat-label">Kaizen</div>
          </div>

          <div className="gb-divider" />

          <div className="gb-stat" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <DayScoreRing score={dayScore} size={52} bgStroke="var(--gb-divider)" />
            <div className="gb-stat-label">Day Score</div>
          </div>
        </div>
      </div>
    </div>
  )
}
