/**
 * BEBU STREAMING ZONE - Main Application Controller & View Engine
 * Manages HTML5 routing, view rendering, DOM event handling,
 * and memory cleanup between navigations.
 */

import { API, IM, gt, grd, mty, yr, fd, fr, frt, batchFetch } from './api.js';
import { 
  State, registerItem, getItem, isInWatchlist, toggleWatchlist,
  addToHistory, removeFromHistory, clearHistory, getProgress,
  removeProgress, getContinueWatching, exportUserData, importUserData,
  showToast, subscribe, getNotifications, saveNotifications, ST
} from './state.js';
import { mountPlayer, destroyPlayer, sendPlayerCommand, buildEmbedUrl } from './player.js';

/* ─── ICONS & SVG GLYPHS ──────────────────────────────────── */
export const I = {
  play: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
  playFilled: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
  info: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  star: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  bookmark: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
  bookmarkFilled: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
  heart: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
  chevronLeft: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>`,
  chevronRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>`,
  menu: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  home: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  film: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`,
  tv: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>`,
  trend: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  calendar: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  genre: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  watchlist: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>`,
  pause: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
  search: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  clock: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  layers: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  backup: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  trailer: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`
};

const PAGES = [
  { id: 'home', label: 'Home', icon: I.home, route: '/' },
  { id: 'movies', label: 'Movies', icon: I.film, route: '/movies' },
  { id: 'tv', label: 'TV Shows', icon: I.tv, route: '/tv' },
  { id: 'trending', label: 'Trending', icon: I.trend, route: '/trending' },
  { id: 'calendar', label: 'Calendar', icon: I.calendar, route: '/calendar' },
  { id: 'genres', label: 'Genres', icon: I.genre, route: '/genres' },
  { id: 'watchlist', label: 'Watchlist', icon: I.watchlist, route: '/watchlist' },
];

const PAGE_TITLES = {
  home: 'BEBU Streaming Zone · Cinema Portal',
  movies: 'Movies · BEBU',
  tv: 'TV Shows · BEBU',
  trending: 'Trending Now · BEBU',
  calendar: 'Releases & TV Schedule · BEBU',
  genres: 'Genres · BEBU',
  watchlist: 'My Watchlist · BEBU',
  search: 'Search · BEBU',
  detail: 'Details · BEBU',
  watch: 'Watch Player · BEBU',
  person: 'Cast & Filmography · BEBU'
};

const GICONS = {
  28: '💥', 12: '🌍', 16: '🎨', 35: '😂', 80: '🔫', 99: '📰',
  18: '🎭', 10751: '👨‍👩‍👧', 14: '🧙', 36: '📜', 27: '👻', 10402: '🎵',
  9648: '🔍', 10749: '💕', 878: '🚀', 10770: '📺', 53: '⚡', 10752: '⚔️',
  37: '🤠', 10759: '🏃', 10765: '✨', 10768: '🪖'
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_SHORT = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

/* ═══════════════════════════════════════════════════════════════════
   ROUTER & NAVIGATION (HTML5 History API)
   ═══════════════════════════════════════════════════════════════════ */

export function slugify(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function parseRoute() {
  if (typeof window === 'undefined') {
    return { root: 'home', segments: [], params: new URLSearchParams(), fullPath: '/' };
  }

  let fullPath = window.location.pathname || '/';
  let queryString = window.location.search || '';

  // Backward compatibility: If URL has a hash like #/movie/123 or #detail/movie/123
  if (window.location.hash) {
    const rawHash = window.location.hash.replace(/^#\/?/, '');
    const [hPath, hQuery] = rawHash.split('?');
    if (hPath) {
      fullPath = '/' + hPath;
    }
    if (hQuery) {
      queryString = '?' + hQuery;
    }
    try {
      window.history.replaceState(null, '', fullPath + queryString);
    } catch {}
  }

  // Remove leading and trailing slashes for segment parsing
  const clean = fullPath.replace(/^\/+|\/+$/g, '');
  const segments = clean ? clean.split('/') : [];
  const params = new URLSearchParams(queryString);

  let root = segments[0] || 'home';

  // Normalize /movie/:id/:slug or /tv/:id/:slug to root = 'detail'
  if (root === 'movie' || (root === 'tv' && segments[1])) {
    root = 'detail';
  }

  return { root, segments, params, fullPath };
}

export const parseHash = parseRoute;

export function isSameMedia(urlA, urlB) {
  if (!urlA || !urlB) return false;
  const parse = (u) => {
    const clean = u.replace(/^#\/?/, '').replace(/^\/+/, '').split('?')[0];
    const parts = clean.split('/');
    if (parts[0] === 'movie' || parts[0] === 'tv') return `${parts[0]}/${parts[1]}`;
    if (parts[0] === 'detail' && parts[2]) return `${parts[1]}/${parts[2]}`;
    if (parts[0] === 'watch' && parts[2]) return `${parts[1]}/${parts[2]}`;
    return null;
  };
  const a = parse(urlA);
  const b = parse(urlB);
  return a && b && a === b;
}

export function routeTo(url, options = {}) {
  if (typeof window === 'undefined') return;

  const replace = typeof options === 'boolean' ? options : Boolean(options && options.replace);

  let cleanUrl = url || '/';
  if (cleanUrl.startsWith('#/')) {
    cleanUrl = cleanUrl.replace(/^#\/?/, '/');
  } else if (cleanUrl.startsWith('#')) {
    cleanUrl = '/' + cleanUrl.replace(/^#/, '');
  }
  if (!cleanUrl.startsWith('/')) {
    cleanUrl = '/' + cleanUrl;
  }

  const currentUrl = (window.location.pathname || '/') + (window.location.search || '');
  // Idempotent Router: if destination matches active view, never push a duplicate entry
  if (currentUrl === cleanUrl) return;

  if (replace) {
    window.history.replaceState({ url: cleanUrl }, '', cleanUrl);
  } else {
    window.history.pushState({ url: cleanUrl }, '', cleanUrl);
  }

  const { root } = parseRoute();
  // Only top-level browse hubs are tracked as browse return points (never person, detail, or watch)
  if (['home', 'movies', 'tv', 'trending', 'calendar', 'genres', 'watchlist', 'search'].includes(root)) {
    State._lastBrowsePage = cleanUrl;
  }

  handleRoute();
}

export function navigateTo(url, replace = false) {
  return routeTo(url, { replace: typeof replace === 'boolean' ? replace : false });
}

export function handleBack(fallback) {
  // If video player modal is currently open, dismiss it directly without altering history
  const playerModal = document.getElementById('player-modal');
  if (playerModal && playerModal.classList.contains('active')) {
    closePlayerModal();
    return;
  }

  // If trailer modal is open, dismiss it
  const trailerModal = document.getElementById('trailer-modal') || document.getElementById('tmodal');
  if (trailerModal && trailerModal.classList.contains('open')) {
    closeTrailer();
    return;
  }

  const { root, segments } = parseRoute();

  // If in watch player from direct route, unwind to detail view using replaceState
  if (root === 'watch') {
    const type = segments[1] || 'movie';
    const id = segments[2];
    const slug = segments[3] || 'title';
    routeTo(`/${type}/${id}/${slug}`, { replace: true });
    return;
  }

  // Sync navigation exclusively with native HTML5 History API
  if (typeof window !== 'undefined' && window.history.length > 1) {
    window.history.back();
  } else {
    const dest = fallback || State._lastBrowsePage || 'home';
    if (dest === 'home' || dest === '/') {
      go('home');
    } else {
      routeTo(dest);
    }
  }
}
export const goBack = handleBack;

export function go(target, params = {}) {
  if (typeof target === 'string') {
    if (target.startsWith('/') || target.startsWith('#')) {
      routeTo(target);
    } else if (target === 'person') {
      const id = params.id;
      const slug = slugify(params.name || 'cast');
      routeTo(`/person/${id}/${slug}`);
    } else if (target === 'movie') {
      const id = params.id;
      const slug = slugify(params.title || params.name || 'movie');
      routeTo(`/movie/${id}/${slug}`);
    } else if (target === 'tv') {
      const id = params.id;
      const slug = slugify(params.name || params.title || 'tv');
      routeTo(`/tv/${id}/${slug}`);
    } else if (target === 'detail') {
      const t = params.type === 'tv' ? 'tv' : 'movie';
      const id = params.id;
      const slug = slugify(params.title || params.name || t);
      routeTo(`/${t}/${id}/${slug}`);
    } else if (target === 'genre') {
      const id = params.id;
      const slug = slugify(params.name || 'genre');
      routeTo(`/genre/${id}/${slug}`);
    } else if (target === 'watch') {
      // Treat Video Player as Floating Overlay/Modal, NOT a full page navigation state
      const t = params.type === 'tv' ? 'tv' : 'movie';
      const id = params.id;
      openPlayerModal({
        id,
        type: t,
        season: params.season || 1,
        episode: params.episode || 1,
        resume: params.resume ?? true
      });
    } else if (target === 'search') {
      routeTo(`/search?q=${encodeURIComponent(params.q || '')}`);
    } else {
      routeTo(`/${target}`);
    }
  }
}

if (typeof window !== 'undefined') {
  window.routeTo = routeTo;
  window.navigateTo = navigateTo;
  window.go = go;
  window.goBack = handleBack;
  window.handleBack = handleBack;
}

export function getPageFromRoot(root, segments = []) {
  switch (root) {
    case '':
    case 'home':
      return 'home';
    case 'movies':
      return 'movies';
    case 'tv':
      return segments[1] ? 'detail' : 'tv';
    case 'shows':
      return 'tv';
    case 'trending':
      return 'trending';
    case 'calendar':
      return 'calendar';
    case 'genres':
    case 'genre':
      return 'genres';
    case 'watchlist':
    case 'favorites':
      return 'watchlist';
    case 'search':
      return 'search';
    case 'detail':
    case 'movie':
      return 'detail';
    case 'person':
    case 'actor':
      return 'person';
    case 'watch':
      return 'watch';
    default:
      return 'home';
  }
}

export function updateNavActive(pageId = State.page) {
  if (typeof document === 'undefined') return;
  // Strict route identifier matching without hardcoded index lookups
  document.querySelectorAll('.nav-links a[data-nav-id]').forEach(link => {
    link.classList.toggle('on', link.dataset.navId === pageId);
  });
  document.querySelectorAll('.drawer-link[data-drawer-id]').forEach(link => {
    link.classList.toggle('on', link.dataset.drawerId === pageId);
  });
}
if (typeof window !== 'undefined') {
  window.updateNavActive = updateNavActive;
}

function cleanupCurrentView() {
  // Clear hero tick
  if (State.heroTick) {
    clearInterval(State.heroTick);
    State.heroTick = null;
  }
  // Clear player telemetry and timers
  destroyPlayer();
  // Close any search drops or drawer
  closeSearchDrop();
  closeDrawer();
}

export async function handleRoute() {
  cleanupCurrentView();
  window.scrollTo({ top: 0, behavior: 'instant' });

  const { root, segments, params } = parseRoute();
  const activePage = getPageFromRoot(root, segments);
  State.page = activePage;

  // Immediately synchronize active navigation classes without lag or off-by-one errors
  updateNavActive(activePage);

  // Support document View Transitions if available
  const executeRender = async () => {
    switch (root) {
      case 'home':
        document.title = PAGE_TITLES.home;
        await renderPageHome();
        break;

      case 'movies':
        State.page = 'movies';
        document.title = PAGE_TITLES.movies;
        await renderPageMovies();
        break;

      case 'tv':
        State.page = 'tv';
        document.title = PAGE_TITLES.tv;
        await renderPageTV();
        break;

      case 'trending':
        State.page = 'trending';
        document.title = PAGE_TITLES.trending;
        await renderPageTrending();
        break;

      case 'calendar':
        State.page = 'calendar';
        document.title = PAGE_TITLES.calendar;
        await renderPageCalendar();
        break;

      case 'genres':
        State.page = 'genres';
        document.title = PAGE_TITLES.genres;
        await renderPageGenres();
        break;

      case 'genre': {
        State.page = 'genre';
        const genreId = segments[1];
        const genreName = decodeURIComponent(segments[2] || 'Genre').replace(/-/g, ' ');
        State.genre = genreId;
        State.genreName = genreName;
        document.title = `${genreName} · BEBU`;
        await renderPageGenreResults(genreId, genreName);
        break;
      }

      case 'search': {
        State.page = 'search';
        const query = params.get('q') || '';
        State.query = query;
        document.title = query ? `Search "${query}" · BEBU` : PAGE_TITLES.search;
        await renderPageSearch(query);
        break;
      }

      case 'watchlist':
      case 'favorites':
        State.page = 'watchlist';
        document.title = PAGE_TITLES.watchlist;
        renderPageWatchlist();
        break;

      case 'detail': {
        State.page = 'detail';
        let type = 'movie';
        let id = null;
        if (segments[0] === 'detail') {
          type = segments[1] || 'movie';
          id = segments[2];
        } else if (segments[0] === 'movie') {
          type = 'movie';
          id = segments[1];
        } else if (segments[0] === 'tv') {
          type = 'tv';
          id = segments[1];
        }
        State.type = type;
        State.id = +id;
        document.title = PAGE_TITLES.detail;
        await renderPageDetail(id, type);
        break;
      }

      case 'person': {
        State.page = 'person';
        const personId = segments[1];
        const personSlug = segments[2] || 'cast';
        const personName = decodeURIComponent(personSlug.replace(/-/g, ' '));
        document.title = `${personName} · Filmography · BEBU`;
        await renderPagePerson(personId, personName);
        break;
      }

      case 'watch': {
        State.page = 'watch';
        let type = 'movie';
        let id = null;
        if (segments[1] === 'movie' || segments[1] === 'tv') {
          type = segments[1];
          id = segments[2];
        } else {
          type = 'movie';
          id = segments[1];
        }
        const season = +(params.get('season') || 1);
        const ep = +(params.get('ep') || 1);
        State.type = type;
        State.id = +id;
        State.season = season;
        State.ep = ep;
        document.title = PAGE_TITLES.watch;
        await renderPageDetail(id, type);
        openPlayerModal({ id, type, season, episode: ep, resume: true });
        break;
      }

      default:
        State.page = 'home';
        document.title = PAGE_TITLES.home;
        await renderPageHome();
        break;
    }
  };

  if (document.startViewTransition) {
    document.startViewTransition(() => executeRender());
  } else {
    await executeRender();
  }
}

// Native popstate listener for back/forward browser gestures
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    // If video player modal is currently open when browser back is triggered, dismiss overlay
    const playerModal = document.getElementById('player-modal');
    if (playerModal && playerModal.classList.contains('active')) {
      closePlayerModal();
    }
    handleRoute();
  });
}

/* ═══════════════════════════════════════════════════════════════════
   NAVBAR & DRAWER
   ═══════════════════════════════════════════════════════════════════ */

export function renderNavbar() {
  const nb = document.getElementById('nb');
  if (!nb) return;

  nb.innerHTML = `
    <div class="logo-wrap" onclick="navigateTo('/')">
      <div class="logo-icon">B</div>
      <div class="logo-text">BEBU<span style="-webkit-text-fill-color:rgba(245,245,252,0.4)">_</span>ZONE</div>
    </div>
    <ul class="nav-links">
      ${PAGES.map(p => `
        <li><a data-nav-id="${p.id}" class="${State.page === p.id ? 'on' : ''}" onclick="navigateTo('${p.route}')">${p.label}</a></li>
      `).join('')}
    </ul>
    <div class="nav-actions">
      <div class="srch-wrap">
        <span class="srch-ico">${I.search}</span>
        <input id="srch-inp" type="text" placeholder="Search movies, shows…" autocomplete="off" value="${State.query || ''}" />
        <div id="sdrop"></div>
      </div>
      <button class="btn-surprise hide-mobile" onclick="window.surpriseMe()" title="Surprise Me (Roll random title)">
        🎲 <span class="hide-mobile">Surprise Me</span>
      </button>
      <button class="btn btn-out btn-sm hide-mobile" onclick="window.openDataModal()" title="Backup & Restore Data">
        ${I.backup} <span class="hide-mobile">Backup</span>
      </button>
      <div class="notif-wrap" id="notif-wrap">
        <button class="nav-bell-btn" id="nav-bell-btn" onclick="window.toggleNotificationDropdown()" aria-label="Notifications" title="Watchlist Release Notifications">
          <span class="bell-ico">🔔</span>
          <span class="bell-badge" id="bell-badge" style="display:none">0</span>
        </button>
        <div class="notif-dropdown" id="notif-dropdown">
          <div class="notif-header">
            <div class="notif-title">🔔 Watchlist Updates</div>
            <button class="notif-mark-all" onclick="window.markAllNotificationsRead()">Mark all as read</button>
          </div>
          <div class="notif-list" id="notif-list">
            <div class="notif-empty">No watchlist updates detected yet.</div>
          </div>
        </div>
      </div>
      <button class="nav-srch-btn" id="mobile-srch-toggle" onclick="window.toggleMobileSearch()" aria-label="Search" title="Search">
        ${I.search}
      </button>
      <button class="nav-hbg" onclick="openDrawer()" aria-label="Open menu" title="Open Menu">${I.menu}</button>
    </div>
    <div id="mobile-srch-bar" class="mobile-srch-bar">
      <div class="mobile-srch-inner">
        <span class="mobile-srch-ico">${I.search}</span>
        <input id="mobile-srch-inp" type="text" placeholder="Search movies, shows…" autocomplete="off" />
        <button class="mobile-srch-cls" onclick="window.toggleMobileSearch(false)" aria-label="Close search">✕</button>
      </div>
      <div id="mobile-sdrop" class="mobile-sdrop"></div>
    </div>
  `;

  // Attach desktop search input listeners
  const inp = document.getElementById('srch-inp');
  if (inp) {
    let debounceTimer;
    inp.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      const q = e.target.value.trim();
      if (!q) { closeSearchDrop(); return; }
      debounceTimer = setTimeout(async () => {
        if (q.length < 2) return;
        try {
          const data = await API.search(q, 1);
          const results = (data.results || [])
            .filter(i => i.media_type !== 'person' && i.poster_path && (i.title || i.name))
            .slice(0, 6);
          showSearchDrop(results, q);
        } catch {}
      }, 350);
    });

    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = e.target.value.trim();
        if (q) {
          closeSearchDrop();
          navigateTo(`/search?q=${encodeURIComponent(q)}`);
        }
      } else if (e.key === 'Escape') {
        closeSearchDrop();
      }
    });

    inp.addEventListener('focus', () => {
      if (inp.value.trim().length >= 2) {
        document.getElementById('sdrop')?.classList.add('show');
      }
    });
  }

  // Attach mobile search input listeners
  const mInp = document.getElementById('mobile-srch-inp');
  if (mInp) {
    let mTimer;
    mInp.addEventListener('input', (e) => {
      clearTimeout(mTimer);
      const q = e.target.value.trim();
      const drop = document.getElementById('mobile-sdrop');
      if (!q) {
        if (drop) { drop.classList.remove('show'); drop.innerHTML = ''; }
        return;
      }
      mTimer = setTimeout(async () => {
        if (q.length < 2) return;
        try {
          const data = await API.search(q, 1);
          const results = (data.results || [])
            .filter(i => i.media_type !== 'person' && i.poster_path && (i.title || i.name))
            .slice(0, 6);
          showMobileSearchDrop(results, q);
        } catch {}
      }, 300);
    });

    mInp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = e.target.value.trim();
        if (q) {
          window.toggleMobileSearch(false);
          navigateTo(`/search?q=${encodeURIComponent(q)}`);
        }
      } else if (e.key === 'Escape') {
        window.toggleMobileSearch(false);
      }
    });
  }

  renderDrawerLinks();
  updateNotificationBadge();
  renderNotificationsDOM();
}

export function toggleMobileSearch(forceState) {
  const bar = document.getElementById('mobile-srch-bar');
  if (!bar) return;
  const willOpen = typeof forceState === 'boolean' ? forceState : !bar.classList.contains('open');
  bar.classList.toggle('open', willOpen);
  const toggleBtn = document.getElementById('mobile-srch-toggle');
  if (toggleBtn) toggleBtn.classList.toggle('active', willOpen);
  if (willOpen) {
    const inp = document.getElementById('mobile-srch-inp');
    if (inp) {
      setTimeout(() => inp.focus(), 60);
    }
  } else {
    const drop = document.getElementById('mobile-sdrop');
    if (drop) {
      drop.classList.remove('show');
      drop.innerHTML = '';
    }
  }
}
window.toggleMobileSearch = toggleMobileSearch;

function showMobileSearchDrop(items, query) {
  const drop = document.getElementById('mobile-sdrop');
  if (!drop) return;

  if (!items.length) {
    drop.innerHTML = `<div class="sd-row" style="justify-content:center;color:var(--txt3);font-size:0.8rem">No results found</div>`;
    drop.classList.add('show');
    return;
  }

  drop.innerHTML = items.map(item => {
    const t = mty(item);
    registerItem(item);
    const slug = slugify(gt(item) || 'title');
    return `
      <div class="sd-row" onclick="navigateTo('/${t}/${item.id}/${slug}'); window.toggleMobileSearch(false);">
        <img class="sd-img" src="${IM.poster(item.poster_path, 'w92')}" alt="${gt(item)}" loading="lazy" />
        <div style="flex:1;min-width:0">
          <div class="sd-title">${gt(item)}</div>
          <div class="sd-meta">${yr(grd(item))} ${item.vote_average ? `· ⭐ ${fr(item.vote_average)}` : ''}</div>
        </div>
        <span class="sd-type">${t === 'tv' ? 'TV' : 'FILM'}</span>
      </div>
    `;
  }).join('') + `
    <div class="sd-row" style="justify-content:center;color:var(--red);font-size:0.82rem;font-weight:700;gap:6px" 
         onclick="navigateTo('/search?q=${encodeURIComponent(query)}'); window.toggleMobileSearch(false);">
      ${I.search} View all results
    </div>
  `;
  drop.classList.add('show');
}

function renderDrawerLinks() {
  const linksEl = document.getElementById('drawer-links');
  if (!linksEl) return;
  linksEl.innerHTML = PAGES.map(p => `
    <div data-drawer-id="${p.id}" class="drawer-link ${State.page === p.id ? 'on' : ''}" onclick="navigateTo('${p.route}'); closeDrawer();">
      ${p.icon} <span>${p.label}</span>
    </div>
  `).join('');
}

export function openDrawer() {
  document.getElementById('drawer')?.classList.add('open');
}
export function closeDrawer() {
  document.getElementById('drawer')?.classList.remove('open');
}
window.openDrawer = openDrawer;
window.closeDrawer = closeDrawer;

function showSearchDrop(items, query) {
  const drop = document.getElementById('sdrop');
  if (!drop) return;

  if (!items.length) {
    drop.innerHTML = `<div class="sd-row" style="justify-content:center;color:var(--txt3);font-size:0.8rem">No results found</div>`;
    drop.classList.add('show');
    return;
  }

  drop.innerHTML = items.map(item => {
    const t = mty(item);
    registerItem(item);
    const slug = slugify(gt(item) || 'title');
    return `
      <div class="sd-row" onclick="navigateTo('/${t}/${item.id}/${slug}'); closeSearchDrop();">
        <img class="sd-img" src="${IM.poster(item.poster_path, 'w92')}" alt="${gt(item)}" loading="lazy" />
        <div style="flex:1;min-width:0">
          <div class="sd-title">${gt(item)}</div>
          <div class="sd-meta">${yr(grd(item))} ${item.vote_average ? `· ⭐ ${fr(item.vote_average)}` : ''}</div>
        </div>
        <span class="sd-type">${t === 'tv' ? 'TV' : 'FILM'}</span>
      </div>
    `;
  }).join('') + `
    <div class="sd-row" style="justify-content:center;color:var(--red);font-size:0.82rem;font-weight:700;gap:6px" 
         onclick="navigateTo('/search?q=${encodeURIComponent(query)}'); closeSearchDrop();">
      ${I.search} View all results
    </div>
  `;
  drop.classList.add('show');
}

function closeSearchDrop() {
  document.getElementById('sdrop')?.classList.remove('show');
}

// Global click-away to close search drops and notifications
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.srch-wrap')) closeSearchDrop();
    if (!e.target.closest('#mobile-srch-bar') && !e.target.closest('#mobile-srch-toggle')) {
      toggleMobileSearch(false);
    }
    if (!e.target.closest('#notif-wrap')) {
      toggleNotificationDropdown(false);
    }
  });
}

/**
 * Enable native horizontal mouse-wheel translation (deltaY -> scrollLeft)
 * and click-and-drag scrolling for episode chunking tabs
 */
export function enableHorizontalScroll(el) {
  if (!el || el._hasHorizScroll) return;
  el._hasHorizScroll = true;

  // 1. Mouse wheel translation: deltaY -> scrollLeft
  el.addEventListener('wheel', (evt) => {
    if (evt.deltaY !== 0) {
      if (el.scrollWidth > el.clientWidth) {
        evt.preventDefault();
        el.scrollLeft += evt.deltaY;
      }
    }
  }, { passive: false });

  // 2. Click-and-drag horizontal mouse scrolling
  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  el.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDown = true;
    el.classList.add('is-dragging');
    startX = e.pageX - el.offsetLeft;
    scrollLeft = el.scrollLeft;
  });

  const stopDrag = () => {
    if (isDown) {
      isDown = false;
      el.classList.remove('is-dragging');
    }
  };

  window.addEventListener('mouseup', stopDrag);
  window.addEventListener('mouseleave', stopDrag);

  el.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5;
    el.scrollLeft = scrollLeft - walk;
  });
}
window.enableHorizontalScroll = enableHorizontalScroll;

/**
 * Contextual Screen Rotate Button Visibility
 * Hidden by default; displayed only on mobile/touch viewports in portrait mode
 */
export function updateRotateButtonVisibility() {
  const btn = document.getElementById('player-rotate-btn');
  if (!btn) return;
  const isTouch = ('ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0));
  const isMobile = window.innerWidth <= 768;
  const isPortrait = window.matchMedia && window.matchMedia('(orientation: portrait)').matches;
  if (isTouch && isMobile && isPortrait) {
    btn.style.setProperty('display', 'inline-flex', 'important');
  } else {
    btn.style.setProperty('display', 'none', 'important');
  }
}
window.updateRotateButtonVisibility = updateRotateButtonVisibility;
if (typeof window !== 'undefined') {
  window.addEventListener('resize', updateRotateButtonVisibility);
  window.addEventListener('orientationchange', updateRotateButtonVisibility);
}

/**
 * Watchlist Notifications System
 */
export function toggleNotificationDropdown(forceState) {
  const dropdown = document.getElementById('notif-dropdown');
  const btn = document.getElementById('nav-bell-btn');
  if (!dropdown) return;
  const isOpen = typeof forceState === 'boolean' ? forceState : !dropdown.classList.contains('show');
  dropdown.classList.toggle('show', isOpen);
  if (btn) btn.classList.toggle('active', isOpen);
  if (isOpen) {
    renderNotificationsDOM();
  }
}
window.toggleNotificationDropdown = toggleNotificationDropdown;

export function updateNotificationBadge() {
  const notifs = getNotifications();
  const unreadCount = notifs.filter(n => !n.read).length;
  const badge = document.getElementById('bell-badge');
  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}
window.updateNotificationBadge = updateNotificationBadge;

export function renderNotificationsDOM() {
  const listEl = document.getElementById('notif-list');
  if (!listEl) return;
  const notifs = getNotifications();
  if (!notifs.length) {
    listEl.innerHTML = '<div class="notif-empty">No watchlist updates detected yet.</div>';
    return;
  }

  listEl.innerHTML = notifs.map(n => `
    <div class="notif-item ${n.read ? 'read' : 'unread'}" 
         onclick="window.markNotificationRead('${n.id}', ${n.mediaId}, '${n.type}', '${(n.title || '').replace(/'/g, "\\'")}')">
      <div class="notif-item-body">
        <div class="notif-item-head">
          <span class="notif-item-title">${n.title}</span>
          <span class="notif-item-type">${n.type === 'tv' ? 'Series' : 'Movie'}</span>
        </div>
        <div class="notif-item-msg">${n.message}</div>
        <div class="notif-item-date">${fd(n.date) || n.date}</div>
      </div>
    </div>
  `).join('');
}
window.renderNotificationsDOM = renderNotificationsDOM;

export function markNotificationRead(notifId, mediaId, type, title) {
  const notifs = getNotifications();
  const notif = notifs.find(n => n.id === notifId);
  if (notif) {
    notif.read = true;
    saveNotifications(notifs);
    updateNotificationBadge();
    renderNotificationsDOM();
  }
  toggleNotificationDropdown(false);
  if (mediaId && type) {
    const slug = slugify(title || type);
    navigateTo(`/${type}/${mediaId}/${slug}`);
  }
}
window.markNotificationRead = markNotificationRead;

export function markAllNotificationsRead() {
  const notifs = getNotifications();
  notifs.forEach(n => n.read = true);
  saveNotifications(notifs);
  updateNotificationBadge();
  renderNotificationsDOM();
}
window.markAllNotificationsRead = markAllNotificationsRead;

export async function checkWatchlistNotifications() {
  const watchlist = State.watchlistData || State.favData || [];
  if (!watchlist.length) {
    updateNotificationBadge();
    return;
  }

  const existingNotifs = getNotifications();
  const notifMap = new Map();
  existingNotifs.forEach(n => notifMap.set(n.id, n));

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sevenDaysAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAhead = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

  let newAlertCount = 0;

  await batchFetch(watchlist, async (item) => {
    try {
      const type = item.media_type || (item.title ? 'movie' : 'tv');
      const det = await API.detail(item.id, type);
      const title = gt(det);

      if (type === 'tv') {
        // Inspect last episode to air or check if last_air_date falls within the last 7 days
        if (det.last_episode_to_air) {
          const ep = det.last_episode_to_air;
          const airDate = ep.air_date ? new Date(ep.air_date) : null;
          if (airDate && !isNaN(airDate.getTime()) && airDate >= sevenDaysAgo && airDate <= now) {
            const notifId = `tv-${item.id}-s${ep.season_number}e${ep.episode_number}`;
            if (!notifMap.has(notifId)) {
              notifMap.set(notifId, {
                id: notifId,
                title: title,
                message: `Season ${ep.season_number}, Episode ${ep.episode_number}${ep.name ? ` ("${ep.name}")` : ''} is now available!`,
                date: ep.air_date,
                read: false,
                mediaId: item.id,
                type: 'tv'
              });
              newAlertCount++;
            }
          }
        }

        // Inspect next episode to air (upcoming within 7 days)
        if (det.next_episode_to_air) {
          const ep = det.next_episode_to_air;
          const airDate = ep.air_date ? new Date(ep.air_date) : null;
          if (airDate && !isNaN(airDate.getTime()) && airDate >= now && airDate <= sevenDaysAhead) {
            const notifId = `tv-${item.id}-s${ep.season_number}e${ep.episode_number}-upcoming`;
            if (!notifMap.has(notifId)) {
              notifMap.set(notifId, {
                id: notifId,
                title: title,
                message: `Season ${ep.season_number}, Episode ${ep.episode_number} airs soon on ${ep.air_date}!`,
                date: ep.air_date,
                read: false,
                mediaId: item.id,
                type: 'tv'
              });
              newAlertCount++;
            }
          }
        }
      } else if (type === 'movie') {
        // Query belongs_to_collection to check for newer movies in the same collection
        if (det.belongs_to_collection && det.belongs_to_collection.id) {
          try {
            const col = await API.collection(det.belongs_to_collection.id);
            const parts = col.parts || [];
            parts.forEach(part => {
              if (part.id !== item.id && part.release_date) {
                const pDate = new Date(part.release_date);
                if (!isNaN(pDate.getTime()) && pDate >= thirtyDaysAgo && pDate <= sixtyDaysAhead) {
                  const notifId = `movie-${part.id}-sequel`;
                  if (!notifMap.has(notifId)) {
                    const isUpcoming = pDate > now;
                    notifMap.set(notifId, {
                      id: notifId,
                      title: part.title || title,
                      message: isUpcoming
                        ? `New franchise sequel "${part.title}" arrives on ${part.release_date}!`
                        : `New franchise sequel "${part.title}" is now available!`,
                      date: part.release_date,
                      read: false,
                      mediaId: part.id,
                      type: 'movie'
                    });
                    newAlertCount++;
                  }
                }
              }
            });
          } catch (colErr) {}
        }
      }
    } catch (err) {}
  }, 3, 80);

  const updatedNotifs = Array.from(notifMap.values()).sort((a, b) => new Date(b.date) - new Date(a.date));
  saveNotifications(updatedNotifs);
  updateNotificationBadge();
  renderNotificationsDOM();

  if (newAlertCount > 0) {
    showToast(`🎬 ${newAlertCount} new release${newAlertCount > 1 ? 's' : ''} detected in your Watchlist!`, 'ok', 4500);
  }
}
window.checkWatchlistNotifications = checkWatchlistNotifications;

// Window scroll styling (debounced via requestAnimationFrame to eliminate layout thrashing)
if (typeof window !== 'undefined') {
  let scrollTickPending = false;
  window.addEventListener('scroll', () => {
    if (!scrollTickPending) {
      scrollTickPending = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const nb = document.getElementById('nb');
        const s2t = document.getElementById('s2t');
        if (nb) nb.classList.toggle('solid', scrollY > 30);
        if (s2t) s2t.classList.toggle('show', scrollY > 400);
        scrollTickPending = false;
      });
    }
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════════════════════
   CARD RENDERING & BADGES
   ═══════════════════════════════════════════════════════════════════ */

export function getQualityBadge(item) {
  const t = mty(item);
  if (t === 'tv') return `<span class="card-qual qual-hd">HD</span>`;
  const rel = item.release_date || '';
  if (!rel) return `<span class="card-qual qual-hd">HD</span>`;

  const daysSince = (Date.now() - new Date(rel).getTime()) / 86400000;
  if (daysSince < 0) return `<span class="card-qual qual-new">SOON</span>`;
  if (daysSince < 40) return `<span class="card-qual qual-cam">CAM</span>`;
  if (daysSince < 100) return `<span class="card-qual qual-new">NEW</span><span class="card-qual qual-hd">HD</span>`;
  return `<span class="card-qual qual-hd">HD</span>`;
}

export function renderCard(item, { type = null, wide = false } = {}) {
  const t = type || mty(item);
  registerItem({ ...item, media_type: t });
  const isSaved = isInWatchlist(item.id);
  const prg = getProgress(item.id);
  const poster = wide 
    ? (IM.backdrop(item.backdrop_path, 'w500') || IM.poster(item.poster_path))
    : IM.poster(item.poster_path);
  const slug = slugify(gt(item) || 'title');
  const targetUrl = `/${t}/${item.id}/${slug}`;

  return `
    <div class="card ${wide ? 'card-wide' : ''}" 
         data-card-id="${item.id}"
         onclick="navigateTo('${targetUrl}')"
         role="button" tabindex="0"
         onkeydown="if(event.key==='Enter') navigateTo('${targetUrl}')">
      <img class="card-img" src="${poster}" alt="${gt(item).replace(/"/g, '&quot;')}" loading="lazy" />
      <div class="card-ovl"></div>
      <div class="card-play">${I.playFilled}</div>
      <span class="card-badge">${t === 'tv' ? 'TV' : 'FILM'}</span>
      <div class="card-qual-wrap">${getQualityBadge(item)}</div>
      
      <div class="card-actions">
        <button class="card-trailer-btn" 
                onclick="event.stopPropagation(); window.quickTrailer(${item.id}, '${t}');" 
                title="Watch Trailer">
          ${I.trailer}
        </button>
        <button class="card-fav ${isSaved ? 'saved' : ''}" 
                data-fid="${item.id}" 
                onclick="event.stopPropagation(); window.handleToggleWatchlist(${item.id});" 
                title="Watchlist">
          ${isSaved ? I.bookmarkFilled : I.bookmark}
        </button>
      </div>

      <div class="card-info">
        <div class="card-name">${gt(item)}</div>
        <div class="card-meta">
          <span class="card-rat">${I.star} ${fr(item.vote_average)}</span>
          <span class="card-yr">${yr(grd(item))}</span>
        </div>
      </div>
      ${prg ? `<div class="card-prog"><div class="card-prog-fill" style="width:${Math.min(prg.pct, 100)}%"></div></div>` : ''}
    </div>
  `;
}

export function renderContinueWatchingCard(item) {
  const t = mty(item);
  registerItem({ ...item, media_type: t });
  const isSaved = isInWatchlist(item.id);
  const prg = getProgress(item.id);
  const poster = IM.backdrop(item.backdrop_path, 'w500') || IM.poster(item.poster_path);

  return `
    <div class="rec-wrap" id="cw-${item.id}" 
         onclick="window.openPlayerModal({ id: ${item.id}, type: '${t}', season: ${prg?.s || 1}, episode: ${prg?.ep || 1}, resume: true })">
      <div class="card card-wide">
        <img class="card-img" src="${poster}" alt="${gt(item)}" loading="lazy" />
        <div class="card-ovl"></div>
        <div class="card-play">${I.playFilled}</div>
        <span class="card-badge">${t === 'tv' ? 'TV' : 'FILM'}</span>
        <button class="rec-remove" onclick="event.stopPropagation(); window.handleRemoveCW(${item.id});" title="Remove">✕</button>
        <div class="card-actions">
          <button class="card-trailer-btn" 
                  onclick="event.stopPropagation(); window.quickTrailer(${item.id}, '${t}');" 
                  title="Watch Trailer">
            ${I.trailer}
          </button>
          <button class="card-fav ${isSaved ? 'saved' : ''}" 
                  data-fid="${item.id}" 
                  onclick="event.stopPropagation(); window.handleToggleWatchlist(${item.id});">
            ${isSaved ? I.bookmarkFilled : I.bookmark}
          </button>
        </div>
        <div class="card-info">
          <div class="card-name">${gt(item)}</div>
          <div class="card-meta">
            <span class="card-rat">${I.star} ${fr(item.vote_average)}</span>
            ${prg && t === 'tv' ? `<span class="card-yr">S${prg.s} · E${prg.ep}</span>` : ''}
          </div>
        </div>
        ${prg ? `
          <div class="cwlbl"><span class="cwpct">${Math.round(prg.pct)}%</span></div>
          <div class="card-prog"><div class="card-prog-fill" style="width:${prg.pct}%"></div></div>
        ` : ''}
      </div>
    </div>
  `;
}

export function renderHistoryCard(item) {
  const t = mty(item);
  registerItem({ ...item, media_type: t });
  const isSaved = isInWatchlist(item.id);
  const prg = getProgress(item.id);
  const slug = slugify(gt(item) || 'title');
  const targetUrl = `/${t}/${item.id}/${slug}`;

  return `
    <div class="rec-wrap" id="rec-${item.id}">
      <div class="card" onclick="navigateTo('${targetUrl}')">
        <img class="card-img" src="${IM.poster(item.poster_path)}" alt="${gt(item)}" loading="lazy" />
        <div class="card-ovl"></div>
        <div class="card-play">${I.playFilled}</div>
        <span class="card-badge">${t === 'tv' ? 'TV' : 'FILM'}</span>
        <div class="card-qual-wrap">${getQualityBadge(item)}</div>
        <button class="rec-remove" onclick="event.stopPropagation(); window.handleRemoveHistory(${item.id});" title="Remove">✕</button>
        <div class="card-actions">
          <button class="card-trailer-btn" 
                  onclick="event.stopPropagation(); window.quickTrailer(${item.id}, '${t}');" 
                  title="Watch Trailer">
            ${I.trailer}
          </button>
          <button class="card-fav ${isSaved ? 'saved' : ''}" 
                  data-fid="${item.id}" 
                  onclick="event.stopPropagation(); window.handleToggleWatchlist(${item.id});">
            ${isSaved ? I.bookmarkFilled : I.bookmark}
          </button>
        </div>
        <div class="card-info">
          <div class="card-name">${gt(item)}</div>
          <div class="card-meta">
            <span class="card-rat">${I.star} ${fr(item.vote_average)}</span>
            <span class="card-yr">${yr(grd(item))}</span>
          </div>
        </div>
        ${prg ? `<div class="card-prog"><div class="card-prog-fill" style="width:${Math.min(prg.pct, 100)}%"></div></div>` : ''}
      </div>
    </div>
  `;
}

export function renderTop10Card(item, rank, type) {
  const t = type || mty(item);
  registerItem({ ...item, media_type: t });
  const slug = slugify(gt(item) || 'title');
  const targetUrl = `/${t}/${item.id}/${slug}`;
  return `
    <div class="t10-wrap" onclick="navigateTo('${targetUrl}')">
      <div class="t10-num">${rank}</div>
      <div class="t10-card">
        <img class="t10-img" src="${IM.poster(item.poster_path)}" alt="${gt(item)}" loading="lazy" />
        <div class="t10-ovl"></div>
        <div class="t10-info">
          <div class="t10-name">${gt(item)}</div>
          <div class="t10-rat">${I.star} ${fr(item.vote_average)}</div>
        </div>
      </div>
    </div>
  `;
}

export function renderRow(id, title, items, { type = null, seeAllRoute = null, wide = false } = {}) {
  const rowId = `row_${id}`;
  return `
    <div class="section">
      <div class="sec-hd">
        <div class="sec-title">${title}</div>
        ${seeAllRoute ? `<div class="sec-more" onclick="navigateTo('${seeAllRoute}')">${I.chevronRight} See all</div>` : ''}
      </div>
      <div class="row-wrap">
        <button class="rarr rarrl" onclick="scrollCarousel('${rowId}', -1)">${I.chevronLeft}</button>
        <div class="card-row" id="${rowId}">
          ${items.map(item => renderCard(item, { type, wide })).join('')}
        </div>
        <button class="rarr rarrr" onclick="scrollCarousel('${rowId}', 1)">${I.chevronRight}</button>
      </div>
    </div>
  `;
}

export function renderTop10Row(id, title, items, type) {
  const rowId = `row_t10_${id}`;
  return `
    <div class="section">
      <div class="sec-hd"><div class="sec-title">${title}</div></div>
      <div class="row-wrap">
        <button class="rarr rarrl" onclick="scrollCarousel('${rowId}', -1)">${I.chevronLeft}</button>
        <div class="card-row" id="${rowId}" style="gap:6px;padding-left:4px">
          ${items.slice(0, 10).map((item, idx) => renderTop10Card(item, idx + 1, type)).join('')}
        </div>
        <button class="rarr rarrr" onclick="scrollCarousel('${rowId}', 1)">${I.chevronRight}</button>
      </div>
    </div>
  `;
}

export function scrollCarousel(rowId, direction) {
  const el = document.getElementById(rowId);
  if (el) {
    requestAnimationFrame(() => {
      el.scrollBy({ left: direction * 170 * 3, behavior: 'smooth' });
    });
  }
}
window.scrollCarousel = scrollCarousel;

/* Global Action Handlers */
window.handleToggleWatchlist = (id) => {
  toggleWatchlist(id);
  // Update state across all cards on page
  const isSaved = isInWatchlist(id);
  document.querySelectorAll(`[data-fid="${id}"]`).forEach(btn => {
    btn.classList.toggle('saved', isSaved);
    btn.innerHTML = isSaved ? I.bookmarkFilled : I.bookmark;
  });
};

window.handleRemoveCW = (id) => {
  removeProgress(id);
  const el = document.getElementById(`cw-${id}`);
  if (el) {
    el.style.transition = 'opacity 0.25s, transform 0.25s';
    el.style.opacity = '0';
    el.style.transform = 'scale(0.85)';
    setTimeout(() => {
      el.remove();
      const row = document.getElementById('row_cw');
      if (row && !row.children.length) row.closest('.section')?.remove();
    }, 280);
  }
};

window.handleRemoveHistory = (id) => {
  removeFromHistory(id);
  const el = document.getElementById(`rec-${id}`);
  if (el) {
    el.style.transition = 'opacity 0.25s, transform 0.25s';
    el.style.opacity = '0';
    el.style.transform = 'scale(0.85)';
    setTimeout(() => {
      el.remove();
      const row = document.getElementById('row_rc');
      if (row && !row.children.length) row.closest('.section')?.remove();
    }, 280);
  }
};

export function clearAllRecent() {
  clearHistory();
  State.history = [];
  State.recent = [];
  if (typeof localStorage !== 'undefined') {
    try { localStorage.removeItem('bsz-rc'); } catch {}
  }
  const row = document.getElementById('row_rc');
  if (row) {
    const sec = row.closest('.section');
    if (sec) {
      sec.style.transition = 'opacity 0.28s ease, transform 0.28s ease, max-height 0.35s ease, margin 0.35s ease, padding 0.35s ease';
      sec.style.opacity = '0';
      sec.style.transform = 'scale(0.96)';
      sec.style.maxHeight = sec.offsetHeight + 'px';
      setTimeout(() => {
        sec.style.maxHeight = '0';
        sec.style.paddingTop = '0';
        sec.style.paddingBottom = '0';
        sec.style.marginTop = '0';
        sec.style.marginBottom = '0';
        sec.style.overflow = 'hidden';
        setTimeout(() => sec.remove(), 350);
      }, 30);
    }
  }
}
if (typeof window !== 'undefined') {
  window.clearAllRecent = clearAllRecent;
  window.clearHistory = clearAllRecent;
}

/* ═══════════════════════════════════════════════════════════════════
   HERO SLIDER
   ═══════════════════════════════════════════════════════════════════ */

function buildHero(items) {
  State.heroItems = items.filter(i => i.backdrop_path).slice(0, 8);
  State.heroIdx = 0;
  State.heroPaused = false;
  return renderHeroHTML(0);
}

function renderHeroHTML(idx) {
  const items = State.heroItems;
  const item = items[idx];
  if (!item) return '';

  const t = mty(item);
  const bd = IM.backdrop(item.backdrop_path, 'original');
  const prg = getProgress(item.id);
  const slug = slugify(gt(item) || 'title');

  return `
    <div class="hero">
      <div class="hero-bg" id="hero-bg" style="background-image:url('${bd}')"></div>
      <div class="hero-ovl"></div>
      <div class="hero-edge"></div>
      <div class="hero-body">
        <div class="hero-info" id="hero-info">
          <div class="hero-tag">${I.trend} ${t === 'tv' ? 'TV SERIES' : 'PREMIERE'}</div>
          <div class="hero-title" id="h-tit">${gt(item)}</div>
          <div class="hero-stats">
            <span class="stat-gold">${I.star} ${fr(item.vote_average)}</span>
            ${yr(grd(item)) ? `<span>${I.calendar} ${yr(grd(item))}</span>` : ''}
          </div>
          <div class="hero-desc" id="h-dsc">${item.overview || ''}</div>
          <div class="hero-btns">
            <button class="btn btn-red" id="h-bw" onclick="window.openPlayerModal({ id: ${item.id}, type: '${t}', season: ${prg?.s || 1}, episode: ${prg?.ep || 1}, resume: ${Boolean(prg && prg.pct > 5)} })">
              ${I.play} ${prg && prg.pct > 5 ? 'Continue Watching' : 'Watch Now'}
            </button>
            <button class="btn btn-dim" id="h-bi" onclick="navigateTo('/${t}/${item.id}/${slug}')">
              ${I.info} More Info
            </button>
            <button class="btn btn-out btn-ico" data-fid="${item.id}" onclick="window.handleToggleWatchlist(${item.id})">
              ${isInWatchlist(item.id) ? I.bookmarkFilled : I.bookmark}
            </button>
          </div>
        </div>
      </div>
      <div class="hero-ctrl">
        <div class="hcb" onclick="prevHero()">${I.chevronLeft}</div>
        <div class="hcb" id="h-pp" onclick="toggleHeroPause()">${I.pause}</div>
        <div class="hcb" onclick="nextHero()">${I.chevronRight}</div>
      </div>
      <div class="hero-prog" id="h-prog">
        ${items.map((_, i) => `
          <div class="hps ${i < idx ? 'done' : i === idx ? 'cur' : ''}">
            ${i === idx ? '<div class="hpf"></div>' : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function updateHeroSlide(idx) {
  State.heroIdx = idx;
  const items = State.heroItems;
  const item = items[idx];
  if (!item) return;

  const t = mty(item);
  const bd = IM.backdrop(item.backdrop_path, 'original');
  const prg = getProgress(item.id);
  const slug = slugify(gt(item) || 'title');

  const bg = document.getElementById('hero-bg');
  if (bg && bd) {
    bg.style.opacity = '0';
    setTimeout(() => {
      bg.style.backgroundImage = `url('${bd}')`;
      bg.style.opacity = '1';
    }, 400);
  }

  const prog = document.getElementById('h-prog');
  if (prog) {
    prog.innerHTML = items.map((_, i) => `
      <div class="hps ${i < idx ? 'done' : i === idx ? 'cur' : ''}">
        ${i === idx ? '<div class="hpf"></div>' : ''}
      </div>
    `).join('');
  }

  const info = document.getElementById('hero-info');
  if (info) {
    info.style.animation = 'none';
    void info.offsetWidth;
    info.style.animation = 'heroUp 0.55s var(--ease) both';

    const tEl = document.getElementById('h-tit');
    if (tEl) tEl.textContent = gt(item);

    const dEl = document.getElementById('h-dsc');
    if (dEl) dEl.textContent = item.overview || '';

    const bw = document.getElementById('h-bw');
    if (bw) {
      bw.setAttribute('onclick', `window.openPlayerModal({ id: ${item.id}, type: '${t}', season: ${prg?.s || 1}, episode: ${prg?.ep || 1}, resume: ${Boolean(prg && prg.pct > 5)} })`);
      bw.innerHTML = `${I.play} ${prg && prg.pct > 5 ? 'Continue Watching' : 'Watch Now'}`;
    }

    const bi = document.getElementById('h-bi');
    if (bi) bi.setAttribute('onclick', `navigateTo('/${t}/${item.id}/${slug}')`);

    info.querySelectorAll('[data-fid]').forEach(btn => {
      btn.dataset.fid = item.id;
      btn.innerHTML = isInWatchlist(item.id) ? I.bookmarkFilled : I.bookmark;
      btn.setAttribute('onclick', `window.handleToggleWatchlist(${item.id})`);
    });
  }
}

export function nextHero() {
  updateHeroSlide((State.heroIdx + 1) % State.heroItems.length);
}
export function prevHero() {
  updateHeroSlide((State.heroIdx - 1 + State.heroItems.length) % State.heroItems.length);
}
export function toggleHeroPause() {
  State.heroPaused = !State.heroPaused;
  const btn = document.getElementById('h-pp');
  if (btn) btn.innerHTML = State.heroPaused ? I.play : I.pause;
  if (State.heroPaused) {
    if (State.heroTick) clearInterval(State.heroTick);
  } else {
    startHeroTimer();
  }
}
window.nextHero = nextHero;
window.prevHero = prevHero;
window.toggleHeroPause = toggleHeroPause;

function startHeroTimer() {
  if (State.heroTick) clearInterval(State.heroTick);
  State.heroTick = setInterval(() => {
    if (!State.heroPaused) nextHero();
  }, 7500);
}

/* ═══════════════════════════════════════════════════════════════════
   PAGES
   ═══════════════════════════════════════════════════════════════════ */

/* ── 1. HOME ── */
async function renderPageHome() {
  const main = document.getElementById('main');
  main.innerHTML = `<div class="spin-wrap"><div class="spinner"></div></div>`;

  try {
    const [trending, popMovies, popTV, topMovies, topTV, inTheaters, onAir] = await Promise.all([
      API.trending(),
      API.popular('movie'),
      API.popular('tv'),
      API.topRated('movie'),
      API.topRated('tv'),
      API.nowPlaying(),
      API.onAir()
    ]);

    const continueWatching = getContinueWatching();
    const history = State.history.slice(0, 14);

    const cwSection = continueWatching.length ? `
      <div class="section">
        <div class="sec-hd"><div class="sec-title">▶ Continue Watching</div></div>
        <div class="row-wrap">
          <button class="rarr rarrl" onclick="scrollCarousel('row_cw', -1)">${I.chevronLeft}</button>
          <div class="card-row" id="row_cw">${continueWatching.map(renderContinueWatchingCard).join('')}</div>
          <button class="rarr rarrr" onclick="scrollCarousel('row_cw', 1)">${I.chevronRight}</button>
        </div>
      </div>
    ` : '';

    const historySection = history.length ? `
      <div class="section">
        <div class="sec-hd">
          <div class="sec-title">🕐 Recently Viewed</div>
          <div class="sec-more" onclick="window.clearAllRecent()" style="color:var(--txt3);font-size:0.75rem">Clear all</div>
        </div>
        <div class="row-wrap">
          <button class="rarr rarrl" onclick="scrollCarousel('row_rc', -1)">${I.chevronLeft}</button>
          <div class="card-row" id="row_rc">${history.map(renderHistoryCard).join('')}</div>
          <button class="rarr rarrr" onclick="scrollCarousel('row_rc', 1)">${I.chevronRight}</button>
        </div>
      </div>
    ` : '';

    // Progressive rendering: Paint Hero and priority rows first for instant interactive response
    main.innerHTML = `
      <div>
        ${buildHero(trending.results || [])}
        ${cwSection}
        ${historySection}
        ${renderRow('tr', '🔥 Trending This Week', (trending.results || []).slice(0, 18), { seeAllRoute: '/trending' })}
        ${renderTop10Row('pm', '🏆 Top 10 Movies Today', (popMovies.results || []).slice(0, 10), 'movie')}
        <div id="home-secondary-rows"></div>
      </div>
    `;

    startHeroTimer();

    // Stream remaining catalog rows in next frame to prevent DOM blocking and layout thrashing
    requestAnimationFrame(() => {
      const secContainer = document.getElementById('home-secondary-rows');
      if (secContainer && State.page === 'home') {
        secContainer.innerHTML = `
          ${renderRow('pm', '🎬 Popular Movies', (popMovies.results || []).slice(0, 18), { type: 'movie', seeAllRoute: '/movies' })}
          ${renderTop10Row('pt', '📺 Top 10 TV Shows Today', (popTV.results || []).slice(0, 10), 'tv')}
          ${renderRow('pt', '📺 Popular TV Shows', (popTV.results || []).slice(0, 18), { type: 'tv', seeAllRoute: '/tv' })}
          ${renderRow('tm', '⭐ Top Rated Movies', (topMovies.results || []).slice(0, 18), { type: 'movie' })}
          ${renderRow('ttv', '⭐ Top Rated TV Shows', (topTV.results || []).slice(0, 18), { type: 'tv' })}
          ${renderRow('np', '🎭 Now In Theaters', (inTheaters.results || []).slice(0, 18), { type: 'movie' })}
          ${renderRow('oa', '📡 Currently Airing TV', (onAir.results || []).slice(0, 18), { type: 'tv' })}
          ${renderFooter()}
        `;
      }
    });
  } catch (err) {
    main.innerHTML = renderErrorState('Failed to load portal feed. Please check your internet connection.');
  }
}

/* ── 2. MOVIES (With Multi-Attribute Filter & Sort) ── */
async function renderPageMovies() {
  State.movCat = 'popular';
  State.movPg = 1;
  State.movItems = [];

  const categories = [
    { id: 'popular', label: '🔥 Popular' },
    { id: 'top_rated', label: '⭐ Top Rated' },
    { id: 'now_playing', label: '🎭 In Theaters' },
    { id: 'upcoming', label: '📅 Upcoming' }
  ];

  const main = document.getElementById('main');
  main.innerHTML = `
    <div>
      <div class="pg-hd">
        <div class="pg-title">🎬 Movies</div>
        <div class="pg-sub">Browse, filter, and stream great cinema from around the globe</div>
      </div>
      <div class="filter-bar">
        <div class="filter-group">
          ${categories.map(c => `
            <div class="fbb ${c.id === 'popular' ? 'on' : ''}" data-mc="${c.id}" onclick="window.filterMovies('${c.id}')">
              ${c.label}
            </div>
          `).join('')}
        </div>
        <div class="sort-select-wrap">
          <span class="sort-label">Sort By:</span>
          <select class="sort-select" id="mov-sort-select" onchange="window.sortMovies(this.value)">
            <option value="popularity.desc">Most Popular</option>
            <option value="vote_average.desc">Highest Rated</option>
            <option value="primary_release_date.desc">Release Date (Newest)</option>
          </select>
        </div>
      </div>
      <div class="section" style="padding-top:0">
        <div class="cgrid" id="mov-grid">${renderSkeletons(18)}</div>
        <div style="text-align:center;padding:30px 0">
          <button class="btn btn-dim" id="mov-more-btn" onclick="window.loadMoreMovies()" style="display:none">
            Load More Movies
          </button>
        </div>
      </div>
      ${renderFooter()}
    </div>
  `;

  window.filterMovies = async (category) => {
    State.movCat = category;
    State.movPg = 1;
    State.movItems = [];
    document.querySelectorAll('[data-mc]').forEach(f => f.classList.toggle('on', f.dataset.mc === category));
    const grid = document.getElementById('mov-grid');
    if (grid) grid.innerHTML = renderSkeletons(18);
    await loadMoviesData();
  };

  window.sortMovies = async (sortValue) => {
    State.movSort = sortValue;
    State.movPg = 1;
    State.movItems = [];
    const grid = document.getElementById('mov-grid');
    if (grid) grid.innerHTML = renderSkeletons(18);
    await loadMoviesData();
  };

  window.loadMoreMovies = () => loadMoviesData();
  await loadMoviesData();
}

async function loadMoviesData() {
  if (State.movLoading) return;
  State.movLoading = true;

  try {
    let results = [];
    let totalPages = 1;

    if (State.movSort !== 'popularity.desc') {
      // Use discover API for custom sorting
      const data = await API.discover('movie', {
        sort_by: State.movSort,
        'vote_count.gte': State.movSort.includes('vote_average') ? 100 : 0,
        page: State.movPg
      });
      results = data.results || [];
      totalPages = data.total_pages || 1;
      State.movPg++;
    } else {
      if (State.movPg === 1) {
        const pages = await Promise.all([1, 2, 3].map(p => API.paged('movie', State.movCat, p)));
        const seen = new Set();
        pages.forEach(d => {
          (d.results || []).forEach(m => {
            if (!seen.has(m.id)) {
              seen.add(m.id);
              results.push(m);
            }
          });
        });
        State.movPg = 4;
        totalPages = pages[0]?.total_pages || 1;
      } else {
        const d = await API.paged('movie', State.movCat, State.movPg);
        results = d.results || [];
        totalPages = d.total_pages || 1;
        State.movPg++;
      }
    }

    results.forEach(m => State.movItems.push(registerItem({ ...m, media_type: 'movie' })));

    const grid = document.getElementById('mov-grid');
    if (grid) {
      grid.innerHTML = State.movItems.map(m => renderCard(m, { type: 'movie' })).join('');
    }

    const moreBtn = document.getElementById('mov-more-btn');
    if (moreBtn) {
      moreBtn.style.display = State.movPg <= totalPages ? 'inline-flex' : 'none';
    }
  } catch (err) {
    console.warn('[Movies Error]', err);
  } finally {
    State.movLoading = false;
  }
}

/* ── 3. TV SHOWS (With Filter & Sort) ── */
async function renderPageTV() {
  State.tvCat = 'popular';
  State.tvPg = 1;
  State.tvItems = [];

  const categories = [
    { id: 'popular', label: '🔥 Popular' },
    { id: 'top_rated', label: '⭐ Top Rated' },
    { id: 'on_the_air', label: '📡 On Air' },
    { id: 'airing_today', label: '📅 Airing Today' }
  ];

  const main = document.getElementById('main');
  main.innerHTML = `
    <div>
      <div class="pg-hd">
        <div class="pg-title">📺 TV Shows</div>
        <div class="pg-sub">Binge the highest-rated television series and new weekly broadcast releases</div>
      </div>
      <div class="filter-bar">
        <div class="filter-group">
          ${categories.map(c => `
            <div class="fbb ${c.id === 'popular' ? 'on' : ''}" data-tc="${c.id}" onclick="window.filterTV('${c.id}')">
              ${c.label}
            </div>
          `).join('')}
        </div>
        <div class="sort-select-wrap">
          <span class="sort-label">Sort By:</span>
          <select class="sort-select" id="tv-sort-select" onchange="window.sortTV(this.value)">
            <option value="popularity.desc">Most Popular</option>
            <option value="vote_average.desc">Highest Rated</option>
            <option value="first_air_date.desc">First Air Date (Newest)</option>
          </select>
        </div>
      </div>
      <div class="section" style="padding-top:0">
        <div class="cgrid" id="tv-grid">${renderSkeletons(18)}</div>
        <div style="text-align:center;padding:30px 0">
          <button class="btn btn-dim" id="tv-more-btn" onclick="window.loadMoreTV()" style="display:none">
            Load More TV Shows
          </button>
        </div>
      </div>
      ${renderFooter()}
    </div>
  `;

  window.filterTV = async (category) => {
    State.tvCat = category;
    State.tvPg = 1;
    State.tvItems = [];
    document.querySelectorAll('[data-tc]').forEach(f => f.classList.toggle('on', f.dataset.tc === category));
    const grid = document.getElementById('tv-grid');
    if (grid) grid.innerHTML = renderSkeletons(18);
    await loadTVData();
  };

  window.sortTV = async (sortValue) => {
    State.tvSort = sortValue;
    State.tvPg = 1;
    State.tvItems = [];
    const grid = document.getElementById('tv-grid');
    if (grid) grid.innerHTML = renderSkeletons(18);
    await loadTVData();
  };

  window.loadMoreTV = () => loadTVData();
  await loadTVData();
}

async function loadTVData() {
  if (State.tvLoading) return;
  State.tvLoading = true;

  try {
    let results = [];
    let totalPages = 1;

    if (State.tvSort !== 'popularity.desc') {
      const data = await API.discover('tv', {
        sort_by: State.tvSort,
        'vote_count.gte': State.tvSort.includes('vote_average') ? 50 : 0,
        page: State.tvPg
      });
      results = data.results || [];
      totalPages = data.total_pages || 1;
      State.tvPg++;
    } else {
      if (State.tvPg === 1) {
        const pages = await Promise.all([1, 2, 3].map(p => API.paged('tv', State.tvCat, p)));
        const seen = new Set();
        pages.forEach(d => {
          (d.results || []).forEach(item => {
            if (!seen.has(item.id)) {
              seen.add(item.id);
              results.push(item);
            }
          });
        });
        State.tvPg = 4;
        totalPages = pages[0]?.total_pages || 1;
      } else {
        const d = await API.paged('tv', State.tvCat, State.tvPg);
        results = d.results || [];
        totalPages = d.total_pages || 1;
        State.tvPg++;
      }
    }

    results.forEach(item => State.tvItems.push(registerItem({ ...item, media_type: 'tv' })));

    const grid = document.getElementById('tv-grid');
    if (grid) {
      grid.innerHTML = State.tvItems.map(item => renderCard(item, { type: 'tv' })).join('');
    }

    const moreBtn = document.getElementById('tv-more-btn');
    if (moreBtn) {
      moreBtn.style.display = State.tvPg <= totalPages ? 'inline-flex' : 'none';
    }
  } catch (err) {
    console.warn('[TV Error]', err);
  } finally {
    State.tvLoading = false;
  }
}

/* ── 4. TRENDING ── */
async function renderPageTrending() {
  let timeWindow = 'week';
  const main = document.getElementById('main');
  main.innerHTML = `
    <div>
      <div class="pg-hd">
        <div class="pg-title">🔥 Trending Now</div>
        <div class="pg-sub">Top films and television series capturing audience attention worldwide</div>
      </div>
      <div class="filter-bar">
        <div class="filter-group">
          <div class="fbb on" data-tw="week" onclick="window.setTrendingWindow('week')">📅 This Week</div>
          <div class="fbb" data-tw="day" onclick="window.setTrendingWindow('day')">🔴 Today</div>
        </div>
      </div>
      <div class="section" style="padding-top:0">
        <div class="cgrid" id="tr-grid">${renderSkeletons(18)}</div>
      </div>
      ${renderFooter()}
    </div>
  `;

  window.setTrendingWindow = async (w) => {
    timeWindow = w;
    document.querySelectorAll('[data-tw]').forEach(f => f.classList.toggle('on', f.dataset.tw === w));
    const grid = document.getElementById('tr-grid');
    if (grid) grid.innerHTML = renderSkeletons(18);

    try {
      const [all, movies, tv] = await Promise.all([
        API.trending('all', w),
        API.trending('movie', w),
        API.trending('tv', w)
      ]);
      const seen = new Set();
      const combined = [];
      [...(all.results || []), ...(movies.results || []), ...(tv.results || [])].forEach(item => {
        if (!seen.has(item.id)) {
          seen.add(item.id);
          combined.push(item);
        }
      });
      if (grid) grid.innerHTML = combined.slice(0, 60).map(item => renderCard(item)).join('');
    } catch {
      if (grid) grid.innerHTML = renderErrorState('Failed to load trending content.');
    }
  };

  await window.setTrendingWindow('week');
}

/* ═══════════════════════════════════════════════════════════════════
   5. CALENDAR VIEW (With Bug Fix: In-Place Day Detail Toggle)
   ═══════════════════════════════════════════════════════════════════ */

function getCalViewRange(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);

  const viewStart = new Date(firstOfMonth);
  viewStart.setDate(viewStart.getDate() - ((viewStart.getDay() + 6) % 7));

  const viewEnd = new Date(lastOfMonth);
  const dowEnd = viewEnd.getDay();
  if (dowEnd !== 0) viewEnd.setDate(viewEnd.getDate() + (7 - dowEnd));

  const toStr = d => d.toISOString().split('T')[0];
  return { viewStart, viewEnd, start: toStr(viewStart), end: toStr(viewEnd) };
}

async function renderPageCalendar() {
  const main = document.getElementById('main');
  main.innerHTML = `<div class="spin-wrap"><div class="spinner"></div></div>`;
  await fetchCalendarData(State.calYear, State.calMonth);
}

async function fetchCalendarData(year, month) {
  const main = document.getElementById('main');
  const { viewStart, viewEnd, start, end } = getCalViewRange(year, month);

  if (State.calMode === 'releases') {
    try {
      const [movies, tv] = await Promise.all([
        API.discover('movie', { 'primary_release_date.gte': start, 'primary_release_date.lte': end, sort_by: 'popularity.desc', page: 1 }),
        API.discover('tv', { 'first_air_date.gte': start, 'first_air_date.lte': end, sort_by: 'popularity.desc', page: 1 }),
      ]);
      State.calData = {};
      for (const m of (movies.results || [])) {
        const d = m.release_date;
        if (d) {
          if (!State.calData[d]) State.calData[d] = [];
          State.calData[d].push(registerItem({ ...m, media_type: 'movie' }));
        }
      }
      for (const t of (tv.results || [])) {
        const d = t.first_air_date;
        if (d) {
          if (!State.calData[d]) State.calData[d] = [];
          State.calData[d].push(registerItem({ ...t, media_type: 'tv' }));
        }
      }
      Object.values(State.calData).forEach(arr => arr.sort((a, b) => (b.popularity || 0) - (a.popularity || 0)));
    } catch (e) {
      console.warn('[Calendar Releases Error]', e);
    }

    main.innerHTML = buildCalendarPageHTML(year, month, viewStart, viewEnd);
  } else {
    // Schedule mode
    main.innerHTML = buildScheduleShellHTML(year, month);
    await loadScheduleView();
  }
}

function buildCalendarPageHTML(year, month, viewStart, viewEnd) {
  const today = new Date().toISOString().split('T')[0];
  const data = State.calData;
  const weeks = [];
  let cur = new Date(viewStart);

  while (cur <= viewEnd) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }

  const dayCells = weeks.map(week => week.map(day => {
    const ds = day.toISOString().split('T')[0];
    const isToday = ds === today;
    const isOther = day.getMonth() !== month;
    const isSel = ds === State.calSel;
    const rels = data[ds] || [];
    const show = rels.slice(0, 4);
    const more = rels.length - show.length;

    return `
      <div class="cal-day ${isToday ? 'cal-today' : ''} ${isOther ? 'cal-other' : ''} ${isSel ? 'cal-sel' : ''}" 
           data-cal-date="${ds}" 
           onclick="window.selectCalendarDay('${ds}')">
        <div class="cal-day-n">${day.getDate()}</div>
        <div class="cal-items">
          ${show.map(item => {
            const slug = slugify(gt(item) || 'title');
            return `
            <div class="cal-item" 
                 onclick="event.stopPropagation(); navigateTo('/${item.media_type}/${item.id}/${slug}')" 
                 title="${gt(item).replace(/"/g, '&quot;')}">
              <img src="${IM.poster(item.poster_path, 'w92')}" loading="lazy" />
              <div class="cal-item-ty ${item.media_type === 'tv' ? 'tv' : 'mov'}"></div>
            </div>
            `;
          }).join('')}
          ${more > 0 ? `<div class="cal-more" onclick="event.stopPropagation(); window.selectCalendarDay('${ds}')">+${more}</div>` : ''}
        </div>
      </div>
    `;
  }).join('')).join('');

  return `
    <div>
      <div class="cal-top-hd">
        <div class="pg-title">📅 Release Calendar</div>
        <div class="pg-sub">Upcoming films and TV series premieres — select any day to view release details</div>
      </div>
      <div class="cal-wrap">
        <div class="cal-hd">
          <button class="cal-nb" onclick="window.calendarPrev()">${I.chevronLeft}</button>
          <div class="cal-month"><span>${MONTHS[month]}</span> ${year}</div>
          <button class="cal-nb" onclick="window.calendarNext()">${I.chevronRight}</button>
          <button class="cal-today-btn" onclick="window.calendarToday()">Today</button>

          <div class="cal-mode-toggle">
            <div class="cmt releases on">🎬 Releases</div>
            <div class="cmt" onclick="window.setCalendarMode('schedule')">📺 TV Schedule</div>
          </div>

          <div class="cal-view-toggle">
            <div class="cvt ${State.calView === 'month' ? 'on' : ''}" onclick="window.setCalendarView('month')">Month</div>
            <div class="cvt ${State.calView === 'list' ? 'on' : ''}" onclick="window.setCalendarView('list')">List</div>
          </div>
        </div>

        ${State.calView === 'month' ? `
          <div class="cal-grid">
            ${DAYS_SHORT.map(d => `<div class="cal-dow">${d}</div>`).join('')}
            ${dayCells}
          </div>
          <!-- CRITICAL BUG FIX: Dedicated container without re-rendering entire grid -->
          <div id="cal-detail-area">
            ${State.calSel ? renderCalendarDayDetail(State.calSel) : '<div class="cal-hint">💡 Click any calendar day above to inspect scheduled releases</div>'}
          </div>
        ` : renderCalendarListView(viewStart, viewEnd, month)}
      </div>
      ${renderFooter()}
    </div>
  `;
}

/**
 * CRITICAL BUG FIX:
 * Updates the day details panel directly without blowing away main.innerHTML or resetting scroll position!
 */
export function selectCalendarDay(ds) {
  const detailArea = document.getElementById('cal-detail-area');
  
  if (State.calSel === ds) {
    // Deselect if already selected
    State.calSel = null;
    document.querySelectorAll('.cal-day').forEach(el => el.classList.remove('cal-sel'));
    if (detailArea) {
      detailArea.innerHTML = '<div class="cal-hint">💡 Click any calendar day above to inspect scheduled releases</div>';
    }
    return;
  }

  State.calSel = ds;

  // Update active border on day cells smoothly in place
  document.querySelectorAll('.cal-day').forEach(el => {
    el.classList.toggle('cal-sel', el.dataset.calDate === ds);
  });

  // Render day details inside dedicated target
  if (detailArea) {
    detailArea.innerHTML = renderCalendarDayDetail(ds);
    detailArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
window.selectCalendarDay = selectCalendarDay;

function renderCalendarDayDetail(ds) {
  const rels = State.calData[ds] || [];
  const d = new Date(ds + 'T12:00:00');
  const label = d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return `
    <div class="cal-detail">
      <div class="cal-det-hd">
        <div>
          <div class="cal-det-date">${label}</div>
          <div class="cal-det-count">${rels.length ? `${rels.length} premiering release${rels.length !== 1 ? 's' : ''}` : 'No major releases scheduled'}</div>
        </div>
        <button class="cal-det-close" onclick="window.selectCalendarDay('${ds}')">✕</button>
      </div>
      ${rels.length ? `
        <div class="cal-releases">
          ${rels.map(item => {
            const slug = slugify(gt(item) || 'title');
            return `
            <div class="cal-release" onclick="navigateTo('/${item.media_type}/${item.id}/${slug}')">
              <div class="cal-rel-pw">
                <img class="cal-rel-p" src="${IM.poster(item.poster_path, 'w342')}" alt="${gt(item)}" loading="lazy" />
                <span class="cal-rel-badge ${item.media_type === 'tv' ? 'tv' : 'mov'}">${item.media_type === 'tv' ? 'TV' : 'FILM'}</span>
              </div>
              <div class="cal-rel-info">
                <div class="cal-rel-title">${gt(item)}</div>
                ${item.vote_average ? `<div class="cal-rel-rat">${I.star} ${fr(item.vote_average)}</div>` : ''}
                <div class="cal-rel-date">${fd(grd(item))}</div>
                <div class="cal-rel-ov">${item.overview || 'No synopsis provided.'}</div>
                <button class="btn btn-red btn-sm" style="margin-top:10px">More Info</button>
              </div>
            </div>
            `;
          }).join('')}
        </div>
      ` : `<div class="cal-empty">No major movie or television releases on this date.</div>`}
    </div>
  `;
}

function renderCalendarListView(viewStart, viewEnd, month) {
  const data = State.calData;
  const items = [];
  let cur = new Date(viewStart);

  while (cur <= viewEnd) {
    const ds = cur.toISOString().split('T')[0];
    if (cur.getMonth() === month) {
      const rels = data[ds] || [];
      if (rels.length) items.push({ ds, rels, day: new Date(cur) });
    }
    cur.setDate(cur.getDate() + 1);
  }

  if (!items.length) {
    return `<div class="cal-empty">No releases found this month.</div>`;
  }

  return items.map(({ ds, rels, day }) => `
    <div class="cal-detail" style="margin-bottom:14px">
      <div class="cal-det-hd">
        <div class="cal-det-date">${day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
        <div class="cal-det-count">${rels.length} release${rels.length !== 1 ? 's' : ''}</div>
      </div>
      <div class="cal-releases">
        ${rels.map(item => {
          const slug = slugify(gt(item) || 'title');
          return `
          <div class="cal-release" onclick="navigateTo('/${item.media_type}/${item.id}/${slug}')">
            <div class="cal-rel-pw">
              <img class="cal-rel-p" src="${IM.poster(item.poster_path, 'w342')}" alt="${gt(item)}" loading="lazy" />
              <span class="cal-rel-badge ${item.media_type === 'tv' ? 'tv' : 'mov'}">${item.media_type === 'tv' ? 'TV' : 'FILM'}</span>
            </div>
            <div class="cal-rel-info">
              <div class="cal-rel-title">${gt(item)}</div>
              ${item.vote_average ? `<div class="cal-rel-rat">${I.star} ${fr(item.vote_average)}</div>` : ''}
              <div class="cal-rel-ov">${item.overview || ''}</div>
            </div>
          </div>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');
}

window.calendarPrev = () => {
  State.calMonth--;
  if (State.calMonth < 0) { State.calMonth = 11; State.calYear--; }
  State.calSel = null;
  fetchCalendarData(State.calYear, State.calMonth);
};
window.calendarNext = () => {
  State.calMonth++;
  if (State.calMonth > 11) { State.calMonth = 0; State.calYear++; }
  State.calSel = null;
  fetchCalendarData(State.calYear, State.calMonth);
};
window.calendarToday = () => {
  const now = new Date();
  State.calYear = now.getFullYear();
  State.calMonth = now.getMonth();
  State.calSel = now.toISOString().split('T')[0];
  fetchCalendarData(State.calYear, State.calMonth);
};
window.setCalendarView = (v) => {
  State.calView = v;
  fetchCalendarData(State.calYear, State.calMonth);
};
window.setCalendarMode = (m) => {
  State.calMode = m;
  State.calSel = null;
  fetchCalendarData(State.calYear, State.calMonth);
};

/* ── TV Schedule View (With Batch Chunking) ── */
function buildScheduleShellHTML(year, month) {
  return `
    <div>
      <div class="cal-top-hd">
        <div class="pg-title">📅 TV Schedule</div>
        <div class="pg-sub">Weekly episode broadcast airings for popular television shows</div>
      </div>
      <div class="cal-wrap">
        <div class="cal-hd">
          <div class="cal-month"><span>${MONTHS[month]}</span> ${year}</div>
          <div class="cal-mode-toggle" style="margin-left:auto">
            <div class="cmt releases" onclick="window.setCalendarMode('releases')">🎬 Releases</div>
            <div class="cmt on schedule">📺 TV Schedule</div>
          </div>
        </div>
        <div id="sched-area"><div class="spin-wrap" style="min-height:220px"><div class="spinner"></div></div></div>
      </div>
      ${renderFooter()}
    </div>
  `;
}

function getScheduleWeekRange(offset) {
  const now = new Date();
  const dow = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dow + 6) % 7) + offset * 7);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const toStr = d => d.toISOString().split('T')[0];
  return { monday, sunday, start: toStr(monday), end: toStr(sunday) };
}

/**
 * CONCURRENCY FIX: Uses batchFetch chunking to eliminate N+1 waterfall TMDB 429 errors!
 */
async function fetchScheduleData(offset) {
  const { monday, start, end, sunday } = getScheduleWeekRange(offset);
  State.calSchedData = {};

  try {
    const [p1, p2] = await Promise.all([
      API.discover('tv', { 'air_date.gte': start, 'air_date.lte': end, sort_by: 'popularity.desc', page: 1 }),
      API.discover('tv', { 'air_date.gte': start, 'air_date.lte': end, sort_by: 'popularity.desc', page: 2 }),
    ]);
    const shows = [...(p1.results || []), ...(p2.results || [])].slice(0, 20);

    // Concurrently fetch show details in chunks of 4
    const detailsSettled = await batchFetch(shows, async (show) => {
      const detail = await API.tvDetail(show.id);
      const season = detail.next_episode_to_air?.season_number || detail.last_episode_to_air?.season_number;
      if (!season) return null;
      const seasonData = await API.season(detail.id, season);
      return { show, detail, season, episodes: seasonData.episodes || [] };
    }, 4, 60);

    const startTs = new Date(start).getTime() - 1;
    const endTs = new Date(end).getTime() + 86400000;

    for (const res of detailsSettled) {
      if (res.status !== 'fulfilled' || !res.value) continue;
      const { show, detail, season, episodes } = res.value;

      for (const ep of episodes) {
        if (!ep.air_date) continue;
        const epTs = new Date(ep.air_date).getTime();
        if (epTs < startTs || epTs > endTs) continue;

        if (!State.calSchedData[ep.air_date]) State.calSchedData[ep.air_date] = [];
        State.calSchedData[ep.air_date].push({
          showId: detail.id,
          showName: gt(detail),
          showPoster: show.poster_path,
          epName: ep.name || `Episode ${ep.episode_number}`,
          epNum: ep.episode_number,
          epSeason: season,
          epStill: ep.still_path,
          epOverview: ep.overview || '',
          popularity: detail.popularity || 0
        });
      }
    }

    Object.values(State.calSchedData).forEach(arr => arr.sort((a, b) => (b.popularity || 0) - (a.popularity || 0)));
  } catch (err) {
    console.warn('[Schedule Fetch Error]', err);
  }

  return { monday, sunday };
}

async function loadScheduleView() {
  const schedArea = document.getElementById('sched-area');
  if (!schedArea) return;

  schedArea.innerHTML = `<div class="spin-wrap" style="min-height:220px"><div class="spinner"></div></div>`;
  const { monday } = await fetchScheduleData(State.calSchedOffset);
  schedArea.innerHTML = buildScheduleContentHTML(monday);
}

function buildScheduleContentHTML(monday) {
  const today = new Date().toISOString().split('T')[0];
  const offset = State.calSchedOffset;
  const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  if (!State.calSchedDay) {
    const todayInRange = days.find(d => d.toISOString().split('T')[0] === today);
    if (todayInRange) {
      State.calSchedDay = today;
    } else {
      const firstWithEps = days.find(d => State.calSchedData[d.toISOString().split('T')[0]]?.length);
      State.calSchedDay = firstWithEps ? firstWithEps.toISOString().split('T')[0] : days[0].toISOString().split('T')[0];
    }
  }

  const dayTabs = days.map((d, i) => {
    const ds = d.toISOString().split('T')[0];
    const isToday = ds === today;
    const isSel = ds === State.calSchedDay;
    const count = (State.calSchedData[ds] || []).length;

    return `
      <div class="sched-day-tab ${isSel ? 'sel' : ''} ${isToday ? 'today-tab' : ''}" 
           data-sday="${ds}"
           onclick="window.selectScheduleDay('${ds}')">
        <div class="sd-dow">${DOW[i]}</div>
        <div class="sd-num">${d.getDate()}</div>
        ${count ? `<div class="sd-cnt">${count}</div>` : `<div class="sd-cnt" style="color:var(--txt3)">—</div>`}
      </div>
    `;
  }).join('');

  const eps = State.calSchedData[State.calSchedDay] || [];
  const epCards = eps.length ? `
    <div class="sched-ep-list">
      ${eps.map(ep => {
        const slug = slugify(ep.showName || 'tv');
        return `
        <div class="sched-ep-card" onclick="navigateTo('/tv/${ep.showId}/${slug}')">
          ${ep.epStill ? `<img class="sched-ep-still" src="${IM.still(ep.epStill)}" loading="lazy" />` : `<img class="sched-ep-poster" src="${IM.poster(ep.showPoster, 'w342')}" loading="lazy" />`}
          <div class="sched-ep-body">
            <div class="sched-ep-show">${ep.showName}</div>
            <div class="sched-ep-name">${ep.epName}</div>
            <div class="sched-ep-num">Season ${ep.epSeason} · Episode ${ep.epNum}</div>
          </div>
        </div>
        `;
      }).join('')}
    </div>
  ` : `<div class="cal-empty">No episode airings found for this day. Select a different date.</div>`;

  const wLabel = `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return `
    <div>
      <div class="sched-nav">
        <button class="sched-nav-btn" onclick="window.schedPrevWeek()">◀ Previous Week</button>
        ${offset !== 0 ? `<button class="sched-nav-btn today" onclick="window.schedThisWeek()">Today</button>` : ''}
        <button class="sched-nav-btn" onclick="window.schedNextWeek()">Next Week ▶</button>
        <span style="font-size:0.8rem;color:var(--txt3);margin-left:auto">${wLabel}</span>
      </div>
      <div class="sched-days">${dayTabs}</div>
      <div id="sched-eps-container">${epCards}</div>
    </div>
  `;
}

window.selectScheduleDay = (ds) => {
  State.calSchedDay = ds;
  document.querySelectorAll('.sched-day-tab').forEach(tab => {
    tab.classList.toggle('sel', tab.dataset.sday === ds);
  });
  const container = document.getElementById('sched-eps-container');
  if (container) {
    const eps = State.calSchedData[ds] || [];
    container.innerHTML = eps.length ? `
      <div class="sched-ep-list">
        ${eps.map(ep => {
          const slug = slugify(ep.showName || 'tv');
          return `
          <div class="sched-ep-card" onclick="navigateTo('/tv/${ep.showId}/${slug}')">
            ${ep.epStill ? `<img class="sched-ep-still" src="${IM.still(ep.epStill)}" loading="lazy" />` : `<img class="sched-ep-poster" src="${IM.poster(ep.showPoster, 'w342')}" loading="lazy" />`}
            <div class="sched-ep-body">
              <div class="sched-ep-show">${ep.showName}</div>
              <div class="sched-ep-name">${ep.epName}</div>
              <div class="sched-ep-num">Season ${ep.epSeason} · Episode ${ep.epNum}</div>
            </div>
          </div>
          `;
        }).join('')}
      </div>
    ` : `<div class="cal-empty">No episode airings found for this day.</div>`;
  }
};

window.schedPrevWeek = async () => {
  State.calSchedOffset--;
  State.calSchedDay = null;
  await loadScheduleView();
};
window.schedNextWeek = async () => {
  State.calSchedOffset++;
  State.calSchedDay = null;
  await loadScheduleView();
};
window.schedThisWeek = async () => {
  State.calSchedOffset = 0;
  State.calSchedDay = null;
  await loadScheduleView();
};

/* ── 6. GENRES ── */
async function renderPageGenres() {
  const main = document.getElementById('main');
  main.innerHTML = `<div class="spin-wrap"><div class="spinner"></div></div>`;

  try {
    const [movieGenres, tvGenres] = await Promise.all([
      API.genres('movie'),
      API.genres('tv')
    ]);
    const genreMap = new Map();
    [...(movieGenres.genres || []), ...(tvGenres.genres || [])].forEach(g => genreMap.set(g.id, g.name));

    main.innerHTML = `
      <div>
        <div class="pg-hd">
          <div class="pg-title">🎭 Browse Genres</div>
          <div class="pg-sub">Explore tailored collections by category and themes</div>
        </div>
        <div class="genre-grid">
          ${[...genreMap.entries()].map(([id, name]) => {
            const slug = slugify(name || 'genre');
            return `
            <div class="genre-chip" onclick="navigateTo('/genre/${id}/${slug}')">
              <span class="genre-ico">${GICONS[id] || '🎬'}</span>
              <div class="genre-name">${name}</div>
              <div class="genre-type">Movies &amp; Series</div>
            </div>
            `;
          }).join('')}
        </div>
        ${renderFooter()}
      </div>
    `;
  } catch {
    main.innerHTML = renderErrorState('Failed to load categories.');
  }
}

async function renderPageGenreResults(genreId, genreName) {
  let mediaType = 'movie';
  let sortOption = 'popularity.desc';
  let page = 1;
  let items = [];
  let loading = false;

  const SORT_FILTERS = [
    { id: 'popularity.desc', label: '🔥 Popular', extra: {} },
    { id: 'vote_average.desc', label: '📈 Top Rated', extra: { 'vote_count.gte': 200 } },
    { id: 'newest', label: '📅 Newest', extra: {} },
    { id: 'vote_count.desc', label: '🏆 Most Voted', extra: {} }
  ];

  function getSortByValue() {
    if (sortOption === 'newest') {
      return mediaType === 'tv' ? 'first_air_date.desc' : 'primary_release_date.desc';
    }
    return sortOption;
  }

  function getExtraParams() {
    const found = SORT_FILTERS.find(f => f.id === sortOption);
    return found?.extra || {};
  }

  const main = document.getElementById('main');
  main.innerHTML = `
    <div>
      <div class="pg-hd">
        <button class="btn btn-out btn-sm" onclick="navigateTo('/genres')" style="margin-bottom:12px">
          ${I.chevronLeft} All Genres
        </button>
        <div class="pg-title">${GICONS[genreId] || '🎬'} ${genreName}</div>
        <div class="pg-sub">Browse top ${genreName} movies and television shows with customized sorting</div>
      </div>

      <div class="filter-bar" style="gap:16px;flex-wrap:wrap">
        <!-- Media Type Selector -->
        <div class="filter-group">
          <div class="fbb on" data-gt="movie" onclick="window.setGenreMediaType('movie')">🎬 Movies</div>
          <div class="fbb" data-gt="tv" onclick="window.setGenreMediaType('tv')">📺 TV Shows</div>
        </div>

        <!-- Multi-Attribute Sort Filters -->
        <div class="filter-group" id="genre-sort-group">
          ${SORT_FILTERS.map(f => `
            <div class="fbb ${sortOption === f.id ? 'on' : ''}" 
                 data-sort="${f.id}" 
                 onclick="window.setGenreSortFilter('${f.id}')">
              ${f.label}
            </div>
          `).join('')}
        </div>
      </div>

      <div class="section" style="padding-top:0">
        <div class="cgrid" id="genre-grid">${renderSkeletons(18)}</div>
        <div style="text-align:center;padding:30px 0">
          <button class="btn btn-dim" id="genre-more-btn" onclick="window.loadMoreGenreItems()" style="display:none">
            Load More
          </button>
        </div>
      </div>
      ${renderFooter()}
    </div>
  `;

  async function loadItems() {
    if (loading) return;
    loading = true;
    try {
      const isFirst = page === 1;
      const sortBy = getSortByValue();
      const extra = getExtraParams();

      if (isFirst) {
        const pages = await Promise.all([1, 2, 3].map(p => API.byGenre(mediaType, genreId, p, sortBy, extra)));
        const seen = new Set();
        pages.forEach(d => {
          (d.results || []).forEach(item => {
            if (!seen.has(item.id)) {
              seen.add(item.id);
              items.push(registerItem({ ...item, media_type: mediaType }));
            }
          });
        });
        page = 4;
        const grid = document.getElementById('genre-grid');
        if (grid) {
          grid.innerHTML = items.length 
            ? items.map(m => renderCard(m, { type: mediaType })).join('') 
            : '<div style="color:var(--txt3);padding:40px 0;text-align:center;grid-column:1/-1">No titles found for this filter combination.</div>';
        }
        const moreBtn = document.getElementById('genre-more-btn');
        if (moreBtn) moreBtn.style.display = page <= (pages[0]?.total_pages || 1) ? 'inline-flex' : 'none';
      } else {
        const d = await API.byGenre(mediaType, genreId, page, sortBy, extra);
        (d.results || []).forEach(item => items.push(registerItem({ ...item, media_type: mediaType })));
        const grid = document.getElementById('genre-grid');
        if (grid) grid.innerHTML = items.map(m => renderCard(m, { type: mediaType })).join('');
        const moreBtn = document.getElementById('genre-more-btn');
        if (moreBtn) moreBtn.style.display = page < (d.total_pages || 1) ? 'inline-flex' : 'none';
        page++;
      }
    } catch (err) {
      console.warn('[Genre Results Error]', err);
    }
    loading = false;
  }

  window.setGenreMediaType = async (type) => {
    if (mediaType === type) return;
    mediaType = type;
    page = 1;
    items = [];
    document.querySelectorAll('[data-gt]').forEach(f => f.classList.toggle('on', f.dataset.gt === type));
    const grid = document.getElementById('genre-grid');
    if (grid) grid.innerHTML = renderSkeletons(18);
    await loadItems();
  };

  window.setGenreSortFilter = async (sortId) => {
    if (sortOption === sortId) return;
    sortOption = sortId;
    page = 1;
    items = [];
    document.querySelectorAll('#genre-sort-group [data-sort]').forEach(f => f.classList.toggle('on', f.dataset.sort === sortId));
    const grid = document.getElementById('genre-grid');
    if (grid) grid.innerHTML = renderSkeletons(18);
    await loadItems();
  };

  window.loadMoreGenreItems = () => loadItems();
  await loadItems();
}

/* ── 7. SEARCH ── */
async function renderPageSearch(query) {
  const main = document.getElementById('main');
  main.innerHTML = `
    <div>
      <div class="pg-hd">
        <div class="pg-title">🔍 Search</div>
        <div class="pg-sub">Results for: <strong style="color:var(--txt)">"${query}"</strong></div>
      </div>
      <div class="section" style="padding-top:0">
        <div class="cgrid" id="sr-grid">${renderSkeletons(12)}</div>
      </div>
      ${renderFooter()}
    </div>
  `;

  if (!query) {
    document.getElementById('sr-grid').innerHTML = renderEmptyState('🔍', 'Start Searching', 'Type title, actor, or franchise in the search bar above.');
    return;
  }

  try {
    const data = await API.search(query);
    const results = (data.results || []).filter(i => 
      i.media_type !== 'person' && (i.poster_path || i.backdrop_path) && (i.title || i.name)
    );
    const grid = document.getElementById('sr-grid');
    if (grid) {
      grid.innerHTML = results.length 
        ? results.map(i => renderCard(i)).join('')
        : renderEmptyState('😔', 'No Titles Found', `Nothing matched "${query}". Check spelling or try a different term.`);
    }
  } catch {
    document.getElementById('sr-grid').innerHTML = renderErrorState('Search query failed.');
  }
}

/* ── 8. WATCHLIST & BACKUP ── */
function renderPageWatchlist() {
  const items = State.watchlistData;
  const main = document.getElementById('main');

  main.innerHTML = `
    <div>
      <div class="pg-hd" style="display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:14px">
        <div>
          <div class="pg-title">❤️ My Watchlist</div>
          <div class="pg-sub">${items.length} saved title${items.length !== 1 ? 's' : ''}</div>
        </div>
        <button class="btn btn-out btn-sm" onclick="window.openDataModal()">
          ${I.backup} Export / Import Data
        </button>
      </div>
      <div class="section" style="padding-top:0">
        ${items.length ? `
          <div class="cgrid">
            ${items.map(item => renderCard(item)).join('')}
          </div>
        ` : `
          ${renderEmptyState('🎬', 'Your Watchlist is Empty', 'Click the bookmark icon on any poster or detail view to save titles for later.')}
          <div style="text-align:center;margin-top:20px">
            <button class="btn btn-red" onclick="navigateTo('/')">Browse Titles</button>
          </div>
        `}
      </div>
      ${renderFooter()}
    </div>
  `;
}

/* ── 9. MEDIA DETAIL VIEW (With Collections & Trailer Support) ── */
async function renderPageDetail(id, type) {
  const main = document.getElementById('main');
  main.innerHTML = `<div class="spin-wrap" style="min-height:80vh"><div class="spinner"></div></div>`;

  try {
    const det = await API.detail(id, type);
    registerItem({ ...det, media_type: type });
    addToHistory({ ...det, media_type: type });

    const bd = IM.backdrop(det.backdrop_path, 'original');
    const poster = IM.poster(det.poster_path, 'w500');
    const title = gt(det);
    const genres = det.genres || [];
    const cast = (det.credits?.cast || []).slice(0, 18);
    const crew = det.credits?.crew || [];
    const director = crew.find(c => c.job === 'Director');
    const writers = crew.filter(c => c.job === 'Screenplay' || c.job === 'Writer').slice(0, 2);

    const videos = det.videos?.results || [];
    const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube') || videos.find(v => v.site === 'YouTube');
    const similar = [...(det.recommendations?.results || []), ...(det.similar?.results || [])]
      .filter(i => i.poster_path)
      .slice(0, 18);

    const seasons = type === 'tv' ? (det.seasons || []).filter(s => s.season_number > 0) : [];
    const runtime = type === 'movie' ? frt(det.runtime) : (det.episode_run_time?.[0] ? `~${det.episode_run_time[0]}m/ep` : '');
    const prg = getProgress(det.id);
    const isSaved = isInWatchlist(det.id);

    main.innerHTML = `
      <div>
        <div class="det-top-bar">
          <button class="det-back-btn" onclick="window.goBack()">${I.chevronLeft} Back</button>
        </div>
        <div class="det-hero">
          ${bd ? `<img src="${bd}" alt="${title.replace(/"/g, '&quot;')}" />` : ''}
          <div class="det-hero-ovl"></div>
        </div>
        <div class="det-body">
          <div class="det-grid">
            <div>
              <img class="det-poster" src="${poster}" alt="${title.replace(/"/g, '&quot;')}" />
            </div>
            <div>
              <div class="det-genres">
                ${genres.map(g => `<span class="gpill">${g.name}</span>`).join('')}
              </div>
              <div class="det-title">${title}</div>
              ${det.tagline ? `<div class="det-tagline">"${det.tagline}"</div>` : ''}

              <div class="det-meta">
                <div class="dmi">
                  <div class="rat-ring">${fr(det.vote_average)}</div>
                  <div>
                    <span class="dml">TMDB Score</span>
                    <span class="dmv">${(det.vote_count || 0).toLocaleString()} votes</span>
                  </div>
                </div>
                ${grd(det) ? `
                  <div class="dmi">
                    ${I.calendar}
                    <div><span class="dml">Release Date</span><span class="dmv">${fd(grd(det))}</span></div>
                  </div>
                ` : ''}
                ${runtime ? `
                  <div class="dmi">
                    ${I.clock}
                    <div><span class="dml">Runtime</span><span class="dmv">${runtime}</span></div>
                  </div>
                ` : ''}
                ${type === 'tv' && det.number_of_seasons ? `
                  <div class="dmi">
                    ${I.layers}
                    <div><span class="dml">Seasons</span><span class="dmv">${det.number_of_seasons}</span></div>
                  </div>
                ` : ''}
                ${det.status ? `
                  <div class="dmi">
                    <div><span class="dml">Status</span><span class="dmv">${det.status}</span></div>
                  </div>
                ` : ''}
              </div>

              <div class="det-overview">${det.overview || 'No synopsis available for this title.'}</div>

              ${director || writers.length ? `
                <div class="det-crew">
                  ${director ? `<div><div class="crew-l">Director</div><div class="crew-v">${director.name}</div></div>` : ''}
                  ${writers.length ? `<div><div class="crew-l">Writer${writers.length > 1 ? 's' : ''}</div><div class="crew-v">${writers.map(w => w.name).join(', ')}</div></div>` : ''}
                </div>
              ` : ''}

              <div class="det-actions">
                <button class="btn btn-red" onclick="window.openPlayerModal({ id: ${det.id}, type: '${type}', season: ${prg?.s || 1}, episode: ${prg?.ep || 1}, resume: ${Boolean(prg && prg.pct > 5)} })">
                  ${I.play} ${prg && prg.pct > 5 ? `Resume ${type === 'tv' ? `S${prg.s}·E${prg.ep}` : ''} (${Math.round(prg.pct)}%)` : 'Watch Now'}
                </button>
                ${trailer ? `
                  <button class="btn btn-dim" onclick="window.openTrailerModal('${trailer.key}')">
                    ${I.trailer} Watch Trailer
                  </button>
                ` : ''}
                <button class="btn btn-out" data-fid="${det.id}" onclick="window.handleToggleWatchlist(${det.id})">
                  ${isSaved ? I.heart : I.bookmark} <span>${isSaved ? 'In Watchlist' : 'Add to Watchlist'}</span>
                </button>
              </div>

              ${det.production_companies?.length ? `
                <div style="font-size:0.75rem;color:var(--txt3)">
                  Produced by: ${det.production_companies.slice(0, 3).map(c => c.name).join(' · ')}
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        ${cast.length ? `
          <div class="section" style="margin-top:20px">
            <div class="sec-hd"><div class="sec-title">Top Billed Cast</div></div>
            <div class="cast-row">
              ${cast.map(p => `
                <div class="cast-card" 
                     role="button" tabindex="0"
                     onclick="go('person', { id: ${p.id}, name: '${(p.name || '').replace(/'/g, "\\'")}' })"
                     onkeydown="if(event.key==='Enter') go('person', { id: ${p.id}, name: '${(p.name || '').replace(/'/g, "\\'")}' })"
                     title="View ${p.name || 'Cast'} Filmography">
                  <img class="cast-photo" src="${IM.profile(p.profile_path)}" alt="${p.name}" loading="lazy" />
                  <div class="cast-name">${p.name}</div>
                  <div class="cast-char">${p.character || ''}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${type === 'tv' && seasons.length ? `
          <div class="ep-sel" id="ep-sel">
            <div class="sec-title" style="margin-bottom:16px">Seasons &amp; Episodes</div>
            <div class="s-tabs" id="s-tabs">
              ${seasons.map(s => `
                <div class="stab ${s.season_number === 1 ? 'on' : ''}" onclick="window.loadDetailEpisodes(${det.id}, ${s.season_number})">
                  Season ${s.season_number}
                </div>
              `).join('')}
            </div>
            <div class="ep-range-tabs chunk-tabs-row" id="detail-ep-range-tabs" style="display:none"></div>
            <div class="ep-grid" id="ep-grid">${renderEpisodeSkeletons(6)}</div>
          </div>
        ` : ''}

        ${det.belongs_to_collection ? `
          <div class="col-sec" id="collection-sec">
            <div class="spin-wrap" style="min-height:160px"><div class="spinner"></div></div>
          </div>
        ` : ''}

        ${similar.length ? renderRow('sim', '🎯 You Might Also Like', similar, { type }) : ''}
        ${renderFooter()}
      </div>
    `;

    if (type === 'tv' && seasons.length) {
      window.loadDetailEpisodes(det.id, 1);
    }
    if (det.belongs_to_collection?.id) {
      loadFranchiseCollection(det.belongs_to_collection.id, det.id);
    }
  } catch (err) {
    main.innerHTML = renderErrorState('Failed to load title details.', true);
  }
}

window._detailTvId = null;
window._detailSeasonNumber = 1;
window._detailSeasonEpisodes = [];
window._detailActiveChunk = 0;
const DETAIL_EP_CHUNK_SIZE = 25;

window.loadDetailEpisodes = async (tvId, seasonNumber) => {
  window._detailTvId = tvId;
  window._detailSeasonNumber = seasonNumber;
  window._detailActiveChunk = 0;

  document.querySelectorAll('#s-tabs .stab').forEach(t => {
    t.classList.toggle('on', t.textContent.trim() === `Season ${seasonNumber}`);
  });
  const grid = document.getElementById('ep-grid');
  const rangeNav = document.getElementById('detail-ep-range-tabs');
  if (!grid) return;
  grid.innerHTML = renderEpisodeSkeletons(6);

  try {
    const data = await API.season(tvId, seasonNumber);
    const episodes = data.episodes || [];
    window._detailSeasonEpisodes = episodes;

    if (rangeNav) {
      if (episodes.length > DETAIL_EP_CHUNK_SIZE) {
        const numChunks = Math.ceil(episodes.length / DETAIL_EP_CHUNK_SIZE);
        rangeNav.style.display = 'flex';
        rangeNav.classList.add('chunk-tabs-row');
        rangeNav.innerHTML = Array.from({ length: numChunks }, (_, idx) => {
          const start = idx * DETAIL_EP_CHUNK_SIZE + 1;
          const end = Math.min((idx + 1) * DETAIL_EP_CHUNK_SIZE, episodes.length);
          return `
            <button class="range-tab ${idx === 0 ? 'on' : ''}" 
                    type="button"
                    data-chunk="${idx}"
                    onclick="window.switchDetailEpisodeChunk(${idx})">
              Episodes ${start}–${end}
            </button>
          `;
        }).join('');
        enableHorizontalScroll(rangeNav);
      } else {
        rangeNav.style.display = 'none';
        rangeNav.innerHTML = '';
      }
    }

    window.renderDetailEpisodeGrid(0);
  } catch {
    if (rangeNav) {
      rangeNav.style.display = 'none';
      rangeNav.innerHTML = '';
    }
    grid.innerHTML = '<div style="color:var(--txt3);font-size:0.85rem">Could not load episodes.</div>';
  }
};

window.switchDetailEpisodeChunk = (chunkIdx) => {
  window._detailActiveChunk = +chunkIdx;
  document.querySelectorAll('#detail-ep-range-tabs .range-tab').forEach(b => {
    b.classList.toggle('on', +b.dataset.chunk === window._detailActiveChunk);
  });
  window.renderDetailEpisodeGrid(window._detailActiveChunk);
};

window.renderDetailEpisodeGrid = (chunkIdx = 0) => {
  const grid = document.getElementById('ep-grid');
  if (!grid) return;

  const episodes = window._detailSeasonEpisodes || [];
  const tvId = window._detailTvId;
  const seasonNumber = window._detailSeasonNumber;

  let displayEpisodes = episodes;
  if (episodes.length > DETAIL_EP_CHUNK_SIZE) {
    const start = chunkIdx * DETAIL_EP_CHUNK_SIZE;
    displayEpisodes = episodes.slice(start, start + DETAIL_EP_CHUNK_SIZE);
  }

  if (!displayEpisodes.length) {
    grid.innerHTML = '<div style="color:var(--txt3);font-size:0.85rem">No episodes found for this season.</div>';
    return;
  }

  grid.innerHTML = displayEpisodes.map(ep => `
    <div class="ep-card" onclick="window.openPlayerModal({ id: ${tvId}, type: 'tv', season: ${seasonNumber}, episode: ${ep.episode_number} })">
      <img class="ep-thumb" src="${IM.still(ep.still_path)}" alt="Episode ${ep.episode_number}" loading="lazy" />
      <div style="min-width:0">
        <div class="ep-num">S${seasonNumber} · E${ep.episode_number} ${ep.runtime ? `· ${ep.runtime}m` : ''}</div>
        <div class="ep-name">${ep.name || `Episode ${ep.episode_number}`}</div>
        <div class="ep-desc">${ep.overview || ''}</div>
      </div>
    </div>
  `).join('');
};

/**
 * Custom Collections / Franchise View with Release Order & Viewing Progress
 */
async function loadFranchiseCollection(colId, currentMovieId) {
  const container = document.getElementById('collection-sec');
  if (!container) return;

  try {
    const collection = await API.collection(colId);
    if (!collection?.parts?.length) {
      container.remove();
      return;
    }

    // Sort chronologically by release date
    const parts = [...collection.parts].sort((a, b) => {
      const da = a.release_date ? new Date(a.release_date).getTime() : 9999999999999;
      const db = b.release_date ? new Date(b.release_date).getTime() : 9999999999999;
      return da - db;
    });

    const colPoster = collection.poster_path ? IM.poster(collection.poster_path, 'w185') : null;

    container.innerHTML = `
      <div class="col-hd">
        ${colPoster ? `<img class="col-poster" src="${colPoster}" alt="Franchise" />` : ''}
        <div>
          <div class="col-name">${collection.name}</div>
          ${collection.overview ? `<div style="font-size:0.82rem;color:var(--txt2);line-height:1.6;margin-top:4px;max-width:750px">${collection.overview}</div>` : ''}
          <div class="col-count">${parts.length} film${parts.length !== 1 ? 's' : ''} in chronological saga order</div>
        </div>
      </div>
      <div class="row-wrap">
        <button class="rarr rarrl" onclick="scrollCarousel('row_col', -1)">${I.chevronLeft}</button>
        <div class="card-row" id="row_col">
          ${parts.map((part, idx) => {
            const isCur = part.id === currentMovieId;
            const isUnreleased = part.release_date && new Date(part.release_date).getTime() > Date.now();
            const prg = getProgress(part.id);
            
            let statusBadge = `<span class="col-badge unwatched">#${idx + 1} Saga</span>`;
            if (isCur) statusBadge = `<span class="col-badge viewing">▶ Viewing</span>`;
            else if (prg && prg.pct >= 90) statusBadge = `<span class="col-badge completed">Completed ✅</span>`;
            else if (prg && prg.pct > 5) statusBadge = `<span class="col-badge progress">${Math.round(prg.pct)}% Watched</span>`;
            else if (isUnreleased) statusBadge = `<span class="col-badge unwatched">Coming Soon</span>`;

            const partSlug = slugify(part.title || 'movie');
            return `
              <div class="col-wrap" onclick="navigateTo('/movie/${part.id}/${partSlug}')">
                <div class="col-card ${isCur ? 'current' : ''}">
                  <img class="col-img" src="${IM.poster(part.poster_path)}" alt="${part.title}" loading="lazy" />
                  <div class="col-ovl"></div>
                  ${statusBadge}
                  <div class="col-info">
                    <div class="col-title">${part.title}</div>
                    <div class="col-year">${yr(part.release_date)}</div>
                  </div>
                  ${prg ? `<div class="card-prog"><div class="card-prog-fill" style="width:${prg.pct}%"></div></div>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <button class="rarr rarrr" onclick="scrollCarousel('row_col', 1)">${I.chevronRight}</button>
      </div>
    `;
  } catch {
    container.remove();
  }
}

/* ── 10. WATCH PLAYER VIEW ── */
async function renderPageWatch(id, type, season, ep) {
  const main = document.getElementById('main');
  main.innerHTML = `<div class="spin-wrap" style="min-height:80vh"><div class="spinner"></div></div>`;

  try {
    const det = await API.detail(id, type);
    registerItem({ ...det, media_type: type });
    addToHistory({ ...det, media_type: type });

    const title = gt(det);
    const seasons = type === 'tv' ? (det.seasons || []).filter(s => s.season_number > 0) : [];
    const totalMinutes = type === 'movie' ? (det.runtime || 95) : (det.episode_run_time?.[0] || 45);

    // Prepare next episode information
    let nextEpisodeInfo = null;
    if (type === 'tv') {
      try {
        const curSeasonData = await API.season(id, season);
        const epList = curSeasonData.episodes || [];
        const nextInSeason = epList.find(e => e.episode_number === ep + 1);
        if (nextInSeason) {
          nextEpisodeInfo = {
            season,
            episode: ep + 1,
            name: nextInSeason.name,
            still: IM.still(nextInSeason.still_path)
          };
        } else if (season < (det.number_of_seasons || 1)) {
          nextEpisodeInfo = {
            season: season + 1,
            episode: 1,
            name: `Season ${season + 1} Premiere`,
            still: null
          };
        }
      } catch {}
    }

    const fromCW = State._fromCW;
    State._fromCW = false; // consume flag

    const { embedUrl } = mountPlayer({
      id,
      type,
      season,
      episode: ep,
      totalMinutes,
      onNextEpisode: (nextS, nextE) => {
        State.season = nextS;
        State.ep = nextE;
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', `/watch/tv/${id}/${slugify(title)}?season=${nextS}&ep=${nextE}`);
        }
        const sub = document.querySelector('.watch-sub');
        if (sub) sub.textContent = `Season ${nextS} · Episode ${nextE}`;
      },
      onClose: () => {
        window.goBack(`/${type}/${id}/${slugify(title)}`);
      }
    });

    main.innerHTML = `
      <div>
        <div class="watch-bar">
          <button class="btn btn-out btn-sm" onclick="window.goBack('/${type}/${id}/${slugify(title)}')">
            ${I.chevronLeft} Detail View
          </button>
          <div style="flex:1;min-width:0">
            <div class="watch-title">${title}</div>
            ${type === 'tv' ? `<div class="watch-sub">Season ${season} · Episode ${ep}</div>` : ''}
          </div>
          <button class="btn btn-out btn-ico" data-fid="${id}" onclick="window.handleToggleWatchlist(${id})" title="Watchlist">
            ${isInWatchlist(id) ? I.heart : I.bookmark}
          </button>
        </div>

        <div class="player-pos-wrap">
          <div class="player-outer">
            <iframe id="player-iframe" src="${embedUrl}" 
                    allowfullscreen 
                    allow="autoplay; fullscreen; picture-in-picture">
            </iframe>
          </div>
        </div>

        <div class="section" style="padding-top:20px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:24px;flex-wrap:wrap">
            <div style="flex:1;min-width:280px">
              <div class="det-genres" style="margin-bottom:8px">
                ${(det.genres || []).map(g => `<span class="gpill">${g.name}</span>`).join('')}
              </div>
              <div style="font-family:'Bebas Neue',sans-serif;font-size:2rem;margin-bottom:6px">${title}</div>
              ${type === 'tv' ? `<div style="color:var(--red);font-weight:700;margin-bottom:12px">Now Playing: Season ${season} · Episode ${ep}</div>` : ''}
              <div style="font-size:0.88rem;color:var(--txt2);line-height:1.7;max-width:780px">${det.overview || ''}</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex-shrink:0">
              <div class="rat-ring">${fr(det.vote_average)}</div>
              <span style="font-size:0.7rem;color:var(--txt3)">Rating</span>
            </div>
          </div>
        </div>

        ${type === 'tv' && seasons.length ? `
          <div class="ep-sel" style="border-top:1px solid var(--brd)">
            <div class="sec-title" style="margin-bottom:16px">Switch Episode</div>
            <div class="s-tabs" id="watch-s-tabs">
              ${seasons.map(s => `
                <div class="stab ${s.season_number === season ? 'on' : ''}" onclick="window.loadWatchEpisodes(${id}, ${s.season_number}, ${ep})">
                  Season ${s.season_number}
                </div>
              `).join('')}
            </div>
            <div class="ep-range-tabs chunk-tabs-row" id="watch-ep-range-tabs" style="display:none"></div>
            <div class="ep-grid" id="watch-ep-grid">${renderEpisodeSkeletons(6)}</div>
          </div>
        ` : ''}

        ${renderFooter()}
      </div>
    `;

    if (type === 'tv' && seasons.length) {
      window.loadWatchEpisodes(id, season, ep);
    }
  } catch (err) {
    main.innerHTML = renderErrorState('Failed to load video player.', true);
  }
}

window._watchTvId = null;
window._watchSeasonNumber = 1;
window._watchCurrentEp = 1;
window._watchSeasonEpisodes = [];
window._watchActiveChunk = 0;

window.loadWatchEpisodes = async (tvId, s, currentEp) => {
  window._watchTvId = tvId;
  window._watchSeasonNumber = s;
  window._watchCurrentEp = currentEp;

  document.querySelectorAll('#watch-s-tabs .stab').forEach(t => {
    t.classList.toggle('on', t.textContent.trim() === `Season ${s}`);
  });
  const grid = document.getElementById('watch-ep-grid');
  const rangeNav = document.getElementById('watch-ep-range-tabs');
  if (!grid) return;
  grid.innerHTML = renderEpisodeSkeletons(6);

  try {
    const data = await API.season(tvId, s);
    const episodes = data.episodes || [];
    window._watchSeasonEpisodes = episodes;

    if (episodes.length > DETAIL_EP_CHUNK_SIZE) {
      const numChunks = Math.ceil(episodes.length / DETAIL_EP_CHUNK_SIZE);
      const activeChunk = Math.floor((currentEp - 1) / DETAIL_EP_CHUNK_SIZE);
      window._watchActiveChunk = Math.min(Math.max(activeChunk, 0), numChunks - 1);

      if (rangeNav) {
        rangeNav.style.display = 'flex';
        rangeNav.classList.add('chunk-tabs-row');
        rangeNav.innerHTML = Array.from({ length: numChunks }, (_, idx) => {
          const start = idx * DETAIL_EP_CHUNK_SIZE + 1;
          const end = Math.min((idx + 1) * DETAIL_EP_CHUNK_SIZE, episodes.length);
          return `
            <button class="range-tab ${idx === window._watchActiveChunk ? 'on' : ''}"
                    type="button"
                    data-chunk="${idx}"
                    onclick="window.switchWatchEpisodeChunk(${idx})">
              Episodes ${start}–${end}
            </button>
          `;
        }).join('');
        enableHorizontalScroll(rangeNav);
      }
    } else {
      window._watchActiveChunk = 0;
      if (rangeNav) {
        rangeNav.style.display = 'none';
        rangeNav.innerHTML = '';
      }
    }

    window.renderWatchEpisodeGrid(window._watchActiveChunk);
  } catch {
    if (rangeNav) {
      rangeNav.style.display = 'none';
      rangeNav.innerHTML = '';
    }
    grid.innerHTML = '';
  }
};

window.switchWatchEpisodeChunk = (chunkIdx) => {
  window._watchActiveChunk = +chunkIdx;
  document.querySelectorAll('#watch-ep-range-tabs .range-tab').forEach(b => {
    b.classList.toggle('on', +b.dataset.chunk === window._watchActiveChunk);
  });
  window.renderWatchEpisodeGrid(window._watchActiveChunk);
};

window.renderWatchEpisodeGrid = (chunkIdx = 0) => {
  const grid = document.getElementById('watch-ep-grid');
  if (!grid) return;
  const episodes = window._watchSeasonEpisodes || [];
  const tvId = window._watchTvId;
  const s = window._watchSeasonNumber;
  const currentEp = window._watchCurrentEp;

  let displayEpisodes = episodes;
  if (episodes.length > DETAIL_EP_CHUNK_SIZE) {
    const start = chunkIdx * DETAIL_EP_CHUNK_SIZE;
    displayEpisodes = episodes.slice(start, start + DETAIL_EP_CHUNK_SIZE);
  }

  const showSlug = slugify(title || 'tv');
  grid.innerHTML = displayEpisodes.map(episode => {
    const isCur = episode.episode_number === currentEp && s === State.season;
    return `
      <div class="ep-card ${isCur ? 'playing' : ''}" 
           onclick="window.openPlayerModal({ id: ${tvId}, type: 'tv', season: ${s}, episode: ${episode.episode_number} })">
        <img class="ep-thumb" src="${IM.still(episode.still_path)}" alt="Episode ${episode.episode_number}" loading="lazy" />
        <div style="min-width:0">
          <div class="ep-num">S${s} · E${episode.episode_number} ${isCur ? '▶ Currently Playing' : ''}</div>
          <div class="ep-name">${episode.name || `Episode ${episode.episode_number}`}</div>
          <div class="ep-desc">${episode.overview || ''}</div>
        </div>
      </div>
    `;
  }).join('');
};

/* ═══════════════════════════════════════════════════════════════════
   ACTOR / CAST MEMBER FILMOGRAPHY VIEW
   ═══════════════════════════════════════════════════════════════════ */

export async function renderPagePerson(personId, personName) {
  const main = document.getElementById('main');
  if (!main) return;
  main.innerHTML = `<div class="spin-wrap"><div class="spinner"></div></div>`;

  try {
    const data = await API.person(personId);
    if (!data || (!data.name && !data.id)) {
      throw new Error('Actor profile not found');
    }

    const name = data.name || decodeURIComponent(personName) || 'Cast Member';
    const profileImg = data.profile_path ? IM.poster(data.profile_path, 'w500') : IM.profile(null);
    const department = data.known_for_department || 'Acting';
    const birthday = data.birthday ? fd(data.birthday) : '';
    const deathday = data.deathday ? ` – ${fd(data.deathday)}` : '';
    const birthPlace = data.place_of_birth || '';
    const bio = data.biography ? data.biography.trim() : '';

    // Extract & deduplicate combined credits
    const rawCredits = (data.combined_credits?.cast || []).filter(c => c && (c.title || c.name) && (c.poster_path || c.backdrop_path));
    const seen = new Set();
    const credits = [];
    for (const c of rawCredits) {
      const mType = c.media_type || (c.title ? 'movie' : 'tv');
      const key = `${mType}_${c.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        credits.push({ ...c, media_type: mType });
      }
    }

    // Default sorting: popularity desc
    credits.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    window._personCredits = credits;
    window._personActiveFilter = 'all';
    window._personActiveSort = 'pop';

    main.innerHTML = `
      <div>
        <div class="det-top-bar">
          <button class="det-back-btn" onclick="window.goBack()">
            ${I.chevronLeft} Back
          </button>
        </div>

        <div class="person-hero">
          <div class="person-grid">
            <img class="person-poster" src="${profileImg}" alt="${name.replace(/"/g, '&quot;')}" />
            <div class="person-info">
              <div class="gpill" style="display:inline-block;margin-bottom:12px">${department}</div>
              <h1 class="person-name">${name}</h1>
              
              <div class="person-meta">
                ${birthday ? `
                  <div class="dmi">
                    ${I.calendar}
                    <div>
                      <span class="dml">Born</span>
                      <span class="dmv">${birthday}${deathday}</span>
                    </div>
                  </div>
                ` : ''}
                ${birthPlace ? `
                  <div class="dmi">
                    <div>
                      <span class="dml">Birthplace</span>
                      <span class="dmv">${birthPlace}</span>
                    </div>
                  </div>
                ` : ''}
                <div class="dmi">
                  ${I.film}
                  <div>
                    <span class="dml">Known Credits</span>
                    <span class="dmv">${credits.length} Titles</span>
                  </div>
                </div>
              </div>

              ${bio ? `
                <div class="person-bio" id="person-bio">
                  ${bio.length > 500 ? `
                    <span id="bio-short">${bio.slice(0, 480)}…</span>
                    <span id="bio-full" style="display:none">${bio}</span>
                    <button class="btn btn-dim btn-sm" style="margin-top:8px;padding:4px 10px;font-size:0.75rem" onclick="const f=document.getElementById('bio-full'),s=document.getElementById('bio-short'); if(f.style.display==='none'){f.style.display='inline';s.style.display='none';this.textContent='Show Less';}else{f.style.display='none';s.style.display='inline';this.textContent='Read More';}">Read More</button>
                  ` : bio}
                </div>
              ` : '<div class="person-bio" style="font-style:italic">No biography recorded for this artist.</div>'}
            </div>
          </div>
        </div>

        <div class="person-credits-hd" style="margin-top:36px">
          <div>
            <div class="sec-title" id="person-credits-title">Filmography (${credits.length})</div>
            <div style="font-size:0.8rem;color:var(--txt3);margin-top:2px">Movies &amp; TV Appearances</div>
          </div>

          <div class="pfilter-bar-wrap">
            <div class="pfilter-wrap">
              <button class="pfilter-btn on" id="pfilter-all" onclick="window.filterPersonCredits('all')">
                <span class="pfilter-icon">⭐</span>
                <span class="pfilter-label">All Credits</span>
                <span class="pfilter-badge">${credits.length}</span>
              </button>
              <button class="pfilter-btn" id="pfilter-movie" onclick="window.filterPersonCredits('movie')">
                <span class="pfilter-icon">🎬</span>
                <span class="pfilter-label">Movies</span>
                <span class="pfilter-badge">${credits.filter(c => c.media_type === 'movie').length}</span>
              </button>
              <button class="pfilter-btn" id="pfilter-tv" onclick="window.filterPersonCredits('tv')">
                <span class="pfilter-icon">📺</span>
                <span class="pfilter-label">TV Series</span>
                <span class="pfilter-badge">${credits.filter(c => c.media_type === 'tv').length}</span>
              </button>
            </div>

            <div class="sort-select-wrap">
              <span class="sort-lbl">Sort by</span>
              <select class="sort-select" onchange="window.sortPersonCredits(this.value)">
                <option value="pop" selected>Most Popular</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest Release</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        <div class="filmography-grid" id="person-credits-grid">
          ${credits.length ? credits.map(item => renderCard(item)).join('') : renderEmptyState('🎬', 'No Credits Available', 'No films or television shows found for this person.')}
        </div>

        ${renderFooter()}
      </div>
    `;
  } catch (err) {
    console.error('[Person View Error]', err);
    main.innerHTML = renderErrorState('Failed to load cast member filmography.', true);
  }
}
window.renderPagePerson = renderPagePerson;

window.filterPersonCredits = (type) => {
  window._personActiveFilter = type;
  document.querySelectorAll('.person-credits-hd .pfilter-btn, .person-credits-hd .cmt').forEach(b => {
    b.classList.toggle('on', b.id === `pfilter-${type}`);
  });
  window.updatePersonCreditsDOM();
};

window.sortPersonCredits = (sortMode) => {
  window._personActiveSort = sortMode;
  window.updatePersonCreditsDOM();
};

window.updatePersonCreditsDOM = () => {
  const grid = document.getElementById('person-credits-grid');
  const titleEl = document.getElementById('person-credits-title');
  if (!grid || !window._personCredits) return;

  let items = [...window._personCredits];
  if (window._personActiveFilter === 'movie') {
    items = items.filter(c => c.media_type === 'movie');
  } else if (window._personActiveFilter === 'tv') {
    items = items.filter(c => c.media_type === 'tv');
  }

  if (window._personActiveSort === 'pop') {
    items.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  } else if (window._personActiveSort === 'rating') {
    items.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
  } else if (window._personActiveSort === 'newest') {
    items.sort((a, b) => new Date(grd(b) || '1970').getTime() - new Date(grd(a) || '1970').getTime());
  } else if (window._personActiveSort === 'oldest') {
    items.sort((a, b) => new Date(grd(a) || '2099').getTime() - new Date(grd(b) || '2099').getTime());
  }

  if (titleEl) {
    titleEl.textContent = `Filmography (${items.length})`;
  }

  if (!items.length) {
    grid.innerHTML = renderEmptyState('🎬', 'No Results', 'No titles match this filter.');
  } else {
    grid.innerHTML = items.map(item => renderCard(item)).join('');
  }
};

/* ═══════════════════════════════════════════════════════════════════
   MODALS: TRAILER & DATA BACKUP / RESTORE
   ═══════════════════════════════════════════════════════════════════ */

let activeTrailerKey = null;

export function openTrailerModal(key) {
  activeTrailerKey = key;
  const modal = document.getElementById('trailer-modal') || document.getElementById('tmodal');
  const iframe = document.getElementById('trailer-iframe') || document.getElementById('tr-fr');
  if (modal && iframe) {
    // enablejsapi=1 allows Space key to play/pause
    iframe.src = `https://www.youtube.com/embed/${key}?autoplay=1&rel=0&enablejsapi=1`;
    modal.classList.add('open');
  }
}

export function closeTrailer() {
  const modal = document.getElementById('trailer-modal') || document.getElementById('tmodal');
  const iframe = document.getElementById('trailer-iframe') || document.getElementById('tr-fr');
  if (modal) modal.classList.remove('open');
  if (iframe) {
    // Complete audio buffer destruction
    iframe.src = 'about:blank';
    iframe.removeAttribute('src');
    iframe.src = '';
  }
  activeTrailerKey = null;
}
export const closeTrailerModal = closeTrailer;
window.openTrailerModal = openTrailerModal;
window.closeTrailerModal = closeTrailer;
window.closeTrailer = closeTrailer;

/* ═══════════════════════════════════════════════════════════════════
   CINEMA GLASS PLAYER MODAL (Zero Boring Windows / Eliminates History Loop)
   ═══════════════════════════════════════════════════════════════════ */

let activeCinemaItem = null;
let cinemaEpisodes = [];

export async function openPlayerModal({ id, type = 'movie', season = 1, episode = 1, resume = false }) {
  id = +id;
  season = +season || 1;
  episode = +episode || 1;

  const modal = document.getElementById('player-modal');
  const iframe = document.getElementById('cinema-iframe');
  if (!modal || !iframe) return;

  // 0. Kill background hero carousel timer to eliminate lag & frame drops during video playback
  if (State.heroTick) {
    clearInterval(State.heroTick);
    State.heroTick = null;
  }
  State.heroPaused = true;

  // 1. Resolve Item Metadata & Cache
  let item = getItem(id);
  if (!item) {
    try {
      const fetched = await API.detail(id, type);
      item = registerItem({ ...fetched, media_type: type });
    } catch {
      item = { id, title: 'Playing Title', name: 'Playing Title', media_type: type };
    }
  } else {
    registerItem(item);
  }

  activeCinemaItem = { id, type, season, episode, item };
  addToHistory(item);

  // 2. Accurate Resume Seeking timestamp resolution
  let savedSecs = 0;
  const prg = getProgress(id);
  if (resume && prg) {
    if (typeof prg.currentTime === 'number' && prg.currentTime > 5) {
      savedSecs = Math.floor(prg.currentTime);
    } else if (prg.pct && prg.duration) {
      savedSecs = Math.floor((prg.pct / 100) * prg.duration);
    }
  }

  // 3. UI Header & Watchlist state update
  const titleText = gt(item);
  const titleEl = document.getElementById('player-modal-title');
  const subEl = document.getElementById('player-modal-sub');
  if (titleEl) titleEl.textContent = titleText;
  if (subEl) subEl.textContent = type === 'tv' ? `Season ${season} · Episode ${episode}` : (yr(grd(item)) || '');

  const watchBtn = document.getElementById('player-modal-watchlist-btn');
  if (watchBtn) {
    const isSaved = isInWatchlist(id);
    watchBtn.classList.toggle('active', isSaved);
    watchBtn.classList.toggle('saved', isSaved);
    watchBtn.innerHTML = isSaved ? I.bookmarkFilled : I.bookmark;
  }

  // 4. Mount CineSrc player telemetry & embed URL
  const { embedUrl } = mountPlayer({
    id,
    type,
    season,
    episode,
    time: savedSecs,
    totalMinutes: item?.runtime || 90,
    onNextEpisode: (nextS, nextE) => {
      if (activeCinemaItem) {
        activeCinemaItem.season = nextS;
        activeCinemaItem.episode = nextE;
      }
      if (subEl) subEl.textContent = `Season ${nextS} · Episode ${nextE}`;
      highlightActiveCinemaEpisode(nextS, nextE);
    },
    onClose: () => {
      closePlayerModal();
    }
  });

  iframe.src = embedUrl;
  modal.classList.add('active');
  document.body.classList.add('cinema-modal-open');
  updateRotateButtonVisibility();

  // 5. In-Modal Collapsible Episode Drawer for TV Series
  const epToggle = document.getElementById('player-ep-toggle');
  const epDrawer = document.getElementById('cinema-ep-drawer');
  if (type === 'tv') {
    if (epToggle) epToggle.style.display = 'inline-flex';
    setupCinemaEpisodes(id, season, episode);
  } else {
    if (epToggle) epToggle.style.display = 'none';
    if (epDrawer) epDrawer.classList.remove('open');
  }
}

export function closePlayerModal() {
  const modal = document.getElementById('player-modal');
  const iframe = document.getElementById('cinema-iframe');
  if (modal) modal.classList.remove('active');
  if (iframe) iframe.src = '';
  document.body.classList.remove('cinema-modal-open');
  destroyPlayer();

  // Resume background hero carousel if returning to home view
  if (State.page === 'home') {
    State.heroPaused = false;
    startHeroTimer();
  }

  // If user navigated to a dedicated watch URL, update history back to detail view without loop
  const pathname = window.location.pathname || '';
  const hash = window.location.hash || '';
  if (pathname.startsWith('/watch/') || hash.startsWith('#/watch/')) {
    if (activeCinemaItem?.id && activeCinemaItem?.type) {
      const slug = slugify(gt(activeCinemaItem.item || {}) || activeCinemaItem.type);
      window.history.replaceState(null, '', `/${activeCinemaItem.type}/${activeCinemaItem.id}/${slug}`);
    } else {
      window.history.replaceState(null, '', '/');
    }
  }

  // Unlock device screen orientation and cleanup fullscreen/rotation fallbacks
  try {
    if (screen.orientation && screen.orientation.unlock) {
      screen.orientation.unlock();
    }
  } catch (err) {}
  try {
    if (document.fullscreenElement) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  } catch (err) {}
  document.getElementById('player-modal-container')?.classList.remove('css-landscape-fallback');

  activeCinemaItem = null;
}

export async function togglePlayerOrientation() {
  try {
    if (!document.fullscreenElement) {
      const container = document.getElementById('player-modal-container') || document.documentElement;
      if (container.requestFullscreen) await container.requestFullscreen();
      else if (container.webkitRequestFullscreen) await container.webkitRequestFullscreen();
    }
    if (screen.orientation && screen.orientation.lock) {
      const isPortrait = screen.orientation.type.startsWith('portrait');
      await screen.orientation.lock(isPortrait ? 'landscape' : 'portrait');
    }
  } catch (err) {
    // Fallback for iOS Safari / browsers blocking orientation lock:
    // Toggle CSS class that rotates the container 90deg and sets width: 100vh; height: 100vw;
    document.getElementById('player-modal-container')?.classList.toggle('css-landscape-fallback');
  }
}
window.togglePlayerOrientation = togglePlayerOrientation;

export function togglePlayerEpisodeDrawer() {
  const drawer = document.getElementById('cinema-ep-drawer');
  const btn = document.getElementById('player-ep-toggle');
  if (drawer) {
    drawer.classList.toggle('open');
    if (btn) btn.classList.toggle('active', drawer.classList.contains('open'));
  }
}

let cinemaAllEpisodes = [];
let cinemaCurrentSeason = 1;
let cinemaCurrentChunk = 0;
const EP_CHUNK_SIZE = 25;

async function setupCinemaEpisodes(tvId, curSeason, curEp) {
  try {
    const det = await API.detail(tvId, 'tv');
    const seasons = (det.seasons || []).filter(s => s.season_number > 0);
    const nav = document.getElementById('cinema-season-nav');
    if (nav) {
      nav.innerHTML = seasons.map(s => `
        <button class="cinema-season-tab ${s.season_number === curSeason ? 'active' : ''}" 
                data-season="${s.season_number}"
                onclick="window.switchCinemaSeason(${s.season_number})">
          Season ${s.season_number} ${s.episode_count ? `<span style="opacity:0.75;font-size:0.7rem">(${s.episode_count})</span>` : ''}
        </button>
      `).join('');
    }
    await switchCinemaSeason(curSeason, curEp);
  } catch (err) {
    console.warn('[Cinema Episode Setup Error]', err);
  }
}

export async function switchCinemaSeason(seasonNum, targetEp = null) {
  if (!activeCinemaItem) return;
  cinemaCurrentSeason = +seasonNum;

  // Highlight active season pill
  document.querySelectorAll('.cinema-season-tab').forEach(tab => {
    tab.classList.toggle('active', +tab.dataset.season === cinemaCurrentSeason);
  });

  const list = document.getElementById('cinema-ep-list');
  const rangeNav = document.getElementById('cinema-range-nav');
  if (list) list.innerHTML = renderEpisodeSkeletons(4);

  try {
    const data = await API.season(activeCinemaItem.id, seasonNum);
    cinemaAllEpisodes = data.episodes || [];
    const activeEpNum = targetEp || activeCinemaItem.episode || 1;

    // Check if season has more than 25 episodes for chunking
    if (cinemaAllEpisodes.length > EP_CHUNK_SIZE) {
      const numChunks = Math.ceil(cinemaAllEpisodes.length / EP_CHUNK_SIZE);
      const activeChunk = Math.floor((activeEpNum - 1) / EP_CHUNK_SIZE);
      cinemaCurrentChunk = Math.min(Math.max(activeChunk, 0), numChunks - 1);

      if (rangeNav) {
        rangeNav.style.display = 'flex';
        renderEpisodeRangeNav(numChunks, cinemaCurrentChunk, seasonNum);
      }
    } else {
      cinemaCurrentChunk = 0;
      if (rangeNav) {
        rangeNav.style.display = 'none';
        rangeNav.innerHTML = '';
      }
    }

    renderEpisodeListDOM(seasonNum, activeEpNum);
  } catch (err) {
    if (list) list.innerHTML = '<div style="color:var(--txt3);padding:14px;font-size:0.85rem">Could not load episodes.</div>';
  }
}

function renderEpisodeRangeNav(numChunks, activeChunk, seasonNum) {
  const rangeNav = document.getElementById('cinema-range-nav');
  if (!rangeNav) return;
  const buttons = [];
  for (let i = 0; i < numChunks; i++) {
    const start = i * EP_CHUNK_SIZE + 1;
    const end = Math.min((i + 1) * EP_CHUNK_SIZE, cinemaAllEpisodes.length);
    buttons.push(`
      <button class="cinema-range-tab ${i === activeChunk ? 'active' : ''}"
              data-chunk="${i}"
              onclick="window.switchEpisodeChunk(${i}, ${seasonNum})">
        ${start}–${end}
      </button>
    `);
  }
  rangeNav.innerHTML = buttons.join('');
  rangeNav.classList.add('chunk-tabs-row');
  enableHorizontalScroll(rangeNav);
}

export function switchEpisodeChunk(chunkIdx, seasonNum) {
  cinemaCurrentChunk = +chunkIdx;
  document.querySelectorAll('.cinema-range-tab').forEach(tab => {
    tab.classList.toggle('active', +tab.dataset.chunk === cinemaCurrentChunk);
  });
  renderEpisodeListDOM(seasonNum, activeCinemaItem?.episode);
}

function renderEpisodeListDOM(seasonNum, activeEpNum) {
  const list = document.getElementById('cinema-ep-list');
  if (!list) return;

  let displayEpisodes = cinemaAllEpisodes;
  if (cinemaAllEpisodes.length > EP_CHUNK_SIZE) {
    const start = cinemaCurrentChunk * EP_CHUNK_SIZE;
    displayEpisodes = cinemaAllEpisodes.slice(start, start + EP_CHUNK_SIZE);
  }

  if (!displayEpisodes.length) {
    list.innerHTML = '<div style="color:var(--txt3);padding:14px;font-size:0.85rem">No episodes found for this season.</div>';
    return;
  }

  list.innerHTML = displayEpisodes.map(ep => {
    const isCur = ep.episode_number === +activeEpNum && +seasonNum === activeCinemaItem?.season;
    const thumb = ep.still_path ? IM.still(ep.still_path) : 'assets/placeholder-backdrop.svg';
    const runtime = ep.runtime ? `${ep.runtime}m` : '';
    const epTitle = (ep.name && ep.name.trim() !== '') ? ep.name : `Episode ${ep.episode_number}`;

    return `
      <div class="cinema-ep-item ${isCur ? 'active' : ''}" 
           data-s="${seasonNum}" data-e="${ep.episode_number}"
           onclick="window.switchCinemaEpisode(${seasonNum}, ${ep.episode_number})">
        <div class="cinema-ep-thumb-wrap">
          <img class="cinema-ep-thumb" src="${thumb}" alt="Episode ${ep.episode_number}" loading="lazy" />
          ${runtime ? `<span class="cinema-ep-badge">${runtime}</span>` : ''}
        </div>
        <div class="ep-card-body cinema-ep-info">
          <div class="ep-card-badge cinema-ep-header-line">
            <span class="cinema-ep-num-pill">S${seasonNum} · E${ep.episode_number}</span>
            ${isCur ? '<span style="font-size:0.65rem;color:var(--red);font-weight:700">▶ PLAYING</span>' : ''}
          </div>
          <div class="ep-card-title cinema-ep-name" title="${epTitle.replace(/"/g, '&quot;')}">${epTitle}</div>
          ${ep.overview ? `<div class="cinema-ep-overview">${ep.overview}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

export function switchCinemaEpisode(seasonNum, episodeNum) {
  if (!activeCinemaItem) return;
  activeCinemaItem.season = +seasonNum;
  activeCinemaItem.episode = +episodeNum;

  const subEl = document.getElementById('player-modal-sub');
  if (subEl) subEl.textContent = `Season ${seasonNum} · Episode ${episodeNum}`;

  const iframe = document.getElementById('cinema-iframe');
  if (iframe) {
    iframe.src = buildEmbedUrl({
      id: activeCinemaItem.id,
      type: 'tv',
      season: seasonNum,
      episode: episodeNum
    });
  }

  highlightActiveCinemaEpisode(seasonNum, episodeNum);
}

function highlightActiveCinemaEpisode(seasonNum, episodeNum) {
  document.querySelectorAll('.cinema-ep-item').forEach(el => {
    const s = +el.dataset.s;
    const e = +el.dataset.e;
    el.classList.toggle('active', s === +seasonNum && e === +episodeNum);
  });
}

export function handlePlayerWatchlistToggle(targetId) {
  const id = targetId || activeCinemaItem?.id;
  if (!id) return false;
  const inList = toggleWatchlist(id);
  const btn = document.getElementById('player-modal-watchlist-btn');
  if (btn) {
    btn.classList.toggle('active', inList);
    btn.classList.toggle('saved', inList);
    btn.innerHTML = inList ? I.bookmarkFilled : I.bookmark;
  }
  document.querySelectorAll(`[data-fid="${id}"]`).forEach(b => {
    b.classList.toggle('saved', inList);
    b.innerHTML = inList ? I.bookmarkFilled : I.bookmark;
  });
  return inList;
}
window.handlePlayerWatchlistToggle = handlePlayerWatchlistToggle;
window.toggleFav = handlePlayerWatchlistToggle;
window.switchCinemaSeason = switchCinemaSeason;
window.switchCinemaEpisode = switchCinemaEpisode;
window.switchEpisodeChunk = switchEpisodeChunk;
window.togglePlayerEpisodeDrawer = togglePlayerEpisodeDrawer;

export async function surpriseMe() {
  try {
    showToast('🎲 Rolling for something amazing…', 'ok', 2000);
    const type = Math.random() > 0.5 ? 'movie' : 'tv';
    const randomPage = Math.floor(Math.random() * 5) + 1;
    const pool = await (Math.random() > 0.5 ? API.topRated(type, randomPage) : API.popular(type, randomPage));
    const results = pool.results || [];
    if (results.length) {
      const pick = results[Math.floor(Math.random() * results.length)];
      registerItem({ ...pick, media_type: type });
      showToast(`🎲 Selected: ${gt(pick)}!`, 'ok', 3000);
      const slug = slugify(gt(pick) || type);
      navigateTo(`/${type}/${pick.id}/${slug}`);
    } else {
      navigateTo('/trending');
    }
  } catch (err) {
    navigateTo('/trending');
  }
}

export async function quickTrailer(id, type) {
  try {
    showToast('🎬 Loading preview trailer…', 'ok', 1500);
    const det = await API.detail(id, type);
    const videos = det.videos?.results || [];
    const trailer = videos.find(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')) ||
                    videos.find(v => v.site === 'YouTube');
    if (trailer?.key) {
      openTrailerModal(trailer.key);
    } else {
      showToast('No trailer video available for this title.', 'warn');
    }
  } catch {
    showToast('Could not fetch trailer video.', 'warn');
  }
}

window.openPlayerModal = openPlayerModal;
window.closePlayerModal = closePlayerModal;
window.togglePlayerEpisodeDrawer = togglePlayerEpisodeDrawer;
window.switchCinemaSeason = switchCinemaSeason;
window.switchCinemaEpisode = switchCinemaEpisode;
window.handlePlayerWatchlistToggle = handlePlayerWatchlistToggle;
window.surpriseMe = surpriseMe;
window.quickTrailer = quickTrailer;

// Global Keyboard Controls (Esc to close, Space/K to pause/play, M for Mute)
document.addEventListener('keydown', (e) => {
  const activeTag = document.activeElement?.tagName?.toLowerCase();
  if (['input', 'textarea', 'select'].includes(activeTag)) return;

  const playerModal = document.getElementById('player-modal');
  const isPlayerOpen = playerModal?.classList.contains('active');

  const trailerModal = document.getElementById('trailer-modal') || document.getElementById('tmodal');
  const isTrailerOpen = trailerModal?.classList.contains('open');

  // 1. Esc: close modals
  if (e.key === 'Escape') {
    if (isPlayerOpen) {
      closePlayerModal();
      return;
    }
    if (isTrailerOpen) {
      closeTrailer();
      return;
    }
    const notifDropdown = document.getElementById('notif-dropdown');
    if (notifDropdown?.classList.contains('show')) {
      toggleNotificationDropdown(false);
      return;
    }
    const dataModal = document.getElementById('data-modal');
    if (dataModal?.classList.contains('open')) {
      dataModal.classList.remove('open');
      return;
    }
    closeDrawer();
  }

  // 2. Space / K: Play/Pause
  if (e.key === ' ' || e.key === 'k' || e.key === 'K') {
    if (isPlayerOpen) {
      e.preventDefault();
      sendPlayerCommand('togglePlay');
    } else if (isTrailerOpen) {
      e.preventDefault();
      const iframe = document.getElementById('trailer-iframe');
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      }
    }
  }

  // 3. M: Mute / Unmute
  if (e.key === 'm' || e.key === 'M') {
    if (isPlayerOpen) {
      e.preventDefault();
      sendPlayerCommand('toggleMute');
    }
  }
});

/* Export / Import Modal */
export function openDataModal() {
  const modal = document.getElementById('data-modal');
  if (!modal) return;

  modal.innerHTML = `
    <div class="data-modal-card">
      <div class="dmc-header">
        <div class="dmc-title">💾 Backup &amp; Restore Data</div>
        <button class="drawer-cls" onclick="window.closeDataModal()">✕</button>
      </div>
      <div class="dmc-tabs">
        <button class="dmc-tab active" id="tab-export" onclick="window.switchDataTab('export')">Export Data</button>
        <button class="dmc-tab" id="tab-import" onclick="window.switchDataTab('import')">Import Backup</button>
      </div>

      <div id="dmc-view-export">
        <div class="dmc-body">
          Download or copy your complete BEBU user state, including your Watchlist, Watch Progress, and Recently Viewed titles.
        </div>
        <div style="display:flex;gap:10px;margin-top:16px">
          <button class="btn btn-red btn-sm" onclick="window.downloadBackupFile()">
            ${I.backup} Download JSON File
          </button>
          <button class="btn btn-dim btn-sm" onclick="window.copyBackupToClipboard()">
            Copy to Clipboard
          </button>
        </div>
      </div>

      <div id="dmc-view-import" style="display:none">
        <div class="dmc-body">
          Restore from a saved JSON backup file or paste your exported JSON string below:
        </div>
        <input type="file" id="dmc-file-input" accept=".json" style="margin-top:10px;font-size:0.8rem;color:var(--txt2)" onchange="window.handleBackupFileSelect(event)" />
        <textarea class="dmc-textarea" id="dmc-import-text" placeholder="Paste your backup JSON here..."></textarea>
        <div style="margin-top:14px;display:flex;gap:10px">
          <button class="btn btn-red btn-sm" onclick="window.executeRestore()">Restore Data</button>
          <button class="btn btn-dim btn-sm" onclick="window.closeDataModal()">Cancel</button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');
}
export function closeDataModal() {
  document.getElementById('data-modal')?.classList.remove('open');
}
window.openDataModal = openDataModal;
window.closeDataModal = closeDataModal;

window.switchDataTab = (tab) => {
  const expView = document.getElementById('dmc-view-export');
  const impView = document.getElementById('dmc-view-import');
  const expTab = document.getElementById('tab-export');
  const impTab = document.getElementById('tab-import');

  if (tab === 'export') {
    expView.style.display = 'block';
    impView.style.display = 'none';
    expTab.classList.add('active');
    impTab.classList.remove('active');
  } else {
    expView.style.display = 'none';
    impView.style.display = 'block';
    expTab.classList.remove('active');
    impTab.classList.add('active');
  }
};

window.downloadBackupFile = () => {
  const json = exportUserData();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bebu-streaming-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Backup downloaded successfully', 'ok');
};

window.copyBackupToClipboard = async () => {
  const json = exportUserData();
  try {
    await navigator.clipboard.writeText(json);
    showToast('Backup JSON copied to clipboard!', 'ok');
  } catch {
    showToast('Failed to copy to clipboard', 'err');
  }
};

window.handleBackupFileSelect = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const area = document.getElementById('dmc-import-text');
    if (area) area.value = e.target.result;
  };
  reader.readAsText(file);
};

window.executeRestore = () => {
  const area = document.getElementById('dmc-import-text');
  const text = area?.value.trim();
  if (!text) {
    showToast('Please paste valid JSON or select a backup file', 'err');
    return;
  }

  const result = importUserData(text);
  if (result.success) {
    showToast(`Restored ${result.counts.watchlist} watchlist items and ${result.counts.progress} watch points!`, 'ok');
    closeDataModal();
    handleRoute(); // Refresh active view
  } else {
    showToast(`Restore failed: ${result.error}`, 'err');
  }
};

/* ═══════════════════════════════════════════════════════════════════
   HELPERS & COMMON COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function renderSkeletons(count = 18) {
  return Array(count).fill(`<div class="sk sk-g"></div>`).join('');
}
function renderEpisodeSkeletons(count = 6) {
  return Array(count).fill(`<div class="sk" style="height:76px;border-radius:10px"></div>`).join('');
}
function renderEmptyState(icon, title, desc) {
  return `
    <div class="empty">
      <div class="em-ico">${icon}</div>
      <div class="em-t">${title}</div>
      <div class="em-s">${desc}</div>
    </div>
  `;
}
function renderErrorState(msg, showBack = false) {
  return `
    <div class="empty">
      <div class="em-ico">⚠️</div>
      <div class="em-t">Playback or Connection Notice</div>
      <div class="em-s">${msg}</div>
      <div style="display:flex;gap:10px;margin-top:20px">
        ${showBack ? `<button class="btn btn-out btn-sm" onclick="window.goBack()">Go Back</button>` : ''}
        <button class="btn btn-red btn-sm" onclick="navigateTo('/')">Return Home</button>
      </div>
    </div>
  `;
}
function renderFooter() {
  return `
    <footer>
      <div class="ft-logo">BEBU_STREAMING_ZONE</div>
      <div class="ft-by">Crafted by Joshua Cambal · Version 2.0 Production Edition</div>
      <div class="ft-nav">
        ${PAGES.map(p => `<a onclick="navigateTo('${p.route}')">${p.label}</a>`).join('')}
      </div>
      <div class="ft-copy">
        BEBU Streaming Zone is an ad-free entertainment catalog powered by TMDB metadata and CineSrc playback. Content rights belong to their respective copyright holders.
      </div>
    </footer>
  `;
}

export function initApp() {
  if (typeof document === 'undefined') return;
  const main = document.getElementById('main');
  if (!main) return;
  renderNavbar();
  setupDrawerSearch();
  handleRoute();
  
  // Automated background release & new episode checks for Watchlist items
  setTimeout(() => {
    checkWatchlistNotifications();
  }, 800);
}

subscribe('state:restored', () => {
  renderNavbar();
  checkWatchlistNotifications();
});

function setupDrawerSearch() {
  const inp = document.getElementById('drawer-srch');
  const drop = document.getElementById('drawer-sdrop');
  if (!inp || !drop) return;
  let timer;
  inp.addEventListener('input', () => {
    clearTimeout(timer);
    const q = inp.value.trim();
    if (q.length < 2) {
      drop.classList.remove('show');
      drop.innerHTML = '';
      return;
    }
    timer = setTimeout(async () => {
      try {
        const d = await API.search(q, 1);
        const items = (d.results || []).filter(i => i.media_type !== 'person' && i.poster_path && (i.title || i.name)).slice(0, 5);
        if (!items.length) {
          drop.innerHTML = '<div style="padding:10px;text-align:center;color:var(--txt3);font-size:0.8rem">No results</div>';
          drop.classList.add('show');
          return;
        }
        drop.innerHTML = items.map(i => {
          const t = mty(i);
          registerItem(i);
          const slug = slugify(gt(i) || 'title');
          return `
            <div class="sd-row" onclick="navigateTo('/${t}/${i.id}/${slug}'); closeDrawer();">
              <img class="sd-img" src="${IM.poster(i.poster_path, 'w92')}" alt="${gt(i)}" />
              <div style="min-width:0">
                <div class="sd-title">${gt(i)}</div>
                <div class="sd-meta">${yr(grd(i))} · ⭐ ${fr(i.vote_average)}</div>
              </div>
            </div>
          `;
        }).join('');
        drop.classList.add('show');
      } catch {}
    }, 350);
  });
}

// Auto-boot on load
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}
