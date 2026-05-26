'use client'

const NEWS = [
  {
    tag: 'AI',
    tagBg: 'var(--know-bg)',
    tagColor: 'var(--know-col)',
    title: 'OpenAI releases new reasoning model with improved coding abilities',
    src: 'TechCrunch',
  },
  {
    tag: 'Markets',
    tagBg: 'var(--fin-bg)',
    tagColor: 'var(--fin-col)',
    title: 'Fed signals two rate cuts possible in 2026 as inflation cools',
    src: 'Reuters',
  },
  {
    tag: 'Science',
    tagBg: 'var(--pink-bg)',
    tagColor: 'var(--pink-col)',
    title: 'New study links sleep quality directly to decision-making performance',
    src: 'Nature',
  },
]

export default function KnowledgeColumn({ onExpand }) {
  return (
    <div className="hero-col" onClick={onExpand}>
      <div className="hero-header know">
        <div className="hero-title know">
          <i className="ph-bold ph-book-open" />
          Knowledge
        </div>
        <div
          className="expand-icon know"
          onClick={e => { e.stopPropagation(); onExpand() }}
        >
          <i className="ph-bold ph-arrows-out" />
        </div>
      </div>

      <div className="hero-body">
        {/* Top News */}
        <div className="sub-section">
          <div className="sub-label">Top News</div>
          {NEWS.map(n => (
            <div className="news-item" key={n.title}>
              <span
                className="news-tag"
                style={{ background: n.tagBg, color: n.tagColor }}
              >
                {n.tag}
              </span>
              <div className="news-title">{n.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                <div className="news-src">{n.src}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Did You Know */}
        <div className="sub-section">
          <div className="sub-label">Did you know</div>
          <div className="did-you-know">
            &ldquo;The human brain processes visual information 60,000&times; faster than text, yet we spend 90% of learning time reading.&rdquo;
          </div>
        </div>

        {/* Concept of the Day */}
        <div className="sub-section">
          <div className="sub-label">Concept of the day</div>
          <div className="concept-name">Compounding</div>
          <div className="concept-def">The process where a quantity grows exponentially because gains are reinvested — making time your most powerful asset.</div>
        </div>
      </div>
    </div>
  )
}
