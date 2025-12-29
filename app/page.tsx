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

  // Preload all background images and wait for first image to load before fade-in
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

  // Set body background to first image as fallback (only after mount to prevent flicker)
  useEffect(() => {
    if (shuffledBackgrounds.length > 0 && isMounted) {
      document.body.style.backgroundImage = `url(${shuffledBackgrounds[0]})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundAttachment = 'fixed';
    }
  }, [shuffledBackgrounds, isMounted]);

  // Initialize on mount - shuffle and trigger fade-in on client side only (after hydration)
  useEffect(() => {
    if (!hasShuffledRef.current) {
      // Shuffle backgrounds first (before fade-in)
      const newShuffled = shuffleArray(allBackgrounds);
      setShuffledBackgrounds(newShuffled);
      hasShuffledRef.current = true;
      
      // Trigger fade-in for content immediately
      setIsLoaded(true);
      
      // Wait for images to load and DOM to be ready, then fade in background from black
      // Use multiple requestAnimationFrame calls to ensure everything is ready
      const startFadeIn = () => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Small delay to ensure shuffle state has propagated
            setTimeout(() => {
              setIsMounted(true);
            }, 50);
          });
        });
      };
      
      // Check if first image is loaded, otherwise wait a bit
      const firstImg = new Image();
      firstImg.onload = startFadeIn;
      firstImg.onerror = startFadeIn; // Start anyway if image fails
      firstImg.src = newShuffled[0];
      
      // Fallback timeout in case image takes too long
      setTimeout(startFadeIn, 300);
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
            // Before mount, show first background immediately (no fade-in)
            if (!isMounted) {
              // Show the first background in the shuffled array immediately
              return shuffledIndex === 0 && currentBackgroundIndex === 0 ? 1 : 0;
            }
            // After mount, use normal transitions for background changes
            return isActive ? 1 : 0;
          };
          
          // Use slower transition for subsequent background changes (not initial load)
          const transitionDuration = 'duration-[2000ms]';
          
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
      <main className="flex h-screen flex-col items-center justify-center px-4 text-center relative overflow-hidden z-10">
        <div className="relative z-10">
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
