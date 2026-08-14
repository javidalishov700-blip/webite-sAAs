import "server-only";
import { prisma } from "@/lib/prisma";
import type { AbuseReason, AppLocale } from "@/lib/data/types";

const RATE_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_REPORTS_PER_WINDOW = 5;

export async function countRecentReportsByIp(ipHash: string, since: Date): Promise<number> {
  return prisma.abuseReport.count({
    where: { ipHash, createdAt: { gte: since } },
  });
}

export async function isAbuseReportRateLimited(ipHash: string | null): Promise<boolean> {
  if (!ipHash) return false;
  const since = new Date(Date.now() - RATE_WINDOW_MS);
  const count = await countRecentReportsByIp(ipHash, since);
  return count >= MAX_REPORTS_PER_WINDOW;
}

export async function createAbuseReport(input: {
  companyId: string;
  reason: AbuseReason;
  details?: string | null;
  locale?: AppLocale | null;
  ipHash?: string | null;
  userAgent?: string | null;
}) {
  const details = input.details?.trim() || null;
  return prisma.abuseReport.create({
    data: {
      companyId: input.companyId,
      reason: input.reason,
      details,
      locale: input.locale ?? null,
      ipHash: input.ipHash ?? null,
      userAgent: input.userAgent ?? null,
    },
  });
}
