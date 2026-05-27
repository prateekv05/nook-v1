'use client'

import FinanceColumn from './FinanceColumn'
import KnowledgeColumn from './KnowledgeColumn'
import LifestyleColumn from './LifestyleColumn'
import { useAIContent } from '@/hooks/useAIContent'

export default function HeroGrid({ setView, setSection }) {
  const todayKey = new Date().toISOString().slice(0, 10)
  const { content, loading, error } = useAIContent({ type: 'positivity', key: `positivity-${todayKey}` })

  return (
    <>
      <div className="hero-grid">
        <FinanceColumn onExpand={() => { setSection('financial'); setView('expanded') }} />
        <KnowledgeColumn onExpand={() => { setSection('knowledge'); setView('expanded') }} />
        <LifestyleColumn onExpand={() => { setSection('lifestyle'); setView('expanded') }} />
      </div>

      <div className="positivity-strip">
        <div className="positivity-inner">
          <i className="ph-bold ph-sparkle positivity-icon" />
          <div style={{ flex: 1 }}>
            <div className="positivity-label">Positivity booster</div>
            {loading ? (
              <div style={{ height: 14, borderRadius: 6, background: 'var(--input-bg)', backgroundImage: 'linear-gradient(90deg, var(--input-bg) 0%, var(--border) 50%, var(--input-bg) 100%)', backgroundSize: '400px 100%', animation: 'shimmer 1.4s infinite linear', marginTop: 4, maxWidth: 480 }} />
            ) : error || !content ? (
              <div className="positivity-text" style={{ color: 'var(--text-3)' }}>Keep going — every small step counts.</div>
            ) : (
              <div className="positivity-text">&ldquo;{content}&rdquo;</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
