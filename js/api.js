/**
 * BEBU STREAMING ZONE - API Client & Data Layer
 * Handles TMDB API queries, LRU memory caching, and concurrency-controlled batch requests.
 */

const TMDB_KEY = '34d1a1bd431dc14e9243d534340f360b';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMGB = 'https://image.tmdb.org/t/p';

/**
 * LRU (Least Recently Used) Memory Cache for API responses
 */
export class LRUCache {
  constructor(maxSize = 300) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key);
    // Refresh position to mark as recently used
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Evict oldest item
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }

  get size() {
    return this.cache.size;
  }
}

// Global API cache instance
const apiCache = new LRUCache(350);

/**
 * Base TMDB API fetcher with query parameter handling and caching.
 * @param {string} endpoint 
 * @param {Record<string, string|number>} params 
 * @returns {Promise<any>}
 */
export async function apiFetch(endpoint, params = {}) {
  const url = new URL(TMDB_BASE + endpoint);
  url.searchParams.set('api_key', TMDB_KEY);
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== '') {
      url.searchParams.set(key, String(val));
    }
  }

  const cacheKey = url.toString();
  if (apiCache.has(cacheKey)) {
    return apiCache.get(cacheKey);
  }

  try {
    const res = await fetch(url.toString(), {
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      if (res.status === 429) {
        console.warn(`[TMDB 429] Rate limit hit on ${endpoint}. Backing off...`);
      }
      throw new Error(`TMDB HTTP Error ${res.status} for ${endpoint}`);
    }

    const data = await res.json();
    apiCache.set(cacheKey, data);
    return data;
  } catch (err) {
    console.error(`[API Error] Request failed for ${endpoint}:`, err.message);
    throw err;
  }
}

/**
 * Concurrency-controlled batch processor to prevent N+1 waterfall query bottlenecks
 * and respect TMDB rate limits (HTTP 429).
 * 
 * @template T, R
 * @param {T[]} items Array of items to process
 * @param {(item: T, index: number) => Promise<R>} workerFn Async worker function
 * @param {number} chunkSize Number of parallel requests per batch (default: 4)
 * @param {number} delayBetweenChunksMs Delay in ms between batch executions (default: 50ms)
 * @returns {Promise<PromiseSettledResult<R>[]>}
 */
export async function batchFetch(items, workerFn, chunkSize = 4, delayBetweenChunksMs = 50) {
  const results = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const chunkResults = await Promise.allSettled(
      chunk.map((item, idx) => workerFn(item, i + idx))
    );
    results.push(...chunkResults);

    if (i + chunkSize < items.length && delayBetweenChunksMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenChunksMs));
    }
  }
  return results;
}

/**
 * API Endpoints
 */
export const API = {
  trending: (type = 'all', window = 'week') => 
    apiFetch(`/trending/${type}/${window}`),

  popular: (type, page = 1) => 
    apiFetch(`/${type}/popular`, { page }),

  topRated: (type, page = 1) => 
    apiFetch(`/${type}/top_rated`, { page }),

  nowPlaying: (page = 1) => 
    apiFetch('/movie/now_playing', { page }),

  upcoming: (page = 1) => 
    apiFetch('/movie/upcoming', { page }),

  onAir: (page = 1) => 
    apiFetch('/tv/on_the_air', { page }),

  airToday: (page = 1) => 
    apiFetch('/tv/airing_today', { page }),

  search: (query, page = 1) => 
    apiFetch('/search/multi', { query, page, include_adult: false }),

  detail: (id, type) => 
    apiFetch(`/${type}/${id}`, { 
      append_to_response: 'credits,videos,similar,recommendations,release_dates,content_ratings' 
    }),

  season: (id, seasonNum) => 
    apiFetch(`/tv/${id}/season/${seasonNum}`),

  byGenre: (type, genreId, page = 1, sortBy = 'popularity.desc', extra = {}) => 
    apiFetch(`/discover/${type}`, { 
      with_genres: genreId, 
      sort_by: sortBy, 
      page,
      ...extra
    }),

  genres: (type) => 
    apiFetch(`/genre/${type}/list`),

  paged: (type, category, page = 1, sortBy = null) => {
    const params = { page };
    if (sortBy) params.sort_by = sortBy;
    return apiFetch(`/${type}/${category}`, params);
  },

  collection: (collectionId) => 
    apiFetch(`/collection/${collectionId}`),

  discover: (type, params = {}) => 
    apiFetch(`/discover/${type}`, params),

  tvDetail: (id) => 
    apiFetch(`/tv/${id}`),

  person: (id) => 
    apiFetch(`/person/${id}`, { append_to_response: 'combined_credits' })
};

/**
 * Image URL Resolvers
 */
export const IM = {
  poster: (path, size = 'w342') => 
    path ? `${IMGB}/${size}${path}` : 'https://placehold.co/342x513/161623/555?text=No+Poster',

  backdrop: (path, size = 'w1280') => 
    path ? `${IMGB}/${size}${path}` : null,

  still: (path, size = 'w300') => 
    path ? `${IMGB}/${size}${path}` : 'https://placehold.co/300x170/161623/555?text=Episode',

  profile: (path, size = 'w185') => 
    path ? `${IMGB}/${size}${path}` : 'https://placehold.co/185x185/161623/555?text=?',
};

/**
 * Formatting & Metadata Helpers
 */
export const gt = (i) => i?.title || i?.name || 'Untitled';
export const grd = (i) => i?.release_date || i?.first_air_date || '';
export const mty = (i) => i?.media_type || (i?.title ? 'movie' : 'tv');
export const yr = (dateStr) => dateStr ? new Date(dateStr).getFullYear() : '';
export const fd = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};
export const fr = (rating) => (rating !== undefined && rating !== null && !isNaN(rating)) ? (+rating).toFixed(1) : 'N/A';
export const frt = (minutes) => {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};
