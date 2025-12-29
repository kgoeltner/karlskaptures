"use client";

import { useState, useEffect } from "react";

export default function ContactPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    photoshootType: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    // TODO: Implement form submission logic (e.g., send to API endpoint)
    // For now, simulate a submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        photoshootType: "",
        message: "",
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 5000);
    }, 1000);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div
        className={`transition-opacity duration-700 ease-out ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ transitionDelay: "0ms" }}
      >
        <h1 className="text-3xl font-semibold">Contact</h1>
        <p className="mt-2 text-sm text-neutral-500">
          Get in touch for bookings and inquiries.
        </p>
      </div>

      <div
        className={`mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12 transition-opacity duration-700 ease-out ${
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
        style={{ transitionDelay: "150ms" }}
      >
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div
                className={`transition-opacity duration-700 ease-out ${
                  isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: "200ms" }}
              >
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-neutral-300 mb-2"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-700 focus:border-transparent transition-colors"
                  placeholder="John"
                />
              </div>

              <div
                className={`transition-opacity duration-700 ease-out ${
                  isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: "250ms" }}
              >
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-neutral-300 mb-2"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-700 focus:border-transparent transition-colors"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div
              className={`transition-opacity duration-700 ease-out ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "300ms" }}
            >
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-300 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-700 focus:border-transparent transition-colors"
                placeholder="john.doe@example.com"
              />
            </div>

            <div
              className={`transition-opacity duration-700 ease-out ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "350ms" }}
            >
              <label
                htmlFor="photoshootType"
                className="block text-sm font-medium text-neutral-300 mb-2"
              >
                Photoshoot Type
              </label>
              <select
                id="photoshootType"
                name="photoshootType"
                value={formData.photoshootType}
                onChange={handleChange}
                required
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundSize: '1.25em 1.25em',
                  backgroundPosition: 'right 1rem center',
                  backgroundRepeat: 'no-repeat',
                }}
                className={`w-full px-4 py-2 pr-12 bg-neutral-900 border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-700 focus:border-transparent transition-colors appearance-none ${
                  formData.photoshootType === "" 
                    ? "text-neutral-500" 
                    : "text-neutral-100"
                }`}
              >
                <option value="" disabled>
                  Select a photoshoot type...
                </option>
                <option value="grad-individual">Grad - Individual</option>
                <option value="grad-couple-duo">Grad - Couple/Duo</option>
                <option value="grad-group">Grad - Group (3+, please inform me of the # of people)</option>
                <option value="couples-engagements">Couples/Engagements</option>
                <option value="wedding">Wedding</option>
                <option value="portrait">Portrait Photoshoot (Headshots, Lifestyle)</option>
                <option value="events">Events (Birthdays, Bridal Showers, etc.)</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div
              className={`transition-opacity duration-700 ease-out ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              <label
                htmlFor="message"
                className="block text-sm font-medium text-neutral-300 mb-2"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-700 focus:border-transparent transition-colors resize-none"
                placeholder="Tell me about your project..."
              />
            </div>

            <div
              className={`transition-opacity duration-700 ease-out ${
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "450ms" }}
            >
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-2 bg-neutral-100 text-neutral-900 font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>

              {submitStatus === "success" && (
                <p className="mt-4 text-sm text-green-400">
                  Thank you! Your message has been sent successfully.
                </p>
              )}

              {submitStatus === "error" && (
                <p className="mt-4 text-sm text-red-400">
                  Something went wrong. Please try again.
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Contact Info Sidebar */}
        <div
          className={`transition-opacity duration-700 ease-out ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: "200ms" }}
        >
          <div className="lg:sticky lg:top-24 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Contact Info</h2>
              <div className="space-y-3">
                <div>
                  <a
                    href="mailto:karlskaptures@gmail.com"
                    className="text-neutral-200 hover:text-white transition-colors break-all"
                  >
                    karlskaptures[at]gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800">
              <p className="text-sm text-neutral-400 leading-relaxed">
                *Available for projects in San Francisco or anywhere else (with covered travel expenses)
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

