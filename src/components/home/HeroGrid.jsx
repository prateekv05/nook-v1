'use client'

import FinanceColumn from './FinanceColumn'
import KnowledgeColumn from './KnowledgeColumn'
import LifestyleColumn from './LifestyleColumn'

export default function HeroGrid({ setView, setSection }) {
  return (
    <div className="hero-grid">
      <FinanceColumn onExpand={() => { setSection('financial'); setView('expanded') }} />
      <KnowledgeColumn onExpand={() => { setSection('knowledge'); setView('expanded') }} />
      <LifestyleColumn onExpand={() => { setSection('lifestyle'); setView('expanded') }} />
    </div>
  )
}
