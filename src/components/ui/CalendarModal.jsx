'use client';
import { useEffect, useState } from 'react';

const STATUS_ICON = {
  green: { icon: 'ph-check-circle',   color: 'var(--fin-col)'  },
  amber: { icon: 'ph-warning-circle', color: 'var(--life-col)' },
  red:   { icon: 'ph-x-circle',       color: 'var(--red-col)'  },
};

export default function CalendarModal({ isOpen, onClose, days = [], loading = false }) {
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) setSelected(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedDay = selected !== null ? days[selected] : null;

  return (
    <div
      className="cal-modal open"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="cal-box">
        <div className="cal-header">
          <div className="cal-title">Checklist History — Last 15 Days</div>
          <button className="cal-close" onClick={onClose} aria-label="Close">
            <i className="ph-bold ph-x" />
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: 10, color: 'var(--text-3)' }}>
            <i className="ph-bold ph-spinner" style={{ fontSize: 20, animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: 13 }}>Loading history…</span>
          </div>
        ) : days.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)', fontSize: 13 }}>
            No checklist history yet — complete some tasks to see data here.
          </div>
        ) : (
          <div className="cal-grid">
            {days.map((day, i) => {
              const { icon, color } = STATUS_ICON[day.status] || STATUS_ICON.green;
              return (
                <button
                  key={day.date}
                  className={`cal-day ${day.status}${selected === i ? ' cal-day-selected' : ''}`}
                  onClick={() => setSelected(selected === i ? null : i)}
                  style={{ cursor: 'pointer', width: '100%', font: 'inherit' }}
                >
                  <div className="cal-day-date">{day.label}</div>
                  <div className="cal-day-icon">
                    <i className={`ph-bold ${icon}`} style={{ color, fontSize: 18 }} />
                  </div>
                  <div className="cal-day-text">{day.summary}</div>
                </button>
              );
            })}
          </div>
        )}

        {selectedDay && (
          <div className="cal-detail">
            <div className="cal-detail-header">
              <span className="cal-detail-date">{selectedDay.label}</span>
              <span className="cal-detail-count">{selectedDay.summary} tasks done</span>
              {selectedDay.day_score != null && (
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>
                  Day score: <strong style={{ color: 'var(--text-1)' }}>{selectedDay.day_score}</strong>
                </span>
              )}
            </div>
            <div className="cal-detail-tasks">
              {selectedDay.tasks.map((task, i) => (
                <div key={i} className={`cal-detail-task${task.is_done ? ' done' : ''}`}>
                  <i
                    className={`ph-bold ${task.is_done ? 'ph-check-circle' : 'ph-circle'} cal-detail-task-icon`}
                    style={{ color: task.is_done ? 'var(--fin-col)' : 'var(--text-3)' }}
                  />
                  <span>{task.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
