'use client';
import { useEffect, useState } from 'react';

const SAMPLE_DAYS = [
  { date: 'Mon 12', status: 'green', label: '5/5', tasks: ['Morning workout', 'Read 30 mins', 'Meditate', 'No junk food', 'Drink 8 glasses'] },
  { date: 'Tue 13', status: 'green', label: '5/5', tasks: ['Morning workout', 'Read 30 mins', 'Meditate', 'No junk food', 'Drink 8 glasses'] },
  { date: 'Wed 14', status: 'amber', label: '3/5', tasks: ['Morning workout', 'Read 30 mins', 'Meditate', 'No junk food', 'Drink 8 glasses'] },
  { date: 'Thu 15', status: 'green', label: '4/5', tasks: ['Morning workout', 'Read 30 mins', 'Meditate', 'No junk food', 'Drink 8 glasses'] },
  { date: 'Fri 16', status: 'red',   label: '0/5', tasks: ['Morning workout', 'Read 30 mins', 'Meditate', 'No junk food', 'Drink 8 glasses'] },
  { date: 'Sat 17', status: 'green', label: '5/5', tasks: ['Morning workout', 'Read 30 mins', 'Meditate', 'No junk food', 'Drink 8 glasses'] },
  { date: 'Sun 18', status: 'green', label: '4/5', tasks: ['Morning workout', 'Read 30 mins', 'Meditate', 'No junk food', 'Drink 8 glasses'] },
  { date: 'Mon 19', status: 'amber', label: '3/5', tasks: ['Morning workout', 'Read 30 mins', 'Meditate', 'No junk food', 'Drink 8 glasses'] },
  { date: 'Tue 20', status: 'green', label: '5/5', tasks: ['Morning workout', 'Read 30 mins', 'Meditate', 'No junk food', 'Drink 8 glasses'] },
  { date: 'Wed 21', status: 'green', label: '5/5', tasks: ['Morning workout', 'Read 30 mins', 'Meditate', 'No junk food', 'Drink 8 glasses'] },
  { date: 'Thu 22', status: 'green', label: '4/5', tasks: ['Morning workout', 'Read 30 mins', 'Meditate', 'No junk food', 'Drink 8 glasses'] },
  { date: 'Fri 23', status: 'amber', label: '2/5', tasks: ['Morning workout', 'Read 30 mins', 'Meditate', 'No junk food', 'Drink 8 glasses'] },
  { date: 'Sat 24', status: 'green', label: '5/5', tasks: ['Morning workout', 'Read 30 mins', 'Meditate', 'No junk food', 'Drink 8 glasses'] },
  { date: 'Sun 25', status: 'green', label: '4/5', tasks: ['Morning workout', 'Read 30 mins', 'Meditate', 'No junk food', 'Drink 8 glasses'] },
  { date: 'Mon 26', status: 'green', label: '1/5', tasks: ['Morning workout', 'Read 30 mins', 'Meditate', 'No junk food', 'Drink 8 glasses'] },
];

const DONE_COUNTS = { '5/5': 5, '4/5': 4, '3/5': 3, '2/5': 2, '1/5': 1, '0/5': 0 };

const STATUS_ICON = {
  green: { icon: 'ph-check-circle', color: 'var(--fin-col)' },
  amber: { icon: 'ph-warning-circle', color: 'var(--life-col)' },
  red:   { icon: 'ph-x-circle',      color: 'var(--red-col)' },
};

export default function CalendarModal({ isOpen, onClose }) {
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

  const selectedDay = selected !== null ? SAMPLE_DAYS[selected] : null;
  const doneCount = selectedDay ? (DONE_COUNTS[selectedDay.label] ?? 0) : 0;

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

        <div className="cal-grid">
          {SAMPLE_DAYS.map((day, i) => {
            const { icon, color } = STATUS_ICON[day.status];
            return (
              <button
                key={day.date}
                className={`cal-day ${day.status}${selected === i ? ' cal-day-selected' : ''}`}
                onClick={() => setSelected(selected === i ? null : i)}
                style={{ cursor: 'pointer', width: '100%', font: 'inherit' }}
              >
                <div className="cal-day-date">{day.date}</div>
                <div className="cal-day-icon">
                  <i className={`ph-bold ${icon}`} style={{ color, fontSize: 18 }} />
                </div>
                <div className="cal-day-text">{day.label}</div>
              </button>
            );
          })}
        </div>

        {selectedDay && (
          <div className="cal-detail">
            <div className="cal-detail-header">
              <span className="cal-detail-date">{selectedDay.date}</span>
              <span className="cal-detail-count">{selectedDay.label} tasks done</span>
            </div>
            <div className="cal-detail-tasks">
              {selectedDay.tasks.map((task, i) => {
                const done = i < doneCount;
                return (
                  <div key={task} className={`cal-detail-task${done ? ' done' : ''}`}>
                    <i className={`ph-bold ${done ? 'ph-check-circle' : 'ph-circle'} cal-detail-task-icon`}
                       style={{ color: done ? 'var(--fin-col)' : 'var(--text-3)' }} />
                    <span>{task}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
