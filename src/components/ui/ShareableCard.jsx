export default function ShareableCard({
  userName = 'You',
  dateRange = 'Week of May 19–25, 2026',
  stats = {},
  score = 0,
}) {
  const {
    avgSleep = '—',
    daysActive = '—',
    daysExercised = '—',
    methodName = null,
  } = stats;

  const scoreLabel =
    score >= 80 ? 'Great week overall' : score >= 60 ? 'Good week overall' : 'Room to grow';

  return (
    <div className="share-card">
      <div className="share-card-logo">
        <div className="share-card-logo-mark">N</div>
        <div className="share-card-logo-name">Nook</div>
      </div>

      <div className="share-card-name">{userName}</div>
      <div className="share-card-date">{dateRange}</div>

      <div className="share-card-stats">
        <div className="share-stat">
          <div className="share-stat-val">{avgSleep}</div>
          <div className="share-stat-lbl">Avg Sleep</div>
        </div>
        <div className="share-stat">
          <div className="share-stat-val">{daysActive}</div>
          <div className="share-stat-lbl">Days Active</div>
        </div>
        <div className="share-stat">
          <div className="share-stat-val">{daysExercised}</div>
          <div className="share-stat-lbl">Exercised</div>
        </div>
        {methodName && (
          <div className="share-stat">
            <div className="share-stat-val" style={{ fontSize: '0.75rem', lineHeight: 1.3 }}>{methodName}</div>
            <div className="share-stat-lbl">Method</div>
          </div>
        )}
      </div>

      <div className="share-card-score">
        <div className="share-score-num">{score}</div>
        <div style={{ flex: 1 }}>
          <div className="share-score-lbl">Day Score — {scoreLabel}</div>
          <div className="share-score-bar">
            <div className="share-score-fill" style={{ width: `${score}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
