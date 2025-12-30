import { NextRequest, NextResponse } from 'next/server';
import { getCachedImage, cacheImageFromUrl, isImageCached } from '../../utils/serverImageCache';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const publicId = searchParams.get('publicId');
    const width = searchParams.get('width') ? parseInt(searchParams.get('width')!) : 800;
    const quality = searchParams.get('quality') || 'auto';
    
    if (!publicId) {
      return new NextResponse('Missing publicId parameter', { status: 400 });
    }
    
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      return new NextResponse('Cloudinary not configured', { status: 500 });
    }
    
    // Check if image is cached
    const cached = await getCachedImage(publicId, width, quality);
    if (cached) {
      return new NextResponse(cached, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
          'X-Cache-Status': 'HIT',
        },
      });
    }
    
    // Not cached, fetch from Cloudinary
    const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},q_${quality}/${publicId}`;
    
    try {
      const response = await fetch(cloudinaryUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Cache it for next time (don't wait)
      cacheImageFromUrl(publicId, cloudinaryUrl, width, quality).catch(console.error);
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Cache-Status': 'MISS',
        },
      });
    } catch (error) {
      console.error('Error fetching image from Cloudinary:', error);
      return new NextResponse('Failed to fetch image', { status: 500 });
    }
  } catch (error) {
    console.error('Error in image API route:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

