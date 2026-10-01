# 🎬 BEBU STREAMING ZONE

> A premium, cinematic streaming platform for movies and TV shows.
> Dark, modern, fast, and completely ad-free.

**Created by:** Joshua Cambal

---

## Overview

BEBU Streaming Zone is a premium streaming web app that lets you browse, search, and watch movies and TV shows from around the world. Inspired by the cinematic look and feel of Netflix, it's built with a clean dark UI, smooth animations, and a polished experience on every screen — from your phone to your living room TV.

No ads. No clutter. Just content.

---

## Features

### 🎥 Content & Browsing
- Browse Movies, TV Shows, Trending content, and Genres
- **Top 10 ranked rows** for movies and TV shows with bold number overlays
- **Continue Watching** — picks up right where you left off with a progress bar
- **Recently Viewed** — quick access to titles you've already opened, removable with one tap
- Multiple curated rows: New & Popular, Now in Theaters, Currently Airing, Airing Today, Top Rated, and more
- Full detail pages showing cast, director, writer, runtime, rating, genres, trailer, and similar titles
- Episode selector for TV shows with season tabs

### 🔍 Search
- Instant live search with poster thumbnails as you type — available on both desktop and mobile
- Full search results page for any movie or TV show

### 🏷️ Quality Badges
Every title card shows a color-coded badge so you know what to expect before you watch:

| Badge | Meaning |
|-------|---------|
| 🟢 `HD` | Full HD quality available |
| 🟡 `CAM` | Recently released — still in theaters |
| 🔵 `NEW` | Fresh digital release |
| 🔵 `SOON` | Not yet released |

### 💾 Your Data, Saved Locally
- **Watchlist** — save any title and remove it anytime, updates instantly
- **Continue Watching** — progress is remembered across visits
- **Recently Viewed** — your browsing history, removable per title
- Everything is saved on your device — no account needed

### 🎨 Design & Experience
- Cinematic hero banner with auto-rotating slideshow and manual controls
- Smooth card hover animations — the whole card lifts cleanly
- Skeleton loaders while content is fetching
- Toast notifications for all actions
- Scroll-to-top button
- Clean empty states, error states, and loading states throughout

---

## Screens & Pages

| Page | What It Does |
|------|-------------|
| **Home** | Hero banner + Continue Watching + Recently Viewed + 10 curated rows |
| **Movies** | Filterable grid — Popular, Top Rated, In Theaters, Upcoming |
| **TV Shows** | Filterable grid — Popular, Top Rated, On Air, Airing Today |
| **Trending** | Toggle between Today and This Week |
| **Genres** | Browse by category — 22+ genres with emoji icons |
| **Search** | Full results page for any search |
| **Watchlist** | All your saved titles in one place |
| **Detail** | Full info page — cast, trailer, episodes, and similar titles |
| **Watch** | Full-screen video player with episode navigation |

---

## Device Support

### 📱 Mobile
- Fully optimized for all phone sizes — small to large
- Hamburger menu with built-in live search
- Detail pages designed for narrow screens — poster and info side by side
- Touch-friendly buttons always visible without needing to hover
- Cards and grids adapt to fill any screen width

### 💻 Desktop & Tablet
- Clean multi-column layout with horizontal scroll rows
- Hover effects on cards, navigation, and buttons
- Live search dropdown in the navbar

### 📺 Smart TV
- Full **D-PAD remote control** support using arrow keys
- `Enter` to select, `Escape` to go back
- Large focus rings for visibility at distance
- Overscan-safe padding on large screens
- Bigger cards and text scaling on 4K displays

---

## Navigation

The app uses the native HTML5 History API (`history.pushState` and `window.onpopstate`). The browser **← Back** and **→ Forward** buttons navigate naturally without broken views or blank pages.

- **Escape key** on a detail, watch page, or modal closes overlays or returns back
- **Space key** in the YouTube Trailer modal toggles play/pause
- **Arrow keys** navigate between interactive cards seamlessly on desktop and Smart TV D-PAD
- **Enter key** activates focused cards and search submissions

---

## 🚀 Running Locally

To run the application locally with ES module support:

```bash
# Option 1: Using Node & npm
npm start
# or: npx serve . -l 3000

# Option 2: Using Python 3
python -m http.server 3000
```

Then open your browser to `http://localhost:3000/`.

---

---

## 🔌 Integrated APIs & Services

### 1. TMDB (The Movie Database)
- **Metadata & Catalog**: Fetches rich movies and television metadata, seasonal lineups, episodes, actor profiles, full credits/filmographies, and trending algorithms.
- **Image Delivery Pipeline**: Efficient multi-tier asset resolution (posters, backdrops, still stills, and profile photos) through TMDB CDN endpoints.
- **Client Cache & Concurrency Guard**: Embedded 350-item LRU memory cache, concurrency rate limiter (`batchFetch`), and automated retry handlers in `js/api.js`.

### 2. CineSrc Player API
- **High-Performance Playback**: Dynamic stream embedding for movies (`/embed/movie/{id}`) and TV shows (`/embed/tv/{id}?s={season}&e={episode}`).
- **Bidirectional Telemetry**: Real-time postMessage synchronization:
  - `cinesrc:timeupdate` — Throttled watch progress reporting persisted straight to LocalStorage.
  - `cinesrc:nextepisode` — Seamless auto-transition to subsequent series episodes without page reload.
  - `cinesrc:close` — Native handling for in-player exit buttons directly closing overlay modals.

---

## 🛠️ Modular Architecture

- **`index.html`** — Semantic HTML5 shell, container roots, global cinema player/trailer modals, and native ES module bootstrapper.
- **`styles.css`** — Cinema dark design system with obsidian tones (`#07070b`), neon crimson accents (`#e8133a`), frosted glassmorphism, responsive breakpoints, custom scrollbars, and fluid mobile layouts.
- **`js/api.js`** — High-speed TMDB API wrapper featuring 350-item LRU memory caching, request-chunking concurrency controller (`batchFetch`), and rate-limit guard.
- **`js/state.js`** — Pure LocalStorage state management (Watchlist, History, Progress, Notifications, Preferences) with pub/sub event syncing and JSON backup/restore.
- **`js/player.js`** — Embed URL generator for CineSrc playback, postMessage telemetry synchronization, auto next-episode event handling, and player close listener.
- **`js/app.js`** — HTML5 History routing engine, view renderers, carousel drag-scrolling engine, mobile orientation controller, and lifecycle memory cleanup.

---

## 📋 Comprehensive Feature List

- **Episode Chunking**: Breaks large TV seasons (e.g. Doraemon, anime, long-running dramas) into digestible 25-episode horizontal tabs with mouse-wheel and drag support.
- **Player Episode Drawer**: Slide-out drawer with 2-column episode cards, robust fallback title extraction (`ep.name` vs `Episode ${ep.episode_number}`), badge tags, and active playback indicators.
- **Persistent Mobile Orientation Toggle**: Bidirectional landscape <-> portrait button on touch viewports utilizing `screen.orientation.lock()` with CSS 3D fallback and dynamic labels (`📐 Rotate` vs `📱 Portrait`).
- **Kinetic Smooth Drag-to-Scroll**: Physics-based horizontal drag scrolling across all carousels, trending rows, cast cards, and episode chunk bars with momentum inertia decay, drag threshold tolerance (6px), and zero click blockage on normal taps.
- **Audio Leak Prevention**: Absolute destruction of video player & YouTube trailer iframe threads on modal dismissal (`about:blank` + element unmounting + CineSrc pause commands) to eliminate lingering background audio.
- **Strict pushState Guard & Single-Action Back Handler**: Idempotent routing engine prevents duplicate history entries on intra-page adjustments, and `goBack()` resolves directly in a single action without deadlock.
- **Search Auto-Reset**: Automatic clearing of search inputs and dropdowns on navigating to any non-search view.

---

## 📝 Changelog

### v2.4.1 (Latest)
- **Zero-Blockage Carousel Click & Kinetic Drag-to-Scroll**: Removed aggressive pointer-event blockers and premature mousedown grabbing states. Clicks now pass through cleanly to all movie, TV, top 10, cast, and continue-watching cards without converting into drags. Real drags activate smoothly beyond a 6px threshold with friction decay (`velocity *= 0.92`).
- **HTML5 Drag-and-Drop Suppression**: Applied `pointer-events: none` and `-webkit-user-drag: none` to all card images, poster thumbnails, and cast avatars to permanently prevent browser native image drag ghosts from hijacking card click taps.
- **Complete Player Audio Teardown**: Replaced basic `src = ''` clearing with full iframe unmounting (`iframe.remove()`), source destruction (`about:blank`), and CineSrc `pause` postMessage commands on `closePlayer()`, permanently eliminating background audio leaks.
- **Permanent Back Button Loop Elimination**: Added a strict pushState guard preventing identical URL pushes in `routeTo()` and `go()`, removed artificial click debouncing, and ensured modals and sub-views unwind cleanly on the very first tap.
- **Player Drawer Polish**: Fixed missing episode titles with fallback extraction and responsive 2-column pill markup.
- **Persistent Mobile Rotate Toggle**: Bidirectional landscape <-> portrait toggle for touch viewports with dynamic orientation icons.

---

## Credits & Disclaimer

**Movie & TV data** provided by [The Movie Database (TMDB)](https://www.themoviedb.org/).  
*This product uses the TMDB API but is not endorsed or certified by TMDB.*

**Video playback** powered by CineSrc.  
All media rights belong to their respective copyright holders.

**Fonts** — Bebas Neue & Outfit via Google Fonts.

---

> BEBU Streaming Zone is built for personal and educational use only.  
> It does not host or distribute any media content.  
> All content rights belong to their respective owners.

---

**BEBU STREAMING ZONE**  
*Premium streaming, crafted with care.*  

Made with ❤️ by Joshua Cambal for my BEBU Alona!