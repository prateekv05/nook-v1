'use client'

import { useEffect, useState } from 'react'

function getStrokeColor(score) {
  if (score >= 80) return '#4ADE80'
  if (score >= 60) return '#F59E0B'
  return '#EF4444'
}

export default function DayScoreRing({
  score = 0,
  size = 52,
  strokeWidth = 4,
  bgStroke = 'var(--border)',
}) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const center = size / 2
  const radius = center - strokeWidth - 1
  const circumference = 2 * Math.PI * radius
  const offset = animated ? circumference * (1 - score / 100) : circumference
  const fontSize = Math.round(size * 0.25)

  return (
    <div className="day-score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="ring-bg"
          cx={center}
          cy={center}
          r={radius}
          stroke={bgStroke}
          strokeWidth={strokeWidth}
        />
        <circle
          className="ring-fill"
          cx={center}
          cy={center}
          r={radius}
          stroke={getStrokeColor(score)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference.toFixed(1)}
          strokeDashoffset={offset.toFixed(1)}
        />
      </svg>
      <div className="day-score-val" style={{ fontSize }}>{score}</div>
    </div>
  )
}
