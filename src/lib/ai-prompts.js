export const prompts = {
  dailyTip: () =>
    'You are a friendly financial coach. Write one practical money habit in 1-2 sentences. Focus on saving, spending wisely, or growing income. Second person. No markdown.',

  wordOfDay: () =>
    'Choose one finance or investing term (e.g. P/E ratio, EBITDA, hedge, liquidity, amortisation, basis points). Output exactly two lines — no other text:\nWORD: <term>\nDEFINITION: <one-sentence plain-English definition with a real-world example>',

  didYouKnow: () =>
    'Write one surprising fact from science, history, psychology, or nature. 1-2 sentences. Genuinely interesting, not generic. No markdown.',

  conceptOfDay: (topic) =>
    `Explain one concept from ${topic}. Name it clearly in the first sentence. Explain simply in 2-3 more sentences with a real example. No markdown.`,

  journalPrompt: (dayOfWeek) =>
    `Write one thoughtful journaling prompt for a ${dayOfWeek}. One sentence. Encouraging self-reflection. Start with a quote mark, end with a question mark.`,

  methodDay1: (methodName) =>
    `Introduce the ${methodName} method in 4-5 sentences: what it is, why it works psychologically, one concrete way to apply it today. Plain encouraging language. No markdown.`,

  methodDayN: (methodName, dayNumber) =>
    `Write a micro-tip for Day ${dayNumber} of ${methodName}. 1-2 sentences. Specific and actionable for today. No markdown.`,

  positivity: (name, done, total) =>
    `Write warm encouragement for ${name} who completed ${done} of ${total} goals last week. 2-3 sentences. Acknowledge their specific effort. Use their name once. No markdown.`,

  aiInsights: (trackingSummary) =>
    `Based on this 7-day tracking data: ${JSON.stringify(trackingSummary)}. Write 3 specific one-sentence observations about patterns (sleep+exercise correlations, productivity+meals, etc). Separate each with a newline. Be specific with the data. No markdown.`,
}
