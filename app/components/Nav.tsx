"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: "/work", label: "Portfolio" },
    { href: "/services", label: "Services" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav 
      className={`backdrop-blur-sm sticky top-0 z-50 ${pathname === '/' ? 'bg-transparent' : 'bg-neutral-950/50'}`} 
      style={{ 
        ...(pathname === '/' && {
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
        }),
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className={`text-xl font-semibold transition-colors ${
              pathname === '/' 
                ? "text-white hover:text-neutral-200" 
                : "hover:text-neutral-300"
            }`}
            onClick={closeMenu}
          >
            karlskaptures
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  pathname === '/'
                    ? pathname === item.href
                      ? "text-white"
                      : "text-neutral-200 hover:text-white"
                    : pathname === item.href
                      ? "text-white"
                      : "text-neutral-400 hover:text-neutral-300"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className={`md:hidden p-2 -mr-2 transition-colors ${
              pathname === '/'
                ? "text-neutral-200 hover:text-white"
                : "text-neutral-400 hover:text-white"
            }`}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-neutral-800 pt-4">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`text-base py-2 transition-colors ${
                    pathname === '/'
                      ? pathname === item.href
                        ? "text-white font-medium"
                        : "text-neutral-200 hover:text-white"
                      : pathname === item.href
                        ? "text-white font-medium"
                        : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

