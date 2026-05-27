import { NextResponse } from 'next/server'
import { createSupabaseServerClient, supabaseAdmin } from '@/lib/supabase-server'

function formatQuote(q) {
  const pct = q.changesPercentage ?? 0
  return {
    symbol:        q.symbol,
    name:          q.name || q.symbol,
    price:         `$${Number(q.price ?? 0).toFixed(2)}`,
    changePercent: `${pct >= 0 ? '+' : ''}${Number(pct).toFixed(2)}%`,
    up:            pct >= 0,
  }
}

function expiresAt30s() {
  return new Date(Date.now() + 30_000).toISOString()
}

async function fetchFromFMP(tickers) {
  const url = `https://financialmodelingprep.com/api/v3/quote/${tickers}?apikey=${process.env.FMP_API_KEY}`
  const res = await fetch(url, { next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`FMP error: ${res.status}`)
  const data = await res.json()
  if (!Array.isArray(data)) throw new Error('FMP returned non-array')
  return data.map(formatQuote)
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const tickersParam = searchParams.get('tickers')

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
  const cacheKey = `stocks-${sortedKey}`

  // Check fresh cache (< 30 seconds old)
  const { data: fresh } = await supabaseAdmin
    .from('ai_content_cache')
    .select('content')
    .eq('content_key', cacheKey)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (fresh) {
    return NextResponse.json({ stocks: JSON.parse(fresh.content), cached: true })
  }

  // Cache miss — call FMP
  let stocks
  try {
    stocks = await fetchFromFMP(tickers.join(','))
    await supabaseAdmin
      .from('ai_content_cache')
      .upsert({
        content_type:  'stocks',
        content_key:   cacheKey,
        content:       JSON.stringify(stocks),
        model_version: 'fmp-v3',
        generated_at:  new Date().toISOString(),
        expires_at:    expiresAt30s(),
      }, { onConflict: 'content_key' })
  } catch (err) {
    // Return last cached data even if stale
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
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 502 })
  }

  return NextResponse.json({ stocks })
}
