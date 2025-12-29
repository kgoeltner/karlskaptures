"use client";

import { useState, useEffect } from "react";

export default function AboutPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div
        className={`transition-opacity duration-700 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transitionDelay: '0ms' }}
      >
        <h1 className="text-3xl font-semibold">About</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Learn more about the photographer.
        </p>
      </div>
      
      <div
        className={`mt-12 flex flex-col md:flex-row gap-8 items-start transition-opacity duration-700 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transitionDelay: '150ms' }}
      >
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          <img
            src="/photos/pfp.jpg"
            alt="Karl Goeltner"
            className="w-64 md:w-80 h-auto transition-opacity duration-700 ease-out"
            style={{
              opacity: isLoaded ? 1 : 0,
              transitionDelay: '200ms',
            }}
          />
        </div>

        {/* About Content */}
        <div className="flex-1 space-y-6">
          <div
            className={`transition-opacity duration-700 ease-out ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <h2 className="text-2xl font-semibold mb-4">Karl Goeltner</h2>
            <p className="text-neutral-300 leading-relaxed">
            Welcome to karlskaptures, a collection of moments captured through my lens.
            Born and raised in the Bay Area, my travels have taken me to places near and far, each offering its own story to tell.
            </p>
          </div>

          <div
            className={`transition-opacity duration-700 ease-out ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            <p className="text-neutral-300 leading-relaxed">
              From the familiar landscapes of California to the vibrant energy of new destinations, 
              my photography captures authentic emotions and genuine connections. Whether 
              documenting graduations, family gatherings, or everyday scenes, I aim to 
              preserve the moments that make each experience meaningful.
            </p>
          </div>

          <div
            className={`transition-opacity duration-700 ease-out ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            <p className="text-neutral-300 leading-relaxed">
              Currently back in the Bay Area, I continue recording moments that feel both familiar and quietly extraordinary.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

