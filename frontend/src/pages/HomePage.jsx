import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiTrendingUp, FiClock, FiGrid, FiPlay, FiBook } from 'react-icons/fi';
import { searchAnilist } from '../api/anilistApi';
import { searchTmdb } from '../api/tmdbApi';
import { userMediaApi } from '../api/backendApi';
import { useAuth } from '../context/AuthContext';
import MediaCard from '../components/MediaCard';
import { formatMinutes } from '../utils/helpers';

const HERO_TABS = [
  { key: 'anime', label: 'Anime', icon: '⚡', color: '#f59e0b' },
  { key: 'manga', label: 'Manga', icon: '📖', color: '#10b981' },
  { key: 'movie', label: 'Film', icon: '🎬', color: '#ef4444' },
  { key: 'tv', label: 'Dizi', icon: '📺', color: '#3b82f6' }
];

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('anime');
  const [trendingItems, setTrendingItems] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [userList, setUserList] = useState([]);
  const [stats, setStats] = useState(null);
  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    fetchTrending();
  }, [activeTab]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData();
    }
  }, [isAuthenticated]);

  const fetchTrending = async () => {
    setLoadingTrending(true);
    try {
      let items = [];
      if (activeTab === 'anime') {
        const res = await searchAnilist('', 'ANIME');
        items = res.items.slice(0, 12);
      } else if (activeTab === 'manga') {
        const res = await searchAnilist('', 'MANGA');
        items = res.items.slice(0, 12);
      } else if (activeTab === 'movie') {
        const res = await searchTmdb('popular', 'movie');
        items = res.items.slice(0, 12);
      } else {
        const res = await searchTmdb('popular', 'tv');
        items = res.items.slice(0, 12);
      }
      setTrendingItems(items);
    } catch (err) {
      console.error('Trending fetch error:', err);
    } finally {
      setLoadingTrending(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const [listRes, statsRes] = await Promise.all([
        userMediaApi.getAll({ limit: 6 }),
        userMediaApi.getStats()
      ]);
      setUserList(listRes.data.items);
      setStats(statsRes.data);
      setRecentItems(statsRes.data.recentlyUpdated || []);
    } catch (err) {
      console.error('User data error:', err);
    }
  };

  const handleStatusUpdate = () => {
    if (isAuthenticated) fetchUserData();
  };

  const getUserEntry = (item) => {
    return userList.find(u => 
      u.mediaId?.apiId === item.apiId && u.type === item.type
    );
  };

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        padding: '80px 24px 60px',
        background: 'linear-gradient(180deg, rgba(124,58,237,0.08) 0%, rgba(8,8,8,0) 100%)'
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '6px 14px', borderRadius: '99px',
              background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
              marginBottom: '24px', fontSize: '0.8rem', color: '#a78bfa', fontWeight: '600'
            }}>
              ✨ Anime, Manga, Film & Dizi Takip
            </div>

            <h1 style={{
              fontFamily: 'Outfit, sans-serif', fontWeight: '900',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: '1.1',
              margin: '0 0 20px', color: 'white'
            }}>
              Her İçeriğini{' '}
              <span className="gradient-text">Takip Et</span>
            </h1>

            <p style={{
              fontSize: '1.1rem', color: '#71717a', lineHeight: '1.7',
              maxWidth: '560px', margin: '0 auto 36px'
            }}>
              Anime, manga, film ve dizilerini tek yerden takip et. Durumunu güncelle, puanla ve listeni oluştur.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/search')}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '14px 28px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  border: 'none', color: 'white', cursor: 'pointer',
                  fontSize: '1rem', fontWeight: '700',
                  boxShadow: '0 8px 30px rgba(124, 58, 237, 0.4)',
                  transition: 'all 0.2s'
                }}
              >
                <FiSearch size={18} /> İçerik Ara
              </button>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '14px 28px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', textDecoration: 'none',
                    fontSize: '1rem', fontWeight: '600', transition: 'all 0.2s'
                  }}
                >
                  Ücretsiz Başla →
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats bar (if logged in) */}
      {isAuthenticated && stats && (
        <section style={{ padding: '0 24px 40px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px'
            }}>
              {[
                { label: 'Toplam Liste', value: Object.values(stats.statusBreakdown || {}).reduce((a, b) => a + b, 0), icon: FiGrid, color: '#7c3aed' },
                { label: 'Tamamlanan', value: stats.statusBreakdown?.completed || 0, icon: FiTrendingUp, color: '#10b981' },
                { label: 'İzleniyor', value: (stats.statusBreakdown?.watching || 0) + (stats.statusBreakdown?.reading || 0), icon: FiPlay, color: '#3b82f6' },
                { label: 'İzleme Süresi', value: formatMinutes(stats.totalMinutes), icon: FiClock, color: '#f59e0b' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    background: '#141414', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '12px', padding: '16px 20px',
                    display: 'flex', alignItems: 'center', gap: '12px'
                  }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <stat.icon size={18} style={{ color: stat.color }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '1.2rem', color: 'white' }}>{stat.value}</div>
                    <div style={{ fontSize: '0.72rem', color: '#52525b', fontWeight: '500' }}>{stat.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recently Updated (if logged in) */}
      {isAuthenticated && recentItems.length > 0 && (
        <section style={{ padding: '0 24px 48px' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontWeight: '700', fontSize: '1.2rem', color: '#e4e4e7', margin: 0 }}>
                <FiClock size={18} style={{ marginRight: '8px', color: '#7c3aed', verticalAlign: 'middle' }} />
                Son Güncellenenler
              </h2>
              <Link to="/library" style={{ fontSize: '0.85rem', color: '#7c3aed', textDecoration: 'none', fontWeight: '600' }}>
                Tümünü Gör →
              </Link>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '14px'
            }}>
              {recentItems.slice(0, 6).map(entry => {
                const media = entry.mediaId;
                if (!media) return null;
                return (
                  <MediaCard
                    key={entry._id}
                    item={{ ...media, apiId: media.apiId, type: entry.type }}
                    userEntry={entry}
                    onStatusUpdate={handleStatusUpdate}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Trending Section */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontWeight: '700', fontSize: '1.2rem', color: '#e4e4e7', margin: 0 }}>
              <FiTrendingUp size={18} style={{ marginRight: '8px', color: '#7c3aed', verticalAlign: 'middle' }} />
              Popüler İçerikler
            </h2>
            <div style={{ display: 'flex', gap: '6px' }}>
              {HERO_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '8px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600',
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: activeTab === tab.key ? `${tab.color}15` : 'rgba(255,255,255,0.04)',
                    border: activeTab === tab.key ? `1px solid ${tab.color}40` : '1px solid rgba(255,255,255,0.08)',
                    color: activeTab === tab.key ? tab.color : '#71717a'
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loadingTrending ? (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '14px'
            }}>
              {Array(12).fill(0).map((_, i) => (
                <div key={i} style={{ borderRadius: '12px', overflow: 'hidden' }}>
                  <div className="skeleton" style={{ paddingTop: '150%' }} />
                  <div style={{ padding: '10px 12px', background: '#141414' }}>
                    <div className="skeleton" style={{ height: '14px', borderRadius: '4px', marginBottom: '6px' }} />
                    <div className="skeleton" style={{ height: '11px', borderRadius: '4px', width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '14px'
            }}>
              {trendingItems.map((item, i) => (
                <MediaCard
                  key={`${item.apiId}-${item.type}`}
                  item={item}
                  userEntry={getUserEntry(item)}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
            <button
              onClick={() => navigate(`/search?type=${activeTab}`)}
              style={{
                padding: '12px 28px', borderRadius: '10px',
                background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
                color: '#a78bfa', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              Daha Fazla Gör →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
