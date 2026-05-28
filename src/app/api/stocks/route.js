import { NextResponse } from 'next/server'
import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase-server'

function expiresAt30s() {
  return new Date(Date.now() + 30_000).toISOString()
}

async function fetchQuote(ticker) {
  const url = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.FINNHUB_API_KEY}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Finnhub error: ${res.status}`)
  const data = await res.json()
  if (!data || typeof data.c !== 'number') throw new Error(`Finnhub invalid response for ${ticker}`)
  const pct = data.dp ?? 0
  return {
    symbol:        ticker,
    name:          ticker,
    price:         `$${Number(data.c ?? 0).toFixed(2)}`,
    changePercent: `${pct >= 0 ? '+' : ''}${Number(pct).toFixed(2)}%`,
    up:            pct >= 0,
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const searchQuery  = searchParams.get('search')
  const tickersParam = searchParams.get('tickers')

  // ── Company/ticker search ──────────────────────────────────
  if (searchQuery) {
    const supabase = await createSupabaseServerClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
      const url = `https://finnhub.io/api/v1/search?q=${encodeURIComponent(searchQuery)}&token=${process.env.FINNHUB_API_KEY}`
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) throw new Error(`Finnhub search error: ${res.status}`)
      const data = await res.json()
      const results = (data.result || [])
        .filter(r => r.type === 'Common Stock' && r.symbol && !r.symbol.includes('.'))
        .slice(0, 6)
        .map(r => ({ symbol: r.displaySymbol || r.symbol, name: r.description, exchange: '' }))
      return NextResponse.json({ results })
    } catch {
      return NextResponse.json({ results: [] })
    }
  }

  if (!tickersParam) {
    return NextResponse.json({ error: 'tickers query param is required (comma-separated)' }, { status: 400 })
  }

  const tickers = tickersParam.split(',').map(t => t.trim().toUpperCase()).filter(Boolean)
  if (tickers.length === 0) {
    return NextResponse.json({ error: 'No valid tickers provided' }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sortedKey = tickers.slice().sort().join(',')
  const cacheKey  = `stocks-${sortedKey}`

  const { data: fresh } = await supabaseAdmin
    .from('ai_content_cache')
    .select('content')
    .eq('content_key', cacheKey)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (fresh) {
    return NextResponse.json({ stocks: JSON.parse(fresh.content), cached: true })
  }

  let stocks
  try {
    stocks = await Promise.all(tickers.map(t => fetchQuote(t)))

    await supabaseAdmin
      .from('ai_content_cache')
      .upsert({
        content_type:  'stocks',
        content_key:   cacheKey,
        content:       JSON.stringify(stocks),
        model_version: 'finnhub-v1',
        generated_at:  new Date().toISOString(),
        expires_at:    expiresAt30s(),
      }, { onConflict: 'content_key' })
  } catch (err) {
    const { data: stale } = await supabaseAdmin
      .from('ai_content_cache')
      .select('content')
      .eq('content_key', cacheKey)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (stale) {
      return NextResponse.json({ stocks: JSON.parse(stale.content), stale: true })
    }
    return NextResponse.json({ error: 'Failed to fetch stock data', detail: err.message }, { status: 502 })
  }

  return NextResponse.json({ stocks })
}
