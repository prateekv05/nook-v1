import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase-server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Shared types have user_id = null — one cache entry for all users
const SHARED_TYPES = new Set(['daily-tip', 'word-of-day', 'did-you-know', 'concept'])

function midnightExpiry() {
  const d = new Date()
  d.setUTCHours(24, 0, 0, 0)
  return d.toISOString()
}

function sevenDayExpiry() {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString()
}

function expiryFor(type) {
  if (type === 'journal-prompt') return sevenDayExpiry()
  return midnightExpiry()
}

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { type, key, userContext } = body

  if (!type || !key) {
    return NextResponse.json({ error: 'type and key are required' }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isShared = SHARED_TYPES.has(type)
  const userId = isShared ? null : user.id

  // Cache lookup — filter on content_type too so shared/personal entries never cross-contaminate
  let cacheQuery = supabaseAdmin
    .from('ai_content_cache')
    .select('content')
    .eq('content_key', key)
    .eq('content_type', type)
    .gt('expires_at', new Date().toISOString())

  if (isShared) {
    cacheQuery = cacheQuery.is('user_id', null)
  } else {
    cacheQuery = cacheQuery.eq('user_id', userId)
  }

  const { data: cached } = await cacheQuery.maybeSingle()

  if (cached) {
    return NextResponse.json({ content: cached.content, cached: true })
  }

  // Cache miss — generate via Anthropic
  const prompt = buildPrompt(type, userContext)

  let aiText
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })
    aiText = message.content[0]?.text ?? ''
  } catch (err) {
    return NextResponse.json(
      { error: 'AI generation failed. Please try again later.' },
      { status: 500 }
    )
  }

  await supabaseAdmin
    .from('ai_content_cache')
    .upsert({
      user_id:       userId,
      content_type:  type,
      content_key:   key,
      content:       aiText,
      model_version: 'claude-sonnet-4-6',
      token_count:   aiText.length,
      generated_at:  new Date().toISOString(),
      expires_at:    expiryFor(type),
    }, { onConflict: 'content_key' })

  return NextResponse.json({ content: aiText, cached: false })
}

function buildPrompt(type, ctx = {}) {
  switch (type) {
    case 'daily-tip':
      return 'Give one practical, actionable daily wellness tip in 1-2 sentences. Be specific and encouraging. No markdown, no bullet points — plain text only.'

    case 'word-of-day':
      return `Give a word of the day. Format exactly as:
WORD: [word]
PRONUNCIATION: [pronunciation]
DEFINITION: [1-sentence definition]
EXAMPLE: [1-sentence example using the word]
No extra text.`

    case 'did-you-know':
      return 'Share one fascinating, surprising fact that most people don\'t know. 2-3 sentences. Plain text only, no markdown.'

    case 'concept':
      return `Give one interesting intellectual concept${ctx.topics ? ` related to ${ctx.topics}` : ''} that a curious person would find valuable. Format exactly as:
CONCEPT: [short concept name — 1-4 words, e.g. "Dunning-Kruger Effect", "Compounding", "Sunk Cost Fallacy"]
EXPLANATION: [2-3 sentences explaining it simply with a real-world example]
No extra text.`

    case 'journal-prompt':
      return `Generate a thoughtful journaling prompt${ctx.mood ? ` for someone feeling ${ctx.mood}` : ''}. One sentence, thought-provoking, introspective. No markdown.`

    case 'positivity':
      return `Write a warm, genuine motivational message${ctx.name ? ` for ${ctx.name}` : ''}${ctx.score !== undefined ? ` who has a day score of ${ctx.score}/100` : ''}. 1-2 sentences. Encouraging without being cheesy. Plain text only.`

    case 'ai-insights':
      return buildInsightsPrompt(ctx)

    case 'method-day':
      return `For the learning method "${ctx.method || 'active recall'}", describe what to focus on for day ${ctx.day || 1} of a 7-day practice. 2-3 sentences, practical and specific. Plain text only.`

    default:
      return `Provide a helpful, concise insight related to "${type}"${ctx.topic ? ` about ${ctx.topic}` : ''}. 2-3 sentences. Plain text only.`
  }
}

function buildInsightsPrompt(ctx) {
  const parts = ['Generate a brief, personalised daily insight based on the following data:']
  if (ctx.score !== undefined) parts.push(`- Day score: ${ctx.score}/100`)
  if (ctx.sleep)               parts.push(`- Sleep: ${ctx.sleep} hours`)
  if (ctx.water)               parts.push(`- Water: ${ctx.water} glasses`)
  if (ctx.steps)               parts.push(`- Steps: ${ctx.steps}`)
  if (ctx.mood)                parts.push(`- Mood: ${ctx.mood}/5`)
  if (ctx.name)                parts.push(`- Name: ${ctx.name}`)
  parts.push('2-3 sentences. Specific to their numbers. Encouraging and actionable. Plain text only, no markdown.')
  return parts.join('\n')
}
