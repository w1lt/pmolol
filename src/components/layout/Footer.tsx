"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border">
      <div className="px-4 sm:px-24 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/"
              className="font-bold text-lg hover:text-primary transition-colors duration-200"
            >
              pmo.lol
            </Link>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} pmo.lol - All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Privacy
            </Link>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Terms
            </Link>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
