# 🎬 VidKing API Integration Guide

## Quick Integration Setup

This guide walks you through integrating the **VidKing streaming API** with your BEBU'S STREAMING ZONE platform.

---

## Step 1: Get VidKing API Credentials

1. Visit [VidKing.net](https://www.vidking.net/#documentation)
2. Sign up for a developer account
3. Generate API keys from the dashboard
4. Note your:
   - API Key/Token
   - API Secret (if applicable)
   - Base API URL

---

## Step 2: Update app.js with VidKing Configuration

Add your credentials to the top of `app.js`:

```javascript
// VidKing API Configuration
const VIDKING_API_BASE = 'https://api.vidking.net/v1'; // Update with actual endpoint
const VIDKING_API_KEY = 'your-vidking-api-key-here';
const VIDKING_SOURCE_ID = 'vidking';
```

---

## Step 3: Implement getStreamingSources Function

Replace the mock implementation with actual VidKing API calls:

```javascript
const getStreamingSources = async (movieTitle, movieYear) => {
  try {
    // Search VidKing for the movie
    const searchResponse = await fetch(
      `${VIDKING_API_BASE}/search?q=${encodeURIComponent(movieTitle)}&year=${movieYear}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${VIDKING_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!searchResponse.ok) {
      throw new Error(`VidKing search failed: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.results || searchData.results.length === 0) {
      console.log(`No streaming sources found for ${movieTitle}`);
      return {
        sources: [],
        external: [
          { name: 'JustWatch', url: `https://www.justwatch.com/search?q=${encodeURIComponent(movieTitle)}` },
          { name: 'IMDb', url: `https://www.imdb.com/find?q=${encodeURIComponent(movieTitle)}` }
        ]
      };
    }

    const movie = searchData.results[0];
    const movieId = movie.id;

    // Get streaming sources for this movie
    const sourcesResponse = await fetch(
      `${VIDKING_API_BASE}/movies/${movieId}/sources`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${VIDKING_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!sourcesResponse.ok) {
      throw new Error(`Failed to fetch streaming sources: ${sourcesResponse.status}`);
    }

    const sourcesData = await sourcesResponse.json();
    
    // Format sources for the player
    const formattedSources = sourcesData.sources.map(source => ({
      name: source.provider,
      url: source.stream_url,
      quality: source.quality || '720p',
      type: source.format || 'hls',
      region: source.region || 'global'
    }));

    return {
      sources: formattedSources,
      external: [
        { 
          name: 'VidKing', 
          url: `https://vidking.net/movie/${movieId}` 
        },
        { 
          name: 'JustWatch', 
          url: `https://www.justwatch.com/search?q=${encodeURIComponent(movieTitle)}` 
        },
        { 
          name: 'IMDb', 
          url: `https://www.imdb.com/find?q=${encodeURIComponent(movieTitle)}` 
        }
      ]
    };

  } catch (err) {
    console.error('Error fetching streaming sources:', err);
    return {
      sources: [],
      external: [
        { name: 'JustWatch', url: `https://www.justwatch.com/search?q=${encodeURIComponent(movieTitle)}` }
      ]
    };
  }
};
```

---

## Step 4: Update Video Player to Use Streaming Sources

Modify the `VideoPlayer` component to handle multiple sources:

```javascript
const VideoPlayer = ({ movie, onClose, onMarkAsWatched }) => {
  const { useState, useEffect, useRef } = React;
  const videoRef = useRef(null);
  const [sources, setSources] = useState([]);
  const [selectedSource, setSelectedSource] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initPlayer = async () => {
      try {
        const streamSources = await getStreamingSources(
          movie.title, 
          movie.release_date?.split('-')[0]
        );
        
        setSources(streamSources.sources);

        if (videoRef.current && streamSources.sources.length > 0) {
          const player = new Plyr(videoRef.current, {
            controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 
                      'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
            settings: ['quality', 'speed', 'loop'],
            quality: { default: 720, options: [1080, 720, 480] },
            ratio: '16:9'
          });

          // Set the first source
          if (streamSources.sources[0].type === 'hls') {
            if (Hls.isSupported()) {
              const hls = new Hls();
              hls.loadSource(streamSources.sources[0].url);
              hls.attachMedia(videoRef.current);
            } else {
              // Fallback for Safari (native HLS support)
              videoRef.current.src = streamSources.sources[0].url;
            }
          } else {
            videoRef.current.src = streamSources.sources[0].url;
          }
        }
      } catch (err) {
        console.error('Error initializing player:', err);
        setError('Failed to load streaming sources');
      }
    };

    initPlayer();
  }, [movie]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="w-full max-w-4xl mx-auto relative">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white font-bold text-2xl hover:text-purple-400 transition-colors z-10"
        >
          <i className="fas fa-times"></i>
        </button>
        
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          {/* Source Selection */}
          {sources.length > 1 && (
            <div className="bg-gray-800 p-4 flex gap-2 flex-wrap">
              {sources.map((source, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedSource(index)}
                  className={`px-4 py-2 rounded-lg font-bold transition-colors ${
                    selectedSource === index
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {source.name} ({source.quality})
                </button>
              ))}
            </div>
          )}

          {/* Video Player */}
          <div className="relative bg-black">
            {error ? (
              <div className="w-full h-96 flex items-center justify-center text-red-500 text-lg">
                {error}
              </div>
            ) : (
              <video
                ref={videoRef}
                className="w-full"
                controls
                poster={movie.backdrop_path ? `${TMDB_BACKDROP_URL}${movie.backdrop_path}` : undefined}
              />
            )}
          </div>

          {/* Movie Info */}
          <div className="p-6">
            <h1 className="text-3xl font-bold text-white mb-4">{movie.title}</h1>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
              <div>
                <p className="text-gray-400 text-sm">Rating</p>
                <p className="text-yellow-400 font-bold text-lg">
                  {movie.vote_average?.toFixed(1)} / 10
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Release</p>
                <p className="text-white font-bold">{movie.release_date}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Popularity</p>
                <p className="text-white font-bold">{Math.round(movie.popularity)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Language</p>
                <p className="text-white font-bold">
                  {(movie.original_language || 'EN').toUpperCase()}
                </p>
              </div>
            </div>

            <p className="text-gray-300 text-lg mb-6">{movie.overview}</p>

            <div className="flex gap-4">
              <button
                onClick={onMarkAsWatched}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                <i className="fas fa-check mr-2"></i> Mark as Watched
              </button>
              <button
                onClick={onClose}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## Step 5: Add Error Handling for Streaming

Add comprehensive error handling in the VideoPlayer:

```javascript
// In the VideoPlayer useEffect
useEffect(() => {
  const loadStream = async () => {
    try {
      const streamSources = await getStreamingSources(movie.title, movie.release_date?.split('-')[0]);
      
      if (!streamSources.sources || streamSources.sources.length === 0) {
        setError('No streaming sources available for this movie. Check external services.');
        return;
      }

      setSources(streamSources.sources);
      // Load first source...
    } catch (error) {
      console.error('Streaming error:', error);
      setError(`Failed to load: ${error.message}`);
    }
  };

  loadStream();
}, [movie]);
```

---

## Step 6: Test the Integration

1. Open the site in your browser
2. Browse to a popular movie
3. Click **Watch** to open the player
4. Verify the video loads from VidKing
5. Test different streaming sources (if available)
6. Check the browser console for any errors

---

## Advanced Features

### Add Subtitle Support
```javascript
// In getStreamingSources, include subtitles
const formattedSources = sourcesData.sources.map(source => ({
  ...source,
  subtitles: source.subtitles?.map(sub => ({
    kind: 'captions',
    src: sub.url,
    srclang: sub.language,
    label: sub.language
  })) || []
}));
```

### Add Quality Selection
```javascript
const formattedSources = sourcesData.sources
  .sort((a, b) => {
    const qualityOrder = { '4K': 4, '1080p': 3, '720p': 2, '480p': 1 };
    return (qualityOrder[b.quality] || 0) - (qualityOrder[a.quality] || 0);
  });
```

### Add Geographic Region Filtering
```javascript
const getUserRegion = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return data.country_code;
  } catch (err) {
    return 'US'; // Default fallback
  }
};

// Use in getStreamingSources
const userRegion = await getUserRegion();
const availableSources = sourcesData.sources.filter(
  source => !source.region || source.region === userRegion
);
```

---

## Troubleshooting

### Common Issues & Solutions

**Issue**: "CORS error from VidKing API"
- **Solution**: Check if VidKing API supports CORS headers
- **Alternative**: Use a CORS proxy or backend proxy

**Issue**: "Stream fails to load"
- **Solution**: Verify HLS.js is loaded
- **Check**: Video URL format (should be .m3u8 for HLS)

**Issue**: "API key invalid"
- **Solution**: Verify key hasn't expired
- **Check**: Key has correct permissions/scopes

**Issue**: "Video buffering constantly"
- **Solution**: Check internet speed requirements
- **Alternative**: Lower quality options

---

## Performance Optimization

### Lazy Load Streaming Sources
```javascript
const [sourcesLoaded, setSourcesLoaded] = useState(false);

useEffect(() => {
  if (sourcesLoaded) {
    loadSources();
  }
}, [sourcesLoaded]);
```

### Cache Streaming Results
```javascript
const streamCache = new Map();

const getStreamingSources = async (movieTitle, movieYear) => {
  const cacheKey = `${movieTitle}-${movieYear}`;
  if (streamCache.has(cacheKey)) {
    return streamCache.get(cacheKey);
  }
  
  const sources = await fetchFromVidKing(movieTitle, movieYear);
  streamCache.set(cacheKey, sources);
  return sources;
};
```

---

## Production Checklist

- ✅ Update API credentials
- ✅ Test with real VidKing streams
- ✅ Implement error boundaries
- ✅ Add loading spinners
- ✅ Test on multiple browsers
- ✅ Verify responsive design
- ✅ Test watchlist persistence
- ✅ Check performance metrics
- ✅ Add analytics tracking (optional)
- ✅ Deploy to production

---

## Support & Resources

- [VidKing API Docs](https://www.vidking.net/#documentation)
- [Plyr Player Docs](https://plyr.io/)
- [HLS.js Guide](https://github.com/video-dev/hls.js)
- [TMDB API](https://developers.themoviedb.org/3)

Happy streaming! 🎉
