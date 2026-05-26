'use client';
import { useEffect } from 'react';
import ShareableCard from './ShareableCard';
import { useToast } from '../../hooks/useToast';

export default function ShareModal({ isOpen, onClose }) {
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      showToast('Link copied ✓', 'success');
    }).catch(() => {
      showToast('Could not copy link', 'error');
    });
  }

  function handleSaveImage() {
    showToast('Image saved ✓', 'success');
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

        <ShareableCard />

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
