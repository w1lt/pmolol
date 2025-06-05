"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

interface NavigationContextType {
  isNavigating: boolean;
  progress: number;
  isFading: boolean;
}

const NavigationContext = createContext<NavigationContextType>({
  isNavigating: false,
  progress: 0,
  isFading: false,
});

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [previousPathname, setPreviousPathname] = useState("");
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialProgressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  const resetNavigation = () => {
    setIsNavigating(false);
    setIsFading(false);
    setProgress(0);
    setPreviousPathname("");

    // Clear all timers
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
    if (initialProgressTimerRef.current) {
      clearInterval(initialProgressTimerRef.current);
      initialProgressTimerRef.current = null;
    }
  };

  useEffect(() => {
    const handleStart = () => {
      setIsNavigating(true);
      setIsFading(false);
      setProgress(0); // Start at 0%

      // Clear any existing timers
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
      }
      if (initialProgressTimerRef.current) {
        clearInterval(initialProgressTimerRef.current);
      }

      // Set 10-second timeout to reset navigation
      timeoutTimerRef.current = setTimeout(() => {
        resetNavigation();
      }, 10000);

      // Quick initial progress to 20% (4% every 50ms = 20% in 250ms)
      initialProgressTimerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 20) {
            // Clear initial timer and start regular timer
            if (initialProgressTimerRef.current) {
              clearInterval(initialProgressTimerRef.current);
              initialProgressTimerRef.current = null;
            }

            // Start regular progress timer from 20%
            progressTimerRef.current = setInterval(() => {
              setProgress((prev) => {
                if (prev >= 90) return 90; // Cap at 90% until completion
                return prev + 5;
              });
            }, 200);

            return 20;
          }
          return prev + 4; // Quick 4% increments
        });
      }, 50); // Fast 50ms intervals for initial progress
    };

    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (link && link.href) {
        try {
          const url = new URL(link.href);
          const currentUrl = new URL(window.location.href);

          if (
            url.origin === currentUrl.origin &&
            url.pathname !== currentUrl.pathname
          ) {
            setPreviousPathname(currentUrl.pathname);
            handleStart();
          }
        } catch {
          // Ignore URL parsing errors
        }
      }
    };

    document.addEventListener("click", handleLinkClick, true);

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
      }
      if (initialProgressTimerRef.current) {
        clearInterval(initialProgressTimerRef.current);
      }
      document.removeEventListener("click", handleLinkClick, true);
    };
  }, []);

  // Complete when pathname actually changes
  useEffect(() => {
    if (
      isNavigating &&
      pathname !== previousPathname &&
      previousPathname !== ""
    ) {
      // Clear any existing progress timer
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }

      // Clear the initial progress timer if it's still running
      if (initialProgressTimerRef.current) {
        clearInterval(initialProgressTimerRef.current);
        initialProgressTimerRef.current = null;
      }

      // Clear the timeout timer since navigation is completing
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
        timeoutTimerRef.current = null;
      }

      // Immediately set progress to 100%
      setProgress(100);

      // Show 100% briefly, then start fade
      setTimeout(() => {
        setIsFading(true);

        // Reset after fade completes
        setTimeout(() => {
          setIsNavigating(false);
          setIsFading(false);
          setProgress(0);
        }, 300);
      }, 500);
    }
  }, [pathname, isNavigating, previousPathname]);

  return (
    <NavigationContext.Provider value={{ isNavigating, progress, isFading }}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => useContext(NavigationContext);
