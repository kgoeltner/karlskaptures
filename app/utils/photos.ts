import { readdir } from "fs/promises";
import { join } from "path";
import { Category, CategoryInfo, categories as categoriesData } from "../data/photos";

export { categoriesData as categories };

const photosBasePath = join(process.cwd(), "public", "photos");

export interface Photo {
  src: string;
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

export async function getPhotosByCategory(category: Category): Promise<Photo[]> {
  const categoryPath = join(photosBasePath, category);
  
  try {
    const files = await readdir(categoryPath);
    
    // Filter for image files
    const imageFiles = files.filter((file) => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );
    
    // Shuffle files with fixed seed based on category for consistent ordering
    const shuffledFiles = shuffleArray(imageFiles, category);
    
    return shuffledFiles.map((file) => ({
      src: `/photos/${category}/${file}`,
      alt: file.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      category,
    }));
  } catch (error) {
    console.error(`Error reading photos from ${categoryPath}:`, error);
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

