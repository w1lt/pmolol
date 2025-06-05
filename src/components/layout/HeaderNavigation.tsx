"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart, Edit } from "lucide-react";

export function HeaderNavigation() {
  const pathname = usePathname();

  return (
    <div className="flex items-center space-x-6">
      <Link
        href="/dashboard"
        className={cn(
          "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
          pathname === "/dashboard"
            ? "text-black dark:text-white"
            : "text-muted-foreground"
        )}
      >
        <BarChart className="h-4 w-4" />
        Dashboard
      </Link>
      <Link
        href="/edit"
        className={cn(
          "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
          pathname === "/edit"
            ? "text-black dark:text-white"
            : "text-muted-foreground"
        )}
      >
        <Edit className="h-4 w-4" />
        Edit Page
      </Link>
    </div>
  );
}
