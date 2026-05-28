'use client'
import { useState } from 'react'
import Modal from './Modal'

function formatDate(isoDate) {
  return new Date(isoDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatTime(isoTs) {
  if (!isoTs) return ''
  return new Date(isoTs).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export default function JournalHistoryModal({ isOpen, onClose, entries, loading, onDelete, onEdit }) {
  const [editingId, setEditingId]     = useState(null)
  const [editContent, setEditContent] = useState('')
  const [savingId, setSavingId]       = useState(null)

  function startEdit(entry) {
    setEditingId(entry.id)
    setEditContent(entry.content)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditContent('')
  }

  async function saveEdit() {
    if (!editContent.trim()) return
    setSavingId(editingId)
    await onEdit(editingId, editContent.trim())
    setSavingId(null)
    setEditingId(null)
    setEditContent('')
  }

  // Group entries by date, newest first
  const grouped = {}
  for (const entry of entries) {
    if (!grouped[entry.date]) grouped[entry.date] = []
    grouped[entry.date].push(entry)
  }
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <Modal isOpen={isOpen} onClose={onClose} backdropClass="cal-modal open" className="journal-modal-box">
      <div className="cal-header">
        <div className="cal-title">Journal History</div>
        <button className="cal-close" onClick={onClose} aria-label="Close">
          <i className="ph-bold ph-x" />
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 10, color: 'var(--text-3)' }}>
          <i className="ph-bold ph-spinner" style={{ fontSize: 20, animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: 13 }}>Loading…</span>
        </div>
      ) : entries.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '48px 0', color: 'var(--text-3)' }}>
          <i className="ph-bold ph-notebook" style={{ fontSize: 28 }} />
          <div style={{ fontSize: 13, textAlign: 'center', lineHeight: 1.6 }}>
            No journal entries yet.<br />Start writing to build your history.
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {dates.map(date => (
            <div key={date}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, paddingBottom: 6, borderBottom: '0.5px solid var(--border)' }}>
                {formatDate(date)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {grouped[date].map(entry => (
                  <div key={entry.id} style={{ background: 'var(--input-bg)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 16px', transition: 'border-color 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {entry.created_at && (
                          <span style={{ fontSize: 11, color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <i className="ph-bold ph-clock" style={{ fontSize: 10 }} />
                            {formatTime(entry.created_at)}
                          </span>
                        )}
                        {entry.word_count > 0 && (
                          <span style={{ fontSize: 10, color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>
                            · {entry.word_count}w
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        {editingId === entry.id ? (
                          <>
                            <button
                              onClick={saveEdit}
                              disabled={savingId === entry.id}
                              style={{ fontSize: 11, padding: '4px 12px', borderRadius: 7, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.2s', opacity: savingId === entry.id ? 0.6 : 1 }}
                            >
                              {savingId === entry.id ? 'Saving…' : 'Save'}
                            </button>
                            <button
                              onClick={cancelEdit}
                              style={{ fontSize: 11, padding: '4px 12px', borderRadius: 7, border: '0.5px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.2s' }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(entry)}
                              title="Edit entry"
                              style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '0.5px solid var(--border)', background: 'var(--card-bg)', cursor: 'pointer', color: 'var(--text-2)', fontSize: 12, transition: 'all 0.2s', flexShrink: 0 }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--know-bdr)'; e.currentTarget.style.color = 'var(--know-col)' }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)' }}
                            >
                              <i className="ph-bold ph-pencil" />
                            </button>
                            <button
                              onClick={() => onDelete(entry.id)}
                              title="Delete entry"
                              style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '0.5px solid var(--border)', background: 'var(--card-bg)', cursor: 'pointer', color: 'var(--text-2)', fontSize: 12, transition: 'all 0.2s', flexShrink: 0 }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--error-bdr)'; e.currentTarget.style.color = 'var(--error-col)'; e.currentTarget.style.background = 'var(--error-bg)' }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'var(--card-bg)' }}
                            >
                              <i className="ph-bold ph-trash" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {editingId === entry.id ? (
                      <textarea
                        value={editContent}
                        onChange={e => setEditContent(e.target.value)}
                        rows={6}
                        autoFocus
                        style={{ width: '100%', fontSize: 13, color: 'var(--text-1)', lineHeight: 1.7, background: 'var(--card-bg)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '10px 12px', fontFamily: 'var(--font-sans)', resize: 'vertical', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                      />
                    ) : (
                      <div style={{ fontSize: 13, color: 'var(--text-1)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{entry.content}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}
