/**
 * BEBU STREAMING ZONE - State Management & Storage Layer
 * Manages Watchlist, History, Progress, Preferences, and JSON Backup/Restore.
 */

import { gt, grd, mty } from './api.js';

const STORAGE_KEYS = {
  WATCHLIST_IDS: 'bsz-fi',
  WATCHLIST_DATA: 'bsz-fd',
  PROGRESS: 'bsz-pr',
  HISTORY: 'bsz-rc',
  PREFS: 'bsz-prefs',
};

// In-memory media cache registry for quick lookups across views
const itemRegistry = new Map();

// Event listeners for state changes
const eventListeners = new Map();

export function subscribe(event, callback) {
  if (!eventListeners.has(event)) {
    eventListeners.set(event, new Set());
  }
  eventListeners.get(event).add(callback);
  return () => eventListeners.get(event)?.delete(callback);
}

export function emit(event, data) {
  if (eventListeners.has(event)) {
    eventListeners.get(event).forEach(cb => {
      try { cb(data); } catch (e) { console.error(`[State Event Error ${event}]`, e); }
    });
  }
}

function lsGet(key, defaultVal) {
  if (typeof localStorage === 'undefined') return defaultVal;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch (err) {
    console.warn(`[LocalStorage Read Error ${key}]`, err);
    return defaultVal;
  }
}

function lsSet(key, val) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn(`[LocalStorage Write Error ${key}]`, err);
  }
}

export const State = {
  // Global View Navigation State
  page: 'home',
  id: null,
  type: null,
  season: 1,
  ep: 1,
  query: '',
  genre: null,
  genreName: '',
  _fromCW: false,

  // Stored state
  watchlistIds: new Set(lsGet(STORAGE_KEYS.WATCHLIST_IDS, [])),
  watchlistData: lsGet(STORAGE_KEYS.WATCHLIST_DATA, []),
  progress: lsGet(STORAGE_KEYS.PROGRESS, {}),
  history: lsGet(STORAGE_KEYS.HISTORY, []),
  get recent() { return this.history; },
  set recent(v) { this.history = Array.isArray(v) ? v : []; },
  preferences: lsGet(STORAGE_KEYS.PREFS, {
    defaultServer: 'cinesrc',
    autoplayNext: true
  }),

  // Hero state
  heroItems: [],
  heroIdx: 0,
  heroTick: null,
  heroPaused: false,

  // Movies & TV pagination state
  movCat: 'popular',
  movPg: 1,
  movSort: 'popularity.desc',
  movItems: [],
  movLoading: false,

  tvCat: 'popular',
  tvPg: 1,
  tvSort: 'popularity.desc',
  tvItems: [],
  tvLoading: false,

  // Calendar state
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  calData: {},
  calSel: null,
  calView: 'month',
  calMode: 'releases',
  calSchedOffset: 0,
  calSchedDay: null,
  calSchedData: {},
};

/**
 * Register media item in memory registry
 */
export function registerItem(item) {
  if (!item || !item.id) return item;
  const mediaType = mty(item);
  const normalized = { ...item, media_type: mediaType, _mtype: mediaType };
  itemRegistry.set(+item.id, normalized);
  return normalized;
}

export function getItem(id) {
  return itemRegistry.get(+id) || 
         State.watchlistData.find(w => +w.id === +id) || 
         State.history.find(h => +h.id === +id);
}

/**
 * Watchlist management
 */
export function isInWatchlist(id) {
  return State.watchlistIds.has(+id);
}

export function toggleWatchlist(id) {
  id = +id;
  let item = getItem(id);
  if (!item) {
    const fallback = State.watchlistData.find(f => +f.id === id) || State.history.find(r => +r.id === id);
    if (fallback) item = registerItem(fallback);
    else return false;
  }

  const inList = isInWatchlist(id);
  if (inList) {
    State.watchlistIds.delete(id);
    State.watchlistData = State.watchlistData.filter(f => +f.id !== id);
    showToast('Removed from Watchlist');
  } else {
    State.watchlistIds.add(id);
    State.watchlistData.unshift(item);
    showToast('Added to Watchlist ❤️', 'ok');
  }

  lsSet(STORAGE_KEYS.WATCHLIST_IDS, [...State.watchlistIds]);
  lsSet(STORAGE_KEYS.WATCHLIST_DATA, State.watchlistData);
  emit('watchlist:changed', { id, isSaved: !inList });
  return !inList;
}

/**
 * History (Recently Viewed) management
 */
export function addToHistory(item) {
  if (!item || !item.id) return;
  const normalized = registerItem(item);
  State.history = State.history.filter(h => +h.id !== +item.id);
  State.history.unshift(normalized);
  if (State.history.length > 30) State.history.pop();
  lsSet(STORAGE_KEYS.HISTORY, State.history);
  emit('history:changed', State.history);
}

export function removeFromHistory(id) {
  id = +id;
  State.history = State.history.filter(h => +h.id !== id);
  lsSet(STORAGE_KEYS.HISTORY, State.history);
  emit('history:changed', State.history);
  showToast('Removed from Recently Viewed');
}

export function clearHistory() {
  State.history = [];
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
    } catch {}
  }
  lsSet(STORAGE_KEYS.HISTORY, []);
  emit('history:changed', []);
  showToast('Watch history cleared');
}
export const clearAllRecent = clearHistory;

/**
 * Watch Progress management
 */
export function getProgress(id) {
  return State.progress[+id] || null;
}

export function saveProgress(id, type, pct, season = 1, ep = 1, extra = {}) {
  id = +id;
  const item = getItem(id);
  const existing = State.progress[id] || {};
  
  const updated = {
    ...existing,
    type: type || existing.type || 'movie',
    pct: Math.min(Math.max(pct, 0), 100),
    s: season,
    ep: ep,
    ts: Date.now(),
    title: item ? gt(item) : existing.title || '',
    poster_path: item ? item.poster_path : existing.poster_path || '',
    backdrop_path: item ? item.backdrop_path : existing.backdrop_path || '',
    vote_average: item ? item.vote_average : existing.vote_average || 0,
    ...extra
  };

  State.progress[id] = updated;
  lsSet(STORAGE_KEYS.PROGRESS, State.progress);
  emit('progress:updated', { id, progress: updated });
}

export function removeProgress(id) {
  id = +id;
  delete State.progress[id];
  lsSet(STORAGE_KEYS.PROGRESS, State.progress);
  emit('progress:updated', { id, progress: null });
  showToast('Removed from Continue Watching');
}

export function getContinueWatching() {
  return State.history
    .filter(item => {
      const p = getProgress(item.id);
      return p && p.pct > 3 && p.pct < 95;
    })
    .map(item => ({
      ...item,
      progress: getProgress(item.id)
    }));
}

/**
 * User Preferences
 */
export function getPreferences() {
  return State.preferences;
}

export function updatePreferences(patch) {
  State.preferences = { ...State.preferences, ...patch };
  lsSet(STORAGE_KEYS.PREFS, State.preferences);
  emit('prefs:updated', State.preferences);
}

/**
 * Export & Import User Data (Backup & Restore)
 */
export function exportUserData() {
  const exportPayload = {
    appName: 'BEBU_STREAMING_ZONE',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    watchlist: State.watchlistData,
    history: State.history,
    progress: State.progress,
    preferences: State.preferences,
  };
  return JSON.stringify(exportPayload, null, 2);
}

export function importUserData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid JSON data format');
    }

    let watchlistCount = 0;
    let historyCount = 0;
    let progressCount = 0;

    // Merge or restore watchlist
    if (Array.isArray(data.watchlist)) {
      const existingMap = new Map(State.watchlistData.map(w => [+w.id, w]));
      data.watchlist.forEach(item => {
        if (item && item.id) {
          registerItem(item);
          existingMap.set(+item.id, item);
          State.watchlistIds.add(+item.id);
          watchlistCount++;
        }
      });
      State.watchlistData = Array.from(existingMap.values());
      lsSet(STORAGE_KEYS.WATCHLIST_IDS, [...State.watchlistIds]);
      lsSet(STORAGE_KEYS.WATCHLIST_DATA, State.watchlistData);
    }

    // Merge or restore progress
    if (data.progress && typeof data.progress === 'object') {
      Object.entries(data.progress).forEach(([id, prg]) => {
        if (prg && typeof prg === 'object') {
          State.progress[+id] = { ...State.progress[+id], ...prg };
          progressCount++;
        }
      });
      lsSet(STORAGE_KEYS.PROGRESS, State.progress);
    }

    // Merge history
    if (Array.isArray(data.history)) {
      const historyMap = new Map(State.history.map(h => [+h.id, h]));
      data.history.forEach(item => {
        if (item && item.id) {
          registerItem(item);
          historyMap.set(+item.id, item);
          historyCount++;
        }
      });
      State.history = Array.from(historyMap.values()).slice(0, 30);
      lsSet(STORAGE_KEYS.HISTORY, State.history);
    }

    // Restore preferences
    if (data.preferences && typeof data.preferences === 'object') {
      State.preferences = { ...State.preferences, ...data.preferences };
      lsSet(STORAGE_KEYS.PREFS, State.preferences);
    }

    emit('state:restored');
    return {
      success: true,
      counts: { watchlist: watchlistCount, progress: progressCount, history: historyCount }
    };
  } catch (err) {
    console.error('[Import Data Error]', err);
    return { success: false, error: err.message };
  }
}

/**
 * Toast Notifications
 */
export function showToast(msg, type = 'info', durationMs = 3000) {
  if (typeof document === 'undefined') return;
  const container = document.getElementById('toasts');
  if (!container) return;

  const toastEl = document.createElement('div');
  toastEl.className = `toast ${type}`;
  const icon = type === 'ok' ? '✅' : type === 'err' ? '❌' : 'ℹ️';
  toastEl.innerHTML = `<span class="toast-ico">${icon}</span><span class="toast-msg">${msg}</span>`;

  container.appendChild(toastEl);
  setTimeout(() => {
    toastEl.classList.add('out');
    setTimeout(() => toastEl.remove(), 280);
  }, durationMs);
}
