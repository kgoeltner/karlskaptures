"use client";

import { useEffect, useState, useRef } from "react";

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Home() {
  const allBackgrounds = [
    '/photos/backgrounds/background-1.jpg',
    '/photos/backgrounds/background-2.jpg',
    '/photos/backgrounds/background-3.jpg',
    '/photos/backgrounds/background-4.jpg',
    '/photos/backgrounds/background-5.jpg',
  ];
  
  // Start with original order for consistent hydration, then shuffle on client
  const [shuffledBackgrounds, setShuffledBackgrounds] = useState<string[]>(allBackgrounds);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [firstImageLoaded, setFirstImageLoaded] = useState(false);
  const cycleCountRef = useRef(0);
  const hasShuffledRef = useRef(false);

  useEffect(() => {
    // Prevent scrolling
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    let interval: NodeJS.Timeout | null = null;

    // Delay the start of background cycling to keep first image visible longer on initial load
    // Wait 8 seconds before starting to cycle (so first image stays for 8 seconds)
    const startTimeout = setTimeout(() => {
      // Cycle through backgrounds every 5 seconds
      interval = setInterval(() => {
        setCurrentBackgroundIndex((prev) => {
          const nextIndex = prev + 1;
          // If we've reached the end of the shuffled array, reshuffle and start over
          if (nextIndex >= shuffledBackgrounds.length) {
            const newShuffled = shuffleArray(allBackgrounds);
            setShuffledBackgrounds(newShuffled);
            cycleCountRef.current = 0;
            return 0;
          }
          cycleCountRef.current = nextIndex;
          return nextIndex;
        });
      }, 5000);
    }, 8000);

    return () => {
      clearTimeout(startTimeout);
      if (interval) {
        clearInterval(interval);
      }
      // Cleanup when leaving the page
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.backgroundAttachment = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [shuffledBackgrounds.length, allBackgrounds]);

  // Preload all background images
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = allBackgrounds.map((bg) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve; // Continue even if one fails
          img.src = bg;
        });
      });
      await Promise.all(imagePromises);
    };
    
    preloadImages();
  }, [allBackgrounds]);

  // Preload and wait for first image to be fully loaded before showing it
  useEffect(() => {
    if (shuffledBackgrounds.length > 0 && shuffledBackgrounds[0] && !firstImageLoaded) {
      const firstImg = new Image();
      firstImg.onload = () => {
        // Ensure image is fully decoded before showing
        if (firstImg.complete && firstImg.naturalWidth > 0) {
          setFirstImageLoaded(true);
        }
      };
      firstImg.onerror = () => {
        // Still show even if image fails to load
        setFirstImageLoaded(true);
      };
      // Set src after handlers are attached
      firstImg.src = shuffledBackgrounds[0];
      
      // Fallback: if image is already cached and complete, mark as loaded immediately
      if (firstImg.complete && firstImg.naturalWidth > 0) {
        setFirstImageLoaded(true);
      }
    }
  }, [shuffledBackgrounds, firstImageLoaded]);

  // Initialize on mount - shuffle and trigger fade-in on client side only (after hydration)
  useEffect(() => {
    if (!hasShuffledRef.current) {
      // Shuffle backgrounds first (before fade-in)
      const newShuffled = shuffleArray(allBackgrounds);
      setShuffledBackgrounds(newShuffled);
      hasShuffledRef.current = true;
      
      // Trigger fade-in for content immediately
      setIsLoaded(true);
      
      // Preload first image immediately and wait for it before mounting
      const firstImg = new Image();
      firstImg.onload = () => {
        // Ensure image is fully decoded
        if (firstImg.complete && firstImg.naturalWidth > 0) {
          setFirstImageLoaded(true);
          // Use requestAnimationFrame to ensure smooth transition
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setIsMounted(true);
            });
          });
        }
      };
      firstImg.onerror = () => {
        // Still show even if image fails
        setFirstImageLoaded(true);
        requestAnimationFrame(() => {
          setIsMounted(true);
        });
      };
      firstImg.src = newShuffled[0];
      
      // If image is already cached, handle immediately
      if (firstImg.complete && firstImg.naturalWidth > 0) {
        setFirstImageLoaded(true);
        requestAnimationFrame(() => {
          setIsMounted(true);
        });
      } else {
        // Fallback: mount anyway after max 500ms to prevent indefinite wait
        setTimeout(() => {
          if (!firstImageLoaded) {
            setFirstImageLoaded(true);
            setIsMounted(true);
          }
        }, 500);
      }
    }
  }, [allBackgrounds]);

  return (
    <>
      {/* Background overlay divs for smooth transitions - covers entire viewport including nav */}
      <div className="fixed inset-0 z-0">
        {allBackgrounds.map((bg) => {
          // Find the index of this background in the shuffled array
          const shuffledIndex = shuffledBackgrounds.indexOf(bg);
          // Show this background if it's the current one in the shuffled cycle
          const isActive = shuffledIndex === currentBackgroundIndex && shuffledIndex !== -1;
          
          // Show first background immediately on initial load, then normal transitions
          const getOpacity = () => {
            // Only show first background if it's loaded and mounted
            if (!isMounted || !firstImageLoaded) {
              return 0;
            }
            // After mount, use normal transitions for background changes
            return isActive ? 1 : 0;
          };
          
          // Use slower transition for subsequent background changes (not initial load)
          // But disable transition on initial mount to prevent jitter
          const transitionDuration = isMounted && firstImageLoaded ? 'duration-[2000ms]' : 'duration-0';
          
          return (
            <div
              key={bg}
              className={`absolute inset-0 transition-opacity ${transitionDuration} ease-in-out`}
              style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed',
                opacity: getOpacity(),
                pointerEvents: 'none',
              }}
            />
          );
        })}
      </div>
      <div className="fixed inset-0 bg-black/40 z-[1] pointer-events-none"></div>
      <main className="flex h-screen flex-col items-center justify-center md:justify-center px-4 text-center relative overflow-hidden z-10">
        <div className="relative z-10 -mt-16 md:mt-0">
          <h1 
            className={`text-4xl font-semibold transition-opacity duration-700 ease-out ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '0ms' }}
          >
            karlskaptures
          </h1>
          <p 
            className={`mt-3 text-neutral-200 transition-opacity duration-700 ease-out ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '150ms' }}
          >
        Photography by Karl Goeltner
      </p>
        </div>
    </main>
    </>
  );
}
