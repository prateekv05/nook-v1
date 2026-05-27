'use client'

import FinanceColumn from './FinanceColumn'
import KnowledgeColumn from './KnowledgeColumn'
import LifestyleColumn from './LifestyleColumn'

export default function HeroGrid({ setView, setSection }) {
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
          <div>
            <div className="positivity-label">Positivity booster</div>
            <div className="positivity-text">
              &ldquo;You completed 5 of 7 goals last week. Your consistency is quietly building something real — progress compounds just like interest.&rdquo;
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
