'use client'
import { useEffect, useRef } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function Modal({ isOpen, onClose, backdropClass, className, children }) {
  const containerRef = useRef(null)
  const triggerRef = useRef(null)

  // Save trigger on open, restore focus on close
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement
      requestAnimationFrame(() => {
        containerRef.current?.querySelector(FOCUSABLE)?.focus()
      })
    } else {
      triggerRef.current?.focus()
      triggerRef.current = null
    }
  }, [isOpen])

  // Escape key + Tab focus trap
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const focusable = Array.from(containerRef.current?.querySelectorAll(FOCUSABLE) ?? [])
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className={backdropClass}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div ref={containerRef} className={className} role="dialog" aria-modal="true">
        {children}
      </div>
    </div>
  )
}
