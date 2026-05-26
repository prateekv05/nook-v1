export function calculateDayScore(tracking, checklistTotal, checklistDone) {
  const sleep      = Math.min((tracking.sleep || 0) / 8, 1.0)
  const water      = Math.min((tracking.water || 0) / 8, 1.0)
  const steps      = Math.min((tracking.steps || 0) / 10000, 1.0)
  const checklist  = checklistTotal > 0 ? checklistDone / checklistTotal : 0
  const mood       = ((tracking.mood_morning || 3) + (tracking.mood_evening || 3)) / 10
  return Math.round((sleep * 0.25 + water * 0.20 + steps * 0.15 + checklist * 0.20 + mood * 0.20) * 100)
}
