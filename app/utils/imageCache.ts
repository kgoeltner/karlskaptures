/**
 * Client-side image caching utility
 * Uses browser's native caching and localStorage for metadata
 */

const CACHE_NAME = 'karlskaptures-images';
const CACHE_VERSION = 'v1';
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB max cache size

// Check if browser supports Cache API
const supportsCacheAPI = typeof caches !== 'undefined';

/**
 * Preload and cache an image
 */
export async function cacheImage(url: string): Promise<void> {
  if (!supportsCacheAPI) {
    // Fallback: just preload the image
    const img = new Image();
    img.src = url;
    return;
  }

  try {
    const cache = await caches.open(`${CACHE_NAME}-${CACHE_VERSION}`);
    const cached = await cache.match(url);
    
    if (!cached) {
      // Fetch and cache the image
      await cache.add(url);
    }
  } catch (error) {
    console.warn('Failed to cache image:', error);
    // Fallback: preload the image
    const img = new Image();
    img.src = url;
  }
}

/**
 * Preload multiple images
 */
export async function cacheImages(urls: string[]): Promise<void> {
  if (!supportsCacheAPI) {
    // Fallback: preload all images
    urls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
    return;
  }

  try {
    const cache = await caches.open(`${CACHE_NAME}-${CACHE_VERSION}`);
    
    // Check which images are already cached
    const cachePromises = urls.map(async (url) => {
      const cached = await cache.match(url);
      if (!cached) {
        try {
          await cache.add(url);
        } catch (error) {
          // If cache.add fails, try fetch + put
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
            }
          } catch (fetchError) {
            console.warn(`Failed to cache image ${url}:`, fetchError);
          }
        }
      }
    });

    await Promise.all(cachePromises);
  } catch (error) {
    console.warn('Failed to cache images:', error);
    // Fallback: preload all images
    urls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }
}

/**
 * Get cached image or fetch if not cached
 */
export async function getCachedImage(url: string): Promise<Response | null> {
  if (!supportsCacheAPI) {
    return null;
  }

  try {
    const cache = await caches.open(`${CACHE_NAME}-${CACHE_VERSION}`);
    return await cache.match(url);
  } catch (error) {
    console.warn('Failed to get cached image:', error);
    return null;
  }
}

/**
 * Clear the image cache
 */
export async function clearImageCache(): Promise<void> {
  if (!supportsCacheAPI) {
    return;
  }

  try {
    const cacheNames = await caches.keys();
    const imageCaches = cacheNames.filter(name => name.startsWith(CACHE_NAME));
    await Promise.all(imageCaches.map(name => caches.delete(name)));
  } catch (error) {
    console.warn('Failed to clear image cache:', error);
  }
}

/**
 * Get cache size estimate (approximate)
 */
export async function getCacheSize(): Promise<number> {
  if (!supportsCacheAPI) {
    return 0;
  }

  try {
    const cache = await caches.open(`${CACHE_NAME}-${CACHE_VERSION}`);
    const keys = await cache.keys();
    // Rough estimate: assume average 500KB per image
    return keys.length * 500 * 1024;
  } catch (error) {
    console.warn('Failed to get cache size:', error);
    return 0;
  }
}

