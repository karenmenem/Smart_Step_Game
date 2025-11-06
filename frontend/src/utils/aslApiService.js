/**
 * ASL API Service
 * Automatically fetches ASL signs from external APIs
 * No manual downloads needed!
 */

const API_ENDPOINTS = {
  // Free ASL resources
  handspeak: 'https://www.handspeak.com/word/',
  signingsavvy: 'https://www.signingsavvy.com/search/',
  
  // You can add your own API keys here
  customAPI: process.env.ASL_API_URL || null,
};

/**
 * Fetch ASL video URL from external API
 * This will search for the word and return a video URL
 */
export const fetchASLForWord = async (word) => {
  try {
    // Option 1: Use Signing Savvy (they have embeddable videos)
    const signingsavvyUrl = `https://www.signingsavvy.com/media/mp4-ld/${word}.mp4`;
    
    // Check if video exists
    const response = await fetch(signingsavvyUrl, { method: 'HEAD' });
    if (response.ok) {
      return {
        word,
        videoUrl: signingsavvyUrl,
        source: 'signingsavvy',
        cached: false
      };
    }
    
    // Option 2: Use HandSpeak
    const handspeakUrl = `https://www.handspeak.com/word/search/index.php?id=${word}`;
    
    // If no video found, return null (will use text fallback)
    return null;
  } catch (error) {
    console.error(`Error fetching ASL for "${word}":`, error);
    return null;
  }
};

/**
 * Fetch ASL for entire sentence (batch processing)
 * Much faster than fetching one word at a time
 */
export const fetchASLForSentence = async (sentence) => {
  const words = sentence
    .toLowerCase()
    .replace(/[.,!?;:]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  console.log(`🔍 Fetching ASL for ${words.length} words...`);
  
  // Fetch all words in parallel (much faster!)
  const results = await Promise.all(
    words.map(word => fetchASLForWord(word))
  );
  
  return words.map((word, index) => ({
    word,
    asl: results[index]
  }));
};

/**
 * Alternative: Use YouTube embeds
 * Search YouTube for "ASL sign [word]" and use first result
 */
export const getYoutubeASL = (word) => {
  // YouTube search URL
  const searchQuery = encodeURIComponent(`ASL sign ${word}`);
  return `https://www.youtube.com/results?search_query=${searchQuery}`;
};

/**
 * Alternative: Use animated GIFs from Giphy
 * Much lighter than videos!
 */
export const getGiphyASL = async (word) => {
  const GIPHY_API_KEY = process.env.REACT_APP_GIPHY_API_KEY || 'demo'; // Get free key from giphy.com
  const url = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=ASL+sign+${word}&limit=1`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      return {
        word,
        gifUrl: data.data[0].images.original.url,
        source: 'giphy'
      };
    }
  } catch (error) {
    console.error(`Error fetching Giphy ASL for "${word}":`, error);
  }
  
  return null;
};

/**
 * Cache system - stores fetched ASL signs in localStorage
 * So you don't need to fetch the same word twice
 */
const ASL_CACHE_KEY = 'asl_cache';

export const getCachedASL = (word) => {
  try {
    const cache = JSON.parse(localStorage.getItem(ASL_CACHE_KEY) || '{}');
    return cache[word.toLowerCase()] || null;
  } catch (error) {
    return null;
  }
};

export const setCachedASL = (word, aslData) => {
  try {
    const cache = JSON.parse(localStorage.getItem(ASL_CACHE_KEY) || '{}');
    cache[word.toLowerCase()] = {
      ...aslData,
      cachedAt: new Date().toISOString()
    };
    localStorage.setItem(ASL_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error caching ASL:', error);
  }
};

/**
 * Smart ASL fetcher with cache
 * 1. Check local cache first
 * 2. Check local files (/public/asl/words/)
 * 3. Fetch from API as last resort
 */
export const getASLWithCache = async (word) => {
  // 1. Check cache
  const cached = getCachedASL(word);
  if (cached) {
    console.log(`✅ Using cached ASL for "${word}"`);
    return cached;
  }
  
  // 2. Check if local file exists
  const localUrl = `/asl/words/${word.toLowerCase()}.mp4`;
  try {
    const response = await fetch(localUrl, { method: 'HEAD' });
    if (response.ok) {
      const result = { word, videoUrl: localUrl, source: 'local' };
      setCachedASL(word, result);
      return result;
    }
  } catch (error) {
    // Local file doesn't exist, continue to API
  }
  
  // 3. Fetch from API
  console.log(`🌐 Fetching ASL for "${word}" from API...`);
  const apiResult = await fetchASLForWord(word);
  
  if (apiResult) {
    setCachedASL(word, apiResult);
    return apiResult;
  }
  
  // 4. Try Giphy as fallback
  const giphyResult = await getGiphyASL(word);
  if (giphyResult) {
    setCachedASL(word, giphyResult);
    return giphyResult;
  }
  
  // 5. No ASL found - will use text fallback
  return { word, videoUrl: null, source: 'none' };
};

/**
 * Process entire paragraph with smart caching
 */
export const processASLParagraph = async (paragraph) => {
  const words = paragraph
    .toLowerCase()
    .replace(/[.,!?;:]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  console.log(`📝 Processing ${words.length} words with smart caching...`);
  
  const startTime = Date.now();
  
  // Process all words in parallel (FAST!)
  const results = await Promise.all(
    words.map(word => getASLWithCache(word))
  );
  
  const elapsed = Date.now() - startTime;
  const cached = results.filter(r => r.source === 'local' || getCachedASL(r.word)).length;
  
  console.log(`✅ Processed in ${elapsed}ms`);
  console.log(`📊 Cached: ${cached}/${words.length} words`);
  
  return results;
};
