"use client";

import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Loader2, LogOut } from "lucide-react";

export default function LogoutPage() {
  const [isLoggingOut, setIsLoggingOut] = useState(true);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await signOut({
          callbackUrl: "/",
          redirect: true,
        });
      } catch (error) {
        console.error("Error during logout:", error);
        setIsLoggingOut(false);
      }
    };

    handleLogout();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="max-w-md text-center space-y-6">
        <div className="space-y-4">
          <div className="flex justify-center">
            {isLoggingOut ? (
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            ) : (
              <LogOut className="w-16 h-16 text-primary" />
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">
              {isLoggingOut ? "Signing you out..." : "Something went wrong"}
            </h2>
            <p className="text-lg text-muted-foreground">
              {isLoggingOut
                ? "Please wait while we sign you out securely"
                : "There was an issue signing you out. Please try again."}
            </p>
          </div>
        </div>

        {!isLoggingOut && (
          <button
            onClick={() => {
              setIsLoggingOut(true);
              signOut({ callbackUrl: "/", redirect: true });
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
