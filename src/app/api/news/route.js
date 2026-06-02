import { NextResponse } from 'next/server'
import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase-server'


const TOPIC_QUERY_MAP = {
  'ai-technology':    'artificial intelligence technology',
  'business-markets': 'business markets',
  'geopolitics':      'geopolitics world politics',
  'health-medicine':  'health medicine',
  'science-space':    'science space',
  'environment':      'climate environment',
  'culture-society':  'culture society',
  'sports':           'sports',
  'law-policy':       'law policy',
  'psychology':       'psychology mental health',
  'philosophy':       'philosophy ethics',
  'history':          'history',
  'economics':        'economics',
  'design':           'design creativity',
  'finance':          'personal finance investing',
}

function midnightExpiry() {
  const d = new Date()
  d.setUTCHours(24, 0, 0, 0)
  return d.toISOString()
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

async function fetchFromNewsData(query) {
  const url = `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}&q=${encodeURIComponent(query)}&language=en&size=10`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`NewsData.io error: ${res.status}`)
  const json = await res.json()
  const seen = new Set()
  return (json.results || [])
    .filter(a => {
      const key = a.link || a.title
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map(a => ({
      tag:     a.category?.[0] ?? 'News',
      title:   a.title || '',
      summary: a.description || a.content?.slice(0, 160) || '',
      source:  a.source_id || a.source_name || '',
      url:     a.link || '',
    }))
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const topicsParam = searchParams.get('topics')

  if (!topicsParam) {
    return NextResponse.json({ error: 'topics query param is required (comma-separated)' }, { status: 400 })
  }

  const topics = topicsParam.split(',').map(t => t.trim()).filter(Boolean)
  if (topics.length === 0) {
    return NextResponse.json({ error: 'No valid topics provided' }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const date = todayKey()
  const results = {}

  await Promise.all(topics.map(async (topic) => {
    const query = TOPIC_QUERY_MAP[topic] || topic
    const cacheKey = `news-${topic}-${date}`

    const { data: cached } = await supabaseAdmin
      .from('ai_content_cache')
      .select('content')
      .eq('content_type', 'news')
      .eq('content_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()

    if (cached) {
      results[topic] = JSON.parse(cached.content)
      return
    }

    let articles = []
    try {
      articles = await fetchFromNewsData(query)
    } catch (err) {
      results[topic] = []
      return
    }

    await supabaseAdmin
      .from('ai_content_cache')
      .upsert({
        user_id:       null,
        content_type:  'news',
        content_key:   cacheKey,
        content:       JSON.stringify(articles),
        model_version: 'newsdata-v1',
        token_count:   0,
        generated_at:  new Date().toISOString(),
        expires_at:    midnightExpiry(),
      }, { onConflict: 'content_key' })

    results[topic] = articles
  }))

  return NextResponse.json({ results })
}
