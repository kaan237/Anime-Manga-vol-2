import api from './backendApi';

export const getImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${backendUrl}/api/tmdb/image/${size}${path}`;
};

export function normalizeTmdb(item, type) {
  const isMovie = type === 'movie';
  return {
    apiId: String(item.id),
    type,
    title: item.title || item.name,
    description: item.overview?.slice(0, 500) || '',
    image: getImageUrl(item.poster_path, 'w500') || '',
    bannerImage: getImageUrl(item.backdrop_path, 'original') || '',
    genres: item.genre_ids ? [] : (item.genres?.map(g => g.name) || []),
    status: item.status || null,
    totalEpisodes: item.number_of_episodes || null,
    totalChapters: null,
    year: isMovie 
      ? item.release_date?.split('-')[0] 
      : item.first_air_date?.split('-')[0],
    score: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : null,
    duration: item.runtime || null,
    studios: item.production_companies?.map(c => c.name) || [],
    format: isMovie ? 'MOVIE' : 'TV',
    voteCount: item.vote_count || 0,
    popularity: item.popularity || 0
  };
}

export async function searchTmdb(query, type = 'movie', page = 1) {
  // TMDB proxy in backend
  const { data } = await api.get(`/api/tmdb/search/${type}`, { 
    params: { query, page } 
  });
  
  return {
    items: (data.results || []).map(item => normalizeTmdb(item, type)),
    pageInfo: {
      total: data.total_results || 0,
      currentPage: data.page || 1,
      lastPage: data.total_pages || 1,
      hasNextPage: data.page < data.total_pages
    }
  };
}

export async function getTmdbDetail(id, type = 'movie') {
  // TMDB proxy in backend
  const { data } = await api.get(`/api/tmdb/detail/${type}/${id}`);
  return normalizeTmdb(data, type);
}

// Genre map for TMDB
export const TMDB_GENRES = {
  movie: [
    { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' }, { id: 18, name: 'Drama' },
    { id: 14, name: 'Fantasy' }, { id: 27, name: 'Horror' }, { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science Fiction' }, { id: 53, name: 'Thriller' }
  ],
  tv: [
    { id: 10759, name: 'Action & Adventure' }, { id: 16, name: 'Animation' }, { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' }, { id: 18, name: 'Drama' }, { id: 10765, name: 'Sci-Fi & Fantasy' },
    { id: 9648, name: 'Mystery' }
  ]
};
