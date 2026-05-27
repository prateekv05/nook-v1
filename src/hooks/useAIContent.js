'use client'
import { useState, useEffect } from 'react'

export function useAIContent({ type, key, userContext }) {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!key) {
      setContent(null)
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/ai-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, key, userContext }),
        })
        if (!res.ok) throw new Error(`ai-content ${res.status}`)
        const data = await res.json()
        if (!cancelled) setContent(data.content ?? null)
      } catch (e) {
        if (!cancelled) setError(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [key]) // re-fetch only when key changes

  return { content, loading, error }
}
