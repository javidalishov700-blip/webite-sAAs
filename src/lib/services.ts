/**
 * Prices for the done-for-you setup service, in one place so a change is one
 * edit rather than four translation files. The wording lives in the messages;
 * only the numbers are here, because they are the same in every language.
 */
export const SERVICE_CURRENCY = "AZN";

export const SETUP_PACKAGES = [
  { key: "self", price: 0, href: "/signup" },
  { key: "done", price: 120, featured: true },
  { key: "full", price: 280 },
] as const;

export const MANAGED_PLANS = [
  { key: "selfManage", price: 10 },
  { key: "managed", price: 25, featured: true },
] as const;

export type SetupPackageKey = (typeof SETUP_PACKAGES)[number]["key"];
export type ManagedPlanKey = (typeof MANAGED_PLANS)[number]["key"];
