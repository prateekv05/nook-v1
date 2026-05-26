'use client'

import { useState } from 'react'

const INITIAL_TICKERS = [
  { sym: 'AAPL', name: 'Apple Inc.',  price: '$214.24', change: '+1.42%', up: true  },
  { sym: 'TSLA', name: 'Tesla Inc.',  price: '$172.63', change: '-0.87%', up: false },
  { sym: 'MSFT', name: 'Microsoft',   price: '$418.50', change: '+0.63%', up: true  },
]

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

export default function FinanceSection({ onBack }) {
  const [tickers, setTickers]       = useState(INITIAL_TICKERS)
  const [tickerInput, setTickerInput] = useState('')
  const [expTab, setExpTab]         = useState('today')
  const [expenses, setExpenses]     = useState(INITIAL_EXPENSES)
  const [expAmt, setExpAmt]         = useState('')
  const [expCat, setExpCat]         = useState('Food')
  const [expNote, setExpNote]       = useState('')

  const FREE_LIMIT = 3
  const atLimit = tickers.length >= FREE_LIMIT

  function addTicker() {
    const sym = tickerInput.trim().toUpperCase()
    if (!sym || atLimit || tickers.find(t => t.sym === sym)) return
    setTickers(prev => [...prev, { sym, name: sym, price: '—', change: '—', up: true }])
    setTickerInput('')
  }

  function addExpense() {
    const amt = parseFloat(expAmt)
    if (!amt || amt <= 0) return
    setExpenses(prev => [...prev, { name: expNote || expCat, cat: expCat, amt }])
    setExpAmt('')
    setExpNote('')
  }

  const totalToday = expenses.reduce((s, e) => s + e.amt, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
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
              <div className="e-label fin">
                Watchlist{' '}
                <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-3)', textTransform: 'none', letterSpacing: 0 }}>
                  (Free: 3 · Pro: unlimited)
                </span>
              </div>
              {tickers.map(t => (
                <div className="e-ticker" key={t.sym}>
                  <div>
                    <div className="e-tsym">{t.sym}</div>
                    <div className="e-tname">{t.name}</div>
                  </div>
                  <div>
                    <div className="e-tprice">{t.price}</div>
                    <div style={{ fontSize: 12, color: t.up ? '#22C55E' : '#EF4444', textAlign: 'right' }}>{t.change}</div>
                  </div>
                </div>
              ))}
              <div className="e-add">
                <input
                  className="e-input"
                  placeholder="Add ticker..."
                  style={{ flex: 1 }}
                  value={tickerInput}
                  onChange={e => setTickerInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addTicker()}
                  disabled={atLimit}
                />
                <button className="e-btn-g" onClick={addTicker} disabled={atLimit}>Add</button>
              </div>
              {atLimit && (
                <div style={{ fontSize: 12, color: 'var(--life-col)', marginTop: 8, padding: '8px 10px', background: 'var(--life-bg)', borderRadius: 8, border: '0.5px solid var(--life-bdr)' }}>
                  You've reached the 3-stock limit on the free plan.{' '}
                  <span style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}>Upgrade to Pro</span>
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

              {/* Tabs */}
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

              {/* Today panel */}
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

              {/* Monthly panel */}
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

              {/* 3-Month Trend panel */}
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
