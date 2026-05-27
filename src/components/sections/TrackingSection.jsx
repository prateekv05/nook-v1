'use client'

import { useState } from 'react'
import DailyInputs  from '../tracking/DailyInputs'
import AnalyticsTabs from '../tracking/AnalyticsTabs'

export default function TrackingSection({ onBack }) {
  const [panel, setPanel] = useState('log')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div className="exp-topbar">
        <button className="back-btn" onClick={onBack}>
          <i className="ph-bold ph-caret-left" />
          Dashboard
        </button>
        <div className="exp-label">
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--know-col)', flexShrink: 0 }} />
          Tracking Window
        </div>
      </div>

      <div className="exp-content" style={{ overflow: 'auto' }}>
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
        </div>

        {panel === 'log'       && <DailyInputs />}
        {panel === 'analytics' && <AnalyticsTabs />}
      </div>
    </div>
  )
}
