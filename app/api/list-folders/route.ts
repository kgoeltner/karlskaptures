import { NextResponse } from 'next/server';
import { listCloudinaryFolders, listCloudinarySubfolders } from '../../utils/photos';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const folderPath = searchParams.get('folder');

  try {
    if (folderPath) {
      const subfolders = await listCloudinarySubfolders(folderPath);
      return NextResponse.json({ folder: folderPath, subfolders });
    } else {
      const folders = await listCloudinaryFolders();
      return NextResponse.json({ folders });
    }
  } catch (error) {
    console.error('Error in list-folders API:', error);
    return NextResponse.json(
      { error: 'Failed to list folders' },
      { status: 500 }
    );
  }
}

