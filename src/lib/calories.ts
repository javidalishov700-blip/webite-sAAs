import type { ItemAttribute } from "@/lib/data/types";

const CALORIE_KEY = /calor|kalori|калори|kcal/i;

export function isCalorieAttribute(attribute: Pick<ItemAttribute, "key" | "unit">): boolean {
  return CALORIE_KEY.test(attribute.key.trim()) || /^kcal$/i.test((attribute.unit ?? "").trim());
}

/** e.g. "540 kcal" — for a badge on the product photo. */
export function getCalorieLabel(attributes: Pick<ItemAttribute, "key" | "value" | "unit">[]): string | null {
  const attr = attributes.find((item) => isCalorieAttribute(item) && item.value.trim());
  if (!attr) return null;
  const unit = attr.unit?.trim() || "kcal";
  return `${attr.value.trim()} ${unit}`;
}
