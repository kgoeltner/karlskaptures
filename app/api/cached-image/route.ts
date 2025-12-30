import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';
import { existsSync } from 'fs';

const CACHE_DIR = join(process.cwd(), '.next', 'cache', 'cloudinary-images');

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');
    
    if (!key) {
      return new NextResponse('Missing key parameter', { status: 400 });
    }
    
    // Sanitize key to prevent directory traversal
    const sanitizedKey = key.replace(/[^a-zA-Z0-9_.-]/g, '');
    const cachedPath = join(CACHE_DIR, sanitizedKey);
    
    // Verify path is within cache directory
    if (!cachedPath.startsWith(CACHE_DIR)) {
      return new NextResponse('Invalid key', { status: 400 });
    }
    
    if (!existsSync(cachedPath)) {
      return new NextResponse('Image not found in cache', { status: 404 });
    }
    
    const imageBuffer = await fs.readFile(cachedPath);
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('Error serving cached image:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

