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
  showToast, subscribe
} from './state.js';
import { mountPlayer, destroyPlayer } from './player.js';

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
  { id: 'home', label: 'Home', icon: I.home, route: '#/' },
  { id: 'movies', label: 'Movies', icon: I.film, route: '#/movies' },
  { id: 'tv', label: 'TV Shows', icon: I.tv, route: '#/tv' },
  { id: 'trending', label: 'Trending', icon: I.trend, route: '#/trending' },
  { id: 'calendar', label: 'Calendar', icon: I.calendar, route: '#/calendar' },
  { id: 'genres', label: 'Genres', icon: I.genre, route: '#/genres' },
  { id: 'watchlist', label: 'Watchlist', icon: I.watchlist, route: '#/watchlist' },
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
  watch: 'Watch Player · BEBU'
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

export function parseHash() {
  const hash = window.location.hash || '#/';
  const clean = hash.replace(/^#\/?/, '');
  const [path, queryString] = clean.split('?');
  const segments = path.split('/').filter(Boolean);
  const params = new URLSearchParams(queryString || '');

  const root = segments[0] || 'home';
  return {
    root,
    segments,
    params,
    fullHash: hash
  };
}

export function isSameMedia(hashA, hashB) {
  if (!hashA || !hashB) return false;
  const parse = (h) => {
    const clean = h.replace(/^#\/?/, '').split('?')[0];
    const parts = clean.split('/');
    if ((parts[0] === 'detail' || parts[0] === 'watch') && parts[2]) {
      return `${parts[1]}/${parts[2]}`;
    }
    return null;
  };
  const a = parse(hashA);
  const b = parse(hashB);
  return a && b && a === b;
}

export function navigateTo(hash, replace = false) {
  const currentHash = (typeof window !== 'undefined' && window.location.hash) || '#/';
  if (currentHash === hash) return;

  // Prevent navigation history loop: If toggling between detail and watch for the same media, replace history
  if (isSameMedia(currentHash, hash)) {
    replace = true;
  }

  if (typeof window !== 'undefined') {
    if (replace) {
      window.history.replaceState(null, '', hash);
      if (State._navStack && State._navStack.length > 0) {
        State._navStack[State._navStack.length - 1] = hash;
      }
    } else {
      window.history.pushState(null, '', hash);
      if (!State._navStack) State._navStack = [];
      State._navStack.push(hash);
    }
  }

  const { root } = parseHash();
  if (['home', 'movies', 'tv', 'trending', 'calendar', 'genres', 'watchlist', 'search'].includes(root)) {
    State._lastBrowsePage = hash;
  }

  handleRoute();
}

export function goBack(fallback) {
  const currentHash = (typeof window !== 'undefined' && window.location.hash) || '#/';
  const { root, segments } = parseHash();

  // If in watch player, unwind to detail view using replaceState so player isn't trapped in back loop
  if (root === 'watch') {
    const type = segments[1] || 'movie';
    const id = segments[2];
    navigateTo(`#/detail/${type}/${id}`, true);
    return;
  }

  // If in detail view, return to the browse page the user came from (e.g. home, movies, tv, etc.)
  if (root === 'detail') {
    const dest = State._lastBrowsePage || fallback || '#/';
    navigateTo(dest, false);
    return;
  }

  // General fallback
  if (State._lastBrowsePage && State._lastBrowsePage !== currentHash) {
    navigateTo(State._lastBrowsePage);
  } else if (typeof window !== 'undefined' && window.history.length > 1) {
    window.history.back();
  } else {
    navigateTo(fallback || '#/');
  }
}

if (typeof window !== 'undefined') {
  window.navigateTo = navigateTo;
  window.go = navigateTo;
  window.goBack = goBack;
}

export function getPageFromRoot(root) {
  switch (root) {
    case '':
    case 'home':
      return 'home';
    case 'movies':
    case 'movie':
      return 'movies';
    case 'tv':
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
      return 'detail';
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

  const { root, segments, params } = parseHash();
  const activePage = getPageFromRoot(root);
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
        const genreName = decodeURIComponent(segments[2] || 'Genre');
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
        const type = segments[1] || 'movie';
        const id = segments[2];
        State.type = type;
        State.id = +id;
        document.title = PAGE_TITLES.detail;
        await renderPageDetail(id, type);
        break;
      }

      case 'watch': {
        State.page = 'watch';
        const type = segments[1] || 'movie';
        const id = segments[2];
        const season = +(params.get('season') || 1);
        const ep = +(params.get('ep') || 1);
        State.type = type;
        State.id = +id;
        State.season = season;
        State.ep = ep;
        document.title = PAGE_TITLES.watch;
        await renderPageWatch(id, type, season, ep);
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
    <div class="logo-wrap" onclick="navigateTo('#/')">
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
      <button class="btn btn-out btn-sm" onclick="window.openDataModal()" title="Backup & Restore Data">
        ${I.backup} <span class="hide-mobile">Backup</span>
      </button>
      <button class="nav-hbg" onclick="openDrawer()" aria-label="Open menu">${I.menu}</button>
    </div>
  `;

  // Attach search input listeners
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
          navigateTo(`#/search?q=${encodeURIComponent(q)}`);
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

  renderDrawerLinks();
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
    return `
      <div class="sd-row" onclick="navigateTo('#/detail/${t}/${item.id}'); closeSearchDrop();">
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
         onclick="navigateTo('#/search?q=${encodeURIComponent(query)}'); closeSearchDrop();">
      ${I.search} View all results
    </div>
  `;
  drop.classList.add('show');
}

function closeSearchDrop() {
  document.getElementById('sdrop')?.classList.remove('show');
}

// Global click-away to close search drop
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.srch-wrap')) closeSearchDrop();
  });
}

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

  return `
    <div class="card ${wide ? 'card-wide' : ''}" 
         data-card-id="${item.id}"
         onclick="navigateTo('#/detail/${t}/${item.id}')"
         role="button" tabindex="0"
         onkeydown="if(event.key==='Enter') navigateTo('#/detail/${t}/${item.id}')">
      <img class="card-img" src="${poster}" alt="${gt(item).replace(/"/g, '&quot;')}" loading="lazy" />
      <div class="card-ovl"></div>
      <div class="card-play">${I.playFilled}</div>
      <span class="card-badge">${t === 'tv' ? 'TV' : 'FILM'}</span>
      <div class="card-qual-wrap">${getQualityBadge(item)}</div>
      
      <div class="card-actions">
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
    <div class="rec-wrap" id="cw-${item.id}">
      <div class="card card-wide" 
           onclick="State._fromCW = true; navigateTo('#/watch/${t}/${item.id}?season=${prg?.s || 1}&ep=${prg?.ep || 1}')">
        <img class="card-img" src="${poster}" alt="${gt(item)}" loading="lazy" />
        <div class="card-ovl"></div>
        <div class="card-play">${I.playFilled}</div>
        <span class="card-badge">${t === 'tv' ? 'TV' : 'FILM'}</span>
        <button class="rec-remove" onclick="event.stopPropagation(); window.handleRemoveCW(${item.id});" title="Remove">✕</button>
        <div class="card-actions">
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

  return `
    <div class="rec-wrap" id="rec-${item.id}">
      <div class="card" onclick="navigateTo('#/detail/${t}/${item.id}')">
        <img class="card-img" src="${IM.poster(item.poster_path)}" alt="${gt(item)}" loading="lazy" />
        <div class="card-ovl"></div>
        <div class="card-play">${I.playFilled}</div>
        <span class="card-badge">${t === 'tv' ? 'TV' : 'FILM'}</span>
        <div class="card-qual-wrap">${getQualityBadge(item)}</div>
        <button class="rec-remove" onclick="event.stopPropagation(); window.handleRemoveHistory(${item.id});" title="Remove">✕</button>
        <div class="card-actions">
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
  return `
    <div class="t10-wrap" onclick="navigateTo('#/detail/${t}/${item.id}')">
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
            <button class="btn btn-red" id="h-bw" onclick="navigateTo('#/watch/${t}/${item.id}?season=${prg?.s || 1}&ep=${prg?.ep || 1}')">
              ${I.play} ${prg && prg.pct > 5 ? 'Continue Watching' : 'Watch Now'}
            </button>
            <button class="btn btn-dim" id="h-bi" onclick="navigateTo('#/detail/${t}/${item.id}')">
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
      bw.setAttribute('onclick', `navigateTo('#/watch/${t}/${item.id}?season=${prg?.s || 1}&ep=${prg?.ep || 1}')`);
      bw.innerHTML = `${I.play} ${prg && prg.pct > 5 ? 'Continue Watching' : 'Watch Now'}`;
    }

    const bi = document.getElementById('h-bi');
    if (bi) bi.setAttribute('onclick', `navigateTo('#/detail/${t}/${item.id}')`);

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
        ${renderRow('tr', '🔥 Trending This Week', (trending.results || []).slice(0, 18), { seeAllRoute: '#/trending' })}
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
          ${renderRow('pm', '🎬 Popular Movies', (popMovies.results || []).slice(0, 18), { type: 'movie', seeAllRoute: '#/movies' })}
          ${renderTop10Row('pt', '📺 Top 10 TV Shows Today', (popTV.results || []).slice(0, 10), 'tv')}
          ${renderRow('pt', '📺 Popular TV Shows', (popTV.results || []).slice(0, 18), { type: 'tv', seeAllRoute: '#/tv' })}
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
          ${show.map(item => `
            <div class="cal-item" 
                 onclick="event.stopPropagation(); navigateTo('#/detail/${item.media_type}/${item.id}')" 
                 title="${gt(item).replace(/"/g, '&quot;')}">
              <img src="${IM.poster(item.poster_path, 'w92')}" loading="lazy" />
              <div class="cal-item-ty ${item.media_type === 'tv' ? 'tv' : 'mov'}"></div>
            </div>
          `).join('')}
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
          ${rels.map(item => `
            <div class="cal-release" onclick="navigateTo('#/detail/${item.media_type}/${item.id}')">
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
          `).join('')}
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
        ${rels.map(item => `
          <div class="cal-release" onclick="navigateTo('#/detail/${item.media_type}/${item.id}')">
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
        `).join('')}
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
      ${eps.map(ep => `
        <div class="sched-ep-card" onclick="navigateTo('#/detail/tv/${ep.showId}')">
          ${ep.epStill ? `<img class="sched-ep-still" src="${IM.still(ep.epStill)}" loading="lazy" />` : `<img class="sched-ep-poster" src="${IM.poster(ep.showPoster, 'w342')}" loading="lazy" />`}
          <div class="sched-ep-body">
            <div class="sched-ep-show">${ep.showName}</div>
            <div class="sched-ep-name">${ep.epName}</div>
            <div class="sched-ep-num">Season ${ep.epSeason} · Episode ${ep.epNum}</div>
          </div>
        </div>
      `).join('')}
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
        ${eps.map(ep => `
          <div class="sched-ep-card" onclick="navigateTo('#/detail/tv/${ep.showId}')">
            ${ep.epStill ? `<img class="sched-ep-still" src="${IM.still(ep.epStill)}" loading="lazy" />` : `<img class="sched-ep-poster" src="${IM.poster(ep.showPoster, 'w342')}" loading="lazy" />`}
            <div class="sched-ep-body">
              <div class="sched-ep-show">${ep.showName}</div>
              <div class="sched-ep-name">${ep.epName}</div>
              <div class="sched-ep-num">Season ${ep.epSeason} · Episode ${ep.epNum}</div>
            </div>
          </div>
        `).join('')}
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
          ${[...genreMap.entries()].map(([id, name]) => `
            <div class="genre-chip" onclick="navigateTo('#/genre/${id}/${encodeURIComponent(name)}')">
              <span class="genre-ico">${GICONS[id] || '🎬'}</span>
              <div class="genre-name">${name}</div>
              <div class="genre-type">Movies &amp; Series</div>
            </div>
          `).join('')}
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
  let page = 1;
  let items = [];
  let loading = false;

  const main = document.getElementById('main');
  main.innerHTML = `
    <div>
      <div class="pg-hd">
        <button class="btn btn-out btn-sm" onclick="navigateTo('#/genres')" style="margin-bottom:12px">
          ${I.chevronLeft} All Genres
        </button>
        <div class="pg-title">${GICONS[genreId] || '🎬'} ${genreName}</div>
        <div class="pg-sub">Browse top-rated ${genreName} movies and television shows</div>
      </div>
      <div class="filter-bar">
        <div class="filter-group">
          <div class="fbb on" data-gt="movie" onclick="window.setGenreMediaType('movie')">🎬 Movies</div>
          <div class="fbb" data-gt="tv" onclick="window.setGenreMediaType('tv')">📺 TV Shows</div>
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
      if (isFirst) {
        const pages = await Promise.all([1, 2, 3].map(p => API.byGenre(mediaType, genreId, p)));
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
        if (grid) grid.innerHTML = items.map(m => renderCard(m, { type: mediaType })).join('');
        const moreBtn = document.getElementById('genre-more-btn');
        if (moreBtn) moreBtn.style.display = page <= (pages[0]?.total_pages || 1) ? 'inline-flex' : 'none';
      } else {
        const d = await API.byGenre(mediaType, genreId, page);
        (d.results || []).forEach(item => items.push(registerItem({ ...item, media_type: mediaType })));
        const grid = document.getElementById('genre-grid');
        if (grid) grid.innerHTML = items.map(m => renderCard(m, { type: mediaType })).join('');
        const moreBtn = document.getElementById('genre-more-btn');
        if (moreBtn) moreBtn.style.display = page < (d.total_pages || 1) ? 'inline-flex' : 'none';
        page++;
      }
    } catch (err) {
      console.warn(err);
    }
    loading = false;
  }

  window.setGenreMediaType = async (type) => {
    mediaType = type;
    page = 1;
    items = [];
    document.querySelectorAll('[data-gt]').forEach(f => f.classList.toggle('on', f.dataset.gt === type));
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
            <button class="btn btn-red" onclick="navigateTo('#/')">Browse Titles</button>
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
        <div class="det-hero">
          ${bd ? `<img src="${bd}" alt="${title.replace(/"/g, '&quot;')}" />` : ''}
          <div class="det-hero-ovl"></div>
          <button class="det-back" onclick="window.goBack()">${I.chevronLeft} Back</button>
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
                <button class="btn btn-red" onclick="navigateTo('#/watch/${type}/${det.id}?season=${prg?.s || 1}&ep=${prg?.ep || 1}')">
                  ${I.play} ${prg && prg.pct > 5 ? `Continue Watching (${Math.round(prg.pct)}%)` : 'Watch Now'}
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
                <div class="cast-card">
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

window.loadDetailEpisodes = async (tvId, seasonNumber) => {
  document.querySelectorAll('#s-tabs .stab').forEach(t => {
    t.classList.toggle('on', t.textContent.trim() === `Season ${seasonNumber}`);
  });
  const grid = document.getElementById('ep-grid');
  if (!grid) return;
  grid.innerHTML = renderEpisodeSkeletons(6);

  try {
    const data = await API.season(tvId, seasonNumber);
    grid.innerHTML = (data.episodes || []).map(ep => `
      <div class="ep-card" onclick="navigateTo('#/watch/tv/${tvId}?season=${seasonNumber}&ep=${ep.episode_number}')">
        <img class="ep-thumb" src="${IM.still(ep.still_path)}" loading="lazy" />
        <div style="min-width:0">
          <div class="ep-num">S${seasonNumber} · E${ep.episode_number} ${ep.runtime ? `· ${ep.runtime}m` : ''}</div>
          <div class="ep-name">${ep.name || `Episode ${ep.episode_number}`}</div>
          <div class="ep-desc">${ep.overview || ''}</div>
        </div>
      </div>
    `).join('');
  } catch {
    grid.innerHTML = '<div style="color:var(--txt3);font-size:0.85rem">Could not load episodes.</div>';
  }
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

            return `
              <div class="col-wrap" onclick="navigateTo('#/detail/movie/${part.id}')">
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
          window.history.replaceState(null, '', `#/watch/tv/${id}?season=${nextS}&ep=${nextE}`);
        }
        const sub = document.querySelector('.watch-sub');
        if (sub) sub.textContent = `Season ${nextS} · Episode ${nextE}`;
      },
      onClose: () => {
        window.goBack(`#/detail/${type}/${id}`);
      }
    });

    main.innerHTML = `
      <div>
        <div class="watch-bar">
          <button class="btn btn-out btn-sm" onclick="window.goBack('#/detail/${type}/${id}')">
            ${I.chevronLeft} Detail View
          </button>
          <div style="flex:1;min-width:0">
            <div class="watch-title">${title}</div>
            ${type === 'tv' ? `<div class="watch-sub">Season ${season} · Episode ${ep}</div>` : ''}
          </div>
          <div class="cinesrc-badge">
            <span class="cinesrc-dot"></span>
            <span class="cinesrc-text">CineSrc Ultra HD</span>
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

window.loadWatchEpisodes = async (tvId, s, currentEp) => {
  document.querySelectorAll('#watch-s-tabs .stab').forEach(t => {
    t.classList.toggle('on', t.textContent.trim() === `Season ${s}`);
  });
  const grid = document.getElementById('watch-ep-grid');
  if (!grid) return;
  grid.innerHTML = renderEpisodeSkeletons(6);

  try {
    const data = await API.season(tvId, s);
    grid.innerHTML = (data.episodes || []).map(episode => {
      const isCur = episode.episode_number === currentEp && s === State.season;
      return `
        <div class="ep-card ${isCur ? 'playing' : ''}" 
             onclick="navigateTo('#/watch/tv/${tvId}?season=${s}&ep=${episode.episode_number}')">
          <img class="ep-thumb" src="${IM.still(episode.still_path)}" loading="lazy" />
          <div style="min-width:0">
            <div class="ep-num">S${s} · E${episode.episode_number} ${isCur ? '▶ Currently Playing' : ''}</div>
            <div class="ep-name">${episode.name || `Episode ${episode.episode_number}`}</div>
            <div class="ep-desc">${episode.overview || ''}</div>
          </div>
        </div>
      `;
    }).join('');
  } catch {
    grid.innerHTML = '';
  }
};

/* ═══════════════════════════════════════════════════════════════════
   MODALS: TRAILER & DATA BACKUP / RESTORE
   ═══════════════════════════════════════════════════════════════════ */

let activeTrailerKey = null;

export function openTrailerModal(key) {
  activeTrailerKey = key;
  const modal = document.getElementById('trailer-modal');
  const iframe = document.getElementById('trailer-iframe');
  if (modal && iframe) {
    // enablejsapi=1 allows Space key to play/pause
    iframe.src = `https://www.youtube.com/embed/${key}?autoplay=1&rel=0&enablejsapi=1`;
    modal.classList.add('open');
  }
}
export function closeTrailerModal() {
  const modal = document.getElementById('trailer-modal');
  const iframe = document.getElementById('trailer-iframe');
  if (modal) modal.classList.remove('open');
  if (iframe) iframe.src = '';
  activeTrailerKey = null;
}
window.openTrailerModal = openTrailerModal;
window.closeTrailerModal = closeTrailerModal;

// Keyboard controls for modal (Esc to close, Space to pause/play)
document.addEventListener('keydown', (e) => {
  const activeTag = document.activeElement?.tagName?.toLowerCase();
  if (activeTag === 'input' || activeTag === 'textarea') return;

  const trailerModal = document.getElementById('trailer-modal');
  const isTrailerOpen = trailerModal?.classList.contains('open');

  if (e.key === 'Escape') {
    if (isTrailerOpen) {
      closeTrailerModal();
      return;
    }
    const dataModal = document.getElementById('data-modal');
    if (dataModal?.classList.contains('open')) {
      dataModal.classList.remove('open');
      return;
    }
    closeDrawer();
  }

  if (e.key === ' ' && isTrailerOpen) {
    e.preventDefault();
    const iframe = document.getElementById('trailer-iframe');
    if (iframe && iframe.contentWindow) {
      // Toggle play/pause via YouTube postMessage API
      iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
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
        <button class="btn btn-red btn-sm" onclick="navigateTo('#/')">Return Home</button>
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
}

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
          return `
            <div class="sd-row" onclick="navigateTo('#/detail/${t}/${i.id}'); closeDrawer();">
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
