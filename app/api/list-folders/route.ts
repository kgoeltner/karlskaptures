import { NextResponse } from 'next/server';
import { listCloudinaryFolders, listCloudinarySubfolders } from '../../utils/photos';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folderPath = searchParams.get('folder');

  try {
    let result;
    if (folderPath) {
      const subfolders = await listCloudinarySubfolders(folderPath);
      result = { folder: folderPath, subfolders };
    } else {
      const folders = await listCloudinaryFolders();
      result = { folders };
    }
    
    // Add cache headers
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400', // Cache for 1 hour, stale for 24 hours
      },
    });
  } catch (error) {
    console.error('Error in list-folders API:', error);
    return NextResponse.json(
      { error: 'Failed to list folders' },
      { status: 500 }
    );
  }
}

