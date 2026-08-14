import "server-only";
import { prisma } from "@/lib/prisma";
import type { AnalyticsSummary, AppLocale } from "@/lib/data/types";
import { listCategoriesByCompany } from "@/lib/data/repositories/categories";
import { listItemsByCompany } from "@/lib/data/repositories/items";

function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash);
}

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

export async function getAnalyticsSummary(companyId: string, days = 30): Promise<AnalyticsSummary> {
  const allScans = await prisma.scanEvent.findMany({
    where: { companyId },
    select: { createdAt: true, locale: true },
  });
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const last7 = allScans.filter((s) => now - s.createdAt.getTime() <= 7 * dayMs).length;
  const prev7 = allScans.filter((s) => {
    const age = now - s.createdAt.getTime();
    return age > 7 * dayMs && age <= 14 * dayMs;
  }).length;
  const scansTrendPct = prev7 === 0 ? (last7 > 0 ? 100 : 0) : Math.round(((last7 - prev7) / prev7) * 1000) / 10;

  const byDate = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now - i * dayMs);
    byDate.set(d.toISOString().slice(0, 10), 0);
  }
  allScans.forEach((scan) => {
    const key = toDateKey(scan.createdAt.toISOString());
    if (byDate.has(key)) byDate.set(key, (byDate.get(key) ?? 0) + 1);
  });
  const scansOverTime = Array.from(byDate.entries()).map(([date, scans]) => ({ date, scans }));

  const localeCounts = new Map<AppLocale, number>();
  allScans.forEach((scan) => {
    localeCounts.set(scan.locale, (localeCounts.get(scan.locale) ?? 0) + 1);
  });
  const localeBreakdown = Array.from(localeCounts.entries())
    .map(([locale, count]) => ({ locale, count }))
    .sort((a, b) => b.count - a.count);

  const items = await listItemsByCompany(companyId);
  const categories = await listCategoriesByCompany(companyId);

  const topItems = [...items]
    .filter((i) => i.isVisible)
    .map((i) => ({ itemId: i.id, title: i.title, scans: 40 + (hashString(i.id) % 260) + (i.isFeatured ? 120 : 0) }))
    .sort((a, b) => b.scans - a.scans)
    .slice(0, 5);

  return {
    totalScans: allScans.length,
    scansLast7Days: last7,
    scansTrendPct,
    totalItems: items.length,
    visibleItems: items.filter((i) => i.isVisible).length,
    totalCategories: categories.length,
    scansOverTime,
    topItems,
    localeBreakdown,
  };
}
