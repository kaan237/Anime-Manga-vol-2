import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiGrid, FiList, FiFilter, FiX, FiLoader } from 'react-icons/fi';
import { searchAnilist } from '../api/anilistApi';
import { searchTmdb } from '../api/tmdbApi';
import { userMediaApi } from '../api/backendApi';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useCustom';
import MediaCard from '../components/MediaCard';

const TYPES = [
  { key: 'anime', label: 'Anime', icon: '⚡', color: '#f59e0b' },
  { key: 'manga', label: 'Manga', icon: '📖', color: '#10b981' },
  { key: 'movie', label: 'Film', icon: '🎬', color: '#ef4444' },
  { key: 'tv', label: 'Dizi', icon: '📺', color: '#3b82f6' }
];

export default function SearchPage() {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [type, setType] = useState(searchParams.get('type') || 'anime');
  const [viewMode, setViewMode] = useState('grid');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState(null);
  const [userList, setUserList] = useState([]);
  
  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    if (isAuthenticated) {
      userMediaApi.getAll({ limit: 200 }).then(res => {
        setUserList(res.data.items);
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setPage(1);
    setResults([]);
    doSearch(debouncedQuery, type, 1, true);
    setSearchParams(prev => {
      if (debouncedQuery) prev.set('q', debouncedQuery);
      else prev.delete('q');
      prev.set('type', type);
      return prev;
    });
  }, [debouncedQuery, type]);

  const doSearch = async (q, t, p = 1, reset = false) => {
    if (!q) {
      // Show popular/trending when empty
      q = t === 'anime' ? 'attack' : t === 'manga' ? 'one piece' : t === 'movie' ? 'avengers' : 'breaking';
    }
    setLoading(true);
    try {
      let res;
      if (t === 'anime') res = await searchAnilist(q, 'ANIME', p);
      else if (t === 'manga') res = await searchAnilist(q, 'MANGA', p);
      else if (t === 'movie') res = await searchTmdb(q, 'movie', p);
      else res = await searchTmdb(q, 'tv', p);

      if (reset) {
        setResults(res.items);
      } else {
        setResults(prev => [...prev, ...res.items]);
      }
      setPageInfo(res.pageInfo);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    doSearch(debouncedQuery || '', type, nextPage, false);
  };

  const getUserEntry = (item) => {
    return userList.find(u => u.mediaId?.apiId === item.apiId && u.type === item.type);
  };

  const handleStatusUpdate = async () => {
    if (isAuthenticated) {
      const res = await userMediaApi.getAll({ limit: 200 });
      setUserList(res.data.items);
    }
  };

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh' }}>
      {/* Search Header */}
      <div style={{
        background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '20px 24px', position: 'sticky', top: '64px', zIndex: 90
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <FiSearch size={18} style={{
              position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
              color: '#52525b', pointerEvents: 'none'
            }} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Anime, manga, film veya dizi ara..."
              autoFocus
              style={{
                width: '100%', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px',
                padding: '14px 16px 14px 46px', color: 'white', fontSize: '1rem',
                outline: 'none', transition: 'border-color 0.2s',
                fontFamily: 'Inter, sans-serif'
              }}
              onFocus={e => e.target.style.borderColor = '#7c3aed'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#52525b', cursor: 'pointer'
                }}
              >
                <FiX size={18} />
              </button>
            )}
          </div>

          {/* Type Tabs + View Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {TYPES.map(t => (
                <button
                  key={t.key}
                  onClick={() => setType(t.key)}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600',
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: type === t.key ? `${t.color}15` : 'rgba(255,255,255,0.04)',
                    border: type === t.key ? `1.5px solid ${t.color}40` : '1.5px solid rgba(255,255,255,0.08)',
                    color: type === t.key ? t.color : '#71717a'
                  }}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '8px 10px', borderRadius: '8px',
                  background: viewMode === 'grid' ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)',
                  border: viewMode === 'grid' ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  color: viewMode === 'grid' ? '#a78bfa' : '#52525b', cursor: 'pointer'
                }}
              >
                <FiGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '8px 10px', borderRadius: '8px',
                  background: viewMode === 'list' ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)',
                  border: viewMode === 'list' ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  color: viewMode === 'list' ? '#a78bfa' : '#52525b', cursor: 'pointer'
                }}
              >
                <FiList size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 24px 80px' }}>
        {/* Result count */}
        {!loading && results.length > 0 && (
          <p style={{ fontSize: '0.85rem', color: '#52525b', marginBottom: '20px' }}>
            {pageInfo?.total ? `${pageInfo.total.toLocaleString()} sonuç bulundu` : `${results.length} sonuç`}
          </p>
        )}

        {/* Grid */}
        <AnimatePresence mode="wait">
          {loading && results.length === 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(150px, 1fr))' : '1fr',
              gap: viewMode === 'grid' ? '14px' : '8px'
            }}>
              {Array(viewMode === 'grid' ? 18 : 10).fill(0).map((_, i) => (
                viewMode === 'grid' ? (
                  <div key={i} style={{ borderRadius: '12px', overflow: 'hidden' }}>
                    <div className="skeleton" style={{ paddingTop: '150%' }} />
                    <div style={{ padding: '10px 12px', background: '#141414' }}>
                      <div className="skeleton" style={{ height: '14px', borderRadius: '4px', marginBottom: '6px' }} />
                      <div className="skeleton" style={{ height: '11px', width: '60%', borderRadius: '4px' }} />
                    </div>
                  </div>
                ) : (
                  <div key={i} className="skeleton" style={{ height: '80px', borderRadius: '12px' }} />
                )
              ))}
            </div>
          ) : results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ color: '#e4e4e7', fontWeight: '600', marginBottom: '8px' }}>Sonuç bulunamadı</h3>
              <p style={{ color: '#52525b', fontSize: '0.9rem' }}>Farklı bir arama terimi deneyin.</p>
            </div>
          ) : (
            <motion.div
              key={`${type}-${debouncedQuery}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(150px, 1fr))' : '1fr',
                gap: viewMode === 'grid' ? '14px' : '8px'
              }}
            >
              {results.map((item, i) => (
                <MediaCard
                  key={`${item.apiId}-${item.type}-${i}`}
                  item={item}
                  viewMode={viewMode}
                  userEntry={getUserEntry(item)}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Load more */}
        {pageInfo?.hasNextPage && !loading && results.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
            <button
              onClick={loadMore}
              style={{
                padding: '12px 32px', borderRadius: '10px',
                background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
                color: '#a78bfa', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              Daha Fazla Yükle
            </button>
          </div>
        )}

        {loading && results.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
            <div style={{ color: '#7c3aed', fontSize: '0.85rem' }}>Yükleniyor...</div>
          </div>
        )}
      </div>
    </div>
  );
}
