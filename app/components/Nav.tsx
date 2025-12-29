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
      // CRITICAL: Always set isAtBottom to false on navigation
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
          window.scrollTo(0, 0);
          // Force states to top position - NEVER set isAtBottom to true during reset
          setIsAtTop(true);
          setIsAtBottom(false); // Always false on initial load
          setLastScrollY(0);
          lastScrollYRef.current = 0;
          
          // Clear reset flag after a longer delay to ensure page has rendered
          // This prevents the scroll handler from running before the page is ready
          setTimeout(() => {
            // Double-check we're still at top before clearing the flag
            if (window.scrollY < 50) {
              setIsAtTop(true);
              setIsAtBottom(false);
            }
            isResettingRef.current = false;
          }, 300);
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

  // Prevent body scroll and interaction when mobile menu is open on non-landing pages
  // Also add blur effect to content below nav bar
  useEffect(() => {
    if (isMenuOpen && pathname !== '/') {
      document.body.style.overflow = 'hidden';
      
      // Apply blur and grey effect to main content (not nav bar)
      // Find the main content wrapper (usually a main element or div after nav)
      const mainContent = document.querySelector('main');
      if (mainContent) {
        (mainContent as HTMLElement).style.filter = 'blur(4px) brightness(0.7)';
        (mainContent as HTMLElement).style.transition = 'filter 0.3s ease';
        // Add click handler to close menu when clicking on blurred content
        const handleContentClick = (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          closeMenu();
        };
        mainContent.addEventListener('click', handleContentClick, { capture: true });
        (mainContent as any)._menuCloseHandler = handleContentClick;
      }
      
      // Also apply to any other content elements that might be siblings of nav
      const allChildren = Array.from(document.body.children);
      allChildren.forEach((child) => {
        if (child.tagName !== 'NAV' && child instanceof HTMLElement) {
          child.style.filter = 'blur(4px) brightness(0.7)';
          child.style.transition = 'filter 0.3s ease';
          // Add click handler to close menu
          const handleContentClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            closeMenu();
          };
          child.addEventListener('click', handleContentClick, { capture: true });
          (child as any)._menuCloseHandler = handleContentClick;
        }
      });
      
      // Keep nav bar sharp and interactive
      const nav = document.querySelector('nav');
      if (nav) {
        (nav as HTMLElement).style.filter = 'none'; // Keep nav bar sharp
      }
    } else {
      document.body.style.overflow = '';
      
      // Remove blur from all content and remove click handlers
      const mainContent = document.querySelector('main');
      if (mainContent) {
        (mainContent as HTMLElement).style.filter = '';
        (mainContent as HTMLElement).style.transition = '';
        if ((mainContent as any)._menuCloseHandler) {
          mainContent.removeEventListener('click', (mainContent as any)._menuCloseHandler, { capture: true });
          delete (mainContent as any)._menuCloseHandler;
        }
      }
      
      const allChildren = Array.from(document.body.children);
      allChildren.forEach((child) => {
        if (child.tagName !== 'NAV' && child instanceof HTMLElement) {
          child.style.filter = '';
          child.style.transition = '';
          if ((child as any)._menuCloseHandler) {
            child.removeEventListener('click', (child as any)._menuCloseHandler, { capture: true });
            delete (child as any)._menuCloseHandler;
          }
        }
      });
      
      const nav = document.querySelector('nav');
      if (nav) {
        (nav as HTMLElement).style.filter = '';
      }
    }
    return () => {
      document.body.style.overflow = '';
      
      const mainContent = document.querySelector('main');
      if (mainContent) {
        (mainContent as HTMLElement).style.filter = '';
        (mainContent as HTMLElement).style.transition = '';
        if ((mainContent as any)._menuCloseHandler) {
          mainContent.removeEventListener('click', (mainContent as any)._menuCloseHandler, { capture: true });
          delete (mainContent as any)._menuCloseHandler;
        }
      }
      
      const allChildren = Array.from(document.body.children);
      allChildren.forEach((child) => {
        if (child.tagName !== 'NAV' && child instanceof HTMLElement) {
          child.style.filter = '';
          child.style.transition = '';
          if ((child as any)._menuCloseHandler) {
            child.removeEventListener('click', (child as any)._menuCloseHandler, { capture: true });
            delete (child as any)._menuCloseHandler;
          }
        }
      });
      
      const nav = document.querySelector('nav');
      if (nav) {
        (nav as HTMLElement).style.filter = '';
      }
    };
  }, [isMenuOpen, pathname, closeMenu]);

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
      
      // Only check if at bottom if the page is tall enough to actually scroll
      // This prevents false positives when the page hasn't fully loaded
      if (documentHeight > windowHeight + 100) {
        setIsAtBottom(scrollBottom < 50);
      } else {
        // Page is too short to scroll, so we're not at bottom
        setIsAtBottom(false);
      }

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
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    
    // Always start at top position
    setIsAtTop(initialScrollY < 50);
    // Only set isAtBottom if page is tall enough AND we're actually at bottom
    if (documentHeight > windowHeight + 100) {
      const scrollBottom = documentHeight - windowHeight - initialScrollY;
      setIsAtBottom(scrollBottom < 50);
    } else {
      // Page too short, definitely not at bottom
      setIsAtBottom(false);
    }
    setIsScrollingDown(false);
    setLastScrollY(initialScrollY);
    lastScrollYRef.current = initialScrollY;
    
    // If not at top, force scroll to top
    if (initialScrollY >= 50) {
      window.scrollTo(0, 0);
      setIsAtTop(true);
      setIsAtBottom(false);
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
      className={`backdrop-blur-sm z-50 transition-all duration-300 ${
        isPortfolioPage 
          ? shouldShowNav 
            ? isAtBottom 
              ? 'fixed bottom-0 w-full' 
              : 'sticky top-0'
            : 'sticky top-0 -translate-y-full'
          : 'sticky top-0'
      } ${
        pathname === '/' 
          ? isMenuOpen 
            ? 'bg-black/40 md:bg-transparent' 
            : 'bg-transparent'
          : 'bg-neutral-950/50'
      }`} 
      style={{ 
        ...(pathname === '/' && !isMenuOpen && {
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
        }),
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-4 relative" style={{ zIndex: 51 }}>
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className={`text-xl font-semibold transition-colors ${
              pathname === '/' 
                ? "text-white hover:text-neutral-200" 
                : "text-white hover:text-neutral-300"
            }`}
            onClick={closeMenu}
          >
            karlskaptures
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
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
            
            {/* Visual Separator */}
            <div 
              className={`h-5 w-px ${
                pathname === '/'
                  ? "bg-neutral-300/30"
                  : "bg-neutral-600"
              }`}
            />
            
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/karlskaptures/"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-1.5 transition-colors ${
                  pathname === '/'
                    ? "text-neutral-200 hover:text-white"
                    : "text-neutral-400 hover:text-neutral-300"
                }`}
                aria-label="Instagram"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.217.562-.477.96-.896 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.217-.96-.477-1.379-.896-.421-.419-.69-.824-.9-1.38-.166-.42-.367-1.065-.425-2.235-.047-1.266-.07-1.646-.07-4.86 0-3.21.016-3.586.074-4.859.061-1.17.255-1.814.425-2.234.21-.57.479-.96.9-1.381.419-.419.865-.69 1.379-.9.42-.166 1.051-.367 2.221-.425 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                </svg>
              </a>
              <a
                href="mailto:karlskaptures@gmail.com"
                className={`p-1.5 transition-colors ${
                  pathname === '/'
                    ? "text-neutral-200 hover:text-white"
                    : "text-neutral-400 hover:text-neutral-300"
                }`}
                aria-label="Email"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </a>
            </div>
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
          <>
              {/* Overlay to dim content below and prevent interaction on non-landing pages */}
              {pathname !== '/' && (
                <div 
                  className="md:hidden fixed left-0 right-0 bottom-0 bg-black/90 z-[45] cursor-pointer"
                  style={{ 
                    top: '73px', // Start below the nav bar (approximate nav bar height)
                    pointerEvents: 'auto'
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeMenu();
                  }}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeMenu();
                  }}
                />
              )}
            <div className={`md:hidden absolute left-0 right-0 pb-4 pt-4 backdrop-blur-sm transition-all duration-300 z-50 ${
              isPortfolioPage && isAtBottom
                ? 'bottom-full mb-0 border-b border-neutral-800' // Expand upward from bottom
                : 'top-full mt-0 border-t border-neutral-800' // Expand downward from top
            } ${
              pathname === '/' ? 'bg-black/40' : 'bg-black'
            }`}>
            <div className="mx-auto max-w-6xl px-4">
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
              
              {/* Social Icons for Mobile */}
              <div className="flex items-center gap-4 pt-2">
                <a
                  href="https://www.instagram.com/karlskaptures/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className={`transition-colors ${
                    pathname === '/'
                      ? "text-neutral-200 hover:text-white"
                      : "text-neutral-400 hover:text-white"
                  }`}
                  aria-label="Instagram"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.217.562-.477.96-.896 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.217-.96-.477-1.379-.896-.421-.419-.69-.824-.9-1.38-.166-.42-.367-1.065-.425-2.235-.047-1.266-.07-1.646-.07-4.86 0-3.21.016-3.586.074-4.859.061-1.17.255-1.814.425-2.234.21-.57.479-.96.9-1.381.419-.419.865-.69 1.379-.9.42-.166 1.051-.367 2.221-.425 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
                <a
                  href="mailto:karlskaptures@gmail.com"
                  onClick={closeMenu}
                  className={`transition-colors ${
                    pathname === '/'
                      ? "text-neutral-200 hover:text-white"
                      : "text-neutral-400 hover:text-white"
                  }`}
                  aria-label="Email"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </a>
              </div>
              </div>
            </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

