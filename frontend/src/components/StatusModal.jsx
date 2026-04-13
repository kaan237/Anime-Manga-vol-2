import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiStar, FiSave, FiTrash2, FiHeart } from 'react-icons/fi';
import { userMediaApi } from '../api/backendApi';
import toast from 'react-hot-toast';
import { STATUS_LABELS, getProgressLabel } from '../utils/helpers';

const STATUSES = [
  { key: 'planning', label: 'Planlanıyor', color: '#94a3b8' },
  { key: 'watching', label: 'İzleniyor', color: '#60a5fa' },
  { key: 'completed', label: 'Tamamlandı', color: '#34d399' },
  { key: 'dropped', label: 'Yarıda Bırakıldı', color: '#f87171' },
  { key: 'on_hold', label: 'Beklemede', color: '#fbbf24' }
];

export default function StatusModal({ item, userEntry, onClose, onSave }) {
  const isNew = !userEntry;
  const [status, setStatus] = useState(userEntry?.userStatus || 'planning');
  const [progress, setProgress] = useState(userEntry?.progress || 0);
  const [score, setScore] = useState(userEntry?.score || '');
  const [isFavorite, setIsFavorite] = useState(userEntry?.isFavorite || false);
  const [notes, setNotes] = useState(userEntry?.notes || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const statusLabel = item.type === 'manga' ? 'Okunuyor' : 'İzleniyor';
  const totalProgress = item.totalEpisodes || item.totalChapters || item.totalVolumes || null;

  const handleSave = async () => {
    setSaving(true);
    try {
      if (isNew) {
        const res = await userMediaApi.add({
          mediaData: item,
          userStatus: status,
          progress: Number(progress),
          score: score !== '' ? Number(score) : null,
          isFavorite,
          notes
        });
        toast.success('Listeye eklendi! 🎉');
        onSave(res.data.item);
      } else {
        const res = await userMediaApi.update(userEntry._id, {
          userStatus: status,
          progress: Number(progress),
          score: score !== '' ? Number(score) : null,
          isFavorite,
          notes
        });
        toast.success('Güncellendi! ✨');
        onSave(res.data.item);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!userEntry) return;
    setDeleting(true);
    try {
      await userMediaApi.remove(userEntry._id);
      toast.success('Listeden kaldırıldı.');
      onSave(null);
    } catch (err) {
      toast.error('Kaldırılamadı.');
    } finally {
      setDeleting(false);
    }
  };

  // Close on escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#141414', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px', padding: '0', width: '90%', maxWidth: '460px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.8)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          <img
            src={item.image}
            alt={item.title}
            style={{ width: '52px', height: '72px', objectFit: 'cover', borderRadius: '8px' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontWeight: '700', fontSize: '1rem', color: '#fff', margin: '0 0 4px',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {item.title}
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#71717a' }}>
              {item.type === 'anime' ? 'Anime' : item.type === 'manga' ? 'Manga' : item.type === 'movie' ? 'Film' : 'Dizi'}
              {item.year ? ` • ${item.year}` : ''}
            </span>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#52525b', cursor: 'pointer', padding: '4px'
          }}>
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Status */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '10px' }}>
              Durum
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {STATUSES.filter(s => !(item.type === 'manga' && s.key === 'watching')).map(s => {
                const label = s.key === 'watching' ? statusLabel : s.label;
                const isActive = status === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => setStatus(s.key)}
                    style={{
                      padding: '7px 13px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600',
                      cursor: 'pointer', transition: 'all 0.2s',
                      background: isActive ? `${s.color}20` : 'rgba(255,255,255,0.04)',
                      border: isActive ? `1.5px solid ${s.color}50` : '1.5px solid rgba(255,255,255,0.08)',
                      color: isActive ? s.color : '#71717a'
                    }}
                  >
                    {label}
                  </button>
                );
              })}
              {item.type === 'manga' && (
                <button
                  onClick={() => setStatus('reading')}
                  style={{
                    padding: '7px 13px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600',
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: status === 'reading' ? '#60a5fa20' : 'rgba(255,255,255,0.04)',
                    border: status === 'reading' ? '1.5px solid #60a5fa50' : '1.5px solid rgba(255,255,255,0.08)',
                    color: status === 'reading' ? '#60a5fa' : '#71717a'
                  }}
                >
                  Okunuyor
                </button>
              )}
            </div>
          </div>

          {/* Progress */}
          {item.type !== 'movie' && (
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
                İlerleme {totalProgress ? `(/ ${totalProgress})` : ''}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="number" min="0" max={totalProgress || 9999}
                  value={progress}
                  onChange={e => setProgress(e.target.value)}
                  className="input-field"
                  style={{ width: '100px', textAlign: 'center' }}
                  placeholder="0"
                />
                <span style={{ color: '#52525b', fontSize: '0.85rem' }}>/ {totalProgress || '?'} Bölüm</span>
                {totalProgress && (
                  <div style={{ flex: 1 }}>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{
                        width: `${Math.min(100, (progress / totalProgress) * 100)}%`
                      }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Score */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
              Puanım (0-10)
            </label>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button
                  key={n}
                  onClick={() => setScore(score == n ? '' : n)}
                  style={{
                    width: '30px', height: '30px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700',
                    cursor: 'pointer', border: 'none', transition: 'all 0.15s',
                    background: score >= n ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255,255,255,0.04)',
                    color: score >= n ? '#fbbf24' : '#52525b'
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            {score && (
              <p style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '6px' }}>
                <FiStar size={11} style={{ display: 'inline' }} /> Puanınız: {score}/10
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
              Notlar
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Düşüncelerinizi yazın..."
              maxLength={1000}
              rows={3}
              className="input-field"
              style={{ resize: 'vertical', lineHeight: '1.5' }}
            />
          </div>

          {/* Favorite toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: '#a1a1aa', fontWeight: '500' }}>Favorilere Ekle</span>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: isFavorite ? '#ef4444' : '#52525b', padding: '4px',
                transition: 'color 0.2s, transform 0.2s',
                transform: isFavorite ? 'scale(1.2)' : 'scale(1)'
              }}
            >
              <FiHeart size={22} fill={isFavorite ? '#ef4444' : 'none'} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', gap: '8px', justifyContent: 'space-between'
        }}>
          {!isNew && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '9px 14px', borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#f87171', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600'
              }}
            >
              <FiTrash2 size={14} /> Kaldır
            </button>
          )}
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            <button
              onClick={onClose}
              style={{
                padding: '9px 16px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#a1a1aa', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600'
              }}
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '9px 18px', borderRadius: '8px',
                background: saving ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                border: 'none', color: 'white', cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem', fontWeight: '600',
                boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)'
              }}
            >
              <FiSave size={14} /> {saving ? 'Kaydediliyor...' : isNew ? 'Listeye Ekle' : 'Kaydet'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
