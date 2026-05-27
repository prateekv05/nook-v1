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

const SCORE = 72

export default function GreetingBanner({ name = 'Alex', done = 0, total = 0 }) {
  const [userId, setUserId] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
      setStatsLoading(false)
    })
  }, [])

  const weekStart = getWeekStart()
  const { content: positivity } = useAIContent({
    type: 'positivity',
    key: userId ? `positivity-${userId}-${weekStart}` : null,
    userContext: { name, done, total },
  })

  return (
    <div className="greeting-banner">
      <div className="gb-inner">
        <div className="gb-text">
          <h2>{getGreeting()}, {name}</h2>
          <p>{positivity || "Here’s your daily overview — everything you need in one place."}</p>
        </div>

        <div className="gb-stats">
          <div className="gb-stat">
            {statsLoading
              ? <div className="gb-skel" style={{ width: 36, height: 20 }} />
              : <div className="gb-stat-val">5/7</div>
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
              : <div className="gb-stat-val">Day 3</div>
            }
            <div className="gb-stat-label">Kaizen</div>
          </div>

          <div className="gb-divider" />

          <div className="gb-stat" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <DayScoreRing score={SCORE} size={52} bgStroke="var(--gb-divider)" />
            <div className="gb-stat-label">Day Score</div>
          </div>
        </div>
      </div>
    </div>
  )
}
