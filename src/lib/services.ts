/**
 * Prices for the done-for-you setup service, in one place so a change is one
 * edit rather than four translation files. The wording lives in the messages;
 * only the numbers are here, because they are the same in every language.
 */
export const SERVICE_CURRENCY = "USD";

export const SETUP_PACKAGES = [
  { key: "self", price: 0, href: "/signup" },
  { key: "done", price: 79.9, featured: true },
  { key: "full", price: 169.9 },
] as const;

export const MANAGED_PLANS = [
  { key: "selfManage", price: 5.99 },
  { key: "managed", price: 14.99, featured: true },
] as const;

/** "$79.90" — the same shape the pricing section uses. */
export function servicePrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export type SetupPackageKey = (typeof SETUP_PACKAGES)[number]["key"];
export type ManagedPlanKey = (typeof MANAGED_PLANS)[number]["key"];
