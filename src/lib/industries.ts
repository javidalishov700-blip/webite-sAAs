import {
  Cigarette,
  Cpu,
  GraduationCap,
  Hammer,
  House,
  Package,
  Salad,
  Shirt,
  ShoppingBasket,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { AttributeType, Industry } from "@/lib/data/types";

export const INDUSTRY_VALUES = [
  "RESTAURANT",
  "GROCERY",
  "RETAIL",
  "HOME",
  "HARDWARE",
  "EDUCATION",
  "ELECTRONICS",
  "TOBACCO",
  "SERVICES",
  "OTHER",
] as const satisfies readonly Industry[];

export const INDUSTRY_ICONS: Record<Industry, LucideIcon> = {
  RESTAURANT: Salad,
  GROCERY: ShoppingBasket,
  RETAIL: Shirt,
  HOME: House,
  HARDWARE: Hammer,
  EDUCATION: GraduationCap,
  ELECTRONICS: Cpu,
  TOBACCO: Cigarette,
  SERVICES: Sparkles,
  OTHER: Package,
};

export interface AttributePreset {
  key: string;
  type: AttributeType;
  unit?: string;
}

export const ATTRIBUTE_PRESETS: Record<Industry, AttributePreset[]> = {
  RESTAURANT: [
    { key: "Calories", type: "NUMBER", unit: "kcal" },
    { key: "Allergens", type: "LIST" },
    { key: "Vegan", type: "BOOLEAN" },
    { key: "Spicy", type: "BOOLEAN" },
  ],
  GROCERY: [
    { key: "Weight", type: "TEXT" },
    { key: "Brand", type: "TEXT" },
    { key: "Organic", type: "BOOLEAN" },
    { key: "Origin", type: "TEXT" },
  ],
  RETAIL: [
    { key: "Sizes", type: "LIST" },
    { key: "Material", type: "TEXT" },
    { key: "Color", type: "TEXT" },
  ],
  HOME: [
    { key: "Dimensions", type: "TEXT" },
    { key: "Material", type: "TEXT" },
    { key: "Color", type: "TEXT" },
    { key: "Assembly", type: "BOOLEAN" },
  ],
  HARDWARE: [
    { key: "Size", type: "TEXT" },
    { key: "Material", type: "TEXT" },
    { key: "Voltage", type: "TEXT" },
    { key: "Warranty", type: "NUMBER", unit: "months" },
  ],
  EDUCATION: [
    { key: "Duration", type: "TEXT" },
    { key: "Level", type: "TEXT" },
    { key: "Language", type: "TEXT" },
    { key: "Certificate", type: "BOOLEAN" },
  ],
  ELECTRONICS: [
    { key: "RAM", type: "TEXT" },
    { key: "Storage", type: "TEXT" },
    { key: "Warranty", type: "NUMBER", unit: "months" },
    { key: "Color", type: "TEXT" },
  ],
  TOBACCO: [
    { key: "Brand", type: "TEXT" },
    { key: "Strength", type: "TEXT" },
    { key: "Pack size", type: "TEXT" },
  ],
  SERVICES: [
    { key: "Duration", type: "NUMBER", unit: "min" },
    { key: "Staff level", type: "TEXT" },
    { key: "Home visit", type: "BOOLEAN" },
  ],
  OTHER: [{ key: "Notes", type: "TEXT" }],
};

