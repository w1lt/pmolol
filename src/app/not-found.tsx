"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight } from "lucide-react";

export default function NotFound() {
  const pathname = usePathname();
  const slug = pathname?.slice(1) || "this"; // Remove leading slash, fallback to "this"

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="max-w-md text-center space-y-6">
        <div className="space-y-4">
          <Zap className="w-16 h-16 text-primary mx-auto" />

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              This page is available!
            </h2>
            <p className="text-lg text-muted-foreground">
              {`pmo.lol/${slug} is waiting for you.`}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button asChild size="lg" className="w-full group">
            <Link href="/">
              Claim pmo.lol/{slug}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>

          <p className="text-xs text-muted-foreground">
            Or{" "}
            <Link href="/" className="underline hover:text-primary">
              go back to homepage
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
