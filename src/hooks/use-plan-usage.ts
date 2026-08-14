"use client";

import { useCategories } from "@/hooks/use-categories";
import { useCompany } from "@/hooks/use-company";
import { useItems } from "@/hooks/use-items";
import { useQrCodes } from "@/hooks/use-qr-codes";
import { getPlanLimit, isAtPlanLimit, isPaidPlan, planAllowsFeatured } from "@/lib/plan";
import type { Plan } from "@/lib/data/types";

export function usePlanUsage() {
  const { data: company } = useCompany();
  const { data: items } = useItems();
  const { data: categories } = useCategories();
  const { data: qrCodes } = useQrCodes();
  const plan: Plan = company?.plan ?? "FREE";

  const itemCount = items?.length ?? 0;
  const categoryCount = categories?.length ?? 0;
  const qrCount = qrCodes?.length ?? 0;

  return {
    plan,
    isPaid: isPaidPlan(plan),
    canFeature: planAllowsFeatured(plan),
    items: { used: itemCount, limit: getPlanLimit(plan, "items"), canAdd: !isAtPlanLimit(plan, "items", itemCount) },
    categories: {
      used: categoryCount,
      limit: getPlanLimit(plan, "categories"),
      canAdd: !isAtPlanLimit(plan, "categories", categoryCount),
    },
    qrCodes: { used: qrCount, limit: getPlanLimit(plan, "qrCodes"), canAdd: !isAtPlanLimit(plan, "qrCodes", qrCount) },
  };
}
