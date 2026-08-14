export type ListOption = {
  label: string;
  available: boolean;
};

const UNAVAILABLE_PREFIX = "~";

function normalizeKey(key: string): string {
  return key.trim().toLocaleLowerCase("az-AZ");
}

export function parseListOptions(raw: string): ListOption[] {
  const seen = new Set<string>();
  const out: ListOption[] = [];
  for (const part of raw.split(",")) {
    let token = part.trim();
    if (!token) continue;
    let available = true;
    if (token.startsWith(UNAVAILABLE_PREFIX)) {
      available = false;
      token = token.slice(UNAVAILABLE_PREFIX.length).trim();
    } else if (token.endsWith("!")) {
      available = false;
      token = token.slice(0, -1).trim();
    }
    if (!token) continue;
    const id = token.toLocaleLowerCase("az-AZ");
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({ label: token, available });
  }
  return out;
}

export function serializeListOptions(options: ListOption[]): string {
  return options
    .filter((option) => option.label.trim())
    .map((option) => (option.available ? option.label.trim() : `${UNAVAILABLE_PREFIX}${option.label.trim()}`))
    .join(", ");
}

export function isShoeSizeKey(key: string): boolean {
  const k = normalizeKey(key);
  return /shoe|ayaqqab|ayakkab|обув|sneaker/.test(k);
}

export function sizeChipSet(key: string): "clothing" | "shoe" | null {
  const k = normalizeKey(key);
  if (isShoeSizeKey(key)) return "shoe";
  if (/clothing|geyim|giyim|beden|paltar|одежд|apparel/.test(k)) return "clothing";
  if (/sizes|ölçül|olcul|razmer/.test(k)) return "clothing";
  return null;
}

export const CLOTHING_LETTER_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"] as const;
export const CLOTHING_NUMBER_SIZES = ["32", "34", "36", "38", "40", "42", "44", "46", "48", "50", "52"] as const;
export const SHOE_EU_SIZES = ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47"] as const;

export function isSizeChoiceList(key: string, value: string): boolean {
  if (sizeChipSet(key)) return true;
  const options = parseListOptions(value);
  if (options.length < 2) return false;
  return options.every((option) => /^(xxs|xs|s|m|l|xl|xxl|xxx?l|\d{1,2}xl|\d{2})$/i.test(option.label.trim()));
}

export function suggestedSizeLabels(key: string): string[] {
  if (sizeChipSet(key) === "shoe") return [...SHOE_EU_SIZES];
  if (sizeChipSet(key) === "clothing") return [...CLOTHING_LETTER_SIZES, ...CLOTHING_NUMBER_SIZES];
  return [...CLOTHING_LETTER_SIZES];
}

export function optionState(
  options: ListOption[],
  label: string,
): "off" | "available" | "unavailable" {
  const found = options.find((option) => option.label.toLocaleLowerCase("az-AZ") === label.toLocaleLowerCase("az-AZ"));
  if (!found) return "off";
  return found.available ? "available" : "unavailable";
}

export function cycleSizeOption(options: ListOption[], label: string): ListOption[] {
  const id = label.toLocaleLowerCase("az-AZ");
  const found = options.find((option) => option.label.toLocaleLowerCase("az-AZ") === id);
  if (!found) return [...options, { label, available: true }];
  if (found.available) {
    return options.map((option) => (option.label.toLocaleLowerCase("az-AZ") === id ? { ...option, available: false } : option));
  }
  return options.filter((option) => option.label.toLocaleLowerCase("az-AZ") !== id);
}
