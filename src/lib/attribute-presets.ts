import type { AttributeType, Industry } from "@/lib/data/types";

export type AttributePresetId =
  | "calories"
  | "allergens"
  | "vegan"
  | "spicy"
  | "portion"
  | "ingredients"
  | "prepTime"
  | "alcohol"
  | "volume"
  | "weight"
  | "brand"
  | "organic"
  | "origin"
  | "expiry"
  | "sizes"
  | "color"
  | "material"
  | "gender"
  | "season"
  | "fit"
  | "shoeSize"
  | "toolSize"
  | "dimensions"
  | "assembly"
  | "voltage"
  | "power"
  | "warranty"
  | "duration"
  | "durationMin"
  | "level"
  | "language"
  | "certificate"
  | "age"
  | "year"
  | "model"
  | "ram"
  | "storage"
  | "condition"
  | "screen"
  | "strength"
  | "packSize"
  | "staffLevel"
  | "homeVisit"
  | "notes";

export interface AttributePreset {
  id: AttributePresetId;
  type: AttributeType;
  unit?: string;
}

export const PRESET_BY_ID: Record<AttributePresetId, AttributePreset> = {
  calories: { id: "calories", type: "NUMBER", unit: "kcal" },
  allergens: { id: "allergens", type: "LIST" },
  vegan: { id: "vegan", type: "BOOLEAN" },
  spicy: { id: "spicy", type: "BOOLEAN" },
  portion: { id: "portion", type: "TEXT" },
  ingredients: { id: "ingredients", type: "TEXT" },
  prepTime: { id: "prepTime", type: "NUMBER", unit: "min" },
  alcohol: { id: "alcohol", type: "TEXT" },
  volume: { id: "volume", type: "TEXT" },
  weight: { id: "weight", type: "TEXT" },
  brand: { id: "brand", type: "TEXT" },
  organic: { id: "organic", type: "BOOLEAN" },
  origin: { id: "origin", type: "TEXT" },
  expiry: { id: "expiry", type: "TEXT" },
  sizes: { id: "sizes", type: "LIST" },
  color: { id: "color", type: "TEXT" },
  material: { id: "material", type: "TEXT" },
  gender: { id: "gender", type: "TEXT" },
  season: { id: "season", type: "TEXT" },
  fit: { id: "fit", type: "TEXT" },
  shoeSize: { id: "shoeSize", type: "LIST" },
  toolSize: { id: "toolSize", type: "TEXT" },
  dimensions: { id: "dimensions", type: "TEXT" },
  assembly: { id: "assembly", type: "BOOLEAN" },
  voltage: { id: "voltage", type: "TEXT" },
  power: { id: "power", type: "TEXT" },
  warranty: { id: "warranty", type: "NUMBER", unit: "months" },
  duration: { id: "duration", type: "TEXT" },
  durationMin: { id: "durationMin", type: "NUMBER", unit: "min" },
  level: { id: "level", type: "TEXT" },
  language: { id: "language", type: "TEXT" },
  certificate: { id: "certificate", type: "BOOLEAN" },
  age: { id: "age", type: "TEXT" },
  year: { id: "year", type: "NUMBER" },
  model: { id: "model", type: "TEXT" },
  ram: { id: "ram", type: "TEXT" },
  storage: { id: "storage", type: "TEXT" },
  condition: { id: "condition", type: "TEXT" },
  screen: { id: "screen", type: "TEXT" },
  strength: { id: "strength", type: "TEXT" },
  packSize: { id: "packSize", type: "TEXT" },
  staffLevel: { id: "staffLevel", type: "TEXT" },
  homeVisit: { id: "homeVisit", type: "BOOLEAN" },
  notes: { id: "notes", type: "TEXT" },
};

const INDUSTRY_PRESET_IDS: Record<Industry, AttributePresetId[]> = {
  RESTAURANT: ["calories", "allergens", "vegan", "spicy", "portion", "prepTime", "ingredients"],
  GROCERY: ["weight", "brand", "organic", "origin", "volume", "expiry"],
  RETAIL: ["sizes", "shoeSize", "color", "material", "gender", "season"],
  HOME: ["dimensions", "material", "color", "assembly", "weight"],
  HARDWARE: ["toolSize", "material", "voltage", "power", "warranty"],
  EDUCATION: ["duration", "level", "language", "certificate", "age"],
  ELECTRONICS: ["year", "brand", "model", "warranty", "ram", "storage", "condition", "color", "screen"],
  TOBACCO: ["brand", "strength", "packSize", "origin"],
  SERVICES: ["durationMin", "staffLevel", "homeVisit"],
  OTHER: ["brand", "color", "notes"],
};

const CATEGORY_GROUPS: { match: string[]; ids: AttributePresetId[] }[] = [
  {
    match: [
      "food", "yemek", "yemək", "menu", "menü", "starter", "mezeler", "məzə", "mains",
      "ana yemek", "dessert", "tatlı", "şirniyyat", "pizza", "burger", "soup", "salad",
      "salat", "breakfast", "səhər", "lunch", "dinner", "kebab", "kabab", "grill",
    ],
    ids: ["calories", "allergens", "vegan", "spicy", "portion", "ingredients"],
  },
  {
    match: ["drink", "içki", "içecek", "coffee", "qahvə", "kahve", "tea", "çay", "beer", "wine", "şərab", "cocktail", "şərbət"],
    ids: ["volume", "alcohol", "calories"],
  },
  {
    match: ["cloth", "paltar", "geyim", "giyim", "apparel", "shirt", "köynək", "dress", "don", "pants", "şalvar", "jacket", "palto"],
    ids: ["sizes", "color", "material", "gender", "fit", "season"],
  },
  {
    match: ["shoe", "ayaqqabı", "ayakkabı", "sneaker", "bot", "boot"],
    ids: ["shoeSize", "color", "material"],
  },
  {
    match: ["phone", "telefon", "laptop", "noutbuk", "tv", "televizor", "tablet", "kamera", "qulaqlıq", "headphone", "console", "elektronik"],
    ids: ["year", "brand", "model", "warranty", "condition", "color", "ram", "storage"],
  },
  {
    match: ["mebel", "furniture", "sofa", "divan", "table", "masa", "chair", "stul", "yatak", "çərçivə"],
    ids: ["dimensions", "material", "color", "assembly", "weight"],
  },
  {
    match: ["alət", "alet", "tool", "drill", "boya", "paint", "tesisat", "elektrik"],
    ids: ["toolSize", "material", "voltage", "warranty", "power"],
  },
  {
    match: ["kurs", "course", "dərs", "ders", "workshop", "training", "sertifikat"],
    ids: ["duration", "level", "language", "certificate", "age"],
  },
];

function idsToPresets(ids: AttributePresetId[]): AttributePreset[] {
  return ids.map((id) => PRESET_BY_ID[id]);
}

/** Industry defaults, used when no category name is available. */
export const ATTRIBUTE_PRESETS: Record<Industry, AttributePreset[]> = {
  RESTAURANT: idsToPresets(INDUSTRY_PRESET_IDS.RESTAURANT),
  GROCERY: idsToPresets(INDUSTRY_PRESET_IDS.GROCERY),
  RETAIL: idsToPresets(INDUSTRY_PRESET_IDS.RETAIL),
  HOME: idsToPresets(INDUSTRY_PRESET_IDS.HOME),
  HARDWARE: idsToPresets(INDUSTRY_PRESET_IDS.HARDWARE),
  EDUCATION: idsToPresets(INDUSTRY_PRESET_IDS.EDUCATION),
  ELECTRONICS: idsToPresets(INDUSTRY_PRESET_IDS.ELECTRONICS),
  TOBACCO: idsToPresets(INDUSTRY_PRESET_IDS.TOBACCO),
  SERVICES: idsToPresets(INDUSTRY_PRESET_IDS.SERVICES),
  OTHER: idsToPresets(INDUSTRY_PRESET_IDS.OTHER),
};

export function resolveAttributePresets(industry: Industry, categoryName?: string): AttributePreset[] {
  const seen = new Set<AttributePresetId>();
  const out: AttributePreset[] = [];

  const add = (ids: AttributePresetId[]) => {
    for (const id of ids) {
      if (seen.has(id)) continue;
      seen.add(id);
      out.push(PRESET_BY_ID[id]);
    }
  };

  const name = categoryName?.trim().toLocaleLowerCase("az-AZ") ?? "";
  if (name) {
    for (const group of CATEGORY_GROUPS) {
      if (group.match.some((token) => name.includes(token))) add(group.ids);
    }
  }

  add(INDUSTRY_PRESET_IDS[industry] ?? INDUSTRY_PRESET_IDS.OTHER);
  return out;
}
