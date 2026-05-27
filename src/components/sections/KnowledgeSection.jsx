'use client'

import { useState } from 'react'
import { useAIContent } from '@/hooks/useAIContent'

function AISkeleton({ height = 48 }) {
  return (
    <div style={{ height, borderRadius: 8, background: 'var(--input-bg)', backgroundImage: 'linear-gradient(90deg, var(--input-bg) 0%, var(--border) 50%, var(--input-bg) 100%)', backgroundSize: '400px 100%', animation: 'shimmer 1.4s infinite linear' }} />
  )
}

const ALL_NEWS = [
  {
    tag: 'AI & Tech',
    tagBg: 'var(--know-bg)', tagColor: 'var(--know-col)',
    title: 'OpenAI releases new reasoning model with improved coding abilities',
    summary: 'The latest model targets enterprise customers with improved speed and lower costs, signalling a shift toward efficiency over raw capability.',
    src: 'TechCrunch',
    filter: 'AI',
  },
  {
    tag: 'AI & Tech',
    tagBg: 'var(--know-bg)', tagColor: 'var(--know-col)',
    title: 'EU AI Act enforcement begins for developers',
    summary: 'Companies must comply with transparency and audit requirements under the landmark legislation.',
    src: 'Reuters',
    filter: 'AI',
  },
  {
    tag: 'Markets',
    tagBg: 'var(--fin-bg)', tagColor: 'var(--fin-col)',
    title: 'Fed signals two rate cuts possible in 2026 as inflation cools',
    summary: 'The Fed kept rates unchanged, citing persistent services inflation while acknowledging cooling in goods prices.',
    src: 'Reuters',
    filter: 'Markets',
  },
  {
    tag: 'Markets',
    tagBg: 'var(--fin-bg)', tagColor: 'var(--fin-col)',
    title: 'Nvidia surpasses $3T market cap again on AI demand',
    summary: 'Strong quarterly results driven by AI infrastructure spending pushed Nvidia back above $3 trillion.',
    src: 'Bloomberg',
    filter: 'Markets',
  },
  {
    tag: 'Science',
    tagBg: 'var(--pink-bg)', tagColor: 'var(--pink-col)',
    title: 'New study links sleep quality directly to decision-making performance',
    summary: 'New research shows consistent deep sleep reduces risk of cardiovascular events by up to 34%.',
    src: 'Nature',
    filter: 'Science',
  },
  {
    tag: 'Geopolitics',
    tagBg: 'var(--life-bg)', tagColor: 'var(--life-col)',
    title: 'G7 agrees new framework on digital trade',
    summary: 'Leaders reached an agreement covering AI governance, data flows, and cross-border digital services.',
    src: 'The Guardian',
    filter: 'Other',
  },
]

const FILTERS = ['All', 'AI', 'Markets', 'Science', 'Other']

const STREAK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const STREAK_DONE = [true, true, true, true, false, false, false]

export default function KnowledgeSection({ onBack, learningTopics = [] }) {
  const [activeFilter, setActiveFilter] = useState('All')

  const todayKey   = new Date().toISOString().slice(0, 10)
  const firstTopic = learningTopics[0] || 'general knowledge'
  const { content: dykContent,     loading: dykLoading     } = useAIContent({ type: 'did-you-know', key: `did-you-know-${todayKey}` })
  const { content: conceptContent, loading: conceptLoading } = useAIContent({ type: 'concept', key: `concept-${firstTopic}-${todayKey}`, userContext: { topics: firstTopic } })

  const news = activeFilter === 'All'
    ? ALL_NEWS
    : ALL_NEWS.filter(n => n.filter === activeFilter)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Topbar */}
      <div className="exp-topbar">
        <button className="back-btn" onClick={onBack}>
          <i className="ph-bold ph-caret-left" />
          Dashboard
        </button>
        <div className="exp-label">
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--know-col)', flexShrink: 0 }} />
          Knowledge
        </div>
      </div>

      {/* Content */}
      <div className="exp-content">
        <div className="eg-wide">
          {/* LEFT — news list */}
          <div className="ec grow" style={{ overflow: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div className="e-label know" style={{ marginBottom: 0 }}>Today&rsquo;s news</div>
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 5, marginBottom: 12, flexWrap: 'wrap' }}>
              {FILTERS.map(f => (
                <button
                  key={f}
                  className={`cl-filter-btn${activeFilter === f ? ' active' : ''}`}
                  style={activeFilter === f ? { background: 'var(--know-col)', borderColor: 'var(--know-col)' } : {}}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            {news.map((n, i) => (
              <div className="e-news" key={i}>
                <span className="e-ntag" style={{ background: n.tagBg, color: n.tagColor }}>{n.tag}</span>
                <div className="e-ntitle">{n.title}</div>
                <div className="e-nsummary">{n.summary}</div>
                <div className="e-nmeta">
                  <span className="e-nsrc">{n.src}</span>
                  <button className="e-btn-ghost">know more</button>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT column */}
          <div className="ecol">
            {/* Did You Know */}
            <div className="ec tb">
              <div className="e-label know">Did you know?</div>
              {dykLoading ? (
                <AISkeleton height={52} />
              ) : (
                <div style={{ fontSize: 13, color: 'var(--know-col)', lineHeight: 1.7, fontStyle: 'italic' }}>
                  &ldquo;{dykContent || 'The human brain processes visual information 60,000× faster than text, yet we spend 90% of learning time reading.'}&rdquo;
                </div>
              )}
            </div>

            {/* Concept of the Day */}
            <div className="ec">
              <div className="e-label know">Concept of the day</div>
              {conceptLoading ? (
                <AISkeleton height={72} />
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
                  {conceptContent || 'Compounding — The process where a quantity grows exponentially because gains are reinvested, making time your most powerful asset. Applies to money, knowledge, and habits equally.'}
                </div>
              )}
            </div>

            {/* Deep Dive — Pro */}
            <div className="ec">
              <div className="e-label know" style={{ display: 'flex', alignItems: 'center' }}>
                Deep dive of the week
                <span className="pro-badge">Pro</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)', marginBottom: 5 }}>The attention economy</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 10 }}>
                Every app competes for your focus through reward loops and social validation. Understanding this changes how you design your own environment...
              </div>
              <button className="e-btn-accent">Read full deep dive</button>
            </div>

            {/* Learning Streak */}
            <div className="ec grow">
              <div className="e-label know">Learning streak</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ fontSize: 28, fontWeight: 600, color: 'var(--know-col)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>4</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>days in a row</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>Best: 12 days</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {STREAK_DAYS.map((d, i) => (
                  <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{
                      height: 28,
                      borderRadius: 6,
                      background: STREAK_DONE[i] ? 'var(--know-col)' : 'var(--input-bg)',
                      border: `0.5px solid ${STREAK_DONE[i] ? 'var(--know-col)' : 'var(--border)'}`,
                      marginBottom: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {STREAK_DONE[i] && <i className="ph-bold ph-check" style={{ fontSize: 10, color: '#fff' }} />}
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase' }}>{d}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--know-col)', marginTop: 12, fontStyle: 'italic', lineHeight: 1.5 }}>
                &ldquo;4 days of consistent learning. Keep the chain alive — read one article today.&rdquo;
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
