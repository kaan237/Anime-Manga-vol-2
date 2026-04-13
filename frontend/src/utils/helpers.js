export const STATUS_LABELS = {
  planning: 'Planlanıyor',
  watching: 'İzleniyor',
  reading: 'Okunuyor',
  completed: 'Tamamlandı',
  dropped: 'Yarıda Bırakıldı',
  on_hold: 'Beklemede'
};

export const TYPE_LABELS = {
  anime: 'Anime',
  manga: 'Manga',
  movie: 'Film',
  tv: 'Dizi'
};

export const getStatusLabel = (type, status) => {
  if (status === 'watching') {
    return type === 'manga' ? 'Okunuyor' : 'İzleniyor';
  }
  return STATUS_LABELS[status] || status;
};

export const getProgressLabel = (type) => {
  switch (type) {
    case 'manga': return 'Bölüm';
    case 'anime': return 'Bölüm';
    case 'movie': return '';
    case 'tv': return 'Bölüm';
    default: return 'Bölüm';
  }
};

export const getTotalLabel = (item) => {
  if (item?.type === 'manga') return item?.mediaId?.totalChapters || item?.totalChapters;
  if (item?.type === 'movie') return null;
  return item?.mediaId?.totalEpisodes || item?.totalEpisodes;
};

export const formatScore = (score) => {
  if (!score) return 'N/A';
  return parseFloat(score).toFixed(1);
};

export const formatMinutes = (minutes) => {
  if (!minutes) return '0 saat';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}dk`;
  if (m === 0) return `${h}sa`;
  return `${h}sa ${m}dk`;
};

export const truncate = (str, len = 120) => {
  if (!str) return '';
  return str.length <= len ? str : str.slice(0, len) + '...';
};
