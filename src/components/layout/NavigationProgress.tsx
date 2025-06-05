"use client";

import { useNavigation } from "@/components/providers/NavigationProvider";

export function NavigationProgress() {
  const { isNavigating, progress, isFading } = useNavigation();

  if (!isNavigating) return null;

  return (
    <div className="absolute top-0 left-0 right-0 h-1 bg-background/20 overflow-hidden z-[60]">
      <div
        className={`h-full bg-primary ${
          isFading
            ? "opacity-0 transition-opacity duration-500 ease-out"
            : "opacity-100 transition-all duration-500 ease-out"
        }`}
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}
