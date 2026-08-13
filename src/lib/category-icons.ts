import {
  Beef,
  Coffee,
  Cpu,
  Fish,
  Footprints,
  Gift,
  GlassWater,
  Headphones,
  IceCreamCone,
  Laptop,
  Package,
  Pizza,
  Salad,
  Scissors,
  Shirt,
  Smartphone,
  Soup,
  Sparkles,
  Star,
  Tag,
  UtensilsCrossed,
  Watch,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Salad,
  Soup,
  Pizza,
  Fish,
  Beef,
  IceCreamCone,
  GlassWater,
  Coffee,
  Footprints,
  Shirt,
  Watch,
  Laptop,
  Smartphone,
  Headphones,
  Cpu,
  Sparkles,
  Scissors,
  Gift,
  Tag,
  Star,
  Package,
};

export const CATEGORY_ICON_NAMES = Object.keys(CATEGORY_ICONS);

export function getCategoryIcon(name?: string | null): LucideIcon {
  if (name && CATEGORY_ICONS[name]) return CATEGORY_ICONS[name];
  return Package;
}
