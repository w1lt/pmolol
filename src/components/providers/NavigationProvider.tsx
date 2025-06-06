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
  const pathname = usePathname();

  useEffect(() => {
    const handleStart = () => {
      setIsNavigating(true);
      setIsFading(false);
      setProgress(0); // Start at 0%

      // Clear any existing timers
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }

      // Quick jump to 20% immediately
      setTimeout(() => {
        setProgress(20);

        // Then continue with regular increments
        progressTimerRef.current = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) return 90; // Cap at 90% until completion
            return prev + 5;
          });
        }, 200);
      }, 50);
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

      // Fast completion animation - race to 100%
      const completeInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(completeInterval);

            // Show 100% briefly, then start fade
            setTimeout(() => {
              setIsFading(true);

              // Reset after fade completes
              setTimeout(() => {
                setIsNavigating(false);
                setIsFading(false);
                setProgress(0);
              }, 250);
            }, 450);

            return 100;
          }
          // Ultra fast completion - bigger jumps, faster interval
          return Math.min(prev + 50, 100); // 50% jumps for rapid completion
        });
      }, 15); // Ultra fast 15ms intervals

      return () => clearInterval(completeInterval);
    }
  }, [pathname, isNavigating, previousPathname]);

  return (
    <NavigationContext.Provider value={{ isNavigating, progress, isFading }}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => useContext(NavigationContext);
