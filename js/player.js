/**
 * BEBU STREAMING ZONE - CineSrc Player Controller
 * High-performance streaming playback powered exclusively by CineSrc.
 * Implements postMessage progress sync (cinesrc:timeupdate),
 * auto next-episode event handling (cinesrc:nextepisode),
 * and player close handling (cinesrc:close).
 */

import { saveProgress, showToast } from './state.js';

export const CINESRC_BASE = 'https://cinesrc.st';

/**
 * Builds CineSrc embed URL conforming strictly to the documentation:
 * Movie: https://cinesrc.st/embed/movie/{tmdb_id}?t={seconds}&continueprompt=false&autoplay=true&color=%23e8133a&back=close
 * TV: https://cinesrc.st/embed/tv/{tmdb_id}?s={season}&e={episode}&t={seconds}&continueprompt=false&autoplay=true&autonext=true&color=%23e8133a&back=close
 */
export function buildEmbedUrl({ id, type, season = 1, episode = 1, time = 0 }) {
  const color = '%23e8133a';
  const savedSecs = time && Number(time) > 5 ? Math.floor(Number(time)) : 0;
  const timeParam = savedSecs > 0 ? `&t=${savedSecs}&continueprompt=false` : '';

  if (type === 'tv') {
    return `${CINESRC_BASE}/embed/tv/${id}?s=${season}&e=${episode}${timeParam}&autoplay=true&autonext=true&color=${color}&back=close`;
  }
  return `${CINESRC_BASE}/embed/movie/${id}?${timeParam ? timeParam.slice(1) + '&' : ''}autoplay=true&color=${color}&back=close`;
}

let activeContext = null;
let postMessageListener = null;
let lastProgressSaveTime = 0;
let pendingProgress = null;

function flushProgress() {
  if (pendingProgress && activeContext) {
    saveProgress(
      activeContext.id,
      activeContext.type,
      pendingProgress.pct,
      activeContext.season,
      activeContext.episode,
      {
        currentTime: pendingProgress.currentTime,
        duration: pendingProgress.duration
      }
    );
    pendingProgress = null;
    lastProgressSaveTime = Date.now();
  }
}

/**
 * Mount the CineSrc player and attach postMessage event telemetry
 */
export function mountPlayer({ id, type, season = 1, episode = 1, time = 0, totalMinutes = 90, onNextEpisode = null, onClose = null }) {
  destroyPlayer(); // Clear any previous active player instance

  const totalSecs = (totalMinutes || 90) * 60;
  activeContext = {
    id: +id,
    type,
    season: +season,
    episode: +episode,
    time: +time,
    totalSecs,
    totalMinutes,
    onNextEpisode,
    onClose
  };
  lastProgressSaveTime = Date.now();
  pendingProgress = null;

  const embedUrl = buildEmbedUrl({ id, type, season, episode, time });

  // Attach postMessage listener for https://cinesrc.st
  if (typeof window !== 'undefined') {
    postMessageListener = (event) => {
      // Security: Validate origin strictly
      if (event.origin !== CINESRC_BASE) return;
      if (!event.data) return;

      const eventType = event.data.type || event.data.event;
      const data = event.data.data || event.data;

      // 1. Time Update event: cinesrc:timeupdate (throttled to at most once per 6 seconds to prevent GPU/CPU thrashing)
      if (eventType === 'cinesrc:timeupdate' || eventType === 'timeupdate') {
        const currentTime = data.currentTime ?? data.watched ?? 0;
        const duration = data.duration || activeContext.totalSecs || 1;
        if (duration > 0 && activeContext) {
          const pct = Math.min(Math.max((currentTime / duration) * 100, 0), 100);
          pendingProgress = { currentTime, duration, pct };
          const now = Date.now();
          if (now - lastProgressSaveTime >= 6000) {
            flushProgress();
          }
        }
      }

      // 2. Next Episode event: cinesrc:nextepisode
      else if (eventType === 'cinesrc:nextepisode' || eventType === 'nextepisode') {
        if (!activeContext) return;
        flushProgress();
        const nextSeason = data.season ?? activeContext.season;
        const nextEpisode = data.episode ?? (activeContext.episode + 1);

        activeContext.season = nextSeason;
        activeContext.episode = nextEpisode;

        showToast(`Playing Season ${nextSeason} · Episode ${nextEpisode}`, 'ok', 3000);

        if (typeof activeContext.onNextEpisode === 'function') {
          activeContext.onNextEpisode(nextSeason, nextEpisode, data);
        }
      }

      // 3. Close event: cinesrc:close (fired when player's built-in back button is clicked)
      else if (eventType === 'cinesrc:close' || eventType === 'close') {
        flushProgress();
        if (activeContext && typeof activeContext.onClose === 'function') {
          activeContext.onClose();
        } else if (typeof window.closePlayerModal === 'function') {
          window.closePlayerModal();
        } else if (typeof window.goBack === 'function') {
          window.goBack();
        } else if (window.history.length > 1) {
          window.history.back();
        }
      }
    };

    window.addEventListener('message', postMessageListener);
  }

  return { embedUrl };
}

/**
 * Send postMessage commands to active CineSrc player iframe
 */
export function sendPlayerCommand(command, value = null) {
  if (typeof document === 'undefined') return;
  const iframe = document.getElementById('cinema-iframe') || document.getElementById('player-iframe');
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage({ type: command, action: command, value }, CINESRC_BASE);
  }
}

/**
 * Destroy the player and clean up listeners
 */
export function destroyPlayer() {
  flushProgress();
  if (typeof window !== 'undefined' && postMessageListener) {
    window.removeEventListener('message', postMessageListener);
    postMessageListener = null;
  }
  activeContext = null;
  pendingProgress = null;
}
