"use client";

import { useState, useEffect, useRef } from "react";
import { CldImage } from 'next-cloudinary';
import PhotoLightbox from "./PhotoLightbox";
import { cacheImages } from "../utils/imageCache";

interface Photo {
  publicId: string;
  alt: string;
  category: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [horizontalPhotos, setHorizontalPhotos] = useState<Set<number>>(new Set());
  const [layoutPositions, setLayoutPositions] = useState<Map<number, { col: string; offset: string; horizontal: string }>>(new Map());
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [firstRowIndices, setFirstRowIndices] = useState<Set<number>>(new Set());
  const [visibleImages, setVisibleImages] = useState<Set<number>>(new Set());
  const imageRefs = useRef<Map<number, HTMLButtonElement | null>>(new Map());

  const openLightbox = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const closeLightbox = () => {
    setSelectedPhotoIndex(null);
  };

  const goToNext = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  const goToPrev = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  const selectedPhoto =
    selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;
  
  // Convert photo to format expected by PhotoLightbox
  const lightboxPhoto = selectedPhoto ? {
    publicId: selectedPhoto.publicId,
    alt: selectedPhoto.alt
  } : null;

  // Reset loaded images when photos change and check for cached images
  useEffect(() => {
    setLoadedImages(new Set());
    setVisibleImages(new Set());
    imageRefs.current.clear();
    
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (cloudName && photos.length > 0) {
      // Pre-cache first few images for faster loading
      const imagesToCache = photos.slice(0, 9).map(photo => 
        `https://res.cloudinary.com/${cloudName}/image/upload/w_800,q_auto/${photo.publicId}`
      );
      cacheImages(imagesToCache).catch(console.warn);
      
      // Check if images are already cached and mark them as loaded immediately
      photos.slice(0, 9).forEach(async (photo, index) => {
        const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_800,q_auto/${photo.publicId}`;
        const img = new Image();
        img.onload = () => {
          // If image loads immediately, it's cached - show it right away
          if (img.complete) {
            setLoadedImages((prev) => new Set([...prev, index]));
          }
        };
        img.src = imageUrl;
      });
    }
  }, [photos]);

  // Intersection Observer to detect when images enter viewport for smooth fade-in
  useEffect(() => {
    // Mark first 9 images as visible immediately (above the fold)
    const initialVisible = new Set<number>();
    for (let i = 0; i < Math.min(9, photos.length); i++) {
      initialVisible.add(i);
    }
    setVisibleImages(initialVisible);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            // Mark as visible for smooth fade-in animation (only for images beyond first 9)
            if (index >= 9) {
              setVisibleImages((prev) => {
                if (!prev.has(index)) {
                  return new Set([...prev, index]);
                }
                return prev;
              });
            }
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.05, // Trigger when 5% is visible
      }
    );

    // Observe all image containers after a short delay
    const timeoutId = setTimeout(() => {
      imageRefs.current.forEach((ref) => {
        if (ref) {
          observer.observe(ref);
        }
      });
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [photos]);

  // Detect horizontal images and calculate layout
  // Prioritize first 9 images (first 3 rows) for faster initial layout
  useEffect(() => {
    const horizontalSet = new Set<number>();
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    // Process first 9 images with high priority (first 3 rows)
    const priorityImages = photos.slice(0, 9);
    const remainingImages = photos.slice(9);
    
    const processImage = (photo: Photo, index: number): Promise<void> => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          // If width is greater than height, it's horizontal
          if (img.width > img.height) {
            horizontalSet.add(index);
            setHorizontalPhotos(new Set(horizontalSet));
          }
          resolve();
        };
        img.onerror = () => resolve();
        // Use smaller image for faster dimension detection
        if (cloudName) {
          img.src = `https://res.cloudinary.com/${cloudName}/image/upload/w_200/${photo.publicId}`;
        } else {
          resolve();
        }
      });
    };
    
    // Process priority images first, then remaining
    const priorityPromises = priorityImages.map((photo, i) => processImage(photo, i));
    
    Promise.all(priorityPromises).then(() => {
      // Process remaining images after priority ones
      const remainingPromises = remainingImages.map((photo, i) => processImage(photo, i + 9));
      return Promise.all(remainingPromises);
    }).then(() => {
      // Calculate layout positions - packed top-down, no gaps except at bottom
      const positions = new Map<number, { col: string; offset: string; horizontal: string }>();
      let currentRowCols = 0; // Track how many columns are filled in current row (0-3)
      let photoIndex = 0;
      let rowNumber = 0; // Track which row we're on
      const firstThreeRows = new Set<number>(); // Track indices in first 3 rows
      const skippedHorizontal: number[] = []; // Track horizontal photos we skipped
      
      // Debug: log horizontal photos detected
      console.log('Horizontal photos detected:', Array.from(horizontalSet).sort((a, b) => a - b));
      
      // First pass: place photos filling rows completely
      while (photoIndex < photos.length) {
        // If row is full, start new row
        if (currentRowCols >= 3) {
          currentRowCols = 0;
          rowNumber++;
          continue;
        }
        
        const isHorizontal = horizontalSet.has(photoIndex);
        const remainingInRow = 3 - currentRowCols;
        const remainingPhotos = photos.length - photoIndex;
        
        if (isHorizontal) {
          // Horizontal photo needs 2 columns
          if (remainingInRow >= 2) {
            if (currentRowCols === 0) {
              // Check if we can fill the row (need a vertical photo next)
              const hasVerticalNext = photoIndex + 1 < photos.length && !horizontalSet.has(photoIndex + 1);
              const isNearEnd = remainingPhotos <= 3; // Last 3 photos can have gaps
              
              // Only place if we can fill the row OR we're at the end
              if (hasVerticalNext || isNearEnd) {
                // Track if in first 3 rows
                if (rowNumber < 3) {
                  firstThreeRows.add(photoIndex);
                }
                
                const staggerPatterns = [
                  { offset: "", horizontal: "" },
                  { offset: "lg:mt-4", horizontal: "" },
                  { offset: "lg:mt-5", horizontal: "" },
                  { offset: "lg:mt-3", horizontal: "" },
                ];
                const pattern = staggerPatterns[photoIndex % staggerPatterns.length];
                positions.set(photoIndex, {
                  col: "lg:col-span-2 lg:col-start-1",
                  offset: pattern.offset,
                  horizontal: pattern.horizontal
                });
                currentRowCols = 2;
                photoIndex++;
                
                // Fill remaining column with next vertical photo if available
                if (photoIndex < photos.length && !horizontalSet.has(photoIndex)) {
                  // Track if in first 3 rows
                  if (rowNumber < 3) {
                    firstThreeRows.add(photoIndex);
                  }
                  
                  const vertPatterns = [
                    { offset: "lg:mt-5", horizontal: "" },
                    { offset: "lg:mt-4", horizontal: "" },
                    { offset: "lg:mt-6", horizontal: "" },
                  ];
                  const vertPattern = vertPatterns[photoIndex % vertPatterns.length];
                  positions.set(photoIndex, {
                    col: "lg:col-start-3",
                    offset: vertPattern.offset,
                    horizontal: vertPattern.horizontal
                  });
                  currentRowCols = 3;
                  photoIndex++;
                }
              } else {
                // Can't fill row, skip this horizontal for now
                skippedHorizontal.push(photoIndex);
                photoIndex++;
                continue;
              }
            } else if (currentRowCols === 1) {
              // Place horizontal at cols 2-3 to complete row
              // Track if in first 3 rows
              if (rowNumber < 3) {
                firstThreeRows.add(photoIndex);
              }
              
              const staggerPatterns = [
                { offset: "lg:mt-4", horizontal: "" },
                { offset: "lg:mt-5", horizontal: "" },
                { offset: "lg:mt-3", horizontal: "" },
              ];
              const pattern = staggerPatterns[photoIndex % staggerPatterns.length];
              positions.set(photoIndex, {
                col: "lg:col-span-2 lg:col-start-2",
                offset: pattern.offset,
                horizontal: pattern.horizontal
              });
              currentRowCols = 3;
              photoIndex++;
            } else {
              // Can't place horizontal here, start new row
              currentRowCols = 0;
              continue;
            }
          } else {
            // Not enough space, start new row
            currentRowCols = 0;
            continue;
          }
        } else {
          // Vertical photo needs 1 column - always place it with slight vertical staggering only
          // Track if in first 3 rows
          if (rowNumber < 3) {
            firstThreeRows.add(photoIndex);
          }
          
          const staggerPatterns = [
            { offset: "", horizontal: "" },
            { offset: "lg:mt-4", horizontal: "" },
            { offset: "lg:mt-5", horizontal: "" },
            { offset: "lg:mt-3", horizontal: "" },
            { offset: "lg:mt-6", horizontal: "" },
            { offset: "lg:mt-4", horizontal: "" },
          ];
          const pattern = staggerPatterns[photoIndex % staggerPatterns.length];
          
          if (currentRowCols === 0) {
            positions.set(photoIndex, {
              col: "lg:col-start-1",
              offset: pattern.offset,
              horizontal: pattern.horizontal
            });
            currentRowCols = 1;
          } else if (currentRowCols === 1) {
            positions.set(photoIndex, {
              col: "lg:col-start-2",
              offset: pattern.offset,
              horizontal: pattern.horizontal
            });
            currentRowCols = 2;
          } else if (currentRowCols === 2) {
            positions.set(photoIndex, {
              col: "lg:col-start-3",
              offset: pattern.offset,
              horizontal: pattern.horizontal
            });
            currentRowCols = 3;
          }
          photoIndex++;
        }
      }
      
      // Second pass: place any skipped horizontal photos at the end (will create gaps, but only at bottom)
      // All skipped photos are horizontal, so they MUST span 2 columns
      for (const skippedIndex of skippedHorizontal) {
        // Track if in first 3 rows
        if (rowNumber < 3) {
          firstThreeRows.add(skippedIndex);
        }
        
        if (currentRowCols >= 3) {
          currentRowCols = 0;
          rowNumber++;
        }
        
        if (currentRowCols === 0) {
          positions.set(skippedIndex, {
            col: "lg:col-span-2 lg:col-start-1",
            offset: "",
            horizontal: ""
          });
          currentRowCols = 2;
        } else if (currentRowCols === 1) {
          positions.set(skippedIndex, {
            col: "lg:col-span-2 lg:col-start-2",
            offset: "",
            horizontal: ""
          });
          currentRowCols = 3;
        } else {
          // Start new row
          currentRowCols = 0;
          rowNumber++;
          positions.set(skippedIndex, {
            col: "lg:col-span-2 lg:col-start-1",
            offset: "",
            horizontal: ""
          });
          currentRowCols = 2;
        }
      }
      
      // Final check: ensure all horizontal photos have col-span-2
      horizontalSet.forEach((index) => {
        const position = positions.get(index);
        if (position && !position.col.includes('col-span-2')) {
          console.warn(`Horizontal photo at index ${index} was not assigned col-span-2, fixing...`);
          // Force it to span 2 columns - find the best position
          const existingCol = position.col;
          if (existingCol.includes('col-start-1')) {
            position.col = 'lg:col-span-2 lg:col-start-1';
          } else if (existingCol.includes('col-start-2')) {
            position.col = 'lg:col-span-2 lg:col-start-2';
          } else if (existingCol.includes('col-start-3')) {
            position.col = 'lg:col-span-2 lg:col-start-1';
          } else {
            position.col = 'lg:col-span-2 lg:col-start-1';
          }
          positions.set(index, position);
        }
      });
      
      setLayoutPositions(positions);
      setFirstRowIndices(firstThreeRows);
    });
  }, [photos]);

  // Get layout class from calculated positions
  const getStaggeredClass = (index: number) => {
    const position = layoutPositions.get(index);
    if (position) {
      return `${position.col} ${position.offset} ${position.horizontal}`;
    }
    // Fallback to default pattern if not calculated yet
    return "lg:col-start-1";
  };

  // Check if image is horizontal (spans 2 columns)
  const isHorizontalImage = (index: number) => {
    const position = layoutPositions.get(index);
    return position?.col?.includes('col-span-2') || false;
  };

  return (
    <>
      <div className="mt-8 w-full grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[minmax(150px,auto)] px-6 sm:px-8 lg:px-12">
        {photos.map((photo, index) => {
          const isLoaded = loadedImages.has(index);
          const isVisible = visibleImages.has(index);
          // Only show image if it's both loaded AND visible (for scroll fade-in effect)
          const shouldShow = isLoaded && (isVisible || index < 9); // First 9 show immediately, rest wait for visibility
          
          // Calculate delay: smooth fade-in for visible images when scrolling
          // For images beyond first 9, only fade in when they become visible
          const baseDelay = index < 9 ? index * 60 : 0;
          // Smooth staggered delay for visible images (creates cascading effect)
          const visibleDelay = isVisible && index >= 9 ? Math.min((index - 9) * 30, 150) : baseDelay;
          // Use delay for smooth fade-in when scrolling
          const finalDelay = shouldShow ? (isVisible && index >= 9 ? visibleDelay : baseDelay) : 0;
          
          return (
            <button
              key={photo.publicId}
              ref={(el) => {
                if (el) {
                  imageRefs.current.set(index, el);
                } else {
                  imageRefs.current.delete(index);
                }
              }}
              data-index={index}
              onClick={() => openLightbox(index)}
              onMouseEnter={() => {
                // Aggressively preload and cache full-resolution image for lightbox on hover
                const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                if (cloudName) {
                  const imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_1920,q_90/${photo.publicId}`;
                  
                  // Use link preload for fastest loading (highest priority)
                  const link = document.createElement('link');
                  link.rel = 'preload';
                  link.as = 'image';
                  link.href = imageUrl;
                  link.setAttribute('fetchpriority', 'high');
                  document.head.appendChild(link);
                  
                  // Also preload with Image object for browser cache (this ensures it's in memory)
                  const img = new Image();
                  img.fetchPriority = 'high';
                  img.src = imageUrl;
                  
                  // Preload quick-load version for instant display
                  const quickUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_800,q_80/${photo.publicId}`;
                  const quickImg = new Image();
                  quickImg.fetchPriority = 'high';
                  quickImg.src = quickUrl;
                  
                  // Cache it via Cache API
                  cacheImages([imageUrl, quickUrl]).catch(console.warn);
                }
              }}
              className={`transition-all ease-out hover:scale-[1.02] cursor-pointer w-full ${getStaggeredClass(index)} ${
                shouldShow ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
              style={{
                transitionDuration: isVisible && index >= 9 ? '500ms' : '400ms', // Smooth fade-in for visible images
                transitionDelay: finalDelay > 0 ? `${finalDelay}ms` : '0ms',
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)', // Smooth easing
              }}
            >
              <div className="p-3 relative">
                {/* Placeholder to prevent layout shift and flicker */}
                {!shouldShow && (
                  <div className="absolute inset-3 bg-neutral-900/50 animate-pulse rounded-sm" />
                )}
                <CldImage
                  src={photo.publicId}
                  alt={photo.alt}
                  width={isHorizontalImage(index) ? 1600 : 800}
                  height={800}
                  className={`w-full h-auto object-contain transition-opacity ease-out ${
                    shouldShow ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    willChange: shouldShow ? 'auto' : 'opacity',
                    transitionDuration: isVisible && index >= 9 ? '500ms' : '400ms', // Smooth fade-in for visible images
                    transitionDelay: shouldShow && finalDelay > 0 ? `${finalDelay}ms` : '0ms',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)', // Smooth easing
                  }}
                  loading={firstRowIndices.has(index) || isVisible ? "eager" : "lazy"}
                  sizes={isHorizontalImage(index) 
                    ? "(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 66vw"
                    : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  }
                  quality={firstRowIndices.has(index) ? 90 : 75}
                  fetchPriority={
                    firstRowIndices.has(index) 
                      ? (Array.from(firstRowIndices).indexOf(index) < 6 ? "high" : "auto")
                      : isVisible 
                        ? "high" 
                        : "low"
                  }
                  onLoad={(e) => {
                    // Check if image is already complete (cached) - show immediately
                    const img = e.target as HTMLImageElement;
                    if (img && img.complete) {
                      // Cached image - show immediately without any delay
                      requestAnimationFrame(() => {
                        setLoadedImages((prev) => {
                          if (!prev.has(index)) {
                            return new Set([...prev, index]);
                          }
                          return prev;
                        });
                      });
                    } else {
                      // New image - very short delay for smooth animation
                      requestAnimationFrame(() => {
                        setTimeout(() => {
                          setLoadedImages((prev) => {
                            if (!prev.has(index)) {
                              return new Set([...prev, index]);
                            }
                            return prev;
                          });
                        }, 30); // Reduced from 50ms to 30ms
                      });
                    }
                    
                    // Preload full-resolution version for lightbox when gallery image loads
                    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
                    if (cloudName) {
                      const lightboxUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_1920,q_auto/${photo.publicId}`;
                      cacheImages([lightboxUrl]).catch(() => {
                        // Fallback: just preload
                        const preloadImg = new Image();
                        preloadImg.src = lightboxUrl;
                      });
                    }
                  }}
                  onError={() => {
                    // Mark as loaded even on error so it becomes visible
                    setLoadedImages((prev) => {
                      if (!prev.has(index)) {
                        return new Set([...prev, index]);
                      }
                      return prev;
                    });
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      <PhotoLightbox
        isOpen={selectedPhotoIndex !== null}
        photo={lightboxPhoto}
        onClose={closeLightbox}
        onNext={goToNext}
        onPrev={goToPrev}
        hasNext={selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1}
        hasPrev={selectedPhotoIndex !== null && selectedPhotoIndex > 0}
        nextPhoto={
          selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1
            ? {
                publicId: photos[selectedPhotoIndex + 1].publicId,
                alt: photos[selectedPhotoIndex + 1].alt,
              }
            : null
        }
        prevPhoto={
          selectedPhotoIndex !== null && selectedPhotoIndex > 0
            ? {
                publicId: photos[selectedPhotoIndex - 1].publicId,
                alt: photos[selectedPhotoIndex - 1].alt,
              }
            : null
        }
        allPhotos={photos.map(p => ({ publicId: p.publicId, alt: p.alt }))}
        currentIndex={selectedPhotoIndex ?? undefined}
      />
    </>
  );
}

