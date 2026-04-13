import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiStar, FiPlus, FiEdit, FiCalendar, FiFilm, FiBook, FiClock } from 'react-icons/fi';
import { getAnilistDetail } from '../api/anilistApi';
import { getTmdbDetail, getImageUrl } from '../api/tmdbApi';
import { userMediaApi } from '../api/backendApi';
import { useAuth } from '../context/AuthContext';
import StatusModal from '../components/StatusModal';
import { truncate } from '../utils/helpers';

export default function MediaDetailPage() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userEntry, setUserEntry] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchMedia();
  }, [type, id]);

  useEffect(() => {
    if (isAuthenticated && media) {
      checkUserEntry();
    }
  }, [isAuthenticated, media]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      let data;
      if (type === 'anime') data = await getAnilistDetail(id, 'ANIME');
      else if (type === 'manga') data = await getAnilistDetail(id, 'MANGA');
      else if (type === 'movie') data = await getTmdbDetail(id, 'movie');
      else data = await getTmdbDetail(id, 'tv');
      setMedia(data);
    } catch (err) {
      console.error('Media detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkUserEntry = async () => {
    try {
      const res = await userMediaApi.getAll({ limit: 500 });
      const entry = res.data.items.find(u => 
        u.mediaId?.apiId === String(id) && u.type === type
      );
      setUserEntry(entry || null);
    } catch {}
  };

  const handleStatusUpdate = (data) => {
    setUserEntry(data);
    setModalOpen(false);
  };

  if (loading) {
    return (
      <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
          <div className="skeleton" style={{ height: '400px', borderRadius: '16px', marginBottom: '24px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '32px' }}>
            <div className="skeleton" style={{ height: '375px', borderRadius: '12px' }} />
            <div>
              <div className="skeleton" style={{ height: '36px', borderRadius: '8px', marginBottom: '12px' }} />
              <div className="skeleton" style={{ height: '20px', width: '60%', borderRadius: '6px', marginBottom: '20px' }} />
              <div className="skeleton" style={{ height: '120px', borderRadius: '8px' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!media) return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>😔</div>
        <h2 style={{ color: '#e4e4e7' }}>İçerik bulunamadı</h2>
        <button onClick={() => navigate(-1)} className="btn-primary" style={{ marginTop: '16px' }}>
          Geri Dön
        </button>
      </div>
    </div>
  );

  const TYPE_LABEL = { anime: 'Anime', manga: 'Manga', movie: 'Film', tv: 'Dizi' };
  const TYPE_COLOR = { anime: '#f59e0b', manga: '#10b981', movie: '#ef4444', tv: '#3b82f6' };

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
      {/* Banner */}
      {media.bannerImage && (
        <div style={{
          position: 'relative', height: '380px', overflow: 'hidden'
        }}>
          <img
            src={media.bannerImage}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(8,8,8,0.3) 0%, rgba(8,8,8,0.8) 70%, rgba(8,8,8,1) 100%)'
          }} />
        </div>
      )}

      {/* Content */}
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: '24px',
        marginTop: media.bannerImage ? '-140px' : '0',
        position: 'relative', zIndex: 1
      }}>
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px', padding: '8px 14px', color: '#a1a1aa',
            cursor: 'pointer', fontSize: '0.85rem', marginBottom: '24px',
            transition: 'all 0.2s'
          }}
        >
          <FiArrowLeft size={16} /> Geri
        </button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'clamp(180px, 220px, 240px) 1fr',
          gap: '32px',
          alignItems: 'start'
        }}>
          {/* Poster */}
          <div style={{ flexShrink: 0 }}>
            <motion.img
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              src={media.image || 'https://placehold.co/240x360/141414/333333?text=?'}
              alt={media.title}
              style={{
                width: '100%', borderRadius: '12px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            />

            {/* Action button */}
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => {
                  if (!isAuthenticated) { navigate('/login'); return; }
                  setModalOpen(true);
                }}
                style={{
                  width: '100%', padding: '12px', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: userEntry ? 'rgba(16,185,129,0.15)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  border: userEntry ? '1px solid rgba(16,185,129,0.3)' : 'none',
                  color: userEntry ? '#34d399' : 'white',
                  cursor: 'pointer', fontSize: '0.9rem', fontWeight: '700',
                  boxShadow: userEntry ? 'none' : '0 8px 25px rgba(124,58,237,0.4)',
                  transition: 'all 0.2s'
                }}
              >
                {userEntry ? <><FiEdit size={16} /> Düzenle</> : <><FiPlus size={16} /> Listeye Ekle</>}
              </button>
            </div>

            {/* Quick stats */}
            <div style={{
              marginTop: '16px', background: '#141414',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px', padding: '16px',
              display: 'flex', flexDirection: 'column', gap: '12px'
            }}>
              {media.score && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#71717a' }}>Puan</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700', color: '#fbbf24' }}>
                    <FiStar size={13} /> {parseFloat(media.score).toFixed(1)}/10
                  </span>
                </div>
              )}
              {media.year && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#71717a' }}>Yıl</span>
                  <span style={{ fontWeight: '600', fontSize: '0.85rem', color: '#e4e4e7' }}>{media.year}</span>
                </div>
              )}
              {media.totalEpisodes && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#71717a' }}>Bölüm</span>
                  <span style={{ fontWeight: '600', fontSize: '0.85rem', color: '#e4e4e7' }}>{media.totalEpisodes}</span>
                </div>
              )}
              {media.totalChapters && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#71717a' }}>Bölüm</span>
                  <span style={{ fontWeight: '600', fontSize: '0.85rem', color: '#e4e4e7' }}>{media.totalChapters}</span>
                </div>
              )}
              {media.status && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#71717a' }}>Durum</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '2px 8px', borderRadius: '99px',
                    background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                    {media.status}
                  </span>
                </div>
              )}
              {media.duration && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#71717a' }}>Süre</span>
                  <span style={{ fontWeight: '600', fontSize: '0.85rem', color: '#e4e4e7' }}>{media.duration} dk</span>
                </div>
              )}
            </div>
          </div>

          {/* Main content */}
          <div>
            {/* Type badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{
                padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '700',
                background: `${TYPE_COLOR[type]}15`, color: TYPE_COLOR[type],
                border: `1px solid ${TYPE_COLOR[type]}30`, letterSpacing: '0.05em'
              }}>
                {TYPE_LABEL[type]?.toUpperCase()}
              </span>
              {media.format && (
                <span style={{ fontSize: '0.75rem', color: '#52525b', fontWeight: '500' }}>
                  {media.format}
                </span>
              )}
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: '800',
                fontSize: 'clamp(1.6rem, 3vw, 2.5rem)', color: 'white',
                margin: '0 0 8px', lineHeight: '1.2'
              }}
            >
              {media.title}
            </motion.h1>

            {media.titleRomaji && media.titleRomaji !== media.title && (
              <p style={{ color: '#71717a', fontSize: '0.95rem', marginBottom: '16px' }}>
                {media.titleRomaji}
              </p>
            )}

            {/* Genres */}
            {media.genres?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                {media.genres.map(g => (
                  <span key={g} style={{
                    padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '500',
                    background: 'rgba(255,255,255,0.05)', color: '#a1a1aa',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}>{g}</span>
                ))}
              </div>
            )}

            {/* User entry info */}
            {userEntry && (
              <div style={{
                background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
                borderRadius: '10px', padding: '14px 16px', marginBottom: '20px',
                display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap'
              }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Durumunuz</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#a78bfa' }}>
                    {userEntry.userStatus === 'planning' ? 'Planlanıyor' :
                     userEntry.userStatus === 'watching' ? 'İzleniyor' :
                     userEntry.userStatus === 'reading' ? 'Okunuyor' :
                     userEntry.userStatus === 'completed' ? 'Tamamlandı' :
                     userEntry.userStatus === 'dropped' ? 'Yarıda Bırakıldı' : 'Beklemede'}
                  </div>
                </div>
                {userEntry.progress > 0 && (
                  <div>
                    <div style={{ fontSize: '0.65rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>İlerleme</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#e4e4e7' }}>
                      {userEntry.progress} / {media.totalEpisodes || media.totalChapters || '?'}
                    </div>
                  </div>
                )}
                {userEntry.score && (
                  <div>
                    <div style={{ fontSize: '0.65rem', color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Puanınız</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <FiStar size={14} /> {userEntry.score}/10
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {media.description && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: '#e4e4e7', marginBottom: '10px' }}>Özet</h3>
                <p style={{
                  color: '#a1a1aa', lineHeight: '1.7', fontSize: '0.9rem'
                }}>
                  {expanded ? media.description : truncate(media.description, 300)}
                </p>
                {media.description.length > 300 && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    style={{
                      background: 'none', border: 'none', color: '#7c3aed',
                      cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600',
                      marginTop: '6px', padding: 0
                    }}
                  >
                    {expanded ? 'Daha Az Göster' : 'Devamını Oku'}
                  </button>
                )}
              </div>
            )}

            {/* Studios */}
            {media.studios?.length > 0 && (
              <div>
                <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: '#e4e4e7', marginBottom: '10px' }}>
                  {type === 'movie' || type === 'tv' ? 'Yapımcı' : 'Stüdyo'}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {media.studios.map(s => (
                    <span key={s} style={{
                      padding: '5px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '500',
                      background: '#141414', color: '#a1a1aa', border: '1px solid rgba(255,255,255,0.08)'
                    }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <StatusModal
          item={{ ...media, type }}
          userEntry={userEntry}
          onClose={() => setModalOpen(false)}
          onSave={handleStatusUpdate}
        />
      )}
    </div>
  );
}
