import type { AppLocale, AttributeType, Industry, Plan } from "@/lib/data/types";

export const LOCALES: AppLocale[] = ["en", "ru", "tr", "az"];
export const DEFAULT_LOCALE: AppLocale = "en";

export const LOCALE_META: Record<AppLocale, { label: string; nativeLabel: string; flag: string }> = {
  en: { label: "English", nativeLabel: "English", flag: "🇬🇧" },
  ru: { label: "Russian", nativeLabel: "Русский", flag: "🇷🇺" },
  tr: { label: "Turkish", nativeLabel: "Türkçe", flag: "🇹🇷" },
  az: { label: "Azerbaijani", nativeLabel: "Azərbaycan", flag: "🇦🇿" },
};

export const INDUSTRIES: Industry[] = ["RESTAURANT", "RETAIL", "ELECTRONICS", "SERVICES"];

export const INDUSTRY_META: Record<
  Industry,
  { icon: string; sampleCategories: string[] }
> = {
  RESTAURANT: { icon: "UtensilsCrossed", sampleCategories: ["Starters", "Main Course", "Desserts", "Drinks"] },
  RETAIL: { icon: "Shirt", sampleCategories: ["Sneakers", "Apparel", "Accessories"] },
  ELECTRONICS: { icon: "Cpu", sampleCategories: ["Laptops", "Smartphones", "Audio"] },
  SERVICES: { icon: "Sparkles", sampleCategories: ["Hair", "Spa", "Nails"] },
  OTHER: { icon: "Package", sampleCategories: ["General"] },
};

export interface AttributePreset {
  key: string;
  type: AttributeType;
  unit?: string;
  options?: string[];
}

/** Quick-add attribute suggestions surfaced in the PIM depending on industry. */
export const ATTRIBUTE_PRESETS: Record<Industry, AttributePreset[]> = {
  RESTAURANT: [
    { key: "Calories", type: "NUMBER", unit: "kcal" },
    { key: "Allergens", type: "LIST" },
    { key: "Vegan", type: "BOOLEAN" },
    { key: "Spicy", type: "BOOLEAN" },
    { key: "Prep time", type: "NUMBER", unit: "min" },
  ],
  RETAIL: [
    { key: "Sizes", type: "LIST" },
    { key: "Material", type: "TEXT" },
    { key: "Color", type: "TEXT" },
    { key: "In the box", type: "TEXT" },
  ],
  ELECTRONICS: [
    { key: "RAM", type: "TEXT" },
    { key: "Storage", type: "TEXT" },
    { key: "Warranty", type: "NUMBER", unit: "months" },
    { key: "Color", type: "TEXT" },
  ],
  SERVICES: [
    { key: "Duration", type: "NUMBER", unit: "min" },
    { key: "Staff level", type: "TEXT" },
    { key: "Home visit", type: "BOOLEAN" },
  ],
  OTHER: [{ key: "Notes", type: "TEXT" }],
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
  FREE: { itemLimit: 20, categoryLimit: 4, qrLimit: 1, teamSeats: 1 },
  PRO: { itemLimit: null, categoryLimit: null, qrLimit: 10, teamSeats: 5 },
  ENTERPRISE: { itemLimit: null, categoryLimit: null, qrLimit: null, teamSeats: null },
};

export const SESSION_COOKIE_NAME = "qru_session";
