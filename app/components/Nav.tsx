"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const lastScrollYRef = useRef(0);
  const isResettingRef = useRef(false);

  // Check if we're on portfolio or gallery pages
  const isPortfolioPage = pathname === '/work' || pathname?.startsWith('/work/');

  // Reset scroll states when navigating to/from portfolio pages
  useEffect(() => {
    if (isPortfolioPage) {
      // Set flag to prevent scroll handler from interfering
      isResettingRef.current = true;
      
      // Ensure scrolling is enabled
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      
      // Immediately reset all states to ensure nav starts at top
      setIsAtTop(true);
      setIsAtBottom(false);
      setIsScrollingDown(false);
      setLastScrollY(0);
      lastScrollYRef.current = 0;
      
      // Force scroll to top immediately
      window.scrollTo(0, 0);
      
      // Use multiple requestAnimationFrame calls to ensure DOM is fully updated
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          const scrollBottom = documentHeight - windowHeight - scrollY;
          
          // Force states to top position
          setIsAtTop(true);
          setIsAtBottom(scrollBottom < 50);
          setLastScrollY(0);
          lastScrollYRef.current = 0;
          
          // Clear reset flag after a brief delay to allow scroll handler to work
          setTimeout(() => {
            isResettingRef.current = false;
          }, 100);
        });
      });
    } else {
      // Reset states when leaving portfolio pages
      setIsAtTop(true);
      setIsAtBottom(false);
      setIsScrollingDown(false);
      setLastScrollY(0);
      lastScrollYRef.current = 0;
      isResettingRef.current = false;
    }
  }, [pathname, isPortfolioPage]);

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

  // Handle scroll behavior for portfolio/gallery pages
  useEffect(() => {
    if (!isPortfolioPage) {
      // Reset states when not on portfolio page
      setIsAtTop(true);
      setIsAtBottom(false);
      setIsScrollingDown(false);
      return;
    }

    const handleScroll = () => {
      // Don't handle scroll if we're in the middle of resetting
      if (isResettingRef.current) {
        return;
      }
      
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollBottom = documentHeight - windowHeight - currentScrollY;
      const prevScrollY = lastScrollYRef.current;

      // Check if at top (within 50px threshold)
      setIsAtTop(currentScrollY < 50);
      
      // Check if at bottom (within 50px threshold)
      setIsAtBottom(scrollBottom < 50);

      // Determine scroll direction
      if (currentScrollY > prevScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px
        setIsScrollingDown(true);
      } else if (currentScrollY < prevScrollY) {
        // Scrolling up
        setIsScrollingDown(false);
      }

      setLastScrollY(currentScrollY);
      lastScrollYRef.current = currentScrollY;
    };

    // Initial check - ensure we start at top
    // Only run initial check if we're actually at the top
    // This prevents race conditions with the pathname change effect
    const initialScrollY = window.scrollY;
    if (initialScrollY < 50) {
      setIsAtTop(true);
      setIsAtBottom(false);
      setIsScrollingDown(false);
      setLastScrollY(0);
      lastScrollYRef.current = 0;
    } else {
      // If not at top, reset to top
      window.scrollTo(0, 0);
      setIsAtTop(true);
      setIsAtBottom(false);
      setIsScrollingDown(false);
      setLastScrollY(0);
      lastScrollYRef.current = 0;
    }
    
    // Only call handleScroll if not resetting
    if (!isResettingRef.current) {
      handleScroll();
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPortfolioPage]);

  // Determine nav visibility and position
  // Show nav only when at top or at bottom, hide when scrolling in between
  const shouldShowNav = !isPortfolioPage || isAtTop || isAtBottom;
  const navPosition = isPortfolioPage && isAtBottom ? 'bottom-0' : 'top-0';

  return (
    <nav 
      className={`backdrop-blur-sm z-50 transition-transform duration-300 ${
        isPortfolioPage 
          ? shouldShowNav 
            ? isAtBottom 
              ? 'fixed bottom-0 w-full' 
              : 'sticky top-0'
            : 'sticky top-0 -translate-y-full'
          : 'sticky top-0'
      } ${pathname === '/' ? 'bg-transparent' : 'bg-neutral-950/50'}`} 
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

