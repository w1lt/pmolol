"use client";

import { signOut } from "next-auth/react";
import React from "react";

interface SignOutButtonProps {
  children: React.ReactNode;
}

export function SignOutButton({ children }: SignOutButtonProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return <div onClick={handleSignOut}>{children}</div>;
}
