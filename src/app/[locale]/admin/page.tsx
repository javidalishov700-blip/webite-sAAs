"use client";

import { useLocale, useTranslations } from "next-intl";
import { BarChart3, LayoutGrid, Package, Plus, QrCode as QrCodeIcon, Radar, Smartphone, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { ScansChart } from "@/components/admin/scans-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PlanUsageBanner } from "@/components/admin/plan-usage-banner";
import { usePlanUsage } from "@/hooks/use-plan-usage";
import { useAnalytics } from "@/hooks/use-analytics";
import { useCompany } from "@/hooks/use-company";
import { formatCompactNumber } from "@/lib/utils";
import { LOCALE_META } from "@/lib/constants";
import type { AppLocale } from "@/lib/data/types";

export default function AdminOverviewPage() {
  const t = useTranslations("admin.overview");
  const locale = useLocale();
  const { data: company } = useCompany();
  const { data: summary, isLoading } = useAnalytics();
  const usage = usePlanUsage();

  const localeTotal = summary?.localeBreakdown.reduce((sum, l) => sum + l.count, 0) ?? 0;

  return (
    <div>
      <PageHeader
        title={t("title")}
        subtitle={company ? t("subtitle", { company: company.name }) : undefined}
        actions={
          <Badge variant="accent" className="gap-1.5 py-1.5">
            <Sparkles className="size-3" />
            {t("currentPlan")}: {company?.plan}
          </Badge>
        }
      />

      <PlanUsageBanner />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !summary ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
        ) : (
          <>
            <StatCard
              icon={Radar}
              label={t("totalScans")}
              value={formatCompactNumber(summary.totalScans, locale)}
              hint={t("last7Days") + `: ${summary.scansLast7Days}`}
              trendPct={summary.scansTrendPct}
              accent="var(--chart-1)"
            />
            <StatCard
              icon={Package}
              label={t("totalItems")}
              value={usage.items.limit === null ? String(summary.totalItems) : `${summary.totalItems}/${usage.items.limit}`}
              hint={`${summary.visibleItems} ${t("visibleItems")}`}
              accent="var(--chart-3)"
            />
            <StatCard
              icon={LayoutGrid}
              label={t("totalCategories")}
              value={usage.categories.limit === null ? String(summary.totalCategories) : `${summary.totalCategories}/${usage.categories.limit}`}
              accent="var(--chart-4)"
            />
            <StatCard icon={QrCodeIcon} label={t("currentPlan")} value={company?.plan ?? "—"} accent="var(--chart-2)" />
          </>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>{t("scansOverTime")}</CardTitle>
            <CardDescription>{t("scansOverTimeSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || !summary ? (
              <Skeleton className="h-[280px] w-full rounded-xl" />
            ) : (
              <ScansChart data={summary.scansOverTime} locale={locale} />
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("topItems")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading || !summary
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-9 w-full rounded-lg" />)
                : summary.topItems.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("topItemsEmpty")}</p>
                  ) : (
                    summary.topItems.map((item, i) => (
                    <div key={item.itemId} className="flex items-center gap-3">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm">{item.title}</span>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        {item.scans} {t("views")}
                      </span>
                    </div>
                  )))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("localeBreakdown")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading || !summary
                ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-6 w-full rounded-lg" />)
                : summary.localeBreakdown.map((entry) => {
                    const pct = localeTotal ? Math.round((entry.count / localeTotal) * 100) : 0;
                    const meta = LOCALE_META[entry.locale as AppLocale];
                    return (
                      <div key={entry.locale}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 font-medium">
                            {meta?.flag} {meta?.nativeLabel ?? entry.locale}
                          </span>
                          <span className="text-muted-foreground">{pct}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t("quickActions")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" className="flex-1 justify-start gap-2.5" asChild>
            <Link href="/admin/products?new=1">
              <Plus className="size-4" />
              {t("addProduct")}
            </Link>
          </Button>
          <Button variant="outline" className="flex-1 justify-start gap-2.5" asChild>
            <Link href="/admin/categories?new=1">
              <Plus className="size-4" />
              {t("addCategory")}
            </Link>
          </Button>
          <Button variant="outline" className="flex-1 justify-start gap-2.5" asChild>
            <Link href="/admin/preview">
              <Smartphone className="size-4" />
              {t("openPreview")}
            </Link>
          </Button>
          <Button variant="outline" className="flex-1 justify-start gap-2.5" asChild>
            <Link href="/admin/qr-studio">
              <BarChart3 className="size-4" />
              {t("openQrStudio")}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
