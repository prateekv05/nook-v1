'use client'

import { useState } from 'react'
import DailyInputs   from '../tracking/DailyInputs'
import AnalyticsTabs  from '../tracking/AnalyticsTabs'
import HistoryList    from '../tracking/HistoryList'

export default function TrackingSection({ onBack }) {
  const [panel, setPanel] = useState('log')

  return (
    <div className="section-wrap">
      <div className="section-header">
        <button className="section-back-btn" onClick={onBack} aria-label="Back">
          <i className="ph-bold ph-arrow-left" />
        </button>
        <div>
          <div className="section-title" style={{ color: 'var(--know-col)' }}>Tracking</div>
          <div className="section-sub">Log today's health &amp; focus metrics</div>
        </div>
      </div>

      {/* Tab bar matches reference track-tab-bar */}
      <div className="track-tab-bar" style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
        <button
          className={`chart-tab${panel === 'log' ? ' active' : ''}`}
          style={{ padding: '7px 20px', borderRadius: 8 }}
          onClick={() => setPanel('log')}
        >
          Log today
        </button>
        <button
          className={`chart-tab${panel === 'analytics' ? ' active' : ''}`}
          style={{ padding: '7px 20px', borderRadius: 8 }}
          onClick={() => setPanel('analytics')}
        >
          Analytics
        </button>
        <button
          className={`chart-tab${panel === 'history' ? ' active' : ''}`}
          style={{ padding: '7px 20px', borderRadius: 8 }}
          onClick={() => setPanel('history')}
        >
          History
        </button>
      </div>

      {panel === 'log'       && <DailyInputs   />}
      {panel === 'analytics' && <AnalyticsTabs />}
      {panel === 'history'   && <HistoryList   />}
    </div>
  )
}
