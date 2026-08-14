"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ExternalLink, LayoutGrid, Package, RefreshCw, Settings2, Smartphone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { CatalogPhonePreview } from "@/components/admin/catalog-phone-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompany } from "@/hooks/use-company";
import { catalogPreviewPath } from "@/lib/catalog-url";
import { LOCALE_META } from "@/lib/constants";
import type { AppLocale } from "@/lib/data/types";

export default function CatalogPreviewPage() {
  const t = useTranslations("admin.preview");
  const { data: company, isLoading } = useCompany();
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

  return (
    <div>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-start gap-3">
                <span className="glow-ring flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white">
                  <Smartphone className="size-5" />
                </span>
                <div>
                  <p className="font-display text-lg font-semibold">{t("afterScan")}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t("hint")}</p>
                </div>
              </div>

              {!company.isPublished ? (
                <p className="rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
                  {t("unpublished")}
                </p>
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
            </CardContent>
          </Card>

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

        <CatalogPhonePreview src={src} label={t("phoneLabel")} />
      </div>
    </div>
  );
}
