'use client'

const TICKERS = [
  { sym: 'AAPL', name: 'Apple Inc.',  price: '$189.42', change: '+1.2%',  up: true  },
  { sym: 'MSFT', name: 'Microsoft',   price: '$412.18', change: '-0.4%',  up: false },
  { sym: 'TSLA', name: 'Tesla',       price: '$185.60', change: '+3.1%',  up: true  },
]

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

export default function FinanceColumn({ onExpand }) {
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
          <div className="sub-label">Watchlist</div>
          {TICKERS.map(t => (
            <div className="ticker-row" key={t.sym}>
              <div>
                <div className="t-sym">{t.sym}</div>
                <div className="t-name">{t.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="t-price">{t.price}</div>
                <div className={t.up ? 'up' : 'dn'}>{t.change}</div>
              </div>
            </div>
          ))}
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
        <div className="sub-section">
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
        </div>
      </div>
    </div>
  )
}
