import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HeaderNavigation } from "./HeaderNavigation";
import { NavigationProgress } from "./NavigationProgress";

export async function Header() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 w-full">
      <NavigationProgress />
      <div className="container mx-auto px-4 py-4">
        <div className="flex h-16 items-center justify-between px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border border-border rounded-2xl shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
          <Link
            href="/"
            className="font-bold text-xl hover:text-primary transition-colors duration-200"
          >
            pmo.lol
          </Link>

          <div className="flex items-center space-x-6">
            {user && <HeaderNavigation />}

            {user ? (
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
                className="group inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg shadow-sm border border-border hover:bg-primary/10 hover:shadow-md"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
