'use client'

import { useState } from 'react'

const TOPICS = [
  {
    id: 'ai',
    label: 'AI & Technology',
    tagBg: 'var(--know-bg)',
    tagColor: 'var(--know-col)',
    articles: [
      { title: 'OpenAI launches faster reasoning model for enterprise', src: 'The Verge' },
      { title: 'EU AI Act enforcement begins for developers', src: 'Reuters' },
      { title: 'Google DeepMind releases AlphaFold 3 open weights', src: 'Nature' },
    ],
  },
  {
    id: 'business',
    label: 'Business & Markets',
    tagBg: 'var(--fin-bg)',
    tagColor: 'var(--fin-col)',
    articles: [
      { title: 'Fed holds rates amid mixed inflation signals', src: 'FT' },
      { title: 'Nvidia surpasses $3T market cap again on AI demand', src: 'Bloomberg' },
      { title: 'Apple reports record services revenue in Q2', src: 'WSJ' },
    ],
  },
  {
    id: 'health',
    label: 'Health & Medicine',
    tagBg: 'var(--pink-bg)',
    tagColor: 'var(--pink-col)',
    articles: [
      { title: 'Sleep quality linked to long-term heart health', src: 'Nature Medicine' },
      { title: 'New vaccine approach targets multiple cancer types', src: 'NEJM' },
      { title: 'Study links daily walking to reduced dementia risk', src: 'Lancet' },
    ],
  },
  {
    id: 'geopolitics',
    label: 'Geopolitics',
    tagBg: 'var(--life-bg)',
    tagColor: 'var(--life-col)',
    articles: [
      { title: 'G7 agrees new digital trade framework', src: 'The Guardian' },
      { title: 'US-China trade talks resume in Geneva', src: 'Reuters' },
      { title: 'NATO allies increase defense spending pledges', src: 'BBC' },
    ],
  },
  {
    id: 'science',
    label: 'Science & Space',
    tagBg: 'var(--know-bg)',
    tagColor: 'var(--know-col)',
    articles: [
      { title: 'James Webb captures earliest galaxy ever observed', src: 'NASA' },
      { title: 'Fusion reactor hits energy output milestone', src: 'Science' },
      { title: 'New carbon-capture material breaks efficiency record', src: 'MIT' },
    ],
  },
]

export default function KnowledgeColumn({ onExpand }) {
  const [active, setActive] = useState(() => Object.fromEntries(TOPICS.map(t => [t.id, 0])))

  function setArticle(topicId, idx, e) {
    e.stopPropagation()
    setActive(prev => ({ ...prev, [topicId]: idx }))
  }

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

      <div className="hero-body know-hero-scroll">
        <div className="sub-label" style={{ marginBottom: 8 }}>Today&rsquo;s news</div>
        {TOPICS.map(topic => {
          const art = topic.articles[active[topic.id]]
          return (
            <div key={topic.id} className="know-topic-group">
              <div className="know-topic-header">
                <span
                  className="news-tag"
                  style={{ background: topic.tagBg, color: topic.tagColor }}
                >
                  {topic.label}
                </span>
                <div className="know-topic-dots">
                  {topic.articles.map((_, i) => (
                    <button
                      key={i}
                      className={`know-topic-dot${active[topic.id] === i ? ' active' : ''}`}
                      style={{ background: active[topic.id] === i ? topic.tagColor : undefined }}
                      onClick={e => setArticle(topic.id, i, e)}
                      aria-label={`Article ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
              <div className="know-topic-title">{art.title}</div>
              <div className="news-src">{art.src}</div>
            </div>
          )
        })}

        <div style={{ paddingTop: 12, borderTop: '0.5px solid var(--sub-divider)', marginTop: 4 }} onClick={e => e.stopPropagation()}>
          <div className="sub-label" style={{ marginBottom: 8 }}>Did you know?</div>
          <div className="did-you-know">&ldquo;The average person makes 35,000 decisions a day — most of them unconsciously. Simplifying your environment dramatically reduces decision fatigue.&rdquo;</div>
        </div>

        <div style={{ paddingTop: 12 }} onClick={e => e.stopPropagation()}>
          <div className="sub-label" style={{ marginBottom: 8 }}>Concept of the day</div>
          <div className="concept-name">First Principles Thinking</div>
          <div className="concept-def">Break problems down to their most fundamental truths and reason upward — rather than by analogy.</div>
        </div>
      </div>
    </div>
  )
}
