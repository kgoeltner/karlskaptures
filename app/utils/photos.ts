import { readdir } from "fs/promises";
import { join } from "path";
import { Category, CategoryInfo, categories as categoriesData } from "../data/photos";
import { v2 as cloudinary } from 'cloudinary';

export { categoriesData as categories };

const photosBasePath = join(process.cwd(), "public", "photos");

// Configure Cloudinary
// CLOUDINARY_URL takes precedence if set, otherwise use individual variables
if (process.env.CLOUDINARY_URL) {
  cloudinary.config();
} else {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('Cloudinary environment variables are not set. Gallery photos will not load.');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export interface Photo {
  publicId: string; // Cloudinary public_id
  alt: string;
  category: Category;
}

// Seeded random number generator for consistent shuffling
function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

// Fisher-Yates shuffle algorithm with fixed seed
function shuffleArray<T>(array: T[], seed: string): T[] {
  // Create seed from string with offset to reseed
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  // Add offset to reseed (change this number to get different orders)
  hash = hash + 67892;
  const random = seededRandom(Math.abs(hash));
  
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Cache for photo lists to avoid repeated API calls
const photoCache = new Map<string, { photos: Photo[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getPhotosByCategory(category: Category): Promise<Photo[]> {
  // Check if Cloudinary is configured
  if (!process.env.CLOUDINARY_URL && (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET)) {
    console.error('Cloudinary credentials are missing. Cannot fetch photos.');
    return [];
  }

  // Check cache first
  const cached = photoCache.get(category);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.photos;
  }

  try {
    // Fetch resources from Cloudinary folder matching category name
    // Try different folder path formats
    const possiblePaths = [
      `Home/${category}`,  // Home/solo-grad
      `${category}`,       // solo-grad (if directly in root)
      `Home/${category}/*`, // With wildcard
    ];
    
    let result: any = null;
    let foundPath = '';
    
    for (const path of possiblePaths) {
      try {
        const searchExpression = path.includes('*') ? `folder:${path}` : `folder:${path}/*`;
        
        result = await cloudinary.search
          .expression(searchExpression)
          .max_results(500)
          .execute();
        
        if (result.resources && result.resources.length > 0) {
          foundPath = path;
          break;
        }
      } catch (error) {
        continue;
      }
    }
    
    if (!result || !result.resources || result.resources.length === 0) {
      console.warn(`No photos found in Cloudinary for category: ${category}`);
      return [];
    }
    
    // Extract public_ids and create alt text from filename
    const imagePublicIds = result.resources.map((resource: any) => resource.public_id);
    
    // Shuffle files with fixed seed based on category for consistent ordering
    const shuffledPublicIds = shuffleArray(imagePublicIds, category);
    
    const photos = shuffledPublicIds.map((publicId: unknown) => {
      const publicIdStr = String(publicId);
      // Extract filename from public_id for alt text
      const filename = publicIdStr.split('/').pop() || publicIdStr;
      const alt = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      
      return {
        publicId: publicIdStr,
        alt,
        category,
      };
    });

    // Cache the results
    photoCache.set(category, { photos, timestamp: Date.now() });
    
    return photos;
  } catch (error) {
    console.error(`Error fetching photos from Cloudinary for ${category}:`, error);
    return [];
  }
}

export async function getCategoryCoverImage(category: Category, coverImageFilename?: string): Promise<string> {
  const categoryPath = join(photosBasePath, category);
  
  try {
    const files = await readdir(categoryPath);
    
    // Filter for image files
    const imageFiles = files.filter((file) => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );
    
    if (imageFiles.length === 0) {
      return "";
    }
    
    // If a specific cover image filename is specified, use it
    if (coverImageFilename) {
      const coverFile = imageFiles.find((file) => 
        file === coverImageFilename || file.includes(coverImageFilename)
      );
      if (coverFile) {
        return `/photos/${category}/${coverFile}`;
      }
    }
    
    // Otherwise, use the first photo alphabetically
    imageFiles.sort();
    return `/photos/${category}/${imageFiles[0]}`;
  } catch (error) {
    console.error(`Error reading cover image from ${categoryPath}:`, error);
    return "";
  }
}

export async function getCategoriesWithCovers(): Promise<CategoryInfo[]> {
  const categoriesWithCovers = await Promise.all(
    categoriesData.map(async (category) => {
      const coverImage = await getCategoryCoverImage(category.id, category.coverImageFilename);
      return {
        ...category,
        coverImage,
      };
    })
  );
  
  return categoriesWithCovers.filter((cat) => cat.coverImage !== "");
}

// Utility function to list all folders in Cloudinary
export async function listCloudinaryFolders(): Promise<string[]> {
  if (!process.env.CLOUDINARY_URL && (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET)) {
    console.error('Cloudinary credentials are missing.');
    return [];
  }

  try {
    const result = await cloudinary.api.root_folders();
    console.log('Cloudinary root folders:', JSON.stringify(result, null, 2));
    return result.folders?.map((folder: any) => folder.name) || [];
  } catch (error) {
    console.error('Error listing Cloudinary folders:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    return [];
  }
}

// Utility function to list subfolders in a specific folder
export async function listCloudinarySubfolders(folderPath: string): Promise<string[]> {
  if (!process.env.CLOUDINARY_URL && (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET)) {
    console.error('Cloudinary credentials are missing.');
    return [];
  }

  try {
    const result = await cloudinary.api.sub_folders(folderPath);
    console.log(`Cloudinary subfolders in ${folderPath}:`, JSON.stringify(result, null, 2));
    return result.folders?.map((folder: any) => folder.path) || [];
  } catch (error) {
    console.error(`Error listing Cloudinary subfolders in ${folderPath}:`, error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    return [];
  }
}

// Utility function to list all folders recursively
export async function listAllCloudinaryFolders(): Promise<{ [key: string]: string[] }> {
  if (!process.env.CLOUDINARY_URL && (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET)) {
    console.error('Cloudinary credentials are missing.');
    return {};
  }

  try {
    const allFolders: { [key: string]: string[] } = {};
    
    // Get root folders
    const rootResult = await cloudinary.api.root_folders();
    const rootFolders = rootResult.folders?.map((folder: any) => folder.name) || [];
    
    console.log('Root folders:', rootFolders);
    
    // For each root folder, get its subfolders
    for (const rootFolder of rootFolders) {
      try {
        const subfolders = await listCloudinarySubfolders(rootFolder);
        allFolders[rootFolder] = subfolders;
        
        // Also get subfolders of subfolders (2 levels deep)
        for (const subfolder of subfolders) {
          try {
            const deepSubfolders = await listCloudinarySubfolders(subfolder);
            if (deepSubfolders.length > 0) {
              allFolders[subfolder] = deepSubfolders;
            }
          } catch (e) {
            // Ignore errors for deeper levels
          }
        }
      } catch (error) {
        console.warn(`Could not list subfolders for ${rootFolder}:`, error);
        allFolders[rootFolder] = [];
      }
    }
    
    return allFolders;
  } catch (error) {
    console.error('Error listing all Cloudinary folders:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    return {};
  }
}

// Utility function to list all images in a specific folder
export async function listImagesInFolder(folderPath: string): Promise<string[]> {
  if (!process.env.CLOUDINARY_URL && (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET)) {
    console.error('Cloudinary credentials are missing.');
    return [];
  }

  try {
    const result = await cloudinary.search
      .expression(`folder:${folderPath}/*`)
      .max_results(500)
      .execute();
    
    const images = result.resources?.map((resource: any) => resource.public_id) || [];
    console.log(`Found ${images.length} images in folder: ${folderPath}`);
    return images;
  } catch (error) {
    console.error(`Error listing images in folder ${folderPath}:`, error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    return [];
  }
}

// Utility function to list all folders with their images
export async function listAllFoldersWithImages(): Promise<{ [key: string]: { subfolders: string[], images: string[] } }> {
  if (!process.env.CLOUDINARY_URL && (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET)) {
    console.error('Cloudinary credentials are missing.');
    return {};
  }

  try {
    const allData: { [key: string]: { subfolders: string[], images: string[] } } = {};
    
    // Get root folders
    const rootResult = await cloudinary.api.root_folders();
    const rootFolders = rootResult.folders?.map((folder: any) => folder.name) || [];
    
    // For each root folder, get subfolders and images
    for (const rootFolder of rootFolders) {
      try {
        const subfolders = await listCloudinarySubfolders(rootFolder);
        const images = await listImagesInFolder(rootFolder);
        allData[rootFolder] = { subfolders, images };
        
        // Also get images in subfolders
        for (const subfolder of subfolders) {
          try {
            const subfolderImages = await listImagesInFolder(subfolder);
            const deepSubfolders = await listCloudinarySubfolders(subfolder);
            allData[subfolder] = { subfolders: deepSubfolders, images: subfolderImages };
          } catch (e) {
            console.warn(`Could not list images in ${subfolder}:`, e);
            allData[subfolder] = { subfolders: [], images: [] };
          }
        }
      } catch (error) {
        console.warn(`Could not process folder ${rootFolder}:`, error);
        allData[rootFolder] = { subfolders: [], images: [] };
      }
    }
    
    return allData;
  } catch (error) {
    console.error('Error listing folders with images:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    return {};
  }
}

