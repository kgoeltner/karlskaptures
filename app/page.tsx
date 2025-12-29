"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const backgrounds = [
    '/photos/backgrounds/background-1.jpg',
    '/photos/backgrounds/background-2.jpg',
    '/photos/backgrounds/background-3.jpg',
    '/photos/backgrounds/background-4.jpg',
  ];
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Prevent scrolling
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Cycle through backgrounds every 5 seconds
    const interval = setInterval(() => {
      setCurrentBackgroundIndex((prev) => (prev + 1) % backgrounds.length);
    }, 5000);

    return () => {
      clearInterval(interval);
      // Cleanup when leaving the page
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.backgroundAttachment = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [backgrounds.length]);

  // Preload all background images
  useEffect(() => {
    backgrounds.forEach((bg) => {
      const img = new Image();
      img.src = bg;
    });
  }, [backgrounds]);

  // Set body background to first image as fallback
  useEffect(() => {
    document.body.style.backgroundImage = `url(${backgrounds[0]})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundAttachment = 'fixed';
  }, [backgrounds]);

  // Trigger fade-in on mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <>
      {/* Background overlay divs for smooth transitions - covers entire viewport including nav */}
      <div className="fixed inset-0 z-0">
        {backgrounds.map((bg, index) => (
          <div
            key={bg}
            className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
            style={{
              backgroundImage: `url(${bg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'fixed',
              opacity: index === currentBackgroundIndex ? 1 : 0,
              pointerEvents: 'none',
            }}
          />
        ))}
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
