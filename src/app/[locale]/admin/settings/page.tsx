"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { ImageUpload } from "@/components/admin/image-upload";
import { ColorPicker } from "@/components/admin/color-picker";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompany, useUpdateCompany } from "@/hooks/use-company";
import { catalogAbsoluteUrl } from "@/lib/catalog-url";
import { CURRENCIES, LOCALES, LOCALE_META } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/lib/data/types";

export default function SettingsPage() {
  const t = useTranslations("admin.settings");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { data: company, isLoading } = useCompany();
  const updateCompany = useUpdateCompany();

  const [form, setForm] = useState({
    name: "",
    description: "",
    logoUrl: null as string | null,
    address: "",
    phone: "",
    website: "",
    currency: "USD",
    defaultLocale: "en" as AppLocale,
    supportedLocales: ["en"] as AppLocale[],
    accentColor: "#7C5CFF",
  });

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name,
        description: company.description ?? "",
        logoUrl: company.logoUrl ?? null,
        address: company.address ?? "",
        phone: company.phone ?? "",
        website: company.website ?? "",
        currency: company.currency,
        defaultLocale: company.defaultLocale,
        supportedLocales: company.supportedLocales,
        accentColor: company.accentColor,
      });
    }
  }, [company]);

  function toggleLocale(locale: AppLocale) {
    setForm((f) => {
      const has = f.supportedLocales.includes(locale);
      if (has && f.supportedLocales.length === 1) return f;
      const supportedLocales = has ? f.supportedLocales.filter((l) => l !== locale) : [...f.supportedLocales, locale];
      const defaultLocale = supportedLocales.includes(f.defaultLocale) ? f.defaultLocale : supportedLocales[0];
      return { ...f, supportedLocales, defaultLocale };
    });
  }

  async function handleSave() {
    await updateCompany.mutateAsync(form);
    toast.success(t("saved"));
  }

  if (isLoading || !company) {
    return (
      <div>
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  const publicUrl = catalogAbsoluteUrl(
    typeof window !== "undefined" ? window.location.origin : "",
    company.slug,
    locale,
  );

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Button variant="glow" onClick={handleSave} loading={updateCompany.isPending}>
            <Check className="size-4" />
            {tc("save")}
          </Button>
        }
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("profile")}</CardTitle>
            <CardDescription>{t("profileHint")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-[120px_1fr]">
              <div className="space-y-1.5">
                <Label>{t("logoLabel")}</Label>
                <ImageUpload value={form.logoUrl} onChange={(url) => setForm({ ...form, logoUrl: url })} shape="square" />
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">{t("nameLabel")}</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description">{t("descriptionLabel")}</Label>
                  <Textarea
                    id="description"
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="address">{t("addressLabel")}</Label>
                <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">{t("phoneLabel")}</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website">{t("websiteLabel")}</Label>
                <Input id="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t("accentColorLabel")}</Label>
              <ColorPicker value={form.accentColor} onChange={(color) => setForm({ ...form, accentColor: color })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("localization")}</CardTitle>
            <CardDescription>{t("localizationHint")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label>{t("supportedLocalesLabel")}</Label>
              <div className="flex flex-wrap gap-2">
                {LOCALES.map((locale) => {
                  const active = form.supportedLocales.includes(locale);
                  return (
                    <button
                      key={locale}
                      type="button"
                      onClick={() => toggleLocale(locale)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                        active ? "border-primary bg-primary/10 text-primary" : "border-border/70 text-muted-foreground hover:bg-muted/40",
                      )}
                    >
                      {LOCALE_META[locale].flag} {LOCALE_META[locale].nativeLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t("defaultLocaleLabel")}</Label>
                <Select value={form.defaultLocale} onValueChange={(v) => setForm({ ...form, defaultLocale: v as AppLocale })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {form.supportedLocales.map((locale) => (
                      <SelectItem key={locale} value={locale}>
                        {LOCALE_META[locale].flag} {LOCALE_META[locale].nativeLabel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t("currencyLabel")}</Label>
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("planLabel")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="accent" className="py-1.5 text-sm">
                {company.plan}
              </Badge>
              <div>
                <p className="text-sm font-medium">{t("publicUrlLabel")}</p>
                <a href={`/${locale}/c/${company.slug}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-mono text-xs text-primary hover:underline">
                  {publicUrl.replace(/^https?:\/\//, "")}
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
