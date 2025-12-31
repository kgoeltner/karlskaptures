"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

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

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "When will we get our photos?",
    answer: "You will receive a Google Drive link within two weeks of your shoot. Delivery time may vary slightly depending on my schedule. The link will remain active for 30 days."
  },
  {
    question: "How many pictures will we receive?",
    answer: "The number of fully edited photos depends on your selected package—see your package details for the specific count. I prioritize quality, so you may receive additional photos beyond what's promised if the session yields exceptional results."
  },
  {
    question: "Where are you based and do you travel?",
    answer: "I'm based in the Bay Area and available for shoots throughout the region. For locations outside the Bay Area, travel expenses may apply."
  },
  {
    question: "Can I get my pictures back faster?",
    answer: "Yes! For an additional $50 expedited processing fee, I can deliver your photos within one week instead of the standard two-week turnaround."
  }
];

export default function ServicesPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 pb-32">
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

      {/* FAQ Section */}
      <div className="mt-24 mb-0">
        <div
          className={`transition-opacity duration-700 ease-out ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: "750ms" }}
        >
          <h1 className="text-3xl font-semibold">FAQ</h1>
          <p className="mt-2 text-sm text-neutral-500">
            Common questions about our photography services.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6 mt-12">
          {faqItems.map((faq, index) => {
            const isOpen = openFAQ === index;
            const baseDelay = 800 + (index * 100);
            
            return (
              <div
                key={index}
                className={`transition-opacity duration-700 ease-out ${
                  isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${baseDelay}ms` }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left flex items-start justify-between gap-4 py-2 group"
                >
                  <span className="text-neutral-300 font-medium pr-4 group-hover:text-neutral-200 transition-colors">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-4 h-4 text-neutral-500 flex-shrink-0 mt-1 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="pt-2 pb-4 pl-0">
                    <p className="text-neutral-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
                {index < faqItems.length - 1 && (
                  <div className="border-t border-neutral-800 mt-6"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Book Now Button */}
        <div
          className={`mt-16 flex justify-center transition-opacity duration-700 ease-out ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: "1200ms" }}
        >
          <Link
            href="/contact"
            className="px-8 py-2 bg-neutral-100 text-neutral-900 font-medium hover:bg-neutral-200 transition-colors"
          >
            Book Now
          </Link>
        </div>
      </div>
    </main>
  );
}
