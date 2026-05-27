'use client'

import { useState, useEffect, useRef } from 'react'
import { useAIContent } from '@/hooks/useAIContent'
import { createClient } from '@/lib/supabase'

function parseWOD(text) {
  const word = text?.match(/WORD:\s*(.+)/i)?.[1]?.trim() ?? null
  const def  = text?.match(/DEFINITION:\s*(.+)/i)?.[1]?.trim() ?? null
  return { word, def }
}

function AISkeleton({ height = 36 }) {
  return (
    <div style={{ height, borderRadius: 8, background: 'var(--input-bg)', backgroundImage: 'linear-gradient(90deg, var(--input-bg) 0%, var(--border) 50%, var(--input-bg) 100%)', backgroundSize: '400px 100%', animation: 'shimmer 1.4s infinite linear' }} />
  )
}

const SENTIMENT = [
  { sym: 'AAPL', label: 'Bullish', cls: 'bull' },
  { sym: 'MSFT', label: 'Neutral', cls: 'neut' },
  { sym: 'TSLA', label: 'Bullish', cls: 'bull' },
]

function TickerSkeleton() {
  return (
    <>
      {[1, 2, 3].map(i => (
        <div className="ticker-row" key={i} style={{ alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div className="ticker-skel-bar" style={{ width: 36, height: 11 }} />
            <div className="ticker-skel-bar" style={{ width: 64, height: 9 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
            <div className="ticker-skel-bar" style={{ width: 52, height: 11 }} />
            <div className="ticker-skel-bar" style={{ width: 38, height: 9 }} />
          </div>
        </div>
      ))}
    </>
  )
}

export default function FinanceColumn({ onExpand }) {
  const [tickers, setTickers]       = useState([])
  const [stockMap, setStockMap]     = useState({})
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stockError, setStockError] = useState(false)
  const intervalRef = useRef(null)

  const todayKey = new Date().toISOString().slice(0, 10)
  const { content: wodContent, loading: wodLoading, error: wodError } = useAIContent({ type: 'word-of-day', key: `word-of-day-${todayKey}` })
  const { content: tipContent, loading: tipLoading, error: tipError } = useAIContent({ type: 'daily-tip',   key: `daily-tip-${todayKey}` })
  const wod = parseWOD(wodContent)
  const wodFailed = !wodLoading && (wodError || (!wod.word && !wod.def))

  async function fetchStocks(syms, isRefresh = false) {
    if (!syms.length) { setLoading(false); return }
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await fetch(`/api/stocks?tickers=${syms.join(',')}`)
      if (!res.ok) { setStockError(true); return }
      const { stocks } = await res.json()
      if (Array.isArray(stocks)) {
        const map = {}
        stocks.forEach(s => { map[s.symbol] = s })
        setStockMap(map)
        setStockError(false)
      }
    } catch {
      setStockError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    async function loadWatchlist() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setLoading(false); return }
        const { data } = await supabase
          .from('watchlist')
          .select('ticker')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('display_order', { ascending: true })
        const syms = (data || []).map(r => r.ticker)
        setTickers(syms)
        clearInterval(intervalRef.current)
        fetchStocks(syms)
        intervalRef.current = setInterval(() => fetchStocks(syms, true), 30_000)
      } catch {
        setLoading(false)
      }
    }
    loadWatchlist()
    return () => clearInterval(intervalRef.current)
  }, [])

  return (
    <div className="hero-col" onClick={onExpand}>
      <div className="hero-header fin">
        <div className="hero-title fin">
          <i className="ph-bold ph-currency-dollar" />
          Finance
        </div>
        <div
          className="expand-icon fin"
          onClick={e => { e.stopPropagation(); onExpand() }}
        >
          <i className="ph-bold ph-arrows-out" />
        </div>
      </div>

      <div className="hero-body">
        {/* Watchlist */}
        <div className="sub-section">
          <div className="sub-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Watchlist
            {refreshing && <span className="stock-refresh-dot" />}
            {stockError && !loading && (
              <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 400, marginLeft: 2 }}>· stale</span>
            )}
          </div>
          {loading ? (
            <TickerSkeleton />
          ) : tickers.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text-3)', padding: '8px 0', lineHeight: 1.5 }}>
              No stocks yet — add tickers in the Finance tab.
            </div>
          ) : (
            tickers.map(sym => {
              const s = stockMap[sym]
              return (
                <div className="ticker-row" key={sym}>
                  <div>
                    <div className="t-sym">{sym}</div>
                    <div className="t-name">{s?.name || sym}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="t-price" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {s?.price ?? '—'}
                    </div>
                    <div className={s?.up ? 'up' : 'dn'} style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {s?.changePercent ?? '—'}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Word of the day */}
        <div className="sub-section">
          <div className="sub-label">Word of the day</div>
          {wodLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <AISkeleton height={14} />
              <AISkeleton height={32} />
            </div>
          ) : wodFailed ? (
            <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>Couldn't load today's word.</div>
          ) : (
            <>
              <div className="word-title">{wod.word}</div>
              <div className="word-def">{wod.def}</div>
            </>
          )}
        </div>

        {/* Daily tip */}
        <div className="sub-section">
          <div className="sub-label">Daily tip</div>
          {tipLoading ? (
            <AISkeleton height={36} />
          ) : tipError || !tipContent ? (
            <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>Couldn't load today's tip.</div>
          ) : (
            <div className="tip-text">&ldquo;{tipContent}&rdquo;</div>
          )}
        </div>

        {/* Sentiment */}
        <div className="sub-section">
          <div className="sub-label">Sentiment</div>
          <div className="sent-chips">
            {SENTIMENT.map(s => (
              <div className="sent-chip" key={s.sym}>
                <span className="sent-chip-sym">{s.sym}</span>
                <span className={`sent-bdg ${s.cls}`}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense log */}
        <div className="sub-section">
          <div className="sub-label">Expense log</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
            Log expenses in the Finance tab.
          </div>
        </div>
      </div>
    </div>
  )
}
