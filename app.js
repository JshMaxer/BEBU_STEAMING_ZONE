// BEBU'S STREAMING ZONE - Full Movie Streaming Platform
// Upgraded with VidKing API integration and streaming capabilities

console.log('App.js loading...');

const TMDB_API_KEY = '34d1a1bd431dc14e9243d534340f360b';
const TMDB_READ_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzNGQxYTFiZDQzMWRjMTRlOTI0M2Q1MzQzNDBmMzYwYiIsIm5iZiI6MTY5Njk5ODg5Mi4wNzksInN1YiI6IjY1MjYyNjExMDcyMTY2NDViNmRhZmU2NyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.dMDHJ8cb6eWhumAkM88nt_cArUkaLkZZbHJi7R4eI0i8';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_URL = 'https://image.tmdb.org/t/p/original';

// VidKing API Configuration
const VIDKING_API_BASE = 'https://vidking.net/api';
const VIDKING_SOURCE_ID = 'vidking';

// VidLink API Configuration (Fallback when Vidking is offline)
const VIDLINK_BASE_URL = 'https://vidlink.pro';
const VIDLINK_SOURCE_ID = 'vidlink';
const VIDLINK_PLAYER_CONFIG = {
  primaryColor: '9D00FF',      // Neon Purple
  secondaryColor: '5B00CC',    // Dark Neon Purple
  icons: 'default',
  iconColor: '9D00FF',         // Neon Purple Icons
  title: true,
  poster: true,
  autoplay: false,
  nextbutton: true
};

// Storage keys
const STORAGE_KEYS = {
  WATCHLIST: 'bebu_watchlist',
  WATCHED: 'bebu_watched',
  PREFERENCES: 'bebu_preferences'
};

// Month to Genre mapping
const MONTH_GENRE_MAP = {
  1: "Science Fiction", 2: "Romance", 3: "Drama", 4: "Fantasy",
  5: "Adventure", 6: "Action", 7: "Comedy", 8: "Thriller",
  9: "Mystery", 10: "Crime", 11: "Horror", 12: "Family"
};

// Month to Genre Reason mapping - NEW
const MONTH_GENRE_REASON_MAP = {
  1: "New year, new tech, new mind-bending realities.",
  2: "Valentine’s season. Cupid’s on payroll.",
  3: "Life’s warming up, emotions defrosting.",
  4: "Spring = bloom, magic, and mythical energy.",
  5: "Outdoorsy feels, let’s go on a wild ride.",
  6: "Global summer movie season = boom, bang, blockbusters.",
  7: "Midyear stress? Nah. Let’s laugh it off.",
  8: "Summer heat + global tension = perfect suspense.",
  9: "Fall kicks in, detective energy activated.",
  10: "Gritty, moody, pre-Halloween edge. Mafia, heists, corruption—yum.",
  11: "Post-Halloween, dark days, perfect for screams.",
  12: "Holidays. All the wholesome chaos + nostalgia."
};


// Helper function to shuffle an array
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Local Storage functions - Complete implementation with all features
const LocalStorage = {
  // --- WATCHLIST MANAGEMENT ---
  getWatchlist: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHLIST) || '[]'),
  
  addToWatchlist: (movie) => {
    const watchlist = LocalStorage.getWatchlist();
    if (!watchlist.find(m => m.id === movie.id)) {
      watchlist.push({
        ...movie,
        addedToWatchlistAt: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
      console.log(`✅ Added "${movie.title}" to watchlist`);
    } else {
      console.log(`ℹ️ "${movie.title}" already in watchlist`);
    }
  },
  
  removeFromWatchlist: (movieId) => {
    const watchlist = LocalStorage.getWatchlist();
    const movie = watchlist.find(m => m.id === movieId);
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist.filter(m => m.id !== movieId)));
    if (movie) console.log(`❌ Removed "${movie.title}" from watchlist`);
  },
  
  isInWatchlist: (movieId) => LocalStorage.getWatchlist().some(m => m.id === movieId),
  
  getWatchlistCount: () => LocalStorage.getWatchlist().length,
  
  clearWatchlist: () => {
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify([]));
    console.log('🧹 Watchlist cleared');
  },

  // --- WATCHED MOVIES TRACKING ---
  getWatched: () => JSON.parse(localStorage.getItem(STORAGE_KEYS.WATCHED) || '[]'),
  
  addToWatched: (movie) => {
    const watched = LocalStorage.getWatched();
    const existing = watched.find(m => m.id === movie.id);
    
    if (existing) {
      // Update the timestamp if already watched
      existing.watchedAt = new Date().toISOString();
      existing.watchCount = (existing.watchCount || 1) + 1;
      console.log(`🔁 Marked "${movie.title}" as watched again (Count: ${existing.watchCount})`);
    } else {
      // Add new watched entry with timestamp
      watched.push({
        ...movie,
        watchedAt: new Date().toISOString(),
        watchCount: 1
      });
      console.log(`✅ Marked "${movie.title}" as watched`);
    }
    
    localStorage.setItem(STORAGE_KEYS.WATCHED, JSON.stringify(watched));
  },
  
  isWatched: (movieId) => LocalStorage.getWatched().some(m => m.id === movieId),
  
  getWatchedCount: () => LocalStorage.getWatched().length,
  
  getWatchedMovie: (movieId) => LocalStorage.getWatched().find(m => m.id === movieId),
  
  getWatchedDetails: (movieId) => {
    const watched = LocalStorage.getWatchedMovie(movieId);
    if (!watched) return null;
    return {
      title: watched.title,
      watchedAt: watched.watchedAt,
      watchCount: watched.watchCount || 1,
      lastWatched: new Date(watched.watchedAt).toLocaleDateString()
    };
  },
  
  clearWatched: () => {
    localStorage.setItem(STORAGE_KEYS.WATCHED, JSON.stringify([]));
    console.log('🧹 Watch history cleared');
  },

  // --- PREFERENCES MANAGEMENT ---
  getPreferences: () => {
    const prefs = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return JSON.parse(prefs || JSON.stringify({
      theme: 'dark',
      autoPlay: true,
      quality: '720p',
      subtitles: false,
      language: 'en'
    }));
  },
  
  setPreference: (key, value) => {
    const prefs = LocalStorage.getPreferences();
    prefs[key] = value;
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
    console.log(`⚙️ Preference "${key}" set to "${value}"`);
  },
  
  getPreference: (key) => LocalStorage.getPreferences()[key],

  // --- STATISTICS & REPORTING ---
  getStatistics: () => {
    const watchlist = LocalStorage.getWatchlist();
    const watched = LocalStorage.getWatched();
    const preferences = LocalStorage.getPreferences();
    
    return {
      watchlistCount: watchlist.length,
      watchedCount: watched.length,
      totalWatchTime: watched.reduce((acc, m) => acc + (m.watchCount || 1), 0),
      preferences: preferences,
      lastWatchedMovie: watched.length > 0 ? watched[watched.length - 1].title : null,
      lastWatchedDate: watched.length > 0 ? new Date(watched[watched.length - 1].watchedAt).toLocaleDateString() : null
    };
  },
  
  printStatistics: () => {
    const stats = LocalStorage.getStatistics();
    console.log('📊 BEBU\'S STREAMING ZONE - Statistics:');
    console.log(`  📺 Movies in Watchlist: ${stats.watchlistCount}`);
    console.log(`  ✅ Movies Watched: ${stats.watchedCount}`);
    console.log(`  🎬 Total Watch Count: ${stats.totalWatchTime}`);
    console.log(`  🎯 Last Watched: ${stats.lastWatchedMovie} (${stats.lastWatchedDate})`);
  },

  // --- DEBUGGING & MAINTENANCE ---
  exportData: () => {
    const data = {
      watchlist: LocalStorage.getWatchlist(),
      watched: LocalStorage.getWatched(),
      preferences: LocalStorage.getPreferences(),
      exportedAt: new Date().toISOString()
    };
    console.log('📤 Exported Data:', data);
    return data;
  },
  
  clearAllData: () => {
    if (confirm('⚠️ This will delete ALL your data (Watchlist, Watch History, Preferences). Continue?')) {
      LocalStorage.clearWatchlist();
      LocalStorage.clearWatched();
      localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
      console.log('🧹 All data cleared!');
      window.location.reload();
    }
  }
};

// --- API Calls ---
const tmdbHeaders = {
  'Authorization': `Bearer ${TMDB_READ_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
};

// Check if VidKing is online
const isVidkingOnline = async () => {
  try {
    const response = await fetch('https://www.vidking.net', {
      method: 'HEAD',
      mode: 'no-cors'
    });
    return true;
  } catch (err) {
    console.warn('VidKing appears to be offline:', err.message);
    return false;
  }
};

// Build VidLink embed URL with customization parameters
const buildVidLinkUrl = (tmdbId, customParams = {}) => {
  const params = { ...VIDLINK_PLAYER_CONFIG, ...customParams };
  let url = `${VIDLINK_BASE_URL}/movie/${tmdbId}`;
  
  const queryParams = [];
  queryParams.push(`primaryColor=${params.primaryColor}`);
  queryParams.push(`secondaryColor=${params.secondaryColor}`);
  queryParams.push(`icons=${params.icons}`);
  queryParams.push(`iconColor=${params.iconColor}`);
  queryParams.push(`title=${params.title}`);
  queryParams.push(`poster=${params.poster}`);
  queryParams.push(`autoplay=${params.autoplay}`);
  queryParams.push(`nextbutton=${params.nextbutton}`);
  
  return url + '?' + queryParams.join('&');
};

// Add VidLink progress tracking listener
const initVidLinkProgressTracking = () => {
  window.addEventListener('message', (event) => {
    if (event.origin !== 'https://vidlink.pro') return;
    
    if (event.data?.type === 'MEDIA_DATA') {
      const mediaData = event.data.data;
      localStorage.setItem('vidLinkProgress', JSON.stringify(mediaData));
      console.log('VidLink progress saved:', mediaData);
    }
    
    if (event.data?.type === 'PLAYER_EVENT') {
      const { event: eventType, currentTime, duration } = event.data.data;
      console.log(`VidLink Player ${eventType} at ${currentTime}s of ${duration}s`);
    }
  });
};

// Initialize VidLink tracking on app load
initVidLinkProgressTracking();

const fetchGenresApi = async () => {
  const response = await fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`, {
    headers: tmdbHeaders,
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data.genres;
};

// Modified fetchMoviesApi to correctly handle startYear/endYear for 'upcoming'
// Now always returns data.results for consistency
const fetchMoviesApi = async (type, genreId, startYear, endYear, page = 1) => {
  let apiUrl = '';
  let yearQueryParam = '';

  // Only apply year range if not 'upcoming' type
  if (type !== 'upcoming' && startYear && endYear) {
      yearQueryParam = `&primary_release_date.gte=${startYear}-01-01&primary_release_date.lte=${endYear}-12-31`;
  } else if (type !== 'upcoming' && startYear) {
      yearQueryParam = `&primary_release_date.gte=${startYear}-01-01`;
  } else if (type !== 'upcoming' && endYear) {
      yearQueryParam = `&primary_release_date.lte=${endYear}-12-31`;
  }

  if (type === 'upcoming') {
    const today = new Date();
    const yearToday = today.getFullYear();
    const monthToday = String(today.getMonth() + 1).padStart(2, '0');
    const dayToday = String(today.getDate()).padStart(2, '0');
    const formattedToday = `${yearToday}-${monthToday}-${dayToday}`;

    // For upcoming, we only care about release date from today onwards.
    // yearQueryParam is intentionally NOT included here for 'upcoming'
    apiUrl = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&primary_release_date.gte=${formattedToday}&page=${page}`;
  } else if (type === 'genre' || type === 'monthly') {
    if (!genreId) {
        throw new Error('Genre ID is required for genre or monthly movie types.');
    }
    
    // Fetch a single page with many results
    apiUrl = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}${yearQueryParam}`;
  } else {
    throw new Error('Invalid movie type specified.');
  }

  const response = await fetch(apiUrl, { headers: tmdbHeaders });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data; // Return full data object with results and total_pages
};

// Get streaming sources with VidLink as primary - INTEGRATED WITH TMDB
const getStreamingSources = async (movieTitle, movieYear, tmdbId) => {
  try {
    // Check if TMDB ID is available
    if (!tmdbId) {
      console.warn('No TMDB ID provided, cannot generate streaming embeds');
      return {
        sources: [],
        external: [
          { name: 'IMDb', url: `https://www.imdb.com/find?q=${encodeURIComponent(movieTitle)}` },
          { name: 'JustWatch', url: `https://www.justwatch.com/search?q=${encodeURIComponent(movieTitle)}` },
        ]
      };
    }

    // Generate VidLink embed URL as primary
    const vidlinkEmbedUrl = buildVidLinkUrl(tmdbId);
    
    // Generate VidKing embed URL with TMDB ID
    const vidkingEmbedUrl = `https://www.vidking.net/embed/movie/${tmdbId}`;
    const vidkingEmbedUrlWithFeatures = `https://www.vidking.net/embed/movie/${tmdbId}?color=9146ff&autoPlay=false`;

    // Check if VidKing is online
    const vidkingOnline = await isVidkingOnline();
    
    const streamingData = {
      sources: [],
      external: []
    };

    // Add VidLink as primary source
    streamingData.sources.push({
      name: 'VidLink 1080p',
      url: vidlinkEmbedUrl,
      embedUrl: vidlinkEmbedUrl,
      quality: '1080p',
      type: 'iframe',
      tmdbId: tmdbId,
      provider: 'vidlink'
    });
    
    // Add VidKing as backup (if online)
    if (vidkingOnline) {
      streamingData.sources.push({
        name: 'VidKing 1080p (Backup)',
        url: vidkingEmbedUrl,
        embedUrl: vidkingEmbedUrlWithFeatures,
        quality: '1080p',
        type: 'iframe',
        tmdbId: tmdbId,
        provider: 'vidking',
        isBackup: true
      });
      
      console.log('✅ VidLink is primary, VidKing available as backup');
    } else {
      console.log('✅ VidLink is primary, VidKing is offline');
    }

    streamingData.external = [
      { name: 'IMDb', url: `https://www.imdb.com/find?q=${encodeURIComponent(movieTitle)}` },
      { name: 'JustWatch', url: `https://www.justwatch.com/search?q=${encodeURIComponent(movieTitle)}` },
      { name: 'VidKing Search', url: `https://www.vidking.net/?s=${encodeURIComponent(movieTitle)}` }
    ];

    console.log('Streaming sources generated:', streamingData);
    return streamingData;
  } catch (err) {
    console.error('Error creating streaming sources:', err);
    
    // Return fallback with direct links
    return {
      sources: [],
      external: [
        { name: 'IMDb', url: `https://www.imdb.com/find?q=${encodeURIComponent(movieTitle)}` },
        { name: 'JustWatch', url: `https://www.justwatch.com/search?q=${encodeURIComponent(movieTitle)}` }
      ]
    };
  }
};

// --- Components ---
// Enhanced MovieCard with streaming features
const MovieCard = ({ movie, onPlay, onAddToWatchlist, isInWatchlist, isWatched, compact = false }) => {
  const watchedDetails = isWatched ? LocalStorage.getWatchedDetails(movie.id) : null;
  
  // Compact view for watchlist
  if (compact) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-purple-500/40 border border-gray-700 relative">
        <div className="relative group cursor-pointer">
          <img
            src={movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : `https://placehold.co/500x750/333333/FFFFFF?text=No+Image`}
            alt={movie.title}
            className="w-full h-64 object-cover object-center rounded-t-xl"
            onClick={() => onPlay(movie)}
            onError={(e) => { e.target.src = `https://placehold.co/500x750/333333/FFFFFF?text=No+Image`; }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-t-xl">
            <button
              onClick={() => onPlay(movie)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110"
            >
              <i className="fas fa-play mr-2"></i> Watch
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <h2 className="text-lg font-bold text-purple-300 mb-3">{movie.title}</h2>
          <button
            onClick={() => onAddToWatchlist(movie)}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition-all transform duration-300 hover:scale-105 flex items-center justify-center"
            title="Remove from watchlist"
          >
            <i className="fas fa-trash mr-2"></i> Remove
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-purple-500/40 border border-gray-700 relative flex flex-col h-full">
      <div className="relative group flex-shrink-0">
        <img
          src={movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : `https://placehold.co/500x750/333333/FFFFFF?text=No+Image`}
          alt={movie.title}
          className="w-full h-64 object-cover object-center rounded-t-xl"
          onError={(e) => { e.target.src = `https://placehold.co/500x750/333333/FFFFFF?text=No+Image`; }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-t-xl">
          <button
            onClick={() => onPlay(movie)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110"
          >
            <i className="fas fa-play mr-2"></i> Play Now
          </button>
        </div>
        
        {/* Watched Status Badge with Timestamp */}
        {isWatched && watchedDetails && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-lg hover:bg-green-600 transition-colors cursor-help" title={`Watched on ${watchedDetails.lastWatched}\nWatch count: ${watchedDetails.watchCount}`}>
            <div className="flex items-center gap-1">
              <i className="fas fa-check"></i>
              <span>Watched</span>
            </div>
            <div className="text-xs opacity-90 mt-1">
              {watchedDetails.watchCount > 1 && `(${watchedDetails.watchCount}x)`}
            </div>
          </div>
        )}
        
        {/* In Watchlist Indicator */}
        {isInWatchlist && !isWatched && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            <i className="fas fa-bookmark mr-1"></i> Saved
          </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h2 className="text-2xl font-bold text-purple-300 mb-2 line-clamp-2">{movie.title}</h2>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">{movie.overview}</p>
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <span className="text-yellow-400 font-semibold text-lg flex items-center">
            <i className="fas fa-star mr-1"></i>
            {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'} / 10
          </span>
          <span className="text-gray-400 text-sm">{movie.release_date || 'N/A'}</span>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onPlay(movie)}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105"
          >
            <i className="fas fa-play mr-2"></i> Watch
          </button>
          <button
            onClick={() => onAddToWatchlist(movie)}
            className={`px-4 py-2 rounded-lg font-bold transition-all transform duration-300 hover:scale-110 ${
              isInWatchlist
                ? 'bg-pink-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
            title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <i className={`${isInWatchlist ? 'fas' : 'far'} fa-heart`}></i>
          </button>
        </div>
      </div>
    </div>
  );
};

// Video Player Component - INTEGRATED WITH VIDKING & VIDLINK
const VideoPlayer = ({ movie, onClose, onMarkAsWatched, onAddToWatchlist, isInWatchlist }) => {
  const { useState, useEffect, useRef } = React;
  const videoRef = useRef(null);
  const [streamingSources, setStreamingSources] = useState(null);
  const [selectedSource, setSelectedSource] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState('auto'); // 'auto', 'vidking', 'vidlink'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initPlayer = async () => {
      setLoading(true);
      const sources = await getStreamingSources(
        movie.title, 
        movie.release_date?.split('-')[0],
        movie.id
      );
      setStreamingSources(sources);
      setSelectedSource(0);
      setLoading(false);
      console.log('Streaming sources loaded:', sources);
    };

    initPlayer();
  }, [movie]);

  // Prevent background page from scrolling while the floating movie page is open
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow || '';
    };
  }, []);

  // Get the appropriate source based on provider selection
  const getSourcesByProvider = () => {
    if (!streamingSources || !streamingSources.sources) return [];
    
    if (selectedProvider === 'auto') {
      // Return all sources (automatic or first available)
      return streamingSources.sources;
    } else if (selectedProvider === 'vidking') {
      // Return only VidKing sources
      return streamingSources.sources.filter(s => s.provider === 'vidking' || s.name.includes('VidKing'));
    } else if (selectedProvider === 'vidlink') {
      // Return only VidLink sources
      return streamingSources.sources.filter(s => s.provider === 'vidlink' || s.name.includes('VidLink'));
    }
    return streamingSources.sources;
  };

  const availableSources = getSourcesByProvider();
  const currentSource = availableSources.length > 0 ? availableSources[Math.min(selectedSource, availableSources.length - 1)] : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="w-full max-w-7xl max-h-[95vh] md:max-h-[92vh] relative flex flex-col">
        <button
          onClick={onClose}
          className="absolute -top-8 md:-top-10 right-0 text-white font-bold text-xl md:text-2xl hover:text-purple-400 transition-colors z-10"
        >
          <i className="fas fa-times"></i>
        </button>
        
        {/* Scrollable container for floating page effect */}
        <div className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-y-auto overflow-x-hidden h-full">
          {/* Content wrapper - full width */}
          <div className="w-full max-w-full">
              {/* Video Player Area - Bigger on PC, Floating Look */}
              <div 
                className="relative bg-black mx-2 md:mx-4 my-2 md:my-4 rounded-lg overflow-hidden" 
                style={{ 
                  height: window.innerWidth >= 1024 ? '800px' : window.innerWidth >= 768 ? '700px' : '220px',
                  boxShadow: '0 0 30px rgba(168, 85, 247, 0.4)',
                  maxWidth: '100%'
                }}
              >
                <div className="w-full h-full">
                  {loading ? (
                    <div className="text-center h-full flex items-center justify-center">
                      <div>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                        <p className="text-gray-300">Loading player...</p>
                      </div>
                    </div>
                  ) : currentSource ? (
                    <div className="w-full h-full">
                      {/* Provider Iframe Embed */}
                      <iframe
                        key={`${currentSource.provider}-${selectedSource}`}
                        src={currentSource.embedUrl || currentSource.url}
                        width="100%"
                        height="100%"
                        frameBorder="0"   
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        style={{ display: 'block' }}
                        onError={(e) => console.error('iframe error:', e)}
                      ></iframe>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 p-8 h-full flex items-center justify-center">
                      <div>
                        <i className="fas fa-exclamation-triangle text-3xl mb-4 block text-yellow-500"></i>
                        <p>No streaming sources found for this movie.</p>
                        <p className="text-sm mt-2">Use the links below to search for it on other platforms.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Movie Info Section - Responsive Layout, Now part of scrollable content */}
              <div className="p-3 md:p-6 bg-gray-800">
                {/* Title and Info with Poster */}
                <div className="mb-6">
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    {/* Small Poster - Desktop only, on the left */}
                    <div className="hidden md:block flex-shrink-0">
                      <img
                        src={movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : `https://placehold.co/150x225/333333/FFFFFF?text=${encodeURIComponent(movie.title)}`}
                        alt={movie.title}
                        className="rounded-lg shadow-lg border border-purple-500"
                        style={{ width: '150px', height: 'auto', boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)' }}
                      />
                    </div>
                    
                    {/* Title and Description Section */}
                    <div className="flex-1">
                      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{movie.title}</h1>
                      <p className="text-gray-400 text-xs md:text-sm mb-4">Year: {movie.release_date?.split('-')[0]}</p>
                      
                      {/* Description - Now next to poster */}
                      <div className="hidden md:block">
                        <h3 className="text-sm md:text-lg font-bold text-purple-300 mb-2">About:</h3>
                        <p className="text-gray-300 text-xs md:text-base leading-relaxed">{movie.overview || 'No description available.'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description for mobile - below poster area */}
                  <div className="md:hidden mb-4">
                    <h3 className="text-sm font-bold text-purple-300 mb-2">About:</h3>
                    <p className="text-gray-300 text-xs leading-relaxed">{movie.overview || 'No description available.'}</p>
                  </div>
              
              {/* Quick Info - Compact on mobile */}
              <div className="flex flex-wrap gap-2 md:gap-3 mb-4">
                <div className="bg-gray-700 px-3 py-2 rounded text-center text-xs md:text-sm">
                  <p className="text-yellow-400 font-bold">{movie.vote_average?.toFixed(1)}</p>
                  <p className="text-gray-400 text-xs">IMDB</p>
                </div>
                <div className="bg-gray-700 px-3 py-2 rounded text-center text-xs md:text-sm">
                  <p className="text-white font-bold">{movie.release_date}</p>
                  <p className="text-gray-400 text-xs">Release</p>
                </div>
                <div className="bg-gray-700 px-3 py-2 rounded text-center text-xs md:text-sm">
                  <p className="text-white font-bold">{(movie.original_language || 'EN').toUpperCase()}</p>
                  <p className="text-gray-400 text-xs">Lang</p>
                </div>
              </div>

                </div>

            {/* Streaming Provider Selection */}
            {streamingSources && streamingSources.sources && streamingSources.sources.length > 0 && (
              <div className="mb-4 p-4 bg-gray-700 rounded-lg border border-purple-500 shadow-lg">
                <h3 className="text-sm font-bold text-purple-300 mb-3">🎬 Choose Streaming Provider:</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {/* Auto Select Button */}
                  <button
                    onClick={() => {
                      setSelectedProvider('auto');
                      setSelectedSource(0);
                    }}
                    className={`font-bold py-2 px-4 text-sm rounded-lg transition-all transform duration-300 hover:scale-105 flex items-center gap-2 ${
                      selectedProvider === 'auto'
                        ? 'bg-purple-600 text-white shadow-lg border border-purple-400'
                        : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                    }`}
                  >
                    <i className="fas fa-magic"></i> Auto
                  </button>
                  
                  {/* VidKing Button */}
                  {streamingSources.sources.some(s => s.provider === 'vidking' || s.name.includes('VidKing')) && (
                    <button
                      onClick={() => {
                        setSelectedProvider('vidking');
                        setSelectedSource(0);
                      }}
                      className={`font-bold py-2 px-4 text-sm rounded-lg transition-all transform duration-300 hover:scale-105 flex items-center gap-2 ${
                        selectedProvider === 'vidking'
                          ? 'bg-blue-600 text-white shadow-lg border border-blue-400'
                          : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                      }`}
                    >
                      <i className="fas fa-crown"></i> VidKing
                    </button>
                  )}
                  
                  {/* VidLink Button */}
                  {streamingSources.sources.some(s => s.provider === 'vidlink' || s.name.includes('VidLink')) && (
                    <button
                      onClick={() => {
                        setSelectedProvider('vidlink');
                        setSelectedSource(0);
                      }}
                      className={`font-bold py-2 px-4 text-sm rounded-lg transition-all transform duration-300 hover:scale-105 flex items-center gap-2 ${
                        selectedProvider === 'vidlink'
                          ? 'bg-purple-600 text-white shadow-lg border border-purple-400'
                          : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                      }`}
                    >
                      <i className="fas fa-link"></i> VidLink
                    </button>
                  )}
                </div>

                              </div>
            )}

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => {
                      onMarkAsWatched();
                      setTimeout(() => onClose(), 500);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-all transform duration-300 hover:scale-105 flex items-center"
                  >
                    <i className="fas fa-check mr-2"></i> Mark as Watched & Close
                  </button>
                  <button
                    onClick={() => onAddToWatchlist(movie)}
                    className={`font-bold py-2 px-6 rounded-lg transition-all transform duration-300 hover:scale-105 flex items-center ${
                      isInWatchlist
                        ? 'bg-pink-600 hover:bg-pink-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <i className={`${isInWatchlist ? 'fas' : 'far'} fa-heart mr-2`}></i> {isInWatchlist ? 'Remove' : 'Add to Favorites'}
                  </button>
                  <button
                    onClick={onClose}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg transition-all transform duration-300 hover:scale-105 flex items-center"
                  >
                    <i className="fas fa-times mr-2"></i> Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

// Navigation Component
const Navigation = ({ currentView, onViewChange, watchlistCount, onSearch, onWatchlist }) => {
  const { useState } = React;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-40 flex flex-col items-end gap-3">
      {/* Browse Button */}
      {isExpanded && (
        <button
          onClick={() => {
            onViewChange('browse');
            setIsExpanded(false);
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 flex items-center gap-2 whitespace-nowrap"
        >
          <i className="fas fa-film"></i> Browse
        </button>
      )}

      {/* Watchlist Button */}
      {isExpanded && (
        <button
          onClick={onWatchlist}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 flex items-center gap-2 whitespace-nowrap relative"
        >
          <i className="fas fa-heart"></i> Watchlist
          {watchlistCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              {watchlistCount}
            </span>
          )}
        </button>
      )}

      {/* Search Button */}
      {isExpanded && (
        <button
          onClick={onSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 flex items-center gap-2 whitespace-nowrap"
        >
          <i className="fas fa-search"></i> Search
        </button>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-4 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 w-16 h-16 flex items-center justify-center text-2xl"
        title="Toggle menu"
      >
        <i className={`fas fa-${isExpanded ? 'times' : 'bars'} transition-transform duration-300`}></i>
      </button>
    </div>
  );
};

// Search Modal Component
const SearchModal = ({ isOpen, onClose, onSearch }) => {
  const { useState } = React;
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (term) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(term)}&page=1`,
        { headers: tmdbHeaders }
      );
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 overflow-hidden p-4">
      <div className="w-full max-w-6xl mx-auto h-full flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-0 right-0 text-white font-bold text-3xl hover:text-purple-400 transition-colors z-20"
        >
          <i className="fas fa-times"></i>
        </button>
        
        <div className="p-6 flex-shrink-0 border-b border-gray-700">
          <h2 className="text-3xl font-bold mb-6">Search Movies</h2>
          
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleSearch(e.target.value);
              }}
              placeholder="Search movies, shows, actors..."
              className="w-full px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
              autoFocus
            />
            <i className="fas fa-search absolute right-4 top-4 text-gray-500 text-xl"></i>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <p className="text-gray-400 text-center">Searching...</p>
          )}

          {results.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {results.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => {
                    onSearch(movie);
                    onClose();
                  }}
                  className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-purple-500/40"
                >
                  <img
                    src={movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : `https://placehold.co/300x450/333333/FFFFFF?text=No+Image`}
                    alt={movie.title}
                    className="w-full h-48 object-cover"
                />
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-white truncate">{movie.title}</h3>
                    <p className="text-xs text-yellow-400">{movie.vote_average?.toFixed(1)} ⭐</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchTerm && results.length === 0 && !loading && (
            <p className="text-center text-gray-400">No movies found. Try another search!</p>
          )}

          {!searchTerm && (
            <p className="text-center text-gray-400 text-lg">Start typing to search for movies...</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Watchlist Modal Component
const WatchlistModal = ({ isOpen, onClose, watchlist, onPlay, onAddToWatchlist }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 overflow-hidden p-4">
      <div className="w-full max-w-6xl mx-auto h-full flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-0 right-0 text-white font-bold text-3xl hover:text-purple-400 transition-colors z-20"
        >
          <i className="fas fa-times"></i>
        </button>
        
        <div className="p-6 flex-shrink-0 border-b border-gray-700">
          <h2 className="text-3xl font-bold">My Watchlist</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {watchlist.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {watchlist.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onPlay={onPlay}
                  onAddToWatchlist={onAddToWatchlist}
                  isInWatchlist={true}
                  isWatched={LocalStorage.isWatched(movie.id)}
                  compact={true}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 text-lg">No movies in your watchlist. Start adding some!</p>
          )}
        </div>
      </div>
    </div>
  );
};

const GenreSelector = ({ genres, selectedMovieType, selectedGenreId, onGenreChange, loading, error }) => {
  return (
    <div>
      <label htmlFor="genre-select" className="block text-lg font-medium text-gray-300 mb-2 text-center">
        Choose Your Vibe:
      </label>
      <select
        id="genre-select"
        className="block w-full p-3 border border-gray-600 rounded-lg shadow-md bg-gray-700 text-white focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ease-in-out"
        value={selectedMovieType === 'monthly' ? 'monthly-genre-selection' : (selectedMovieType === 'upcoming' ? 'upcoming-movies' : selectedGenreId)}
        onChange={onGenreChange}
        disabled={loading || error}
      >
        <option value="">Select a Genre</option>
        <option value="monthly-genre-selection">Based on Month</option>
        <option value="upcoming-movies">Upcoming</option>
        {genres.map((genre) => (
          <option key={genre.id} value={genre.id}>
            {genre.name}
          </option>
        ))}
      </select>
    </div>
  );
};

// --- Main App Component ---
const App = () => {
  const { useState, useEffect } = React;

  const [genres, setGenres] = useState([]);
  const [selectedGenreId, setSelectedGenreId] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startYear, setStartYear] = useState(1920);
  const [endYear, setEndYear] = useState(new Date().getFullYear());
  const [selectedMovieType, setSelectedMovieType] = useState('monthly');
  const [currentView, setCurrentView] = useState('browse');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [watchlist, setWatchlist] = useState(LocalStorage.getWatchlist());
  const [watched, setWatched] = useState(LocalStorage.getWatched());
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [moviesToShow, setMoviesToShow] = useState(60);
  const [allFetchedMovies, setAllFetchedMovies] = useState([]);
  const [currentFetchPage, setCurrentFetchPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const currentMonthNum = new Date().getMonth() + 1;
  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' });
  const currentMonthGenreName = MONTH_GENRE_MAP[currentMonthNum];
  const currentMonthGenreReason = MONTH_GENRE_REASON_MAP[currentMonthNum];

  const minPossibleYear = 1920;
  const maxPossibleYear = new Date().getFullYear();

  const getMovies = async (type, genreId, currentStartYear, currentEndYear, page = 1) => {
    setLoading(true);
    setError(null);
    setMovies([]);
    setMoviesToShow(60);
    setCurrentFetchPage(1);
    setIsLoadingMore(false);

    try {
      // For initial load, fetch the first batch of pages
      const pages = [1, 2, 3, 4, 5];
      const allMoviesList = [];

      for (const p of pages) {
        const data = await fetchMoviesApi(type, genreId, currentStartYear, currentEndYear, p);
        if (data.results) {
          allMoviesList.push(...data.results);
        }
      }

      let sorted = [];
      if (type === 'upcoming') {
        sorted = allMoviesList.sort((a, b) => 
          new Date(a.release_date) - new Date(b.release_date)
        );
      } else {
        sorted = allMoviesList.sort((a, b) => {
          const popularityDiff = (b.popularity || 0) - (a.popularity || 0);
          return popularityDiff !== 0 ? popularityDiff : (b.vote_average || 0) - (a.vote_average || 0);
        });
      }

      // Remove duplicates
      const uniqueMovies = Array.from(new Map(sorted.map(movie => [movie.id, movie])).values());
      setAllFetchedMovies(uniqueMovies);
      setMovies(uniqueMovies.slice(0, 60));
      setCurrentFetchPage(6); // Next page to fetch
    } catch (err) {
      console.error("Failed to fetch movies:", err);
      setError("Failed to fetch movies. Try again or check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    
    try {
      // Fetch the next 5 pages
      const moviesToFetch = [];
      const pagesToFetch = [currentFetchPage, currentFetchPage + 1, currentFetchPage + 2, currentFetchPage + 3, currentFetchPage + 4];

      for (const p of pagesToFetch) {
        const data = await fetchMoviesApi(selectedMovieType, selectedGenreId, startYear, endYear, p);
        if (data.results) {
          moviesToFetch.push(...data.results);
        }
      }

      // Add new movies to existing list
      const combined = [...allFetchedMovies, ...moviesToFetch];
      const uniqueMovies = Array.from(new Map(combined.map(movie => [movie.id, movie])).values());
      
      setAllFetchedMovies(uniqueMovies);
      const newCount = moviesToShow + 60;
      setMoviesToShow(newCount);
      setMovies(uniqueMovies.slice(0, newCount));
      setCurrentFetchPage(currentFetchPage + 5);
    } catch (err) {
      console.error("Failed to load more movies:", err);
      setError("Failed to load more movies. Try again.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const fetchedGenres = await fetchGenresApi();
        setGenres(fetchedGenres);

        const monthlyGenreName = MONTH_GENRE_MAP[currentMonthNum];
        const monthlyGenre = fetchedGenres.find(g => g.name === monthlyGenreName);

        if (monthlyGenre) {
          setSelectedGenreId(monthlyGenre.id);
          setSelectedMovieType('monthly');
          getMovies('monthly', monthlyGenre.id, startYear, endYear);
        }
      } catch (err) {
        console.error("Failed to fetch genres:", err);
        setError("Failed to load genres. Please check your API key/token.");
      }
    };

    initializeApp();
  }, []);

  // Handle scroll to show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenreChange = (genreId) => {
    setSelectedGenreId(genreId);
    setSelectedMovieType('genre');
    getMovies('genre', genreId, startYear, endYear, 1);
  };

  const handlePlayMovie = (movie) => {
    setSelectedMovie(movie);
    setShowWatchlistModal(false);
    setShowSearchModal(false);
  };

  const handleAddToWatchlist = (movie) => {
    if (LocalStorage.isInWatchlist(movie.id)) {
      LocalStorage.removeFromWatchlist(movie.id);
      setWatchlist(LocalStorage.getWatchlist());
    } else {
      LocalStorage.addToWatchlist(movie);
      setWatchlist(LocalStorage.getWatchlist());
    }
  };

  const handleMarkAsWatched = (movie) => {
    LocalStorage.addToWatched(movie);
    setWatched(LocalStorage.getWatched());
    // Remove from watchlist when marked as watched
    if (LocalStorage.isInWatchlist(movie.id)) {
      LocalStorage.removeFromWatchlist(movie.id);
      setWatchlist(LocalStorage.getWatchlist());
    }
  };

  const handleSearchResult = (movie) => {
    setSelectedMovie(movie);
    setCurrentView('browse');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white" style={{ backgroundImage: 'url(BG.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      {/* Hero Section with Overlay */}
      <div className="relative bg-black bg-opacity-40 flex items-center justify-center border-b-4 border-purple-600 p-4" style={{ minHeight: 'fit-content' }}>
        <div className="w-full border-4 border-purple-500 rounded-2xl p-8 md:p-12 bg-black bg-opacity-60 backdrop-blur-sm shadow-2xl" style={{ boxShadow: '0 0 40px rgba(168, 85, 247, 0.6), inset 0 0 20px rgba(168, 85, 247, 0.2)' }}>
          {/* Logo and Tagline */}
          <div className="text-center mb-8 pb-8 border-b-2 border-purple-500">
            <img src="Logo no BG.png" alt="BEBU's Logo" className="h-40 md:h-56 mx-auto mb-6 drop-shadow-2xl" />
            <p className="text-gray-300 text-lg md:text-2xl font-light leading-relaxed">
              Your Ultimate Movie Experience - Discover, Watch & Manage Your Collection
            </p>
          </div>

          {/* December's Pick and Genres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Side - December's Pick */}
            <div>
              <h2 className="text-3xl font-bold mb-2">{currentMonthName}'s Pick: {currentMonthGenreName}</h2>
              <p className="text-gray-400 text-lg italic">"{currentMonthGenreReason}"</p>
            </div>

            {/* Right Side - Genre Buttons */}
            <div className="flex flex-wrap gap-2 items-start content-start">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreChange(genre.id)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all transform duration-300 hover:scale-110 ${
                    selectedGenreId === genre.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        watchlistCount={watchlist.length}
        onSearch={() => setShowSearchModal(true)}
        onWatchlist={() => setShowWatchlistModal(true)}
      />

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 left-8 z-40 bg-purple-600 hover:bg-purple-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
          title="Back to top"
        >
          <i className="fas fa-arrow-up text-xl"></i>
        </button>
      )}

      {selectedMovie && (
        <VideoPlayer
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onMarkAsWatched={() => {
            handleMarkAsWatched(selectedMovie);
            setSelectedMovie(null);
          }}
          onAddToWatchlist={handleAddToWatchlist}
          isInWatchlist={LocalStorage.isInWatchlist(selectedMovie.id)}
        />
      )}

      <WatchlistModal
        isOpen={showWatchlistModal}
        onClose={() => setShowWatchlistModal(false)}
        watchlist={watchlist}
        onPlay={handlePlayMovie}
        onAddToWatchlist={handleAddToWatchlist}
      />

      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={handleSearchResult}
      />

      <main className="p-4 sm:p-8 w-full">
        <div className="w-full">

          {loading && (
            <p className="text-center text-purple-300 text-xl animate-pulse">Loading movies...</p>
          )}

          {error && (
            <p className="text-center text-red-500 text-lg bg-red-900 bg-opacity-30 rounded-lg p-4 border border-red-700">
              {error}
            </p>
          )}

          {!loading && !error && movies.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
                {movies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onPlay={handlePlayMovie}
                    onAddToWatchlist={handleAddToWatchlist}
                    isInWatchlist={LocalStorage.isInWatchlist(movie.id)}
                    isWatched={LocalStorage.isWatched(movie.id)}
                  />
                ))}
              </div>

              {true && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className={`px-8 py-3 font-bold rounded-lg transition-all duration-300 text-lg ${
                      isLoadingMore
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {isLoadingMore ? 'Loading...' : 'Load More Movies'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="mt-12 p-8 text-center text-gray-500 text-sm border-t border-gray-800">
        <p className="mb-2">BEBU'S STREAMING ZONE - Your Ultimate Movie Experience</p>
        <p>Powered by TMDB API | Integrated with VidKing Streaming Services</p>
        <p className="mt-4">Created by JshMaxer. All rights reserved.</p>
      </footer>
    </div>
  );
};

// Render the App
console.log('Attempting to render React app...');
console.log('React:', window.React);
console.log('ReactDOM:', window.ReactDOM);
console.log('Root element:', document.getElementById('root'));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
console.log('React app rendered successfully!');
