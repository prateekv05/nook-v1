'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

const CATEGORIES = [
  { label: 'Method of the Week',    slug: 'method-of-week',      icon: 'ph-lightning' },
  { label: 'Financial of the Day',  slug: 'financial-of-day',    icon: 'ph-currency-dollar' },
  { label: 'Daily Financial Tip',   slug: 'daily-financial-tip', icon: 'ph-lightbulb' },
  { label: 'Deep Dive of the Week', slug: 'deep-dive',           icon: 'ph-binoculars' },
  { label: 'Did you Know',          slug: 'did-you-know',        icon: 'ph-question' },
  { label: 'Concept of the Day',    slug: 'concept-of-day',      icon: 'ph-book-open' },
]

function BlogInner() {
  const params     = useSearchParams()
  const router     = useRouter()
  const rawSlug    = params.get('category')
  const validSlugs = CATEGORIES.map(c => c.slug)
  const activeSlug  = validSlugs.includes(rawSlug) ? rawSlug : CATEGORIES[0].slug
  const activeLabel = CATEGORIES.find(c => c.slug === activeSlug)?.label ?? ''

  return (
    <div className="blog-shell">
      {/* Topbar */}
      <div className="exp-topbar">
        <button className="back-btn" onClick={() => router.back()}>
          <i className="ph-bold ph-caret-left" />
          Back
        </button>
        <div className="exp-label">
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
          Blog
        </div>
      </div>

      <div className="blog-body">
        {/* Sidebar */}
        <nav className="blog-sidebar" aria-label="Blog categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat.slug}
              className={`blog-cat-btn${activeSlug === cat.slug ? ' active' : ''}`}
              onClick={() => router.push(`/blog?category=${cat.slug}`)}
            >
              <i className={`ph-bold ${cat.icon}`} style={{ fontSize: 14, flexShrink: 0 }} />
              {cat.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <main className="blog-content">
          <div className="blog-soon">
            <i className="ph-bold ph-article blog-soon-icon" />
            <div className="blog-soon-title">Blog Coming Soon</div>
            <div className="blog-soon-sub">
              We&rsquo;re writing something great on <strong>{activeLabel}</strong>. Check back soon.
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function BlogPage() {
  return (
    <Suspense fallback={null}>
      <BlogInner />
    </Suspense>
  )
}
