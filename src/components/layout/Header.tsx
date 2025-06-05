"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils";
import { User, LogOut, BarChart, Edit } from "lucide-react";
import { useSession } from "next-auth/react";
import { HeaderNavigation } from "./HeaderNavigation";
import { NavigationProgress } from "./NavigationProgress";
import { GetStartedButton } from "@/components/auth/GetStartedButton";
import { useEffect, useState, useRef } from "react";

// Simple scroll detection with timeout to prevent jitter

export function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [isScrolled, setIsScrolled] = useState(false);
  const isLoading = status === "loading";
  const lastScrollYRef = useRef(0);
  const lastChangeTimeRef = useRef(0);

  useEffect(() => {
    // Initialize with current scroll position
    lastScrollYRef.current = window.scrollY;
    setIsScrolled(window.scrollY > 0);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const now = Date.now();

      // Check if enough time has passed since last state change (500ms debounce)
      if (now - lastChangeTimeRef.current >= 250) {
        if (!isScrolled && currentScrollY > 0) {
          // Any scroll from top - collapse header
          setIsScrolled(true);
          lastChangeTimeRef.current = now;
        } else if (isScrolled && currentScrollY === 0) {
          // Back at the very top - expand header
          setIsScrolled(false);
          lastChangeTimeRef.current = now;
        }
      }

      // Always update last position for next comparison
      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolled]);

  return (
    <header className="sticky top-0 z-50 w-full">
      <NavigationProgress />
      <div
        className="w-full transition-all duration-250"
        style={{
          paddingTop: isScrolled ? "0" : "1rem",
          paddingBottom: isScrolled ? "0.5rem" : "1rem",
        }}
      >
        <div
          className="flex h-16 items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border border-border transition-all duration-500 ease-out hover:border-primary/20 mx-auto"
          style={{
            maxWidth: isScrolled ? "100%" : "80rem",
            paddingLeft: isScrolled ? "2rem" : "1.5rem",
            paddingRight: isScrolled ? "2rem" : "1.5rem",
            borderRadius: isScrolled ? "0" : "1rem",
            borderLeftWidth: isScrolled ? "0" : "1px",
            borderRightWidth: isScrolled ? "0" : "1px",
            borderTopWidth: isScrolled ? "0" : "1px",
          }}
        >
          <Link
            href="/"
            className="font-bold hover:text-primary transition-all duration-500 ease-out"
            style={{
              fontSize: isScrolled ? "1.5rem" : "1.25rem",
              lineHeight: isScrolled ? "2rem" : "1.75rem",
            }}
          >
            pmo.lol
          </Link>

          <div className="flex items-center space-x-6">
            {/* Desktop Navigation - Hidden on mobile */}
            <div className="hidden md:block transition-opacity duration-300">
              {isLoading ? (
                <div className="flex items-center space-x-4 opacity-60">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ) : user ? (
                <div className="animate-in fade-in-0 duration-300">
                  <HeaderNavigation />
                </div>
              ) : null}
            </div>

            {/* User Avatar or Get Started Button */}
            <div className="transition-opacity duration-300">
              {isLoading ? (
                <Skeleton className="h-8 w-8 rounded-full opacity-60" />
              ) : user ? (
                <div className="animate-in fade-in-0 duration-300">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="group focus:outline-none">
                        <Avatar className="ring-2 ring-transparent group-hover:ring-primary/20 cursor-pointer transition-all duration-500 ease-out">
                          <AvatarImage
                            src={user.image || ""}
                            alt={user.name || "User"}
                          />
                          <AvatarFallback className="group-hover:bg-primary/10 transition-colors duration-200">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {/* Mobile Navigation Links - Only shown on mobile */}
                      <div className="md:hidden">
                        <DropdownMenuItem asChild>
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <BarChart className="h-4 w-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link
                            href="/edit"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                            Edit Page
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </div>

                      {/* Profile and Logout - Always shown */}
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <User className="h-4 w-4" />
                          View Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/logout"
                          className="flex items-center gap-2 cursor-pointer text-destructive"
                        >
                          <LogOut className="h-4 w-4" />
                          Log Out
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="animate-in fade-in-0 duration-300">
                  <GetStartedButton useModal={true} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
