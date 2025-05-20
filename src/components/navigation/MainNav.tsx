"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogOut, Plus } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { useSession } from "next-auth/react";

export function MainNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isAuthenticated = !!session?.user;

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
      public: true,
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      active: pathname === "/dashboard",
      public: false,
    },
    {
      href: "/edit",
      label: "Edit Page",
      active: pathname === "/edit",
      public: false,
    },
  ];

  return (
    <div className="flex items-center space-x-4 lg:space-x-6">
      {routes.map((route) => {
        if (!isAuthenticated && !route.public) {
          return null;
        }

        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              route.active
                ? "text-black dark:text-white"
                : "text-muted-foreground"
            )}
          >
            {route.label}
          </Link>
        );
      })}
      {isAuthenticated ? (
        <SignOutButton>
          <Button variant="ghost" size="icon">
            <LogOut className="h-4 w-4" />
          </Button>
        </SignOutButton>
      ) : (
        <Link href="/signin">
          <Button>Sign In</Button>
        </Link>
      )}
    </div>
  );
}
