import "server-only";
import { prisma } from "@/lib/prisma";
import type { AnalyticsSummary, AppLocale } from "@/lib/data/types";
import { listCategoriesByCompany } from "@/lib/data/repositories/categories";
import { listItemsByCompany } from "@/lib/data/repositories/items";

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

export async function getAnalyticsSummary(companyId: string, days = 30): Promise<AnalyticsSummary> {
  const [allScans, items, categories, viewGroups] = await Promise.all([
    prisma.scanEvent.findMany({
      where: { companyId },
      select: { createdAt: true, locale: true },
    }),
    listItemsByCompany(companyId),
    listCategoriesByCompany(companyId),
    prisma.itemView.groupBy({
      by: ["itemId"],
      where: { companyId },
      _count: { itemId: true },
      orderBy: { _count: { itemId: "desc" } },
      take: 5,
    }),
  ]);

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

  const titles = new Map(items.map((i) => [i.id, i.title]));
  const topItems = viewGroups
    .map((row) => ({
      itemId: row.itemId,
      title: titles.get(row.itemId) ?? "Item",
      scans: row._count.itemId,
    }))
    .filter((row) => titles.has(row.itemId));

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
