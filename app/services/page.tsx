"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Service {
  id: string;
  title: string;
  image: string;
  description: string;
  price: string;
  details: string[];
}

const services: Service[] = [
  {
    id: "solo-grad",
    title: "Solo Grad",
    image: "/photos/services/solo_grad.jpg",
    description: "A 60-minute photoshoot focused entirely on you. Select multiple locations and enjoy ample time to explore different angles, poses, and settings. This session is designed to capture your unique personality and celebrate your achievement.",
    price: "$195",
    details: [
      "60-minute photoshoot",
      "Multiple locations",
      "25-30 edited photos"
    ]
  },
  {
    id: "couples-duo-grad",
    title: "Couples / Duo Grad",
    image: "/photos/services/couples_grad.jpg",
    description: "A personalized photoshoot crafted for couples or duos celebrating graduation together. We'll capture your connection through a blend of candid moments and thoughtfully composed shots at locations that reflect your shared story.",
    price: "$295",
    details: [
      "Flexible duration",
      "Multiple locations available",
      "50-60 edited photos"
    ]
  },
  {
    id: "group-grad",
    title: "Group Grad",
    image: "/photos/services/group_grad.jpg",
    description: "Celebrate this milestone with your friends! Whether you're a small group of 2-7 or a larger group of 8+, we'll create a dynamic session that includes group photos, smaller subgroup shots, and individual portraits. Perfect for clubs, teams, or friend groups.",
    price: "Small: $80-120/person | Large: $250",
    details: [
      "60-minute photoshoot",
      "Up to 4 locations (small) or 2-3 locations (large)",
      "60-70 edited photos",
      "Contact for longer shoot pricing"
    ]
  },
  {
    id: "portrait-shoot",
    title: "Portrait Shoot",
    image: "/photos/services/portrait.jpg",
    description: "Professional portrait photography tailored to your needs—whether for headshots, lifestyle portraits, or personal branding. We'll collaborate to create images that authentically represent you, whether in a studio setting or at a location of your choosing.",
    price: "Contact me",
    details: [
      "Flexible duration",
      "Studio or location options",
      "Professional editing included"
    ]
  },
  {
    id: "family-shoot",
    title: "Family Shoot",
    image: "/photos/services/family.jpg",
    description: "Preserve your family's most meaningful moments with a personalized photoshoot. Ideal for family portraits, milestone celebrations, or simply documenting the connections and stories that make your family unique. We'll work together to create images you'll treasure for years to come.",
    price: "Contact me",
    details: [
      "Flexible duration",
      "Location of your choice",
      "Professional editing included"
    ]
  }
];

export default function ServicesPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div
        className={`transition-opacity duration-700 ease-out ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ transitionDelay: "0ms" }}
      >
        <h1 className="text-3xl font-semibold">Services</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Photography services and packages.
        </p>
      </div>

      <div className="mt-12 space-y-16 mb-24 md:mb-32">
        {services.map((service, index) => {
          const isEven = index % 2 === 1; // Alternate: odd indices (1, 3, 5) are "even" rows
          const baseDelay = 150 + (index * 100); // Start at 150ms, then add 100ms per service
          
          return (
            <div
              key={service.id}
              className={`flex flex-col md:flex-row gap-4 items-center ${isEven ? "md:flex-row-reverse" : ""}`}
            >
              {/* Service Image */}
              <div 
                className={`flex-shrink-0 w-full md:w-96 transition-opacity duration-700 ease-out ${
                  isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${baseDelay}ms` }}
              >
                <div className="relative w-full overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    width={800}
                    height={600}
                    className="object-contain w-full h-auto"
                    sizes="(max-width: 768px) 100vw, 384px"
                  />
                </div>
              </div>

              {/* Service Content */}
              <div className="flex-1 space-y-4 flex flex-col justify-center text-center max-w-md mx-auto">
                <div
                  className={`transition-opacity duration-700 ease-out ${
                    isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${baseDelay + 50}ms` }}
                >
                  <h2 className="text-2xl font-semibold mb-6 text-neutral-200">{service.title}</h2>
                  <p className="text-neutral-400 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div 
                  className={`flex justify-center pt-4 transition-opacity duration-700 ease-out ${
                    isLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ transitionDelay: `${baseDelay + 100}ms` }}
                >
                  <div className="h-8 w-px bg-neutral-700"></div>
                </div>

                <div 
                  className={`pt-4 transition-opacity duration-700 ease-out ${
                    isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${baseDelay + 150}ms` }}
                >
                  <div className="text-xl font-semibold text-neutral-300 mb-4">
                    {service.price}
                  </div>
                  <ul className="space-y-2">
                    {service.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="text-neutral-500 text-sm flex items-start justify-center">
                        <span className="text-neutral-600 mr-2">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
          </div>
          );
        })}
      </div>
    </main>
  );
}
