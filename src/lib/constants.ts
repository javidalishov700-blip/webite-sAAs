import type { AppLocale, Plan } from "@/lib/data/types";

export { ATTRIBUTE_PRESETS, INDUSTRY_VALUES } from "@/lib/industries";
export type { AttributePreset } from "@/lib/industries";

export const LOCALES: AppLocale[] = ["en", "ru", "tr", "az"];
export const DEFAULT_LOCALE: AppLocale = "en";

export const LOCALE_META: Record<AppLocale, { label: string; nativeLabel: string; flag: string }> = {
  en: { label: "English", nativeLabel: "English", flag: "🇬🇧" },
  ru: { label: "Russian", nativeLabel: "Русский", flag: "🇷🇺" },
  tr: { label: "Turkish", nativeLabel: "Türkçe", flag: "🇹🇷" },
  az: { label: "Azerbaijani", nativeLabel: "Azərbaycan", flag: "🇦🇿" },
};

export const CURRENCIES = ["USD", "EUR", "GBP", "TRY", "AZN", "RUB"] as const;

export const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  TRY: "₺",
  AZN: "₼",
  RUB: "₽",
};

export const PLAN_META: Record<
  Plan,
  { itemLimit: number | null; categoryLimit: number | null; qrLimit: number | null; teamSeats: number | null }
> = {
  FREE: { itemLimit: 100, categoryLimit: null, qrLimit: 3, teamSeats: 1 },
  PRO: { itemLimit: null, categoryLimit: null, qrLimit: 10, teamSeats: 5 },
  ENTERPRISE: { itemLimit: null, categoryLimit: null, qrLimit: null, teamSeats: null },
};

export const SESSION_COOKIE_NAME = "qru_session";
