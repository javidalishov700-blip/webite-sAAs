import "server-only";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPlanLimit, planAllowsFeatured, type PlanResource } from "@/lib/plan";
import type { Plan } from "@/lib/data/types";

export function planLimitResponse(plan: Plan, resource: PlanResource) {
  const limit = resource === "featured" ? 0 : getPlanLimit(plan, resource);
  return NextResponse.json(
    {
      error: "plan_limit",
      code: "plan_limit",
      resource,
      limit,
      plan,
    },
    { status: 403 },
  );
}

async function countResource(companyId: string, resource: Exclude<PlanResource, "featured">): Promise<number> {
  if (resource === "items") return prisma.item.count({ where: { companyId } });
  if (resource === "categories") return prisma.category.count({ where: { companyId } });
  return prisma.qrCode.count({ where: { companyId } });
}

export async function assertPlanCapacity(
  companyId: string,
  plan: Plan,
  resource: Exclude<PlanResource, "featured">,
): Promise<NextResponse | null> {
  const limit = getPlanLimit(plan, resource);
  if (limit === null) return null;
  const used = await countResource(companyId, resource);
  if (used >= limit) return planLimitResponse(plan, resource);
  return null;
}

export function assertFeaturedAllowed(
  plan: Plan,
  wantsFeatured: boolean | undefined,
  alreadyFeatured = false,
): NextResponse | null {
  if (!wantsFeatured) return null;
  if (alreadyFeatured) return null;
  if (planAllowsFeatured(plan)) return null;
  return planLimitResponse(plan, "featured");
}
