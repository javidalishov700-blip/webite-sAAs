import "server-only";
import { prisma } from "@/lib/prisma";
import { PUBLIC_SHOWCASE_SLUG } from "@/lib/data/public-showcase";
import { isPlatformOperator } from "@/lib/platform-admin";
import type { Plan } from "@/lib/data/types";
import type { OpsProtectedReason, OpsReport, OpsWorkspace } from "@/lib/ops-types";

export type { OpsProtectedReason, OpsReport, OpsWorkspace } from "@/lib/ops-types";

function toIso(value: Date): string {
  return value.toISOString();
}

function classifyProtection(
  slug: string,
  members: { user: { email: string; platformAdmin: boolean } }[],
): OpsProtectedReason | null {
  if (slug === PUBLIC_SHOWCASE_SLUG) return "live_demo";
  if (members.some((member) => isPlatformOperator(member.user))) return "platform_admin";
  return null;
}

export async function listOpsWorkspaces(query?: string): Promise<OpsWorkspace[]> {
  const q = query?.trim();
  const rows = await prisma.company.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
            { memberships: { some: { user: { email: { contains: q, mode: "insensitive" } } } } },
          ],
        }
      : undefined,
    include: {
      memberships: {
        where: { role: "OWNER" },
        include: { user: { select: { name: true, email: true, platformAdmin: true, emailVerifiedAt: true } } },
      },
      qrCodes: {
        select: { id: true, name: true, isActive: true, scans: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: { select: { items: true, abuseReports: true, qrCodes: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  return rows.map((row) => {
    const protectedReason = classifyProtection(row.slug, row.memberships);
    const owners = row.memberships.map((member) => ({
      name: member.user.name,
      email: member.user.email,
      emailVerified: Boolean(member.user.emailVerifiedAt),
    }));
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      plan: row.plan,
      isPublished: row.isPublished,
      bannedAt: row.bannedAt ? toIso(row.bannedAt) : null,
      bannedReason: row.bannedReason,
      createdAt: toIso(row.createdAt),
      itemCount: row._count.items,
      reportCount: row._count.abuseReports,
      qrCount: row._count.qrCodes,
      owners,
      qrCodes: row.qrCodes,
      emailVerified: owners.length === 0 ? true : owners.every((owner) => owner.emailVerified),
      protected: Boolean(protectedReason),
      protectedReason,
    };
  });
}

export async function getOpsWorkspaceGuard(id: string): Promise<{
  exists: boolean;
  protectedReason: OpsProtectedReason | null;
} | null> {
  const row = await prisma.company.findUnique({
    where: { id },
    include: {
      memberships: { include: { user: { select: { email: true, platformAdmin: true } } } },
    },
  });
  if (!row) return null;
  return { exists: true, protectedReason: classifyProtection(row.slug, row.memberships) };
}

export async function banWorkspace(id: string, reason?: string | null) {
  return prisma.company.update({
    where: { id },
    data: {
      bannedAt: new Date(),
      bannedReason: reason?.trim().slice(0, 300) || null,
      isPublished: false,
    },
  });
}

export async function unbanWorkspace(id: string) {
  return prisma.company.update({
    where: { id },
    data: {
      bannedAt: null,
      bannedReason: null,
    },
  });
}

export async function setWorkspacePlan(id: string, plan: Plan) {
  return prisma.company.update({
    where: { id },
    data: { plan },
  });
}

export async function setWorkspacePublished(id: string, isPublished: boolean) {
  return prisma.company.update({
    where: { id },
    data: { isPublished },
  });
}

export async function listOpsReports(): Promise<OpsReport[]> {
  const rows = await prisma.abuseReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { company: { select: { id: true, name: true, slug: true } } },
  });
  return rows.map((row) => ({
    id: row.id,
    createdAt: toIso(row.createdAt),
    reason: row.reason,
    details: row.details,
    locale: row.locale,
    companyId: row.company.id,
    companyName: row.company.name,
    companySlug: row.company.slug,
  }));
}
