import type { AppLocale } from "@/lib/data/types";

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

export const SESSION_COOKIE_NAME = "qru_session";
