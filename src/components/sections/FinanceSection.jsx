'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { isPro } from '@/lib/isPro'
import { useToast } from '@/hooks/useToast'
import UpgradeModal from '@/components/ui/UpgradeModal'

const SENTIMENT = [
  { sym: 'AAPL', label: 'Bullish', cls: 'bullish', note: 'Strong earnings beat expected. Analysts raise price targets.' },
  { sym: 'TSLA', label: 'Neutral', cls: 'neutral', note: 'Mixed delivery signals. Watch for macro headwinds.' },
  { sym: 'MSFT', label: 'Bullish', cls: 'bullish', note: 'Azure growth accelerating on AI enterprise demand.' },
]

const INITIAL_EXPENSES = [
  { name: 'Coffee & breakfast', cat: 'Food',          amt: 12.50 },
  { name: 'Uber to office',     cat: 'Transport',     amt: 8.20  },
  { name: 'Netflix',            cat: 'Entertainment', amt: 15.99 },
]

const MONTHLY_CATS = [
  { cat: 'Food',          color: '#22C55E', pct: 42, amt: 780 },
  { cat: 'Transport',     color: '#60A5FA', pct: 18, amt: 332 },
  { cat: 'Entertainment', color: '#A78BFA', pct: 14, amt: 258 },
  { cat: 'Health',        color: '#F59E0B', pct: 12, amt: 221 },
  { cat: 'Utilities',     color: '#F87171', pct: 9,  amt: 166 },
  { cat: 'Other',         color: '#94A3B8', pct: 5,  amt: 85  },
]

const EXPENSE_CATS = ['Food', 'Transport', 'Entertainment', 'Health', 'Utilities', 'Other']
const FREE_LIMIT   = 3
const TICKER_RE    = /^[A-Z]{1,10}$/

function TickerRowSkeleton() {
  return (
    <>
      {[1, 2, 3].map(i => (
        <div className="e-ticker" key={i} style={{ alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div className="ticker-skel-bar" style={{ width: 40, height: 12 }} />
            <div className="ticker-skel-bar" style={{ width: 72, height: 10 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end' }}>
            <div className="ticker-skel-bar" style={{ width: 58, height: 12 }} />
            <div className="ticker-skel-bar" style={{ width: 44, height: 10 }} />
          </div>
        </div>
      ))}
    </>
  )
}

export default function FinanceSection({ onBack }) {
  const toast = useToast()
  const supabase = createClient()

  // Watchlist: [{ id, ticker }] — loaded from DB
  const [watchlistItems, setWatchlistItems] = useState([])
  const [watchlistLoading, setWatchlistLoading] = useState(true)

  // Stock prices: { SYM: { symbol, name, price, changePercent, up } }
  const [stockMap, setStockMap]         = useState({})
  const [stocksLoading, setStocksLoading] = useState(false)
  const [refreshing, setRefreshing]     = useState(false)

  // Profile for isPro check
  const [profile, setProfile] = useState(null)

  // Add ticker form
  const [tickerInput, setTickerInput] = useState('')
  const [tickerError, setTickerError] = useState('')
  const [addingTicker, setAddingTicker] = useState(false)

  // Upgrade modal
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  // Expense log
  const [expTab, setExpTab]   = useState('today')
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES)
  const [expAmt, setExpAmt]   = useState('')
  const [expCat, setExpCat]   = useState('Food')
  const [expNote, setExpNote] = useState('')

  const intervalRef = useRef(null)

  // ── Load profile + watchlist on mount ─────────────────────
  useEffect(() => {
    async function loadInitialData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: prof }, { data: wl }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase
          .from('watchlist')
          .select('id, ticker, display_order')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('display_order', { ascending: true, nullsFirst: false })
          .order('added_at', { ascending: true }),
      ])

      if (prof) setProfile(prof)
      const items = (wl || []).map(r => ({ id: r.id, ticker: r.ticker }))
      setWatchlistItems(items)
      setWatchlistLoading(false)
    }
    loadInitialData()
  }, [])

  // ── Fetch/refresh stock prices when watchlist changes ──────
  async function fetchStocks(syms, isRefresh = false) {
    if (syms.length === 0) { setStocksLoading(false); return }
    if (isRefresh) setRefreshing(true)
    else setStocksLoading(true)
    try {
      const res = await fetch(`/api/stocks?tickers=${syms.join(',')}`)
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
      setStocksLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (watchlistLoading) return
    const syms = watchlistItems.map(w => w.ticker)
    clearInterval(intervalRef.current)
    fetchStocks(syms)
    intervalRef.current = setInterval(() => fetchStocks(syms, true), 30_000)
    return () => clearInterval(intervalRef.current)
  }, [watchlistItems, watchlistLoading])

  // ── Add ticker ─────────────────────────────────────────────
  async function addTicker() {
    const sym = tickerInput.trim().toUpperCase()
    setTickerError('')

    if (!sym) return
    if (!TICKER_RE.test(sym)) {
      setTickerError('Tickers must be 1–10 letters (A–Z only).')
      return
    }
    if (watchlistItems.find(w => w.ticker === sym)) {
      setTickerError(`${sym} is already in your watchlist.`)
      return
    }

    const proUser = profile && isPro(profile)
    if (watchlistItems.length >= FREE_LIMIT && !proUser) {
      setUpgradeOpen(true)
      return
    }

    setAddingTicker(true)
    try {
      // Validate ticker via stocks API
      const res = await fetch(`/api/stocks?tickers=${sym}`)
      const json = res.ok ? await res.json() : {}
      const found = Array.isArray(json.stocks) && json.stocks.length > 0 &&
        json.stocks.some(s => s.symbol === sym && s.price !== '$0.00')

      if (!found) {
        setTickerError(`"${sym}" not found. Check the symbol and try again.`)
        return
      }

      // Optimistic add
      const optimisticItem = { id: `opt-${sym}`, ticker: sym }
      setWatchlistItems(prev => [...prev, optimisticItem])
      setTickerInput('')

      // Persist to DB
      const { data: { user } } = await supabase.auth.getUser()
      const { data: inserted, error } = await supabase
        .from('watchlist')
        .insert({
          user_id:       user.id,
          ticker:        sym,
          display_order: watchlistItems.length + 1,
          is_active:     true,
        })
        .select('id, ticker')
        .single()

      if (error) throw error

      // Replace optimistic row with real DB row
      setWatchlistItems(prev =>
        prev.map(w => w.id === optimisticItem.id ? { id: inserted.id, ticker: inserted.ticker } : w)
      )
      toast?.success?.(`${sym} added to watchlist`)
    } catch (err) {
      // Roll back optimistic add on failure
      setWatchlistItems(prev => prev.filter(w => w.ticker !== sym))
      setTickerError('Failed to add ticker. Please try again.')
      console.error('[watchlist add]', err)
    } finally {
      setAddingTicker(false)
    }
  }

  // ── Remove ticker (soft delete) ────────────────────────────
  async function removeTicker(item) {
    // Optimistic remove
    setWatchlistItems(prev => prev.filter(w => w.id !== item.id))

    try {
      const { error } = await supabase
        .from('watchlist')
        .update({ is_active: false })
        .eq('id', item.id)
      if (error) throw error
    } catch (err) {
      // Roll back
      setWatchlistItems(prev => [...prev, item])
      toast?.error?.('Failed to remove ticker.')
      console.error('[watchlist remove]', err)
    }
  }

  // ── Expense helpers ────────────────────────────────────────
  function addExpense() {
    const amt = parseFloat(expAmt)
    if (!amt || amt <= 0) return
    setExpenses(prev => [...prev, { name: expNote || expCat, cat: expCat, amt }])
    setExpAmt('')
    setExpNote('')
  }

  const totalToday = expenses.reduce((s, e) => s + e.amt, 0)
  const proUser    = profile && isPro(profile)
  const atLimit    = watchlistItems.length >= FREE_LIMIT && !proUser

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} />

      {/* Topbar */}
      <div className="exp-topbar">
        <button className="back-btn" onClick={onBack}>
          <i className="ph-bold ph-caret-left" />
          Dashboard
        </button>
        <div className="exp-label">
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--fin-col)', flexShrink: 0 }} />
          Finance
        </div>
      </div>

      {/* Content */}
      <div className="exp-content">
        <div className="eg2">
          {/* LEFT COLUMN */}
          <div className="ecol">
            {/* Watchlist */}
            <div className="ec">
              <div className="e-label fin" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>
                  Watchlist{' '}
                  <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-3)', textTransform: 'none', letterSpacing: 0 }}>
                    (Free: {FREE_LIMIT} · Pro: unlimited)
                  </span>
                </span>
                {refreshing && <span className="stock-refresh-dot" />}
              </div>

              {watchlistLoading || stocksLoading ? (
                <TickerRowSkeleton />
              ) : watchlistItems.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--text-3)', padding: '12px 0', textAlign: 'center' }}>
                  No stocks yet — add a ticker below.
                </div>
              ) : (
                watchlistItems.map(item => {
                  const s = stockMap[item.ticker]
                  return (
                    <div className="e-ticker" key={item.id} style={{ alignItems: 'center' }}>
                      <div>
                        <div className="e-tsym">{item.ticker}</div>
                        <div className="e-tname">{s?.name || item.ticker}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div className="e-tprice" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {s?.price ?? '—'}
                          </div>
                          <div style={{ fontSize: 12, color: s?.up ? '#22C55E' : '#EF4444', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                            {s?.changePercent ?? '—'}
                          </div>
                        </div>
                        <button
                          className="ticker-remove-btn"
                          onClick={() => removeTicker(item)}
                          title={`Remove ${item.ticker}`}
                          aria-label={`Remove ${item.ticker} from watchlist`}
                        >
                          <i className="ph-bold ph-x" style={{ fontSize: 11 }} />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}

              <div className="e-add" style={{ marginTop: 8 }}>
                <input
                  className="e-input"
                  placeholder={atLimit ? 'Upgrade to add more' : 'Add ticker…'}
                  style={{ flex: 1, textTransform: 'uppercase' }}
                  value={tickerInput}
                  onChange={e => { setTickerInput(e.target.value); setTickerError('') }}
                  onKeyDown={e => e.key === 'Enter' && !addingTicker && addTicker()}
                  disabled={addingTicker}
                />
                <button
                  className="e-btn-g"
                  onClick={addTicker}
                  disabled={addingTicker || !tickerInput.trim()}
                >
                  {addingTicker ? '…' : 'Add'}
                </button>
              </div>

              {tickerError && <div className="ticker-error">{tickerError}</div>}

              {atLimit && (
                <div style={{ fontSize: 12, color: 'var(--life-col)', marginTop: 8, padding: '8px 10px', background: 'var(--life-bg)', borderRadius: 8, border: '0.5px solid var(--life-bdr)' }}>
                  You've reached the {FREE_LIMIT}-stock limit on the free plan.{' '}
                  <span
                    style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}
                    onClick={() => setUpgradeOpen(true)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setUpgradeOpen(true)}
                  >
                    Upgrade to Pro
                  </span>
                </div>
              )}
            </div>

            {/* Sentiment */}
            <div className="ec">
              <div className="e-label fin">Stock sentiment</div>
              {SENTIMENT.map((s, i) => (
                <div key={s.sym} style={{ display: 'flex', alignItems: 'flex-start', padding: '8px 0', borderBottom: i < SENTIMENT.length - 1 ? '0.5px solid var(--sub-divider)' : 'none', gap: 8 }}>
                  <div style={{ minWidth: 44 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{s.sym}</div>
                    <span className={`sent-badge-e ${s.cls}`}>{s.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>{s.note}</div>
                </div>
              ))}
            </div>

            {/* Income goal */}
            <div className="ec grow">
              <div className="e-label fin">Income goal tracker</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Monthly target</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>$6,200 / $8,000</span>
              </div>
              <div className="e-prog">
                <div className="e-progb" style={{ width: '77%', background: 'var(--fin-col)' }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>77% of goal — keep going!</div>
              <div style={{ fontSize: 12, color: 'var(--fin-col)', marginTop: 10, fontStyle: 'italic' }}>
                &ldquo;You&rsquo;re on track, Alex. At this pace, you&rsquo;ll hit your target by the 26th.&rdquo;
              </div>
              <div className="e-add" style={{ marginTop: 14 }}>
                <input className="e-input" placeholder="$0.00" style={{ width: 90 }} />
                <input className="e-input" placeholder="Source (e.g. Freelance)" style={{ flex: 1 }} />
                <button className="e-btn-g">Log income</button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="ecol">
            {/* Word of the Day */}
            <div className="ec tg">
              <div className="e-label fin">Word of the day</div>
              <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--fin-col)', marginBottom: 8, fontFamily: 'var(--font-serif)' }}>
                Dollar-cost averaging
              </div>
              <div style={{ fontSize: 13, color: 'var(--fin-col)', opacity: 0.8, lineHeight: 1.7 }}>
                Investing a fixed amount at regular intervals regardless of price — reducing volatility and removing emotion from your investment decisions.
              </div>
            </div>

            {/* Daily tip */}
            <div className="ec">
              <div className="e-label fin">Daily financial tip</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, fontStyle: 'italic' }}>
                &ldquo;Automating your savings — even $50/month — removes the decision entirely. Increase by 1% every quarter.&rdquo;
              </div>
            </div>

            {/* Expense log */}
            <div className="ec grow">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div className="e-label fin" style={{ marginBottom: 0 }}>Expense log</div>
              </div>

              <div className="fin-chart-tabs">
                {[['today', 'Today'], ['monthly', 'Monthly'], ['trend', '3-Month Trend']].map(([id, label]) => (
                  <div
                    key={id}
                    className={`fin-chart-tab${expTab === id ? ' active' : ''}`}
                    onClick={() => setExpTab(id)}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {expTab === 'today' && (
                <div>
                  {expenses.map((e, i) => (
                    <div key={i} className="e-row">
                      <div>
                        <div style={{ fontSize: 13, color: 'var(--text-1)' }}>{e.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{e.cat}</div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#EF4444', fontVariantNumeric: 'tabular-nums' }}>
                        −${e.amt.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-1)', padding: '8px 0', borderTop: '0.5px solid var(--border)', marginTop: 4 }}>
                    Total today:{' '}
                    <span style={{ color: '#EF4444', fontVariantNumeric: 'tabular-nums' }}>−${totalToday.toFixed(2)}</span>
                  </div>
                  <div className="e-add">
                    <input
                      className="e-input"
                      placeholder="$0.00"
                      style={{ width: 72 }}
                      value={expAmt}
                      onChange={e => setExpAmt(e.target.value)}
                    />
                    <select className="e-input" style={{ width: 110 }} value={expCat} onChange={e => setExpCat(e.target.value)}>
                      {EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <input
                      className="e-input"
                      placeholder="Note"
                      style={{ flex: 1 }}
                      value={expNote}
                      onChange={e => setExpNote(e.target.value)}
                    />
                    <button className="e-btn-g" onClick={addExpense}>Add</button>
                  </div>
                </div>
              )}

              {expTab === 'monthly' && (
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>April 2026 — $1,842 total</div>
                  {MONTHLY_CATS.map(c => (
                    <div key={c.cat} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.color, display: 'inline-block' }} />
                          {c.cat}
                        </span>
                        <span style={{ fontWeight: 500, color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>
                          ${c.amt}{' '}
                          <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>({c.pct}%)</span>
                        </span>
                      </div>
                      <div className="e-prog">
                        <div className="e-progb" style={{ width: `${c.pct * 2}%`, background: c.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {expTab === 'trend' && (
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>Monthly spend — Feb, Mar, Apr 2026</div>
                  <div style={{ height: 140, background: 'var(--input-bg)', borderRadius: 10, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <canvas id="c-expense-trend" style={{ width: '100%', height: '100%' }} />
                  </div>
                  <div style={{ padding: 10, background: 'var(--fin-bg)', borderRadius: 9, border: '0.5px solid var(--fin-bdr)' }}>
                    <div style={{ fontSize: 12, color: 'var(--fin-col)', lineHeight: 1.6, fontStyle: 'italic' }}>
                      &ldquo;Your food spend dropped 12% from March. Entertainment is up slightly — worth keeping an eye on.&rdquo;
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
