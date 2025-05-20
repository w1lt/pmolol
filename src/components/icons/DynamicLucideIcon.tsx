"use client";

import React, { ComponentType, memo } from "react";
import dynamic from "next/dynamic";
import type { LucideProps } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { HelpCircle } from "lucide-react"; // Default fallback icon

// Cache for the dynamically created components
const DynamicIconComponentsCache: {
  [key: string]: ComponentType<LucideProps>;
} = {};

interface CustomIconProps extends Omit<LucideProps, "name"> {
  name: string | null | undefined; // Allow null or undefined for no icon
  fallback?: React.ReactNode;
  size?: number | string; // Ensure size is part of props
}

// This component now directly attempts to render or show its immediate fallback.
// The consuming component will need to wrap this in <Suspense> if desired.
const DynamicLucideIcon: React.FC<CustomIconProps> = memo(
  ({
    name,
    fallback: fallbackProp,
    size = 20, // Default size here
    ...props // className will be in here
  }) => {
    const fallbackUi = fallbackProp || (
      <HelpCircle
        {...props}
        size={size}
        aria-label="Icon not found (default fallback)"
      />
    );

    if (!name || !dynamicIconImports[name as keyof typeof dynamicIconImports]) {
      if (name) {
        // Only warn if a name was provided but not found
        console.warn(`Lucide icon "${name}" not found. Rendering fallback.`);
      }
      // Render the explicit fallback prop, or a default Lucide icon
      return fallbackUi;
    }

    let LucideIconComponent = DynamicIconComponentsCache[name];

    if (!LucideIconComponent) {
      // The dynamic import itself is the part that might suspend.
      // We ensure this HOC is created only once per iconName.
      LucideIconComponent = dynamic(
        dynamicIconImports[name as keyof typeof dynamicIconImports]
      ) as ComponentType<LucideProps>; // Casting here
      DynamicIconComponentsCache[name] = LucideIconComponent;
    }

    // Pass size and other props like className to the actual Lucide component
    return <LucideIconComponent {...props} size={size} />;
  }
);
DynamicLucideIcon.displayName = "DynamicLucideIcon (Cached)";

export default DynamicLucideIcon;
