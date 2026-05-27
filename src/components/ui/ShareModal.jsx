'use client';
import { useEffect, useState } from 'react';
import ShareableCard from './ShareableCard';
import { useToast } from '../../hooks/useToast';
import { createClient } from '../../lib/supabase';

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d) => d.toISOString().split('T')[0];
  const label = (d) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return {
    monStr: fmt(monday),
    sunStr: fmt(sunday),
    todayStr: fmt(now),
    label: `Week of ${label(monday)}–${label(sunday)}, ${sunday.getFullYear()}`,
  };
}

export default function ShareModal({ isOpen, onClose }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;

    async function fetchData() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const userId = session.user.id;

        const { monStr, sunStr, todayStr, label } = getWeekRange();

        const [profileRes, trackingRes, methodRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', userId)
            .single(),
          supabase
            .from('daily_tracking')
            .select('date, sleep, exercise_mins, day_score')
            .eq('user_id', userId)
            .gte('date', monStr)
            .lte('date', sunStr),
          supabase
            .from('method_of_week')
            .select('method_name')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        if (!mounted) return;

        const profile = profileRes.data;
        const rows = trackingRes.data || [];

        const userName = profile
          ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'You'
          : 'You';

        const sleepRows = rows.filter((r) => r.sleep != null && r.sleep > 0);
        const avgSleep =
          sleepRows.length > 0
            ? (sleepRows.reduce((s, r) => s + parseFloat(r.sleep), 0) / sleepRows.length).toFixed(1) + 'h'
            : '—';

        const daysActive = rows.filter((r) => (r.day_score || 0) >= 70).length;
        const daysExercised = rows.filter((r) => (r.exercise_mins || 0) > 0).length;

        const todayRow = rows.find((r) => r.date === todayStr);
        const todayScore = todayRow?.day_score ?? 0;

        const methodName = methodRes.data?.method_name ?? null;

        setCardData({
          userName,
          dateRange: label,
          stats: {
            avgSleep,
            daysActive: `${daysActive}/7`,
            daysExercised: String(daysExercised),
            methodName,
          },
          score: todayScore,
        });
      } catch {
        // silently leave cardData null — card shows placeholders
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();
    return () => { mounted = false; };
  }, [isOpen]);

  if (!isOpen) return null;

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast('Link copied ✓', 'success');
    }).catch(() => {
      showToast('Could not copy link', 'error');
    });
  }

  function handleSaveImage() {
    showToast('Coming soon', 'info');
  }

  return (
    <div
      className="share-modal open"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="share-box">
        <div className="share-box-title">
          <span>Share your week</span>
          <button className="share-close" onClick={onClose} aria-label="Close">
            <i className="ph-bold ph-x" />
          </button>
        </div>

        {loading ? (
          <div className="share-loading">
            <div className="skeleton" style={{ height: 220, borderRadius: 16 }} />
          </div>
        ) : (
          <ShareableCard
            userName={cardData?.userName}
            dateRange={cardData?.dateRange}
            stats={cardData?.stats}
            score={cardData?.score ?? 0}
          />
        )}

        <div className="share-actions">
          <button className="share-copy-btn" onClick={handleCopyLink}>
            <i className="ph-bold ph-link" style={{ marginRight: 6 }} />
            Copy link
          </button>
          <button className="share-dl-btn" onClick={handleSaveImage}>
            <i className="ph-bold ph-download-simple" style={{ marginRight: 6 }} />
            Save image
          </button>
        </div>
      </div>
    </div>
  );
}
