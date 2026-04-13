import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGrid, FiClock, FiTrendingUp, FiHeart, FiActivity, FiLogOut } from 'react-icons/fi';
import { userMediaApi } from '../api/backendApi';
import { useAuth } from '../context/AuthContext';
import MediaCard from '../components/MediaCard';
import { formatMinutes } from '../utils/helpers';

const STATUS_COLORS = {
  planning: '#94a3b8', watching: '#60a5fa', reading: '#60a5fa',
  completed: '#34d399', dropped: '#f87171', on_hold: '#fbbf24'
};
const STATUS_LABELS_TR = {
  planning: 'Planlanıyor', watching: 'İzleniyor', reading: 'Okunuyor',
  completed: 'Tamamlandı', dropped: 'Yarıda Bırakıldı', on_hold: 'Beklemede'
};

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    fetchStats();
  }, [isAuthenticated]);

  const fetchStats = async () => {
    try {
      const res = await userMediaApi.getStats();
      setStats(res.data);
      setRecentItems(res.data.recentlyUpdated || []);
    } catch {}
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) return null;

  const totalItems = Object.values(stats?.statusBreakdown || {}).reduce((a, b) => a + b, 0);
  const completed = stats?.statusBreakdown?.completed || 0;
  const completionRate = totalItems ? Math.round((completed / totalItems) * 100) : 0;

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(79,70,229,0.05))',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: '20px', padding: '32px',
            display: 'flex', alignItems: 'center', gap: '24px',
            marginBottom: '32px', flexWrap: 'wrap', position: 'relative'
          }}
        >
          {/* Avatar */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: '800', color: 'white', flexShrink: 0,
            boxShadow: '0 8px 30px rgba(124,58,237,0.4)'
          }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontWeight: '800', fontSize: '1.8rem', color: 'white', margin: '0 0 4px' }}>
              {user?.username}
            </h1>
            <p style={{ color: '#71717a', fontSize: '0.9rem', margin: 0 }}>{user?.email}</p>
            <p style={{ color: '#52525b', fontSize: '0.8rem', marginTop: '4px' }}>
              Üyelik: {new Date(user?.createdAt || Date.now()).toLocaleDateString('tr-TR')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/library" style={{
              padding: '9px 16px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#a1a1aa', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600'
            }}>
              Listem
            </Link>
            <button
              onClick={handleLogout}
              style={{
                padding: '9px 16px', borderRadius: '8px',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)',
                color: '#f87171', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <FiLogOut size={14} /> Çıkış
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '12px' }} />
            ))}
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '32px' }}>
              {[
                { label: 'Toplam İçerik', value: totalItems, icon: FiGrid, color: '#7c3aed' },
                { label: 'Tamamlanan', value: completed, icon: FiTrendingUp, color: '#10b981' },
                { label: 'İzleme Süresi', value: formatMinutes(stats?.totalMinutes), icon: FiClock, color: '#f59e0b' },
                { label: 'Tamamlama Oranı', value: `%${completionRate}`, icon: FiActivity, color: '#3b82f6' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{
                    background: '#141414', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '14px', padding: '20px',
                    display: 'flex', flexDirection: 'column', gap: '10px'
                  }}
                >
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '10px',
                    background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <s.icon size={20} style={{ color: s.color }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '1.8rem', color: 'white', lineHeight: 1 }}>{s.value}</div>
                    <div style={{ fontSize: '0.78rem', color: '#52525b', marginTop: '4px', fontWeight: '500' }}>{s.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 2 Column: Status + Type breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
              {/* Status breakdown */}
              <div style={{
                background: '#141414', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px', padding: '20px'
              }}>
                <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: '#e4e4e7', marginBottom: '16px' }}>
                  Durum Dağılımı
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(stats?.statusBreakdown || {}).map(([status, count]) => (
                    <div key={status}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>{STATUS_LABELS_TR[status] || status}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700', color: STATUS_COLORS[status] || '#a1a1aa' }}>{count}</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{
                          width: `${Math.round((count / totalItems) * 100)}%`,
                          background: STATUS_COLORS[status]
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Type breakdown */}
              <div style={{
                background: '#141414', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px', padding: '20px'
              }}>
                <h3 style={{ fontWeight: '700', fontSize: '0.95rem', color: '#e4e4e7', marginBottom: '16px' }}>
                  Tür Dağılımı
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(stats?.typeBreakdown || []).map(t => {
                    const COLORS = { anime: '#f59e0b', manga: '#10b981', movie: '#ef4444', tv: '#3b82f6' };
                    const ICONS = { anime: '⚡', manga: '📖', movie: '🎬', tv: '📺' };
                    return (
                      <div key={t._id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 12px', borderRadius: '8px',
                        background: `${COLORS[t._id]}10`, border: `1px solid ${COLORS[t._id]}20`
                      }}>
                        <span style={{ fontSize: '0.85rem', color: '#e4e4e7', fontWeight: '500' }}>
                          {ICONS[t._id]} {t._id === 'anime' ? 'Anime' : t._id === 'manga' ? 'Manga' : t._id === 'movie' ? 'Film' : 'Dizi'}
                        </span>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: '#52525b' }}>{t.completed} tamamlandı</span>
                          <span style={{ fontWeight: '800', fontSize: '1rem', color: COLORS[t._id] }}>{t.count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent activity */}
            {recentItems.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontWeight: '700', fontSize: '1rem', color: '#e4e4e7' }}>
                    Son Aktivite
                  </h3>
                  <Link to="/library" style={{ fontSize: '0.85rem', color: '#7c3aed', textDecoration: 'none', fontWeight: '600' }}>
                    Tümünü Gör
                  </Link>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '12px'
                }}>
                  {recentItems.map(entry => {
                    const media = entry.mediaId;
                    if (!media) return null;
                    return (
                      <MediaCard
                        key={entry._id}
                        item={{ ...media, type: entry.type }}
                        userEntry={entry}
                        onStatusUpdate={fetchStats}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
