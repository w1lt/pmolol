"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const pathname = usePathname();

  return (
    <header className="relative z-50 w-full">
      <div className="container mx-auto px-4 py-4">
        <div className="flex h-16 items-center justify-between px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border border-border rounded-2xl shadow-sm">
          <Link
            href="/"
            className="font-bold text-xl hover:text-primary transition-colors duration-200"
          >
            pmo.lol
          </Link>

          <div className="flex items-center space-x-6">
            {user && (
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
            )}

            {status === "loading" ? (
              // Show a subtle loading placeholder to prevent flash
              <div className="h-8 w-20 bg-muted/30 rounded animate-pulse" />
            ) : user ? (
              <Link href="/dashboard" className="group">
                <Avatar className="h-8 w-8 ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-200 group-hover:scale-105">
                  <AvatarImage
                    src={user.image || ""}
                    alt={user.name || "User"}
                  />
                  <AvatarFallback className="group-hover:bg-primary/10 transition-colors duration-200">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Link
                href="/signin"
                className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
