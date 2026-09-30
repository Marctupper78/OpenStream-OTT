
export const IPTV_SOURCES = {
  INDEX: 'https://iptv-org.github.io/iptv/index.m3u',
  CHANNELS_JSON: 'https://iptv-org.github.io/api/channels.json',
  STREAMS_JSON: 'https://iptv-org.github.io/api/streams.json',
  CATEGORY_MOVIES: 'https://iptv-org.github.io/iptv/categories/movies.m3u',
  CATEGORY_NEWS: 'https://iptv-org.github.io/iptv/categories/news.m3u',
  CATEGORY_SPORTS: 'https://iptv-org.github.io/iptv/categories/sports.m3u',
  CATEGORY_MUSIC: 'https://iptv-org.github.io/iptv/categories/music.m3u',
  CATEGORY_ENTERTAINMENT: 'https://iptv-org.github.io/iptv/categories/entertainment.m3u'
};

export const CATEGORIES = [
  { id: 'all', name: 'Todos' },
  { id: 'news', name: 'Notícias' },
  { id: 'movies', name: 'Filmes' },
  { id: 'sports', name: 'Esportes' },
  { id: 'music', name: 'Música' },
  { id: 'entertainment', name: 'Entretenimento' },
  { id: 'documentary', name: 'Documentários' },
  { id: 'kids', name: 'Infantil' },
  { id: 'general', name: 'Geral' },
];

export const FALLBACK_LOGO = 'https://picsum.photos/seed/tv/300/200';
