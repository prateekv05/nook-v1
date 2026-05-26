'use client'

import { useEffect, useState } from 'react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const SCORE = 72
const RADIUS = 21
const CIRCUMFERENCE = 2 * Math.PI * RADIUS // ~131.9

export default function GreetingBanner({ name = 'Alex' }) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const offset = animated
    ? CIRCUMFERENCE * (1 - SCORE / 100)
    : CIRCUMFERENCE

  return (
    <div className="greeting-banner">
      <div className="gb-inner">
        <div className="gb-text">
          <h2>{getGreeting()}, {name}</h2>
          <p>Here&rsquo;s your daily overview — everything you need in one place.</p>
        </div>

        <div className="gb-stats">
          <div className="gb-stat">
            <div className="gb-stat-val">5/7</div>
            <div className="gb-stat-label">Goals done</div>
          </div>

          <div className="gb-divider" />

          <div className="gb-stat">
            <div className="gb-stat-val" style={{ fontSize: '20px', lineHeight: 1 }}>
              <i className="ph-bold ph-smiley" style={{ color: 'inherit' }} />
            </div>
            <div className="gb-stat-label">Mood</div>
          </div>

          <div className="gb-divider" />

          <div className="gb-stat">
            <div className="gb-stat-val">Day 3</div>
            <div className="gb-stat-label">Kaizen</div>
          </div>

          <div className="gb-divider" />

          <div className="gb-stat" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div className="day-score-ring">
              <svg width="52" height="52" viewBox="0 0 52 52">
                <circle className="ring-bg" cx="26" cy="26" r={RADIUS} />
                <circle
                  className="ring-fill"
                  cx="26"
                  cy="26"
                  r={RADIUS}
                  strokeDasharray={CIRCUMFERENCE.toFixed(1)}
                  strokeDashoffset={offset.toFixed(1)}
                />
              </svg>
              <div className="day-score-val">{SCORE}</div>
            </div>
            <div className="gb-stat-label">Day Score</div>
          </div>
        </div>
      </div>
    </div>
  )
}
