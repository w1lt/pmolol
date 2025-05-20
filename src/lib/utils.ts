import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1000000) return (num / 1000).toFixed(1) + "k";
  return (num / 1000000).toFixed(1) + "m";
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return "U";

  const names = name.split(" ");
  if (names.length === 1) return names[0].charAt(0);
  return names[0].charAt(0) + names[names.length - 1].charAt(0);
}

export function getGravatarUrl(email: string | null | undefined): string {
  if (!email) return "";
  const hash = email.trim().toLowerCase();
  return `https://www.gravatar.com/avatar/${hash}?d=mp`;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
