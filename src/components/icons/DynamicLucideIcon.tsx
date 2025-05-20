"use client";

import React, { Suspense, ComponentType } from "react";
import dynamic from "next/dynamic";
import type { LucideProps } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { HelpCircle } from "lucide-react"; // Default fallback icon

interface CustomIconProps extends Omit<LucideProps, "name"> {
  name: string | null | undefined; // Allow null or undefined for no icon
  fallback?: React.ReactNode;
}

// Component to actually load and render the icon, or a fallback
const IconRenderer: React.FC<
  Omit<LucideProps, "name"> & { iconName: string; fallback?: React.ReactNode }
> = ({ iconName, fallback, ...props }) => {
  if (
    !iconName ||
    !dynamicIconImports[iconName as keyof typeof dynamicIconImports]
  ) {
    if (iconName) {
      // Only warn if a name was provided but not found
      console.warn(`Lucide icon "${iconName}" not found.`);
    }
    // Render the explicit fallback prop, or a default Lucide icon (e.g., HelpCircle), or null
    return fallback || <HelpCircle {...props} aria-label="Icon not found" />;
  }

  const LucideIconComponent = dynamic(
    dynamicIconImports[iconName as keyof typeof dynamicIconImports]
  ) as ComponentType<LucideProps>;
  return <LucideIconComponent {...props} />;
};

const DynamicLucideIcon: React.FC<CustomIconProps> = ({
  name,
  fallback = (
    <HelpCircle
      className="h-5 w-5 text-muted-foreground"
      aria-label="Icon not found"
    />
  ),
  className,
  size = 20,
  ...props
}) => {
  return (
    <Suspense fallback={<span>L...</span>}>
      <IconRenderer
        iconName={name || ""}
        fallback={fallback}
        className={className}
        size={size}
        {...props}
      />
    </Suspense>
  );
};

export default DynamicLucideIcon;
