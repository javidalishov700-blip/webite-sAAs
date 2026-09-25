import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CURRENCY_SYMBOL } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Intl's currency patterns are not portable: the same price came out "8,50 ₼"
// on the server (Node, full ICU) and "AZN 8.50" in a browser whose ICU has no
// az data, so a card rendered on the server disagreed with the sheet rendered
// after hydration. Prices are the one thing on a menu that must look identical
// everywhere, so they are composed from these tables instead.
const DECIMAL_MARK: Record<string, { decimal: string; group: string }> = {
  az: { decimal: ",", group: " " },
  tr: { decimal: ",", group: "." },
  ru: { decimal: ",", group: " " },
  en: { decimal: ".", group: "," },
};

/**
 * @param fractionDigits pinned by the caller so every price in one list shares
 * a shape; falls back to "decimals only when the amount has them".
 */
export function formatCurrency(amount: number, currency: string, locale = "en-US", fractionDigits?: number) {
  const digits = fractionDigits ?? (Number.isInteger(amount) ? 0 : 2);
  const sign = amount < 0 ? "-" : "";
  const number = formatNumber(Math.abs(amount), locale, digits);
  const symbol = CURRENCY_SYMBOL[currency];
  // English writes the sign first ($12.90); Azerbaijani, Russian and Turkish
  // menus put it after the amount. A bare ISO code always gets a space.
  if (locale.slice(0, 2).toLowerCase() === "en") return symbol ? `${sign}${symbol}${number}` : `${sign}${currency}\u00a0${number}`;
  return `${sign}${number}\u00a0${symbol ?? currency}`;
}

/** The same tables for the other figures a guest reads — a rating, a review count. */
export function formatNumber(value: number, locale = "en-US", fractionDigits = 0) {
  const marks = DECIMAL_MARK[locale.slice(0, 2).toLowerCase()] ?? DECIMAL_MARK.en;
  const [whole, fraction] = Math.abs(value).toFixed(fractionDigits).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, marks.group);
  return `${value < 0 ? "-" : ""}${fraction ? `${grouped}${marks.decimal}${fraction}` : grouped}`;
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
