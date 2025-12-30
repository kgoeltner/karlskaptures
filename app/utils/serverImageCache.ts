import { promises as fs } from 'fs';
import { join } from 'path';
import { existsSync } from 'fs';

const CACHE_DIR = join(process.cwd(), '.next', 'cache', 'cloudinary-images');
const CACHE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

// Ensure cache directory exists
async function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  }
}

// Generate cache key from publicId and transformation params
function getCacheKey(publicId: string, width?: number, quality?: string): string {
  const params = [publicId, width || 'auto', quality || 'auto'].join('_');
  // Sanitize for filesystem
  return params.replace(/[^a-zA-Z0-9_-]/g, '_') + '.jpg';
}

// Get cached image path
function getCachedImagePath(cacheKey: string): string {
  return join(CACHE_DIR, cacheKey);
}

// Check if image is cached and not expired
export async function isImageCached(publicId: string, width?: number, quality?: string): Promise<boolean> {
  try {
    await ensureCacheDir();
    const cacheKey = getCacheKey(publicId, width, quality);
    const cachedPath = getCachedImagePath(cacheKey);
    
    if (!existsSync(cachedPath)) {
      return false;
    }
    
    const stats = await fs.stat(cachedPath);
    const age = Date.now() - stats.mtimeMs;
    
    return age < CACHE_MAX_AGE;
  } catch (error) {
    console.error('Error checking image cache:', error);
    return false;
  }
}

// Get cached image buffer
export async function getCachedImage(publicId: string, width?: number, quality?: string): Promise<Buffer | null> {
  try {
    await ensureCacheDir();
    const cacheKey = getCacheKey(publicId, width, quality);
    const cachedPath = getCachedImagePath(cacheKey);
    
    if (!existsSync(cachedPath)) {
      return null;
    }
    
    const stats = await fs.stat(cachedPath);
    const age = Date.now() - stats.mtimeMs;
    
    if (age >= CACHE_MAX_AGE) {
      // Cache expired, delete it
      await fs.unlink(cachedPath).catch(() => {});
      return null;
    }
    
    return await fs.readFile(cachedPath);
  } catch (error) {
    console.error('Error reading cached image:', error);
    return null;
  }
}

// Cache image from URL
export async function cacheImageFromUrl(
  publicId: string,
  imageUrl: string,
  width?: number,
  quality?: string
): Promise<boolean> {
  try {
    await ensureCacheDir();
    const cacheKey = getCacheKey(publicId, width, quality);
    const cachedPath = getCachedImagePath(cacheKey);
    
    // Download image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Save to cache
    await fs.writeFile(cachedPath, buffer);
    
    return true;
  } catch (error) {
    console.error('Error caching image:', error);
    return false;
  }
}

// Get image URL (either cached or Cloudinary)
export async function getImageUrl(
  publicId: string,
  width: number = 800,
  quality: string = 'auto'
): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('Cloudinary cloud name not configured');
  }
  
  // Check if cached
  const isCached = await isImageCached(publicId, width, quality);
  if (isCached) {
    // Return path to cached image via API route
    const cacheKey = getCacheKey(publicId, width, quality);
    return `/api/cached-image?key=${encodeURIComponent(cacheKey)}`;
  }
  
  // Return Cloudinary URL (and cache in background)
  const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},q_${quality}/${publicId}`;
  
  // Cache in background (don't wait for it)
  cacheImageFromUrl(publicId, cloudinaryUrl, width, quality).catch(console.error);
  
  return cloudinaryUrl;
}

