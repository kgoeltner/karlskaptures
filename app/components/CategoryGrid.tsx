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
    
    categories.forEach((category, index) => {
      const img = new Image();
      img.onload = () => {
        // Stagger the loaded state updates for gradual cascading animation
        setTimeout(() => {
          setLoadedImages((prev) => new Set([...prev, index]));
        }, index * 100);
      };
      img.onerror = () => {
        // Still mark as loaded on error so it becomes visible
        setTimeout(() => {
          setLoadedImages((prev) => new Set([...prev, index]));
        }, index * 100);
      };
      img.src = category.coverImage;
    });
  }, [categories]);

  return (
    <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
      {categories.map((category, index) => {
        const isLoaded = loadedImages.has(index);
        return (
          <Link
            key={category.id}
            href={`/work/${category.id}`}
            className={`group ${index % 2 === 1 ? 'mt-12' : ''}`}
            prefetch={true}
          >
            <div className="overflow-hidden transition-transform group-hover:scale-[1.02]">
              <div
                className={`transition-all duration-700 ease-out ${
                  isLoaded 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-4'
                }`}
                style={{
                  transitionDelay: isLoaded ? `${index * 100}ms` : '0ms'
                }}
              >
                <img
                  src={category.coverImage}
                  alt={category.label}
                  className="h-full w-full object-cover"
                  loading={index < 2 ? "eager" : "lazy"}
                  fetchPriority={index < 2 ? "high" : "auto"}
                />
              </div>
            </div>
            <p 
              className={`mt-4 text-center text-2xl font-medium text-neutral-300 transition-all duration-700 ease-out ${
                isLoaded 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-4'
              }`}
              style={{
                transitionDelay: isLoaded ? `${index * 100}ms` : '0ms'
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

