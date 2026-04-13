import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGrid, FiList, FiFilter, FiSearch, FiHeart, FiTrash2 } from 'react-icons/fi';
import { userMediaApi } from '../api/backendApi';
import { useAuth } from '../context/AuthContext';
import MediaCard from '../components/MediaCard';
import StatusModal from '../components/StatusModal';
import toast from 'react-hot-toast';

const STATUSES = [
  { key: 'all', label: 'Tümü' },
  { key: 'watching', label: 'İzleniyor' },
  { key: 'reading', label: 'Okunuyor' },
  { key: 'completed', label: 'Tamamlandı' },
  { key: 'planning', label: 'Planlanıyor' },
  { key: 'dropped', label: 'Yarıda Bırakıldı' },
  { key: 'on_hold', label: 'Beklemede' }
];

const TYPES = [
  { key: 'all', label: 'Tümü' },
  { key: 'anime', label: '⚡ Anime' },
  { key: 'manga', label: '📖 Manga' },
  { key: 'movie', label: '🎬 Film' },
  { key: 'tv', label: '📺 Dizi' }
];

export default function LibraryPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!authLoading && isAuthenticated) {
      fetchList();
    }
  }, [isAuthenticated, authLoading]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const params = { limit: 200 };
      const res = await userMediaApi.getAll(params);
      setItems(res.data.items);
      setTotal(res.data.pagination.total);
    } catch (err) {
      toast.error('Liste yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    setModalOpen(false);
    setSelectedEntry(null);
    await fetchList();
  };

  // Filter items
  const filtered = items.filter(entry => {
    const media = entry.mediaId;
    if (!media) return false;
    if (filterStatus !== 'all' && entry.userStatus !== filterStatus) return false;
    if (filterType !== 'all' && entry.type !== filterType) return false;
    if (showFavorites && !entry.isFavorite) return false;
    if (searchQuery && !media.title?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Group by status for display
  const groups = {};
  filtered.forEach(entry => {
    const key = entry.userStatus;
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  });

  // Count by type
  const typeCounts = {};
  items.forEach(e => { typeCounts[e.type] = (typeCounts[e.type] || 0) + 1; });
  const statusCounts = {};
  items.forEach(e => { statusCounts[e.userStatus] = (statusCounts[e.userStatus] || 0) + 1; });

  if (authLoading) return null;
  if (!isAuthenticated) return null;

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        maxWidth: '1400px', margin: '0 auto', padding: '40px 24px 24px'
      }}>
        <h1 style={{
          fontFamily: 'Outfit, sans-serif', fontWeight: '800', fontSize: '2rem',
          color: 'white', margin: '0 0 8px'
        }}>
          Listem
        </h1>
        <p style={{ color: '#52525b', fontSize: '0.9rem', margin: '0 0 24px' }}>
          {total} içerik listenizde
        </p>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {Object.entries(typeCounts).map(([t, count]) => (
            <div key={t} style={{
              padding: '8px 14px', borderRadius: '8px',
              background: '#141414', border: '1px solid rgba(255,255,255,0.06)',
              fontSize: '0.8rem', color: '#a1a1aa', fontWeight: '500'
            }}>
              {t === 'anime' ? '⚡' : t === 'manga' ? '📖' : t === 'movie' ? '🎬' : '📺'} {count}
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{
          background: '#141414', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px', padding: '16px', marginBottom: '24px'
        }}>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '14px' }}>
            <FiSearch size={15} style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              color: '#52525b', pointerEvents: 'none'
            }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Listede ara..."
              style={{
                width: '100%', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                padding: '9px 12px 9px 36px', color: 'white', fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            {/* Type filter */}
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {TYPES.map(t => (
                <button
                  key={t.key}
                  onClick={() => setFilterType(t.key)}
                  style={{
                    padding: '6px 12px', borderRadius: '7px', fontSize: '0.78rem', fontWeight: '600',
                    cursor: 'pointer', transition: 'all 0.15s',
                    background: filterType === t.key ? 'rgba(124,58,237,0.15)' : 'transparent',
                    border: filterType === t.key ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    color: filterType === t.key ? '#a78bfa' : '#71717a'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                style={{
                  padding: '6px 10px', borderRadius: '7px',
                  background: showFavorites ? 'rgba(239,68,68,0.1)' : 'transparent',
                  border: showFavorites ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.06)',
                  color: showFavorites ? '#f87171' : '#71717a', cursor: 'pointer'
                }}
              >
                <FiHeart size={15} fill={showFavorites ? '#f87171' : 'none'} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '6px 10px', borderRadius: '7px',
                  background: viewMode === 'grid' ? 'rgba(124,58,237,0.1)' : 'transparent',
                  border: viewMode === 'grid' ? '1px solid rgba(124,58,237,0.2)' : '1px solid rgba(255,255,255,0.06)',
                  color: viewMode === 'grid' ? '#a78bfa' : '#71717a', cursor: 'pointer'
                }}
              >
                <FiGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '6px 10px', borderRadius: '7px',
                  background: viewMode === 'list' ? 'rgba(124,58,237,0.1)' : 'transparent',
                  border: viewMode === 'list' ? '1px solid rgba(124,58,237,0.2)' : '1px solid rgba(255,255,255,0.06)',
                  color: viewMode === 'list' ? '#a78bfa' : '#71717a', cursor: 'pointer'
                }}
              >
                <FiList size={15} />
              </button>
            </div>
          </div>

          {/* Status filter */}
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {STATUSES.map(s => (
              <button
                key={s.key}
                onClick={() => setFilterStatus(s.key)}
                style={{
                  padding: '5px 11px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '600',
                  cursor: 'pointer', transition: 'all 0.15s',
                  background: filterStatus === s.key ? 'rgba(124,58,237,0.15)' : 'transparent',
                  border: filterStatus === s.key ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  color: filterStatus === s.key ? '#a78bfa' : '#52525b'
                }}
              >
                {s.label}
                {s.key !== 'all' && statusCounts[s.key] ? ` (${statusCounts[s.key]})` : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(150px, 1fr))' : '1fr',
            gap: viewMode === 'grid' ? '14px' : '8px'
          }}>
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="skeleton" style={{
                height: viewMode === 'grid' ? '280px' : '80px', borderRadius: '12px'
              }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📚</div>
            <h3 style={{ color: '#e4e4e7', fontWeight: '600', marginBottom: '8px' }}>Liste Boş</h3>
            <p style={{ color: '#52525b', fontSize: '0.9rem', marginBottom: '20px' }}>
              {items.length === 0 ? 'Henüz listeye içerik eklemediniz.' : 'Bu filtrelerle içerik bulunamadı.'}
            </p>
            <button
              onClick={() => navigate('/search')}
              className="btn-primary"
            >
              İçerik Ara
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(150px, 1fr))' : '1fr',
            gap: viewMode === 'grid' ? '14px' : '8px'
          }}>
            {filtered.map(entry => {
              const media = entry.mediaId;
              if (!media) return null;
              return (
                <div key={entry._id} style={{ position: 'relative' }}>
                  <MediaCard
                    item={{ ...media, type: entry.type }}
                    viewMode={viewMode}
                    userEntry={entry}
                    onStatusUpdate={handleStatusUpdate}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
