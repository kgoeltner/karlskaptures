export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold">About</h1>
      <p className="mt-2 text-sm text-neutral-500">
        Learn more about the photographer.
      </p>
      
      <div className="mt-12 flex flex-col md:flex-row gap-8 items-start">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          <img
            src="/photos/pfp.jpg"
            alt="Karl Goeltner"
            className="w-64 md:w-80 h-auto"
          />
        </div>

        {/* About Content */}
        <div className="flex-1 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Karl Goeltner</h2>
            <p className="text-neutral-300 leading-relaxed">
              Welcome to karlskaptures, a collection of moments captured through my lens. 
              I'm a photographer passionate about documenting life's beautiful moments, 
              from graduation celebrations to intimate family gatherings and everything in between.
            </p>
          </div>

          <div>
            <p className="text-neutral-300 leading-relaxed">
              My work focuses on capturing authentic emotions and genuine connections, 
              whether it's the joy of a graduation day, the warmth of family bonds, 
              or the energy of urban landscapes. Each photograph tells a story, 
              preserving memories that will last a lifetime.
            </p>
          </div>

          <div>
            <p className="text-neutral-300 leading-relaxed">
              Through my photography, I aim to create timeless images that reflect 
              the unique personality and essence of each subject. Every session is an 
              opportunity to create something meaningful and beautiful.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

