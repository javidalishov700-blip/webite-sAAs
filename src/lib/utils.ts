import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CURRENCY_SYMBOL } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string, locale = "en-US") {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    const symbol = CURRENCY_SYMBOL[currency] ?? currency;
    return `${symbol}${amount.toFixed(2)}`;
  }
}

export function formatCompactNumber(value: number, locale = "en-US") {
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatDate(iso: string, locale = "en-US") {
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(new Date(iso));
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function debounce<Args extends unknown[]>(fn: (...args: Args) => void, delayMs: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Args) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delayMs);
  };
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
