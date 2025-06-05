"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAuthModal } from "@/components/providers/AuthModalProvider";

interface GetStartedButtonProps {
  useModal?: boolean;
}

export function GetStartedButton({ useModal = false }: GetStartedButtonProps) {
  const { openModal } = useAuthModal();

  if (useModal) {
    return (
      <button
        onClick={openModal}
        className="group inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg shadow-sm border border-border hover:bg-primary/10 hover:shadow-md"
      >
        Get Started
        <ArrowRight className="w-4 h-4" />
      </button>
    );
  }

  return (
    <Link
      href="/signin"
      className="group inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg shadow-sm border border-border hover:bg-primary/10 hover:shadow-md"
    >
      Get Started
      <ArrowRight className="w-4 h-4" />
    </Link>
  );
}
