import type { Plan } from "@/lib/data/types";

export type PlanResource = "items" | "categories" | "qrCodes" | "featured";

export const PLAN_LIMITS: Record<
  Plan,
  { items: number | null; categories: number | null; qrCodes: number | null }
> = {
  FREE: { items: 15, categories: 4, qrCodes: 2 },
  PRO: { items: null, categories: null, qrCodes: 20 },
  ENTERPRISE: { items: null, categories: null, qrCodes: null },
};

export function isPaidPlan(plan: Plan): boolean {
  return plan === "PRO" || plan === "ENTERPRISE";
}

export function getPlanLimit(plan: Plan, resource: Exclude<PlanResource, "featured">): number | null {
  return PLAN_LIMITS[plan][resource];
}

export function isAtPlanLimit(plan: Plan, resource: Exclude<PlanResource, "featured">, used: number): boolean {
  const limit = getPlanLimit(plan, resource);
  return limit !== null && used >= limit;
}

export function planAllowsFeatured(plan: Plan): boolean {
  return isPaidPlan(plan);
}

export function formatPlanUsage(used: number, limit: number | null): string {
  return limit === null ? String(used) : `${used}/${limit}`;
}
