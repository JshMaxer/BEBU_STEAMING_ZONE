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
 * Movie: https://cinesrc.st/embed/movie/{tmdb_id}?autoplay=true&color=%23e8133a&back=close
 * TV: https://cinesrc.st/embed/tv/{tmdb_id}?s={season}&e={episode}&autoplay=true&autonext=true&color=%23e8133a&back=close
 */
export function buildEmbedUrl({ id, type, season = 1, episode = 1 }) {
  if (type === 'tv') {
    return `${CINESRC_BASE}/embed/tv/${id}?s=${season}&e=${episode}&autoplay=true&autonext=true&color=%23e8133a&back=close`;
  }
  return `${CINESRC_BASE}/embed/movie/${id}?autoplay=true&color=%23e8133a&back=close`;
}

let activeContext = null;
let postMessageListener = null;

/**
 * Mount the CineSrc player and attach postMessage event telemetry
 */
export function mountPlayer({ id, type, season = 1, episode = 1, totalMinutes = 90, onNextEpisode = null, onClose = null }) {
  destroyPlayer(); // Clear any previous active player instance

  const totalSecs = (totalMinutes || 90) * 60;
  activeContext = {
    id: +id,
    type,
    season: +season,
    episode: +episode,
    totalSecs,
    totalMinutes,
    onNextEpisode,
    onClose
  };

  const embedUrl = buildEmbedUrl({ id, type, season, episode });

  // Attach postMessage listener for https://cinesrc.st
  if (typeof window !== 'undefined') {
    postMessageListener = (event) => {
      // Security: Validate origin strictly
      if (event.origin !== CINESRC_BASE) return;
      if (!event.data) return;

      const eventType = event.data.type || event.data.event;
      const data = event.data.data || event.data;

      // 1. Time Update event: cinesrc:timeupdate
      if (eventType === 'cinesrc:timeupdate' || eventType === 'timeupdate') {
        const currentTime = data.currentTime ?? data.watched ?? 0;
        const duration = data.duration || activeContext.totalSecs || 1;
        if (duration > 0 && activeContext) {
          const pct = Math.min(Math.max((currentTime / duration) * 100, 0), 100);
          saveProgress(activeContext.id, activeContext.type, pct, activeContext.season, activeContext.episode, {
            currentTime,
            duration
          });
        }
      }

      // 2. Next Episode event: cinesrc:nextepisode
      else if (eventType === 'cinesrc:nextepisode' || eventType === 'nextepisode') {
        if (!activeContext) return;
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
        if (activeContext && typeof activeContext.onClose === 'function') {
          activeContext.onClose();
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
 * Destroy the player and clean up listeners
 */
export function destroyPlayer() {
  if (typeof window !== 'undefined' && postMessageListener) {
    window.removeEventListener('message', postMessageListener);
    postMessageListener = null;
  }
  activeContext = null;
}
