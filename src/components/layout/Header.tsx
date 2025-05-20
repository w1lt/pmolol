"use client";

import Link from "next/link";
import { MainNav } from "@/components/navigation/MainNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { useSession } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 container">
        <Link href="/" className="font-bold text-xl">
          pmo.lol
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          <MainNav />

          {user && (
            <Link href="/dashboard">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
