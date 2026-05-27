'use client'

import { useState, useEffect } from 'react'
import { useAIContent } from '@/hooks/useAIContent'

function AISkeleton({ height = 36 }) {
  return (
    <div style={{ height, borderRadius: 8, background: 'var(--input-bg)', backgroundImage: 'linear-gradient(90deg, var(--input-bg) 0%, var(--border) 50%, var(--input-bg) 100%)', backgroundSize: '400px 100%', animation: 'shimmer 1.4s infinite linear' }} />
  )
}

function NewsItemSkeleton() {
  return (
    <div className="know-topic-group" style={{ pointerEvents: 'none' }}>
      <div className="know-topic-header">
        <div className="shimmer" style={{ width: 90, height: 20, borderRadius: 6 }} />
      </div>
      <div className="shimmer" style={{ width: '90%', height: 13, borderRadius: 5, marginBottom: 5 }} />
      <div className="shimmer" style={{ width: '60%', height: 13, borderRadius: 5, marginBottom: 4 }} />
      <div className="shimmer" style={{ width: 50, height: 11, borderRadius: 4 }} />
    </div>
  )
}

const FALLBACK_TOPICS = [
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

export default function KnowledgeColumn({ onExpand, learningTopics = [] }) {
  const [active, setActive] = useState(() => Object.fromEntries(FALLBACK_TOPICS.map(t => [t.id, 0])))
  const [topics, setTopics] = useState(FALLBACK_TOPICS)
  const [newsLoading, setNewsLoading] = useState(true)
  const [newsError, setNewsError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const todayKey   = new Date().toISOString().slice(0, 10)
  const firstTopic = learningTopics[0] || 'general knowledge'
  const { content: dykContent,     loading: dykLoading     } = useAIContent({ type: 'did-you-know', key: `did-you-know-${todayKey}` })
  const { content: conceptContent, loading: conceptLoading } = useAIContent({ type: 'concept', key: `concept-${firstTopic}-${todayKey}`, userContext: { topics: firstTopic } })

  useEffect(() => {
    const queryTopics = learningTopics.length > 0
      ? learningTopics.slice(0, 3).join(',')
      : 'technology,science,business'

    setNewsError(false)
    fetch(`/api/news?topics=${queryTopics}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const results = data.results || {}
        const updated = Object.entries(results)
          .filter(([, arts]) => arts.length > 0)
          .map(([topic, arts]) => {
            const fallback = FALLBACK_TOPICS.find(t => t.id === topic) || FALLBACK_TOPICS[0]
            return {
              id: topic,
              label: topic.charAt(0).toUpperCase() + topic.slice(1).replace(/-/g, ' & '),
              tagBg:    fallback.tagBg,
              tagColor: fallback.tagColor,
              articles: arts.slice(0, 3).map(a => ({ title: a.title, src: a.source || a.source_id || '' })),
            }
          })
        if (updated.length > 0) {
          setTopics(updated)
          setActive(Object.fromEntries(updated.map(t => [t.id, 0])))
        }
      })
      .catch(() => { setNewsError(true) })
      .finally(() => setNewsLoading(false))
  }, [learningTopics.join(','), retryCount]) // eslint-disable-line react-hooks/exhaustive-deps

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

        {newsLoading ? (
          <>
            <NewsItemSkeleton />
            <NewsItemSkeleton />
            <NewsItemSkeleton />
            <NewsItemSkeleton />
          </>
        ) : newsError ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 0', textAlign: 'center' }}>
            <i className="ph-bold ph-wifi-x" style={{ fontSize: 22, color: 'var(--text-3)' }} />
            <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>Couldn&rsquo;t load today&rsquo;s news</div>
            <button
              className="e-btn-outline"
              style={{ fontSize: 11, padding: '5px 14px' }}
              onClick={e => { e.stopPropagation(); setNewsError(false); setNewsLoading(true); setRetryCount(c => c + 1) }}
            >
              Retry
            </button>
          </div>
        ) : (
          topics.map(topic => {
            const art = topic.articles[active[topic.id] || 0]
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
                        className={`know-topic-dot${(active[topic.id] || 0) === i ? ' active' : ''}`}
                        style={{ background: (active[topic.id] || 0) === i ? topic.tagColor : undefined }}
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
          })
        )}

        <div style={{ paddingTop: 12, borderTop: '0.5px solid var(--sub-divider)', marginTop: 4 }} onClick={e => e.stopPropagation()}>
          <div className="sub-label" style={{ marginBottom: 8 }}>Did you know?</div>
          {dykLoading ? (
            <AISkeleton height={44} />
          ) : (
            <div className="did-you-know">&ldquo;{dykContent || 'The average person makes 35,000 decisions a day — most of them unconsciously. Simplifying your environment dramatically reduces decision fatigue.'}&rdquo;</div>
          )}
        </div>

        <div style={{ paddingTop: 12 }} onClick={e => e.stopPropagation()}>
          <div className="sub-label" style={{ marginBottom: 8 }}>Concept of the day</div>
          {conceptLoading ? (
            <AISkeleton height={52} />
          ) : (
            <div className="concept-def">{conceptContent || 'First Principles Thinking — Break problems down to their most fundamental truths and reason upward, rather than by analogy.'}</div>
          )}
        </div>
      </div>
    </div>
  )
}
