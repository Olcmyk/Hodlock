import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatAmount(amount: bigint, decimals: number = 18): string {
  const divisor = BigInt(10 ** decimals);
  const integerPart = amount / divisor;
  const fractionalPart = amount % divisor;

  if (fractionalPart === BigInt(0)) {
    return integerPart.toString();
  }

  const fractionalStr = fractionalPart.toString().padStart(decimals, "0");
  const trimmed = fractionalStr.slice(0, 4).replace(/0+$/, "");

  if (trimmed === "") {
    return integerPart.toString();
  }

  return `${integerPart}.${trimmed}`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDaysRemaining(unlockTimestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const remaining = unlockTimestamp - now;

  if (remaining <= 0) {
    return "Unlocked";
  }

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  const minutes = Math.floor((remaining % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

export function calculateUnlockDate(days: number): Date {
  const now = new Date();
  now.setDate(now.getDate() + days);
  return now;
}

export function parseReferrerFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("ref");
}

export function generateReferralLink(address: string): string {
  if (typeof window === "undefined") return "";
  const baseUrl = window.location.origin;
  return `${baseUrl}/lock?ref=${address}`;
}
