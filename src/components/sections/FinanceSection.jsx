'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { isPro } from '@/lib/isPro'
import { useToast } from '@/hooks/useToast'
import UpgradeModal from '@/components/ui/UpgradeModal'
import { useAIContent } from '@/hooks/useAIContent'
import { drawBarChart } from '@/lib/chart-utils'

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
  { sym: 'AAPL', label: 'Bullish', cls: 'bullish', note: 'Strong earnings beat expected. Analysts raise price targets.' },
  { sym: 'TSLA', label: 'Neutral', cls: 'neutral', note: 'Mixed delivery signals. Watch for macro headwinds.' },
  { sym: 'MSFT', label: 'Bullish', cls: 'bullish', note: 'Azure growth accelerating on AI enterprise demand.' },
]

const EXPENSE_CATS = ['Food', 'Transport', 'Entertainment', 'Health', 'Utilities', 'Other']
const FREE_LIMIT   = 3
const TICKER_RE    = /^[A-Z]{1,10}$/

const CAT_COLORS = {
  Food:          '#22C55E',
  Transport:     '#60A5FA',
  Entertainment: '#A78BFA',
  Health:        '#F59E0B',
  Utilities:     '#F87171',
  Other:         '#94A3B8',
}

const CAT_ICONS = {
  Food:          'ph-fork-knife',
  Transport:     'ph-car',
  Entertainment: 'ph-television',
  Health:        'ph-heartbeat',
  Utilities:     'ph-lightning',
  Other:         'ph-tag',
}

function ExpRowSkeleton() {
  return (
    <>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid var(--sub-divider)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div className="ticker-skel-bar" style={{ width: 120, height: 12 }} />
            <div className="ticker-skel-bar" style={{ width: 60, height: 10 }} />
          </div>
          <div className="ticker-skel-bar" style={{ width: 50, height: 12 }} />
        </div>
      ))}
    </>
  )
}

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
  const toast    = useToast()
  const supabase = createClient()

  // Watchlist
  const [watchlistItems, setWatchlistItems]   = useState([])
  const [watchlistLoading, setWatchlistLoading] = useState(true)

  // Stock prices
  const [stockMap, setStockMap]             = useState({})
  const [stocksLoading, setStocksLoading]   = useState(false)
  const [refreshing, setRefreshing]         = useState(false)

  // Profile + userId
  const [profile, setProfile] = useState(null)
  const [userId, setUserId]   = useState(null)

  // Add ticker form
  const [tickerInput, setTickerInput]   = useState('')
  const [tickerError, setTickerError]   = useState('')
  const [addingTicker, setAddingTicker] = useState(false)

  // Upgrade modal
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  // Expense log tabs
  const [expTab, setExpTab]           = useState('today')
  const [expAmt, setExpAmt]           = useState('')
  const [expCat, setExpCat]           = useState('Food')
  const [expNote, setExpNote]         = useState('')
  const [addingExpense, setAddingExpense] = useState(false)

  // Today's expenses
  const [todayExpenses, setTodayExpenses] = useState([])
  const [todayLoading, setTodayLoading]   = useState(true)

  // Monthly grouped by category
  const [monthlyData, setMonthlyData]       = useState(null)
  const [monthlyLoading, setMonthlyLoading] = useState(false)

  // 3-month trend
  const [trendMonths, setTrendMonths]   = useState([])
  const [trendDataset, setTrendDataset] = useState([])
  const [trendLoading, setTrendLoading] = useState(false)
  const [trendInsightKey, setTrendInsightKey] = useState(null)
  const [trendInsightCtx, setTrendInsightCtx] = useState(null)

  // Income goal
  const [incomeGoal, setIncomeGoal]       = useState(undefined)  // undefined = loading, null = not set
  const [incomeTotal, setIncomeTotal]     = useState(0)
  const [incomeLoading, setIncomeLoading] = useState(true)
  const [incomeAmt, setIncomeAmt]         = useState('')
  const [incomeSource, setIncomeSource]   = useState('')
  const [addingIncome, setAddingIncome]   = useState(false)

  // Goal setup form (shown when no goal is set)
  const [goalSetupAmt, setGoalSetupAmt]       = useState('')
  const [goalSetupPeriod, setGoalSetupPeriod] = useState('Monthly')
  const [savingGoal, setSavingGoal]           = useState(false)

  const trendCanvasRef = useRef(null)
  const intervalRef    = useRef(null)

  const todayKey = new Date().toISOString().slice(0, 10)
  const { content: wodContent, loading: wodLoading } = useAIContent({ type: 'word-of-day', key: `word-of-day-${todayKey}` })
  const { content: tipContent, loading: tipLoading } = useAIContent({ type: 'daily-tip',   key: `daily-tip-${todayKey}` })
  const { content: insightContent, loading: insightLoading } = useAIContent({ type: 'ai-insights', key: trendInsightKey, userContext: trendInsightCtx })
  const wod = parseWOD(wodContent)

  // ── Load profile + watchlist + today expenses + income on mount ──
  useEffect(() => {
    async function loadInitialData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const now   = new Date()
      const today = now.toISOString().slice(0, 10)

      const [{ data: prof }, { data: wl }, { data: todayExp }, { data: prefs }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase
          .from('watchlist')
          .select('id, ticker, display_order')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('display_order', { ascending: true, nullsFirst: false })
          .order('added_at', { ascending: true }),
        supabase
          .from('expense_entries')
          .select('id, amount, category, note, date, created_at')
          .eq('user_id', user.id)
          .eq('date', today)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false }),
        supabase
          .from('user_preferences')
          .select('income_goal_amount, income_goal_period')
          .eq('user_id', user.id)
          .single(),
      ])

      if (prof) setProfile(prof)
      setWatchlistItems((wl || []).map(r => ({ id: r.id, ticker: r.ticker })))
      setWatchlistLoading(false)
      setTodayExpenses(todayExp || [])
      setTodayLoading(false)

      const goalAmt    = prefs?.income_goal_amount ?? null
      const goalPeriod = prefs?.income_goal_period ?? 'Monthly'
      if (goalAmt) {
        setIncomeGoal({ amount: parseFloat(goalAmt), period: goalPeriod })
        await loadIncomeTotal(user.id, goalPeriod)
      } else {
        setIncomeGoal(null)
        setIncomeLoading(false)
      }
    }
    loadInitialData()
  }, [])

  // ── Load monthly when tab becomes active ───────────────────
  useEffect(() => {
    if (expTab !== 'monthly' || monthlyData !== null || !userId) return
    loadMonthlyExpenses()
  }, [expTab, userId])

  // ── Load trend when tab becomes active ─────────────────────
  useEffect(() => {
    if (expTab !== 'trend' || trendMonths.length > 0 || !userId) return
    loadTrendExpenses()
  }, [expTab, userId])

  // ── Redraw chart when trend data or canvas ready ───────────
  useEffect(() => {
    if (expTab !== 'trend' || trendMonths.length === 0 || !trendCanvasRef.current) return
    const maxVal = Math.max(...trendDataset.flatMap(ds => ds.data)) || 100
    const yMax   = Math.ceil((maxVal * 1.2) / 100) * 100
    drawBarChart(trendCanvasRef.current, trendMonths, trendDataset, { yMax, stacked: true })
  }, [expTab, trendMonths, trendDataset])

  // ── Fetch / refresh stock prices ───────────────────────────
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

  // ── Load monthly expenses ──────────────────────────────────
  async function loadMonthlyExpenses() {
    if (!userId) return
    setMonthlyLoading(true)
    try {
      const now        = new Date()
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
      const nextMonth  = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      const monthEnd   = nextMonth.toISOString().slice(0, 10)

      const { data, error } = await supabase
        .from('expense_entries')
        .select('amount, category')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .gte('date', monthStart)
        .lt('date', monthEnd)

      if (error) throw error

      const grouped = {}
      let total = 0
      for (const row of (data || [])) {
        const cat = row.category || 'Other'
        grouped[cat] = (grouped[cat] || 0) + parseFloat(row.amount)
        total += parseFloat(row.amount)
      }

      setMonthlyData({ grouped, total })
    } catch (err) {
      toast?.error?.('Failed to load monthly expenses.')
      console.error('[monthly expenses]', err)
    } finally {
      setMonthlyLoading(false)
    }
  }

  // ── Load 3-month trend ─────────────────────────────────────
  async function loadTrendExpenses() {
    if (!userId) return
    setTrendLoading(true)
    try {
      const now           = new Date()
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      const startDate     = threeMonthsAgo.toISOString().slice(0, 10)

      const { data, error } = await supabase
        .from('expense_entries')
        .select('amount, category, date')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .gte('date', startDate)

      if (error) throw error

      const byMonth = {}
      for (const row of (data || [])) {
        const d      = new Date(row.date + 'T12:00:00')
        const mKey   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const mLabel = d.toLocaleDateString('en-US', { month: 'short' })
        if (!byMonth[mKey]) byMonth[mKey] = { label: mLabel, cats: {} }
        const cat = row.category || 'Other'
        byMonth[mKey].cats[cat] = (byMonth[mKey].cats[cat] || 0) + parseFloat(row.amount)
      }

      const monthKeys = Object.keys(byMonth).sort()
      const labels    = monthKeys.map(k => byMonth[k].label)

      const datasets = EXPENSE_CATS
        .map(cat => ({
          color: CAT_COLORS[cat] || '#94A3B8',
          label: cat,
          data:  monthKeys.map(k => byMonth[k]?.cats[cat] || 0),
        }))
        .filter(ds => ds.data.some(v => v > 0))

      setTrendMonths(labels)
      setTrendDataset(datasets)

      if (monthKeys.length >= 2) {
        const thisKey   = monthKeys[monthKeys.length - 1]
        const lastKey   = monthKeys[monthKeys.length - 2]
        const thisM     = byMonth[thisKey]
        const lastM     = byMonth[lastKey]
        const thisTotal = Object.values(thisM.cats).reduce((s, v) => s + v, 0)
        const lastTotal = Object.values(lastM.cats).reduce((s, v) => s + v, 0)
        const summary   = `This month (${thisM.label}): ${Object.entries(thisM.cats).map(([c, v]) => `${c} $${v.toFixed(0)}`).join(', ')}. Total: $${thisTotal.toFixed(0)}. Last month (${lastM.label}): ${Object.entries(lastM.cats).map(([c, v]) => `${c} $${v.toFixed(0)}`).join(', ')}. Total: $${lastTotal.toFixed(0)}.`
        setTrendInsightKey(`expense-insights-${thisKey}`)
        setTrendInsightCtx(summary)
      }
    } catch (err) {
      toast?.error?.('Failed to load expense trend.')
      console.error('[trend expenses]', err)
    } finally {
      setTrendLoading(false)
    }
  }

  // ── Load income total for the current period ──────────────
  async function loadIncomeTotal(uid, period) {
    setIncomeLoading(true)
    try {
      const now   = new Date()
      let startDate, endDate
      if (period === 'Yearly') {
        startDate = `${now.getFullYear()}-01-01`
        endDate   = `${now.getFullYear() + 1}-01-01`
      } else {
        startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
        const next = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        endDate   = next.toISOString().slice(0, 10)
      }

      const { data, error } = await supabase
        .from('income_entries')
        .select('amount')
        .eq('user_id', uid)
        .gte('date', startDate)
        .lt('date', endDate)

      if (error) throw error

      const total = (data || []).reduce((s, r) => s + parseFloat(r.amount), 0)
      setIncomeTotal(total)
    } catch (err) {
      toast?.error?.('Failed to load income data.')
      console.error('[income total]', err)
    } finally {
      setIncomeLoading(false)
    }
  }

  // ── Log income entry ───────────────────────────────────────
  async function logIncome() {
    const amt = parseFloat(incomeAmt)
    if (!amt || amt <= 0 || !userId || !incomeGoal) return
    setAddingIncome(true)

    const prevTotal = incomeTotal
    setIncomeTotal(prev => prev + amt)
    setIncomeAmt('')
    setIncomeSource('')

    try {
      const { error } = await supabase
        .from('income_entries')
        .insert({
          user_id: userId,
          amount:  amt,
          source:  incomeSource.trim() || null,
          date:    new Date().toISOString().slice(0, 10),
        })
      if (error) throw error
      toast?.success?.(`$${amt.toFixed(2)} income logged`)
    } catch (err) {
      setIncomeTotal(prevTotal)
      setIncomeAmt(String(amt))
      toast?.error?.('Failed to log income.')
      console.error('[log income]', err)
    } finally {
      setAddingIncome(false)
    }
  }

  // ── Save income goal to user_preferences ──────────────────
  async function saveGoal() {
    const amt = parseFloat(goalSetupAmt)
    if (!amt || amt <= 0 || !userId) return
    setSavingGoal(true)
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({ user_id: userId, income_goal_amount: amt, income_goal_period: goalSetupPeriod }, { onConflict: 'user_id' })
      if (error) throw error

      setIncomeGoal({ amount: amt, period: goalSetupPeriod })
      setGoalSetupAmt('')
      toast?.success?.('Income goal saved!')
      await loadIncomeTotal(userId, goalSetupPeriod)
    } catch (err) {
      toast?.error?.('Failed to save income goal.')
      console.error('[save goal]', err)
    } finally {
      setSavingGoal(false)
    }
  }

  // ── Add ticker ─────────────────────────────────────────────
  async function addTicker() {
    const sym = tickerInput.trim().toUpperCase()
    setTickerError('')
    if (!sym) return
    if (!TICKER_RE.test(sym)) { setTickerError('Tickers must be 1–10 letters (A–Z only).'); return }
    if (watchlistItems.find(w => w.ticker === sym)) { setTickerError(`${sym} is already in your watchlist.`); return }

    const proUser = profile && isPro(profile)
    if (watchlistItems.length >= FREE_LIMIT && !proUser) { setUpgradeOpen(true); return }

    setAddingTicker(true)
    try {
      const res   = await fetch(`/api/stocks?tickers=${sym}`)
      const json  = res.ok ? await res.json() : {}
      const found = Array.isArray(json.stocks) && json.stocks.length > 0 &&
        json.stocks.some(s => s.symbol === sym && s.price !== '$0.00')

      if (!found) { setTickerError(`"${sym}" not found. Check the symbol and try again.`); return }

      const optimisticItem = { id: `opt-${sym}`, ticker: sym }
      setWatchlistItems(prev => [...prev, optimisticItem])
      setTickerInput('')

      const { data: { user } } = await supabase.auth.getUser()
      const { data: inserted, error } = await supabase
        .from('watchlist')
        .insert({ user_id: user.id, ticker: sym, display_order: watchlistItems.length + 1, is_active: true })
        .select('id, ticker')
        .single()

      if (error) throw error

      setWatchlistItems(prev =>
        prev.map(w => w.id === optimisticItem.id ? { id: inserted.id, ticker: inserted.ticker } : w)
      )
      toast?.success?.(`${sym} added to watchlist`)
    } catch (err) {
      setWatchlistItems(prev => prev.filter(w => w.ticker !== sym))
      setTickerError('Failed to add ticker. Please try again.')
      console.error('[watchlist add]', err)
    } finally {
      setAddingTicker(false)
    }
  }

  // ── Remove ticker (soft delete) ────────────────────────────
  async function removeTicker(item) {
    setWatchlistItems(prev => prev.filter(w => w.id !== item.id))
    try {
      const { error } = await supabase.from('watchlist').update({ is_active: false }).eq('id', item.id)
      if (error) throw error
    } catch (err) {
      setWatchlistItems(prev => [...prev, item])
      toast?.error?.('Failed to remove ticker.')
      console.error('[watchlist remove]', err)
    }
  }

  // ── Add expense ────────────────────────────────────────────
  async function addExpense() {
    const amt = parseFloat(expAmt)
    if (!amt || amt <= 0 || !userId) return
    setAddingExpense(true)

    const today      = new Date().toISOString().slice(0, 10)
    const optimistic = {
      id:         `opt-${Date.now()}`,
      amount:     amt,
      category:   expCat,
      note:       expNote.trim() || null,
      date:       today,
      created_at: new Date().toISOString(),
    }

    setTodayExpenses(prev => [optimistic, ...prev])
    setExpAmt('')
    setExpNote('')

    try {
      const { data: inserted, error } = await supabase
        .from('expense_entries')
        .insert({ user_id: userId, amount: amt, category: expCat, note: expNote.trim() || null, date: today, is_deleted: false })
        .select('id, amount, category, note, date, created_at')
        .single()

      if (error) throw error

      setTodayExpenses(prev => prev.map(e => e.id === optimistic.id ? inserted : e))
    } catch (err) {
      setTodayExpenses(prev => prev.filter(e => e.id !== optimistic.id))
      setExpAmt(String(amt))
      toast?.error?.('Failed to add expense.')
      console.error('[add expense]', err)
    } finally {
      setAddingExpense(false)
    }
  }

  // ── Delete expense (soft delete) ──────────────────────────
  async function deleteExpense(entry) {
    setTodayExpenses(prev => prev.filter(e => e.id !== entry.id))
    try {
      const { error } = await supabase.from('expense_entries').update({ is_deleted: true }).eq('id', entry.id)
      if (error) throw error
    } catch (err) {
      setTodayExpenses(prev => [entry, ...prev])
      toast?.error?.('Failed to delete expense.')
      console.error('[delete expense]', err)
    }
  }

  const totalToday = todayExpenses.reduce((s, e) => s + parseFloat(e.amount), 0)
  const proUser    = profile && isPro(profile)
  const atLimit    = watchlistItems.length >= FREE_LIMIT && !proUser

  const monthlyBreakdown = monthlyData
    ? EXPENSE_CATS
        .map(cat => ({ cat, color: CAT_COLORS[cat], amt: monthlyData.grouped[cat] || 0 }))
        .filter(c => c.amt > 0)
        .sort((a, b) => b.amt - a.amt)
    : []

  const now       = new Date()
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 0 8px' }}>
                  <i className="ph-bold ph-chart-line-up" style={{ fontSize: 24, color: 'var(--text-3)' }} />
                  <div style={{ fontSize: 13, color: 'var(--text-2)', textAlign: 'center', lineHeight: 1.6 }}>
                    Add your first stock to start tracking →
                  </div>
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
                          <div className="e-tprice" style={{ fontVariantNumeric: 'tabular-nums' }}>{s?.price ?? '—'}</div>
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
                <button className="e-btn-g" onClick={addTicker} disabled={addingTicker || !tickerInput.trim()}>
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <div className="e-label fin" style={{ marginBottom: 0 }}>Income goal tracker</div>
                {incomeGoal && (
                  <button
                    style={{ fontSize: 11, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 4, transition: 'color 0.2s' }}
                    onClick={() => { setIncomeGoal(null); setGoalSetupAmt(String(incomeGoal.amount)); setGoalSetupPeriod(incomeGoal.period) }}
                    title="Edit goal"
                  >
                    Edit
                  </button>
                )}
              </div>

              {incomeGoal === undefined || incomeLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="ticker-skel-bar" style={{ width: '100%', height: 12 }} />
                  <div className="ticker-skel-bar" style={{ width: '100%', height: 8 }} />
                  <div className="ticker-skel-bar" style={{ width: 140, height: 10 }} />
                </div>
              ) : incomeGoal === null ? (
                // ── Goal setup form ──────────────────────────────
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 10, lineHeight: 1.5 }}>
                    Set an income goal to track your progress each month or year.
                  </div>
                  <div className="e-add" style={{ flexWrap: 'wrap', gap: 6 }}>
                    <input
                      className="e-input"
                      placeholder="Goal amount"
                      type="number"
                      min="1"
                      step="100"
                      style={{ width: 110 }}
                      value={goalSetupAmt}
                      onChange={e => setGoalSetupAmt(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !savingGoal && saveGoal()}
                      disabled={savingGoal}
                    />
                    <select
                      className="e-input"
                      style={{ width: 100 }}
                      value={goalSetupPeriod}
                      onChange={e => setGoalSetupPeriod(e.target.value)}
                      disabled={savingGoal}
                    >
                      <option>Monthly</option>
                      <option>Yearly</option>
                    </select>
                    <button
                      className="e-btn-g"
                      style={{ flex: 1 }}
                      onClick={saveGoal}
                      disabled={savingGoal || !goalSetupAmt || parseFloat(goalSetupAmt) <= 0}
                    >
                      {savingGoal ? 'Saving…' : 'Set goal'}
                    </button>
                  </div>
                </div>
              ) : (
                // ── Progress view ────────────────────────────────
                (() => {
                  const pct        = Math.min((incomeTotal / incomeGoal.amount) * 100, 100)
                  const barColor   = pct >= 75 ? '#22C55E' : pct >= 50 ? '#F59E0B' : '#EF4444'
                  const now        = new Date()
                  const periodLabel = incomeGoal.period === 'Yearly'
                    ? `${now.getFullYear()} goal`
                    : now.toLocaleDateString('en-US', { month: 'long' }) + ' goal'
                  const daysLeft   = incomeGoal.period === 'Yearly'
                    ? Math.ceil((new Date(now.getFullYear() + 1, 0, 1) - now) / 86400000)
                    : Math.ceil((new Date(now.getFullYear(), now.getMonth() + 1, 1) - now) / 86400000)
                  const statusMsg  = pct >= 100
                    ? 'Goal reached!'
                    : pct >= 75
                    ? `${pct.toFixed(0)}% reached — on track with ${daysLeft}d left`
                    : pct >= 50
                    ? `${pct.toFixed(0)}% reached — ${daysLeft}d to close the gap`
                    : `${pct.toFixed(0)}% reached — ${daysLeft}d left, keep pushing`

                  return (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                        <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{periodLabel}</span>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>
                          ${incomeTotal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} / ${incomeGoal.amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="e-prog">
                        <div className="e-progb" style={{ width: `${pct}%`, background: barColor, transition: 'width 0.5s var(--ease-spring)' }} />
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>{statusMsg}</div>

                      <div className="e-add" style={{ marginTop: 14 }}>
                        <input
                          className="e-input"
                          placeholder="$0.00"
                          type="number"
                          min="0.01"
                          step="0.01"
                          style={{ width: 90 }}
                          value={incomeAmt}
                          onChange={e => setIncomeAmt(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !addingIncome && logIncome()}
                          disabled={addingIncome}
                        />
                        <input
                          className="e-input"
                          placeholder="Source (e.g. Freelance)"
                          style={{ flex: 1 }}
                          value={incomeSource}
                          onChange={e => setIncomeSource(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !addingIncome && logIncome()}
                          disabled={addingIncome}
                        />
                        <button
                          className="e-btn-g"
                          onClick={logIncome}
                          disabled={addingIncome || !incomeAmt || parseFloat(incomeAmt) <= 0}
                        >
                          {addingIncome ? '…' : 'Log'}
                        </button>
                      </div>
                    </>
                  )
                })()
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="ecol">
            {/* Word of the Day */}
            <div className="ec tg">
              <div className="e-label fin">Word of the day</div>
              {wodLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <AISkeleton height={20} />
                  <AISkeleton height={48} />
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 18, fontWeight: 500, color: 'var(--fin-col)', marginBottom: 8, fontFamily: 'var(--font-serif)' }}>
                    {wod.word || 'Dollar-cost averaging'}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--fin-col)', opacity: 0.8, lineHeight: 1.7 }}>
                    {wod.def || 'Investing a fixed amount at regular intervals regardless of price — reducing volatility and removing emotion from your investment decisions.'}
                  </div>
                </>
              )}
            </div>

            {/* Daily tip */}
            <div className="ec">
              <div className="e-label fin">Daily financial tip</div>
              {tipLoading ? (
                <AISkeleton height={48} />
              ) : (
                <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7, fontStyle: 'italic' }}>
                  &ldquo;{tipContent || 'Automating your savings — even $50/month — removes the decision entirely. Increase by 1% every quarter.'}&rdquo;
                </div>
              )}
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
                    role="tab"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setExpTab(id)}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* ── Today tab ─────────────────────────────────── */}
              {expTab === 'today' && (
                <div>
                  {todayLoading ? (
                    <ExpRowSkeleton />
                  ) : todayExpenses.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 0 8px' }}>
                      <i className="ph-bold ph-receipt" style={{ fontSize: 22, color: 'var(--text-3)' }} />
                      <div style={{ fontSize: 13, color: 'var(--text-3)', textAlign: 'center' }}>No expenses logged today</div>
                    </div>
                  ) : (
                    todayExpenses.map(e => (
                      <div key={e.id} className="e-row" style={{ alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: `${CAT_COLORS[e.category] || '#94A3B8'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <i className={`ph-bold ${CAT_ICONS[e.category] || 'ph-tag'}`} style={{ fontSize: 13, color: CAT_COLORS[e.category] || '#94A3B8' }} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {e.note || e.category}
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{e.category}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: '#EF4444', fontVariantNumeric: 'tabular-nums' }}>
                            −${parseFloat(e.amount).toFixed(2)}
                          </div>
                          <button
                            className="ticker-remove-btn"
                            onClick={() => deleteExpense(e)}
                            title="Delete expense"
                            aria-label="Delete expense"
                          >
                            <i className="ph-bold ph-x" style={{ fontSize: 11 }} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}

                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-1)', padding: '8px 0', borderTop: '0.5px solid var(--border)', marginTop: 4 }}>
                    Total today:{' '}
                    <span style={{ color: '#EF4444', fontVariantNumeric: 'tabular-nums' }}>−${totalToday.toFixed(2)}</span>
                  </div>

                  <div className="e-add">
                    <input
                      className="e-input"
                      placeholder="$0.00"
                      style={{ width: 72 }}
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={expAmt}
                      onChange={e => setExpAmt(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !addingExpense && addExpense()}
                      disabled={addingExpense}
                    />
                    <select
                      className="e-input"
                      style={{ width: 110 }}
                      value={expCat}
                      onChange={e => setExpCat(e.target.value)}
                      disabled={addingExpense}
                    >
                      {EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <input
                      className="e-input"
                      placeholder="Note"
                      style={{ flex: 1 }}
                      value={expNote}
                      onChange={e => setExpNote(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !addingExpense && addExpense()}
                      disabled={addingExpense}
                    />
                    <button
                      className="e-btn-g"
                      onClick={addExpense}
                      disabled={addingExpense || !expAmt || parseFloat(expAmt) <= 0}
                    >
                      {addingExpense ? '…' : 'Add'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Monthly tab ───────────────────────────────── */}
              {expTab === 'monthly' && (
                <div>
                  {monthlyLoading ? (
                    <>
                      <div className="ticker-skel-bar" style={{ width: 160, height: 12, marginBottom: 10 }} />
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ marginBottom: 10 }}>
                          <div className="ticker-skel-bar" style={{ width: '100%', height: 10, marginBottom: 4 }} />
                          <div className="ticker-skel-bar" style={{ width: '100%', height: 6 }} />
                        </div>
                      ))}
                    </>
                  ) : monthlyBreakdown.length === 0 ? (
                    <div style={{ fontSize: 13, color: 'var(--text-3)', padding: '12px 0', textAlign: 'center' }}>
                      No expenses this month yet.
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>
                        {monthName} —{' '}
                        <span style={{ color: 'var(--text-1)', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                          ${monthlyData.total.toFixed(2)} total
                        </span>
                      </div>
                      {monthlyBreakdown.map(c => {
                        const pct = monthlyData.total > 0 ? (c.amt / monthlyData.total) * 100 : 0
                        return (
                          <div key={c.cat} style={{ marginBottom: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.color, display: 'inline-block', flexShrink: 0 }} />
                                {c.cat}
                              </span>
                              <span style={{ fontWeight: 500, color: 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>
                                ${c.amt.toFixed(2)}{' '}
                                <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>({pct.toFixed(0)}%)</span>
                              </span>
                            </div>
                            <div className="e-prog">
                              <div className="e-progb" style={{ width: `${Math.min(pct * 2, 100)}%`, background: c.color }} />
                            </div>
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>
              )}

              {/* ── 3-Month Trend tab ─────────────────────────── */}
              {expTab === 'trend' && (
                <div>
                  {trendLoading ? (
                    <div style={{ height: 160, borderRadius: 10, marginBottom: 10, background: 'var(--input-bg)', backgroundImage: 'linear-gradient(90deg, var(--input-bg) 0%, var(--border) 50%, var(--input-bg) 100%)', backgroundSize: '400px 100%', animation: 'shimmer 1.4s infinite linear' }} />
                  ) : trendMonths.length === 0 ? (
                    <div style={{ fontSize: 13, color: 'var(--text-3)', padding: '12px 0', textAlign: 'center' }}>
                      Not enough data for a trend yet.
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 8 }}>
                        Monthly spend — {trendMonths.join(', ')}
                      </div>
                      <div style={{ position: 'relative', height: 140, marginBottom: 8 }}>
                        <canvas
                          ref={trendCanvasRef}
                          style={{ width: '100%', height: '100%', display: 'block' }}
                          height={140}
                        />
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginBottom: 10 }}>
                        {trendDataset.map(ds => (
                          <span key={ds.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-2)' }}>
                            <span style={{ width: 8, height: 8, borderRadius: 2, background: ds.color, flexShrink: 0 }} />
                            {ds.label}
                          </span>
                        ))}
                      </div>

                      <div style={{ padding: 10, background: 'var(--fin-bg)', borderRadius: 9, border: '0.5px solid var(--fin-bdr)' }}>
                        {insightLoading ? (
                          <AISkeleton height={36} />
                        ) : (
                          <div style={{ fontSize: 12, color: 'var(--fin-col)', lineHeight: 1.6, fontStyle: 'italic' }}>
                            &ldquo;{insightContent || 'Track your spending for a few months to unlock AI-powered insights.'}&rdquo;
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
