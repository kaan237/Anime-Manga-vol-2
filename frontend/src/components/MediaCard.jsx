import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiCheck, FiStar, FiEye } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { truncate, getStatusLabel } from '../utils/helpers';
import StatusModal from './StatusModal';

const TYPE_DOT_COLOR = {
  anime: '#f59e0b',
  manga: '#10b981',
  movie: '#ef4444',
  tv: '#3b82f6'
};

const TYPE_LABEL = {
  anime: 'Anime', manga: 'Manga', movie: 'Film', tv: 'Dizi'
};

export default function MediaCard({ item, userEntry, onStatusUpdate, viewMode = 'grid' }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCardClick = () => {
    navigate(`/media/${item.type}/${item.apiId}`);
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setModalOpen(true);
  };

  if (viewMode === 'list') {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleCardClick}
          style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            background: '#141414', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '12px', padding: '12px 16px',
            cursor: 'pointer', transition: 'all 0.2s',
            ...(hovered ? { background: '#1a1a1a', borderColor: 'rgba(255,255,255,0.12)' } : {})
          }}
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
        >
          <img
            src={item.image || 'https://placehold.co/60x80/141414/333333?text=?'}
            alt={item.title}
            style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
            loading="lazy"
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                background: TYPE_DOT_COLOR[item.type]
              }} />
              <h3 style={{ fontWeight: '600', fontSize: '0.95rem', color: '#fff', margin: 0 }}>
                {truncate(item.title, 60)}
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#71717a' }}>
                {TYPE_LABEL[item.type]} {item.year ? `• ${item.year}` : ''}
              </span>
              {item.score && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: '#fbbf24' }}>
                  <FiStar size={11} /> {parseFloat(item.score).toFixed(1)}
                </span>
              )}
              {item.genres?.slice(0, 2).map(g => (
                <span key={g} style={{
                  fontSize: '0.65rem', padding: '2px 6px', borderRadius: '99px',
                  background: 'rgba(255,255,255,0.05)', color: '#71717a'
                }}>{g}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {userEntry ? (
              <span style={{
                fontSize: '0.7rem', padding: '4px 10px', borderRadius: '99px', fontWeight: '600',
                background: 'rgba(16, 185, 129, 0.15)', color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.25)'
              }}>
                {getStatusLabel(item.type, userEntry.userStatus)}
              </span>
            ) : (
              <button
                onClick={handleAddClick}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '6px 12px', borderRadius: '6px',
                  background: 'rgba(124, 58, 237, 0.15)',
                  border: '1px solid rgba(124, 58, 237, 0.3)',
                  color: '#a78bfa', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600'
                }}
              >
                <FiPlus size={13} /> Ekle
              </button>
            )}
          </div>
        </motion.div>
        {modalOpen && (
          <StatusModal
            item={item}
            userEntry={userEntry}
            onClose={() => setModalOpen(false)}
            onSave={(data) => { onStatusUpdate?.(data); setModalOpen(false); }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        onClick={handleCardClick}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        style={{
          position: 'relative', cursor: 'pointer', borderRadius: '12px', overflow: 'hidden',
          background: '#141414', border: '1px solid rgba(255,255,255,0.06)',
          transition: 'border-color 0.3s',
          ...(hovered ? { borderColor: 'rgba(124, 58, 237, 0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' } : {})
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', paddingTop: '150%', overflow: 'hidden', background: '#0f0f0f' }}>
          <img
            src={item.image || 'https://placehold.co/300x450/141414/333333?text=?'}
            alt={item.title}
            loading="lazy"
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', transition: 'transform 0.5s ease',
              ...(hovered ? { transform: 'scale(1.05)' } : {})
            }}
          />

          {/* Overlay on hover */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                  padding: '12px'
                }}
              >
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {item.genres?.slice(0, 2).map(g => (
                    <span key={g} style={{
                      fontSize: '0.6rem', padding: '2px 7px', borderRadius: '99px',
                      background: 'rgba(255,255,255,0.1)', color: '#d4d4d8',
                      backdropFilter: 'blur(8px)'
                    }}>{g}</span>
                  ))}
                </div>
                <p style={{ fontSize: '0.72rem', color: '#a1a1aa', lineHeight: '1.4', marginBottom: '10px' }}>
                  {truncate(item.description, 80)}
                </p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                      padding: '7px', borderRadius: '7px',
                      background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                      color: 'white', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600',
                      backdropFilter: 'blur(8px)'
                    }}
                  >
                    <FiEye size={13} /> Detay
                  </button>
                  {!userEntry ? (
                    <button
                      onClick={handleAddClick}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                        padding: '7px', borderRadius: '7px',
                        background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                        border: 'none', color: 'white', cursor: 'pointer',
                        fontSize: '0.75rem', fontWeight: '600'
                      }}
                    >
                      <FiPlus size={13} /> Ekle
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setModalOpen(true); }}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                        padding: '7px', borderRadius: '7px',
                        background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#34d399', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600'
                      }}
                    >
                      <FiCheck size={13} /> Listede
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Type badge */}
          <div style={{
            position: 'absolute', top: '8px', left: '8px',
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '3px 8px', borderRadius: '99px',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)'
          }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: TYPE_DOT_COLOR[item.type] }} />
            <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'white', letterSpacing: '0.05em' }}>
              {TYPE_LABEL[item.type]?.toUpperCase()}
            </span>
          </div>

          {/* Score */}
          {item.score && (
            <div style={{
              position: 'absolute', top: '8px', right: '8px',
              display: 'flex', alignItems: 'center', gap: '3px',
              padding: '3px 7px', borderRadius: '99px',
              background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)'
            }}>
              <FiStar size={10} style={{ color: '#fbbf24' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#fbbf24' }}>
                {parseFloat(item.score).toFixed(1)}
              </span>
            </div>
          )}

          {/* Status badge if in list */}
          {userEntry && !hovered && (
            <div style={{
              position: 'absolute', bottom: '8px', left: '8px', right: '8px',
              padding: '4px 8px', borderRadius: '6px',
              background: 'rgba(16, 185, 129, 0.85)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'white', letterSpacing: '0.05em' }}>
                {getStatusLabel(item.type, userEntry.userStatus)?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Card body */}
        <div style={{ padding: '10px 12px 12px' }}>
          <h3 style={{
            fontWeight: '600', fontSize: '0.85rem', color: '#e4e4e7',
            margin: '0 0 4px', lineHeight: '1.3',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            {item.title}
          </h3>
          <p style={{ fontSize: '0.72rem', color: '#52525b', margin: 0 }}>
            {item.year || 'Bilinmiyor'}
            {(item.totalEpisodes || item.totalChapters) ? ` • ${item.totalEpisodes || item.totalChapters} Bölüm` : ''}
          </p>

          {/* Progress bar if watching */}
          {userEntry && userEntry.progress > 0 && (
            <div style={{ marginTop: '8px' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', marginBottom: '4px',
                fontSize: '0.65rem', color: '#52525b'
              }}>
                <span>{userEntry.progress} bölüm</span>
                <span>
                  {userEntry.mediaId?.totalEpisodes || userEntry.mediaId?.totalChapters
                    ? `${Math.round((userEntry.progress / (userEntry.mediaId.totalEpisodes || userEntry.mediaId.totalChapters)) * 100)}%`
                    : ''}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: userEntry.mediaId?.totalEpisodes || userEntry.mediaId?.totalChapters
                      ? `${Math.min(100, (userEntry.progress / (userEntry.mediaId.totalEpisodes || userEntry.mediaId.totalChapters)) * 100)}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {modalOpen && (
        <StatusModal
          item={item}
          userEntry={userEntry}
          onClose={() => setModalOpen(false)}
          onSave={(data) => { onStatusUpdate?.(data); setModalOpen(false); }}
        />
      )}
    </>
  );
}
