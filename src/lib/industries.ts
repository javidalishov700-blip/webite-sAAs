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
import type { Industry } from "@/lib/data/types";

export type { AttributePreset, AttributePresetId } from "@/lib/attribute-presets";
export { ATTRIBUTE_PRESETS, resolveAttributePresets } from "@/lib/attribute-presets";

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
