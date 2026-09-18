"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Printer, QrCode as QrCodeIcon } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { QrPrintSheet, type PrintLayout } from "@/components/admin/qr-print-sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Link } from "@/i18n/navigation";
import { useCompany } from "@/hooks/use-company";
import { useQrCodes } from "@/hooks/use-qr-codes";
import { catalogAbsoluteUrl, qrGoAbsoluteUrl } from "@/lib/catalog-url";
import { appBaseUrl } from "@/lib/site";

const LAYOUTS: PrintLayout[] = ["cards", "tent", "poster"];

export default function QrPrintPage() {
  const t = useTranslations("admin.qr.print");
  const { data: company } = useCompany();
  const { data: qrCodes, isLoading } = useQrCodes();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [layout, setLayout] = useState<PrintLayout>("cards");
  const [headline, setHeadline] = useState("");
  const [hint, setHint] = useState("");

  // Defaults come from the translations, so they are wrong in no language.
  useEffect(() => {
    setHeadline((current) => current || t("headlineDefault"));
    setHint((current) => current || t("hintDefault"));
  }, [t]);

  const selected = qrCodes?.find((q) => q.id === selectedId) ?? qrCodes?.[0] ?? null;
  const origin = appBaseUrl();
  const payload = selected
    ? qrGoAbsoluteUrl(origin, selected.id)
    : company
      ? catalogAbsoluteUrl(origin, company.slug, company.defaultLocale)
      : "";

  if (isLoading) {
    return (
      <div>
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!selected) {
    return (
      <div>
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
        <EmptyState icon={QrCodeIcon} title={t("needQr")} className="mt-6 border border-border bg-card" />
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/admin/qr-studio">
            <ArrowLeft className="size-4" />
            QR Studio
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="print:hidden">
        <PageHeader
          title={t("title")}
          subtitle={t("subtitle")}
          actions={
            <Button variant="glow" onClick={() => window.print()}>
              <Printer className="size-4" />
              {t("print")}
            </Button>
          }
        />

        <Card className="mb-6">
          <CardContent className="grid gap-5 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label>{t("qrLabel")}</Label>
              <Select value={selected.id} onValueChange={setSelectedId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {qrCodes?.map((qr) => (
                    <SelectItem key={qr.id} value={qr.id}>
                      {qr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("layoutLabel")}</Label>
              <Select value={layout} onValueChange={(v) => setLayout(v as PrintLayout)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LAYOUTS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {t(`layouts.${option}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="print-headline">{t("headlineLabel")}</Label>
              <Input id="print-headline" value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={28} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="print-hint">{t("hintLabel")}</Label>
              <Input id="print-hint" value={hint} onChange={(e) => setHint(e.target.value)} maxLength={40} />
            </div>
            <p className="text-xs text-muted-foreground sm:col-span-2 lg:col-span-4">{t("tip")}</p>
          </CardContent>
        </Card>
      </div>

      {/* The preview element is the printed element — see .print-root in globals.css */}
      <div className="print-root flex justify-center">
        <div className="origin-top scale-[0.42] sm:scale-[0.6] lg:scale-100 print:scale-100">
          <QrPrintSheet
            qr={selected}
            payload={payload}
            accentColor={company?.accentColor ?? "#7C5CFF"}
            headline={headline}
            hint={hint}
            venue={company?.name ?? ""}
            layout={layout}
          />
        </div>
      </div>
    </div>
  );
}
