"use client";

import { useEffect, useState } from "react";
import { CldImage } from 'next-cloudinary';
import { cacheImages, getCachedImage } from "../utils/imageCache";

interface PhotoLightboxProps {
  isOpen: boolean;
  photo: { publicId: string; alt: string } | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  nextPhoto?: { publicId: string; alt: string } | null;
  prevPhoto?: { publicId: string; alt: string } | null;
  allPhotos?: { publicId: string; alt: string }[]; // All photos for preloading
  currentIndex?: number; // Current photo index
}

export default function PhotoLightbox({
  isOpen,
  photo,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  nextPhoto,
  prevPhoto,
  allPhotos,
  currentIndex,
}: PhotoLightboxProps) {
  // Preload all images when lightbox opens for smooth carousel navigation
  useEffect(() => {
    if (!isOpen || !photo) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) return;

    const imagesToCache: string[] = [];

    // If we have all photos, preload all of them for instant carousel navigation
    if (allPhotos && allPhotos.length > 0) {
      allPhotos.forEach((p) => {
        imagesToCache.push(`https://res.cloudinary.com/${cloudName}/image/upload/w_1920,q_90/${p.publicId}`);
      });
    } else {
      // Fallback: preload current, next, and previous
      imagesToCache.push(`https://res.cloudinary.com/${cloudName}/image/upload/w_1920,q_90/${photo.publicId}`);
      if (nextPhoto) {
        imagesToCache.push(`https://res.cloudinary.com/${cloudName}/image/upload/w_1920,q_90/${nextPhoto.publicId}`);
      }
      if (prevPhoto) {
        imagesToCache.push(`https://res.cloudinary.com/${cloudName}/image/upload/w_1920,q_90/${prevPhoto.publicId}`);
      }
    }

    // Preload all images in background
    if (imagesToCache.length > 0) {
      // Preload with Image objects for browser cache
      imagesToCache.forEach((url) => {
        const img = new Image();
        img.fetchPriority = 'low'; // Low priority to not block current image
        img.src = url;
      });
      
      // Also cache via Cache API
      cacheImages(imagesToCache).catch(console.warn);
    }
  }, [isOpen, photo, nextPhoto, prevPhoto, allPhotos]);

  // Preload images ahead when navigating
  useEffect(() => {
    if (!isOpen || !allPhotos || currentIndex === undefined) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) return;

    // Preload next 5 images ahead for smooth forward navigation
    const nextImages: string[] = [];
    for (let i = 1; i <= 5 && currentIndex + i < allPhotos.length; i++) {
      nextImages.push(`https://res.cloudinary.com/${cloudName}/image/upload/w_1920,q_90/${allPhotos[currentIndex + i].publicId}`);
    }

    // Preload previous 5 images for smooth backward navigation
    const prevImages: string[] = [];
    for (let i = 1; i <= 5 && currentIndex - i >= 0; i++) {
      prevImages.push(`https://res.cloudinary.com/${cloudName}/image/upload/w_1920,q_90/${allPhotos[currentIndex - i].publicId}`);
    }

    // Preload in background
    [...nextImages, ...prevImages].forEach((url) => {
      const img = new Image();
      img.fetchPriority = 'low';
      img.src = url;
    });
  }, [isOpen, allPhotos, currentIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" && onNext) {
        onNext();
      } else if (e.key === "ArrowLeft" && onPrev) {
        onPrev();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen || !photo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 rounded-full bg-neutral-800/80 p-2 text-white hover:bg-neutral-700 transition-colors"
        aria-label="Close"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {hasPrev && onPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 z-10 rounded-full bg-neutral-800/80 p-3 text-white hover:bg-neutral-700 transition-colors"
          aria-label="Previous"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {hasNext && onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 z-10 rounded-full bg-neutral-800/80 p-3 text-white hover:bg-neutral-700 transition-colors"
          aria-label="Next"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      <div
        className="relative max-h-[90vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Use regular img tag for instant display - no fade animations */}
        {(() => {
          const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
          const imageUrl = cloudName 
            ? `https://res.cloudinary.com/${cloudName}/image/upload/w_1920,q_90/${photo.publicId}`
            : '';
          
          return imageUrl ? (
            <img
              src={imageUrl}
              alt={photo.alt}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              style={{
                opacity: 1, // Always fully visible, no fade
              }}
            />
          ) : null;
        })()}
      </div>
    </div>
  );
}

