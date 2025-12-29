"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Category {
  id: string;
  label: string;
  coverImage: string;
}

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  // Reset and preload images when categories change
  useEffect(() => {
    setLoadedImages(new Set());
    
    // Preload all images with link preload for faster loading
    categories.forEach((category, index) => {
      // Use link preload for first 4 images (above the fold)
      if (index < 4) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = category.coverImage;
        document.head.appendChild(link);
      }
      
      const img = new Image();
      img.onload = () => {
        // If image is already complete (cached), show immediately
        if (img.complete) {
          setLoadedImages((prev) => new Set([...prev, index]));
        } else {
          // Stagger the loaded state updates for gradual cascading animation
          // Reduced delay: first 2 images show immediately, rest get shorter delays
          const delay = index < 2 ? 0 : Math.min(index * 50, 200); // Max 200ms delay
          setTimeout(() => {
            setLoadedImages((prev) => new Set([...prev, index]));
          }, delay);
        }
      };
      img.onerror = () => {
        // Still mark as loaded on error so it becomes visible
        setLoadedImages((prev) => new Set([...prev, index]));
      };
      img.src = category.coverImage;
    });
  }, [categories]);

  return (
    <div className="mt-8 grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-8">
      {categories.map((category, index) => {
        const isLoaded = loadedImages.has(index);
        return (
          <Link
            key={category.id}
            href={`/work/${category.id}`}
            className={`group block w-full ${index % 2 === 1 ? 'sm:mt-12' : ''}`}
            prefetch={true}
          >
            <div className="relative overflow-hidden transition-transform group-hover:scale-[1.02]">
              {/* Placeholder to prevent layout shift */}
              {!isLoaded && (
                <div className="absolute inset-0 bg-neutral-900/30 animate-pulse z-0" />
              )}
              <div
                className={`relative z-10 transition-all duration-500 ease-out ${
                  isLoaded 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-4'
                }`}
                style={{
                  transitionDelay: isLoaded 
                    ? (index < 2 ? '0ms' : `${Math.min(index * 50, 200)}ms`) 
                    : '0ms'
                }}
              >
                <img
                  src={category.coverImage}
                  alt={category.label}
                  className="h-full w-full object-cover"
                  loading={index < 4 ? "eager" : "lazy"}
                  fetchPriority={index < 2 ? "high" : index < 4 ? "auto" : "low"}
                  decoding="async"
                />
              </div>
            </div>
            <p 
              className={`mt-4 text-center text-2xl font-medium text-neutral-300 transition-all duration-500 ease-out ${
                isLoaded 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-4'
              }`}
              style={{
                transitionDelay: isLoaded 
                  ? (index < 2 ? '0ms' : `${Math.min(index * 50, 200)}ms`) 
                  : '0ms'
              }}
            >
              {category.label}
            </p>
          </Link>
        );
      })}
    </div>
  );
}

