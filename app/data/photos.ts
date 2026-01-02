export type Category = "solo-grad" | "group-grad" | "couples-grad" | "flower-fields" | "family" | "getty-museum" | "nyc" | "santana-row";

export interface Photo {
  src: string;
  alt: string;
  category: Category;
}

export interface CategoryInfo {
  id: Category;
  label: string;
  coverImage: string;
  coverImageFilename?: string; // Optional: specify which photo file to use as cover
}

export const categories: CategoryInfo[] = [
  { 
    id: "solo-grad", 
    label: "Solo Grad",
    coverImage: "/photos/solo-grad/glow_grad.jpg", // Will be overridden dynamically
    coverImageFilename: "DSC01658-Edit.jpg"
  },
  { 
    id: "group-grad", 
    label: "Group Grad",
    coverImage: "/photos/group-grad/fairies_grad.jpg",
    coverImageFilename: "fairies_grad.jpg"
  },
  { 
    id: "couples-grad", 
    label: "Couples Grad",
    coverImage: "/photos/couples-grad/couple_grad.jpg",
    coverImageFilename: "couple_grad.jpg"
  },
  { 
    id: "flower-fields", 
    label: "Flower Fields",
    coverImage: "/photos/flower-fields/golden_flower_fields.jpg"
  },
  { 
    id: "family", 
    label: "Family",
    coverImage: "/photos/family/family.jpg"
  },
  { 
    id: "getty-museum", 
    label: "Getty Museum",
    coverImage: "/photos/getty-museum/walk_getty.jpg"
  },
  { 
    id: "nyc", 
    label: "NYC",
    coverImage: "/photos/nyc/buddies.jpg"
  },
  { 
    id: "santana-row", 
    label: "Santana Row",
    coverImage: "/photos/santana-row/DSC02378-3.jpg",
    coverImageFilename: "DSC02378-3.jpg"
  },
];

export const photos: Photo[] = [
  { src: "/photos/solo-grad/glow_grad.jpg", alt: "Solo graduation", category: "solo-grad" },
  { src: "/photos/couples-grad/couple_grad.jpg", alt: "Couple graduation", category: "couples-grad" },
  { src: "/photos/group-grad/fairies_grad.jpg", alt: "Group graduation", category: "group-grad" },
  { src: "/photos/nyc/buddies.jpg", alt: "NYC", category: "nyc" },
  { src: "/photos/flower-fields/golden_flower_fields.jpg", alt: "Flower fields", category: "flower-fields" },
  { src: "/photos/family/family.jpg", alt: "Family portrait", category: "family" },
  { src: "/photos/getty-museum/walk_getty.jpg", alt: "Getty Museum", category: "getty-museum" },
];

