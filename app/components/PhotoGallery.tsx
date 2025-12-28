"use client";

import { useState, useEffect } from "react";
import PhotoLightbox from "./PhotoLightbox";

interface Photo {
  src: string;
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

  // Reset loaded images when photos change and check for already-loaded images
  useEffect(() => {
    setLoadedImages(new Set());
    
    // Check if images are already cached/loaded
    photos.forEach((photo, index) => {
      const img = new Image();
      img.onload = () => {
        setLoadedImages((prev) => new Set([...prev, index]));
      };
      img.src = photo.src;
    });
  }, [photos]);

  // Detect horizontal images and calculate layout
  useEffect(() => {
    const horizontalSet = new Set<number>();
    const imagePromises = photos.map((photo, index) => {
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
        img.src = photo.src;
      });
    });
    
    Promise.all(imagePromises).then(() => {
      // Calculate layout positions - packed top-down, no gaps except at bottom
      const positions = new Map<number, { col: string; offset: string; horizontal: string }>();
      let currentRowCols = 0; // Track how many columns are filled in current row (0-3)
      let photoIndex = 0;
      const skippedHorizontal: number[] = []; // Track horizontal photos we skipped
      
      // First pass: place photos filling rows completely
      while (photoIndex < photos.length) {
        // If row is full, start new row
        if (currentRowCols >= 3) {
          currentRowCols = 0;
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
      for (const skippedIndex of skippedHorizontal) {
        if (currentRowCols >= 3) {
          currentRowCols = 0;
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
          positions.set(skippedIndex, {
            col: "lg:col-span-2 lg:col-start-1",
            offset: "",
            horizontal: ""
          });
          currentRowCols = 2;
        }
      }
      
      setLayoutPositions(positions);
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

  return (
    <>
      <div className="mt-8 w-full grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[minmax(150px,auto)] px-6 sm:px-8 lg:px-12">
        {photos.map((photo, index) => {
          const isLoaded = loadedImages.has(index);
          return (
            <button
              key={photo.src}
              onClick={() => openLightbox(index)}
              className={`transition-all duration-500 hover:scale-[1.02] cursor-pointer w-full ${getStaggeredClass(index)} ${
                isLoaded 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-4'
              }`}
              style={{
                transitionDelay: isLoaded ? `${index * 50}ms` : '0ms'
              }}
            >
              <div className="p-3">
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-auto object-contain"
                  onLoad={() => {
                    setLoadedImages((prev) => new Set([...prev, index]));
                  }}
                  onError={() => {
                    // Mark as loaded even on error so it becomes visible
                    setLoadedImages((prev) => new Set([...prev, index]));
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      <PhotoLightbox
        isOpen={selectedPhotoIndex !== null}
        photo={selectedPhoto}
        onClose={closeLightbox}
        onNext={goToNext}
        onPrev={goToPrev}
        hasNext={selectedPhotoIndex !== null && selectedPhotoIndex < photos.length - 1}
        hasPrev={selectedPhotoIndex !== null && selectedPhotoIndex > 0}
      />
    </>
  );
}

