"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function HeaderNavigation() {
  const pathname = usePathname();

  return (
    <>
      <Link
        href="/dashboard"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard"
            ? "text-black dark:text-white"
            : "text-muted-foreground"
        )}
      >
        Dashboard
      </Link>
      <Link
        href="/edit"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/edit"
            ? "text-black dark:text-white"
            : "text-muted-foreground"
        )}
      >
        Edit Page
      </Link>
    </>
  );
}
