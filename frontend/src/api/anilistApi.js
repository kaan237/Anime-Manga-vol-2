const ANILIST_ENDPOINT = 'https://graphql.anilist.co';

const SEARCH_QUERY = `
  query ($search: String, $type: MediaType, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage total currentPage lastPage }
      media(search: $search, type: $type, sort: POPULARITY_DESC) {
        id
        title { romaji english native }
        description(asHtml: false)
        coverImage { extraLarge large medium color }
        bannerImage
        genres
        averageScore
        status
        episodes
        chapters
        volumes
        startDate { year }
        studios(isMain: true) { nodes { name } }
        source
        format
        duration
        type
      }
    }
  }
`;

const DETAIL_QUERY = `
  query ($id: Int, $type: MediaType) {
    Media(id: $id, type: $type) {
      id
      title { romaji english native }
      description(asHtml: false)
      coverImage { extraLarge large medium color }
      bannerImage
      genres
      averageScore
      status
      episodes
      chapters
      volumes
      startDate { year month day }
      endDate { year }
      studios(isMain: true) { nodes { name } }
      source
      format
      duration
      type
      characters(sort: ROLE, perPage: 6) {
        nodes { name { full } image { medium } }
      }
      relations {
        edges {
          relationType
          node { id title { romaji } coverImage { medium } type }
        }
      }
    }
  }
`;

async function anilistRequest(query, variables) {
  const res = await fetch(ANILIST_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  
  if (!res.ok) throw new Error(`AniList API error: ${res.status}`);
  const data = await res.json();
  if (data.errors) throw new Error(data.errors[0].message);
  return data.data;
}

export function normalizeAnilist(item) {
  return {
    apiId: String(item.id),
    type: item.type === 'ANIME' ? 'anime' : 'manga',
    title: item.title.english || item.title.romaji || item.title.native,
    titleEnglish: item.title.english,
    titleRomaji: item.title.romaji,
    description: item.description?.replace(/<[^>]*>/g, '').slice(0, 500) || '',
    image: item.coverImage?.extraLarge || item.coverImage?.large || item.coverImage?.medium || '',
    bannerImage: item.bannerImage || '',
    genres: item.genres || [],
    status: item.status,
    totalEpisodes: item.episodes || null,
    totalChapters: item.chapters || null,
    totalVolumes: item.volumes || null,
    year: item.startDate?.year || null,
    score: item.averageScore ? item.averageScore / 10 : null,
    duration: item.duration || null,
    source: item.source || null,
    studios: item.studios?.nodes?.map(s => s.name) || [],
    format: item.format || null,
    color: item.coverImage?.color || null
  };
}

export async function searchAnilist(query, type = 'ANIME', page = 1) {
  const data = await anilistRequest(SEARCH_QUERY, { 
    search: query, type, page, perPage: 18 
  });
  return {
    items: data.Page.media.map(normalizeAnilist),
    pageInfo: data.Page.pageInfo
  };
}

export async function getAnilistDetail(id, type = 'ANIME') {
  const data = await anilistRequest(DETAIL_QUERY, { id: Number(id), type });
  return normalizeAnilist(data.Media);
}
