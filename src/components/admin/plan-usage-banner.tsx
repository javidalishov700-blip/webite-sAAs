"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { formatPlanUsage, isPaidPlan } from "@/lib/plan";
import { usePlanUsage } from "@/hooks/use-plan-usage";
import { cn } from "@/lib/utils";

export function PlanUsageBanner({ className }: { className?: string }) {
  const t = useTranslations("admin.plan");
  const usage = usePlanUsage();

  if (isPaidPlan(usage.plan)) return null;

  return (
    <div
      className={cn(
        "mb-5 flex flex-col gap-2 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-foreground">
        {t("bannerFree", {
          items: formatPlanUsage(usage.items.used, usage.items.limit),
          categories: formatPlanUsage(usage.categories.used, usage.categories.limit),
          qr: formatPlanUsage(usage.qrCodes.used, usage.qrCodes.limit),
        })}
      </p>
      <Link href="/contact" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
        <Sparkles className="size-3.5" />
        {t("contactCta")}
      </Link>
    </div>
  );
}
