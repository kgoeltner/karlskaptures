export default function WorkPage() {
    const photos = [
      { src: "/photos/buddies.jpg", alt: "Street – San Francisco" },
      { src: "/photos/couple_grad.jpg", alt: "Matcha – Berkeley" },
      { src: "/photos/fairies_grad.jpg", alt: "Travel – Hong Kong" },
    ];
  
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-semibold">Work</h1>
        <p className="mt-2 text-sm text-neutral-500">
          A selection of recent photographs.
        </p>
  
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p) => (
            <div
              key={p.src}
              className="overflow-hidden rounded-2xl bg-neutral-900"
            >
              <img
                src={p.src}
                alt={p.alt}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </main>
    );
  }
  