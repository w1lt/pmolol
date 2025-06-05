"use client";

import { useAuthModal } from "@/components/providers/AuthModalProvider";

interface AuthTriggerProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthTrigger({ children, className }: AuthTriggerProps) {
  const { openModal } = useAuthModal();

  return (
    <button onClick={openModal} className={className}>
      {children}
    </button>
  );
}
