"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ExternalLink, LayoutGrid, Package, QrCode, RefreshCw, Settings2, Smartphone, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { CatalogPhonePreview } from "@/components/admin/catalog-phone-preview";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompany } from "@/hooks/use-company";
import { useItems } from "@/hooks/use-items";
import { catalogPreviewPath } from "@/lib/catalog-url";
import { LOCALE_META } from "@/lib/constants";
import type { AppLocale } from "@/lib/data/types";

export default function CatalogPreviewPage() {
  const t = useTranslations("admin.preview");
  const { data: company, isLoading } = useCompany();
  const { data: items } = useItems();
  const [locale, setLocale] = useState<AppLocale | null>(null);
  const [tick, setTick] = useState(0);

  const previewLocale = locale ?? company?.defaultLocale ?? "en";
  const src = useMemo(() => {
    if (!company) return "";
    return `${catalogPreviewPath(company.slug, previewLocale)}&r=${tick}`;
  }, [company, previewLocale, tick]);

  if (isLoading || !company) {
    return (
      <div>
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
        <Skeleton className="mx-auto h-[640px] w-[340px] rounded-[2.5rem]" />
      </div>
    );
  }

  const empty = (items?.length ?? 0) === 0;
  const steps = [
    { n: "1", icon: QrCode, title: t("step1Title"), body: t("step1Body") },
    { n: "2", icon: Smartphone, title: t("step2Title"), body: t("step2Body") },
    { n: "3", icon: Sparkles, title: t("step3Title"), body: t("step3Body") },
  ];

  return (
    <div>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid items-start gap-10 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-5">
          <ol className="space-y-3">
            {steps.map((step) => (
              <li key={step.n} className="glass-card flex gap-4 rounded-2xl p-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent font-display text-sm font-bold text-white">
                  {step.n}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-display text-base font-semibold">
                    <step.icon className="size-4 text-primary" />
                    {step.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          {!company.isPublished ? (
            <p className="rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">{t("unpublished")}</p>
          ) : null}
          {empty ? (
            <p className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">{t("emptyHint")}</p>
          ) : null}

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">{t("localeLabel")}</p>
            <Select value={previewLocale} onValueChange={(v) => setLocale(v as AppLocale)}>
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {company.supportedLocales.map((code) => {
                  const meta = LOCALE_META[code];
                  return (
                    <SelectItem key={code} value={code}>
                      {meta.flag} {meta.nativeLabel}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="glow" onClick={() => setTick((n) => n + 1)}>
              <RefreshCw className="size-4" />
              {t("refresh")}
            </Button>
            <Button variant="outline" asChild>
              <a href={src.split("&r=")[0]} target="_blank" rel="noreferrer">
                <ExternalLink className="size-4" />
                {t("openFull")}
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/products">
                <Package className="size-4" />
                {t("editProducts")}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/categories">
                <LayoutGrid className="size-4" />
                {t("editCategories")}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/settings">
                <Settings2 className="size-4" />
                {t("editLook")}
              </Link>
            </Button>
          </div>
        </div>

        <CatalogPhonePreview src={src} label={t("phoneLabel")} caption={t("caption")} />
      </div>
    </div>
  );
}
