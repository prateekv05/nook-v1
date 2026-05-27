'use client'

import { useState, useEffect, useRef } from 'react'

const DEFAULT_TICKERS = ['AAPL', 'MSFT', 'TSLA']

const SENTIMENT = [
  { sym: 'AAPL', label: 'Bullish', cls: 'bull' },
  { sym: 'MSFT', label: 'Neutral', cls: 'neut' },
  { sym: 'TSLA', label: 'Bullish', cls: 'bull' },
]

const EXPENSES = [
  { name: 'Coffee & breakfast',  cat: 'Food',          amt: '−$12.50' },
  { name: 'Uber to office',      cat: 'Transport',     amt: '−$8.20'  },
  { name: 'Netflix',             cat: 'Entertainment', amt: '−$15.99' },
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
  const [stockMap, setStockMap] = useState({})
  const [loading, setLoading]   = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const intervalRef = useRef(null)

  async function fetchStocks(isRefresh = false) {
    if (isRefresh) setRefreshing(true)
    try {
      const res = await fetch(`/api/stocks?tickers=${DEFAULT_TICKERS.join(',')}`)
      if (!res.ok) return
      const { stocks } = await res.json()
      if (Array.isArray(stocks)) {
        const map = {}
        stocks.forEach(s => { map[s.symbol] = s })
        setStockMap(map)
      }
    } catch {
      // keep last data on error
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStocks()
    intervalRef.current = setInterval(() => fetchStocks(true), 30_000)
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
          </div>
          {loading ? (
            <TickerSkeleton />
          ) : (
            DEFAULT_TICKERS.map(sym => {
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
          <div className="word-title">Dollar-Cost Averaging</div>
          <div className="word-def">Investing a fixed amount regularly regardless of price — smoothing out market volatility over time.</div>
        </div>

        {/* Daily tip */}
        <div className="sub-section">
          <div className="sub-label">Daily tip</div>
          <div className="tip-text">"Review your subscriptions monthly — the average person forgets 3 active subscriptions."</div>
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
        <div className="sub-section" onClick={e => e.stopPropagation()}>
          <div className="sub-label">Expense log</div>
          <div className="hero-exp-list">
            {EXPENSES.map(e => (
              <div className="hero-exp-row" key={e.name}>
                <span className="hero-exp-name">{e.name}</span>
                <span className="hero-exp-cat">{e.cat}</span>
                <span className="hero-exp-amt">{e.amt}</span>
              </div>
            ))}
          </div>
          <div className="hero-exp-total">Today: <span>−$36.69</span></div>
          <div className="e-add">
            <input className="e-input" placeholder="$0.00" style={{ width: 60 }} />
            <select className="e-input" style={{ width: 90 }}>
              <option>Food</option>
              <option>Transport</option>
              <option>Entertainment</option>
              <option>Health</option>
              <option>Utilities</option>
              <option>Other</option>
            </select>
            <input className="e-input" placeholder="Note" style={{ flex: 1 }} />
            <button className="e-btn-g">Add</button>
          </div>
        </div>
      </div>
    </div>
  )
}
