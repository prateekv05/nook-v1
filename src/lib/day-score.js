export function calculateDayScore(tracking, checklistTotal, checklistDone, habitTotal = 0, habitDone = 0) {
  const sleep     = Math.min((tracking.sleep || 0) / 8, 1.0)
  const water     = Math.min((tracking.water || 0) / 8, 1.0)
  const steps     = Math.min((tracking.steps || 0) / 10000, 1.0)
  const checklist = checklistTotal > 0 ? checklistDone / checklistTotal : 0
  const mood      = ((tracking.mood_morning || 3) + (tracking.mood_evening || 3)) / 10
  const habits    = habitTotal > 0 ? habitDone / habitTotal : 0

  if (habitTotal > 0) {
    // Scale existing weights by 0.85 to make room for habits at 15%
    return Math.round(
      (sleep * 0.2125 + water * 0.17 + steps * 0.1275 + checklist * 0.17 + mood * 0.17 + habits * 0.15) * 100
    )
  }

  return Math.round((sleep * 0.25 + water * 0.20 + steps * 0.15 + checklist * 0.20 + mood * 0.20) * 100)
}
