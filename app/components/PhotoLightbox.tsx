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
}: PhotoLightboxProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [lowQualityLoaded, setLowQualityLoaded] = useState(false);
  
  // Reset image loaded state when photo changes
  useEffect(() => {
    setImageLoaded(false);
    setLowQualityLoaded(false);
  }, [photo?.publicId]);

  // Immediately preload current image and adjacent images when lightbox opens
  useEffect(() => {
    if (!isOpen || !photo) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) return;

    const currentImageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_1920,q_auto/${photo.publicId}`;
    
    // Aggressively check if image is already in browser cache
    const checkCache = () => {
      const testImg = new Image();
      testImg.onload = () => {
        if (testImg.complete && testImg.naturalWidth > 0) {
          // Image is cached and ready
          setImageLoaded(true);
          setLowQualityLoaded(true);
        }
      };
      testImg.onerror = () => {
        // Not cached, continue with normal loading
      };
      testImg.src = currentImageUrl;
    };
    
    // Check cache immediately
    checkCache();
    
    // Also check via Cache API
    getCachedImage(currentImageUrl).then((cached) => {
      if (cached) {
        setImageLoaded(true);
        setLowQualityLoaded(true);
      }
    });

    const imagesToCache: string[] = [];
    imagesToCache.push(currentImageUrl);
    
    // Preload a medium quality version for instant display (faster than low quality)
    const mediumQualityUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_1200,q_75/${photo.publicId}`;
    const mediumImg = new Image();
    mediumImg.onload = () => {
      if (!imageLoaded) {
        setLowQualityLoaded(true);
      }
    };
    mediumImg.src = mediumQualityUrl;

    // Preload next image
    if (nextPhoto) {
      imagesToCache.push(`https://res.cloudinary.com/${cloudName}/image/upload/w_1920,q_auto/${nextPhoto.publicId}`);
    }

    // Preload previous image
    if (prevPhoto) {
      imagesToCache.push(`https://res.cloudinary.com/${cloudName}/image/upload/w_1920,q_auto/${prevPhoto.publicId}`);
    }

    // Cache all images
    if (imagesToCache.length > 0) {
      cacheImages(imagesToCache).catch(console.warn);
    }
  }, [isOpen, photo, nextPhoto, prevPhoto]);

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
        {/* Medium quality placeholder for instant display */}
        {lowQualityLoaded && !imageLoaded && (
          <CldImage
            src={photo.publicId}
            alt={photo.alt}
            width={1200}
            height={1200}
            className="max-h-[90vh] max-w-[90vw] object-contain opacity-70"
            quality={75}
            loading="eager"
            fetchPriority="high"
          />
        )}
        
        {/* Loading spinner - only show if nothing has loaded yet */}
        {!lowQualityLoaded && !imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-700 border-t-white" />
          </div>
        )}
        
        {/* High quality image */}
        <CldImage
          src={photo.publicId}
          alt={photo.alt}
          width={1920}
          height={1920}
          className={`max-h-[90vh] max-w-[90vw] object-contain transition-opacity duration-150 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="eager"
          fetchPriority="high"
          quality="auto"
          format="auto"
          onLoad={() => {
            // Immediately show the image when loaded (no delay)
            requestAnimationFrame(() => {
              setImageLoaded(true);
            });
          }}
          onError={() => {
            // If high quality fails, at least show the medium quality
            if (lowQualityLoaded) {
              setImageLoaded(true);
            }
          }}
        />
      </div>
    </div>
  );
}

