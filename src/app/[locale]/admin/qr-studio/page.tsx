"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Download, Plus, QrCode as QrCodeIcon, Smartphone, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { QrCanvas, type QrCanvasHandle } from "@/components/admin/qr-canvas";
import { CatalogPhonePreview } from "@/components/admin/catalog-phone-preview";
import { ColorPicker } from "@/components/admin/color-picker";
import { ImageUpload } from "@/components/admin/image-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCreateQrCode, useDeleteQrCode, useQrCodes, useUpdateQrCode } from "@/hooks/use-qr-codes";
import { useCompany } from "@/hooks/use-company";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { catalogAbsoluteUrl, catalogPreviewPath, qrGoAbsoluteUrl } from "@/lib/catalog-url";
import type { QrDotStyle } from "@/lib/data/types";

const DOT_STYLES: QrDotStyle[] = ["SQUARE", "DOTS", "ROUNDED", "CLASSY", "CLASSY_ROUNDED", "EXTRA_ROUNDED"];

export default function QrStudioPage() {
  const t = useTranslations("admin.qr");
  const tc = useTranslations("common");
  const { data: company } = useCompany();
  const { data: qrCodes, isLoading } = useQrCodes();
  const createQr = useCreateQrCode();
  const updateQr = useUpdateQrCode();
  const deleteQr = useDeleteQrCode();
  const qrRef = useRef<QrCanvasHandle>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    name: string;
    dotsColor: string;
    backgroundColor: string;
    dotsStyle: QrDotStyle;
    cornerStyle: QrDotStyle;
    logoUrl: string | null;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selected = qrCodes?.find((q) => q.id === selectedId) ?? qrCodes?.[0] ?? null;

  useEffect(() => {
    if (selected && (!draft || selectedId !== selected.id)) {
      setSelectedId(selected.id);
      setDraft({
        name: selected.name,
        dotsColor: selected.dotsColor,
        backgroundColor: selected.backgroundColor,
        dotsStyle: selected.dotsStyle,
        cornerStyle: selected.cornerStyle,
        logoUrl: selected.logoUrl ?? null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const catalogUrl = company ? catalogAbsoluteUrl(origin, company.slug, company.defaultLocale) : "";
  const qrPayload = selected ? qrGoAbsoluteUrl(origin, selected.id) : catalogUrl;

  async function handleCreate() {
    const qr = await createQr.mutateAsync({ name: `QR code ${(qrCodes?.length ?? 0) + 1}` });
    setSelectedId(qr.id);
    toast.success(t("created"));
  }

  async function handleSave() {
    if (!selected || !draft) return;
    await updateQr.mutateAsync({ id: selected.id, ...draft });
    toast.success(t("updated"));
  }

  async function handleDelete() {
    if (!deletingId) return;
    await deleteQr.mutateAsync(deletingId);
    if (deletingId === selectedId) setSelectedId(null);
    setDeletingId(null);
    toast.success(t("deleted"));
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title={t("title")} subtitle={t("subtitle")} />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Button variant="glow" onClick={handleCreate} loading={createQr.isPending}>
            <Plus className="size-4" />
            {t("newCode")}
          </Button>
        }
      />

      {!qrCodes || qrCodes.length === 0 ? (
        <EmptyState
          icon={QrCodeIcon}
          title={t("yourCodes")}
          action={
            <Button variant="glow" onClick={handleCreate}>
              <Plus className="size-4" />
              {t("newCode")}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <div className="flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {qrCodes.map((qr) => (
              <button
                key={qr.id}
                onClick={() => setSelectedId(qr.id)}
                className={cn(
                  "glass-card flex w-56 shrink-0 items-center gap-3 rounded-2xl p-3 text-left transition-colors lg:w-auto",
                  selected?.id === qr.id && "ring-2 ring-primary",
                )}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: qr.backgroundColor }}>
                  <QrCodeIcon className="size-5" style={{ color: qr.dotsColor }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{qr.name}</p>
                  <p className="text-xs text-muted-foreground">{t("scans", { count: qr.scans })}</p>
                </div>
              </button>
            ))}
          </div>

          {selected && draft && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <Card>
                <CardHeader>
                  <CardTitle>{t("style")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-1.5">
                    <Label>{t("nameLabel")}</Label>
                    <Input
                      placeholder={t("namePlaceholder")}
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>{t("urlLabel")}</Label>
                    <p className="truncate rounded-lg border border-border/70 bg-muted/20 px-3 py-2 font-mono text-xs text-muted-foreground">
                      {qrPayload || catalogUrl}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>{t("dotsColorLabel")}</Label>
                      <ColorPicker value={draft.dotsColor} onChange={(color) => setDraft({ ...draft, dotsColor: color })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t("backgroundColorLabel")}</Label>
                      <ColorPicker value={draft.backgroundColor} onChange={(color) => setDraft({ ...draft, backgroundColor: color })} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>{t("dotsStyleLabel")}</Label>
                      <Select value={draft.dotsStyle} onValueChange={(v) => setDraft({ ...draft, dotsStyle: v as QrDotStyle })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DOT_STYLES.map((style) => (
                            <SelectItem key={style} value={style}>
                              {t(`dotStyles.${style}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>{t("cornerStyleLabel")}</Label>
                      <Select value={draft.cornerStyle} onValueChange={(v) => setDraft({ ...draft, cornerStyle: v as QrDotStyle })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DOT_STYLES.map((style) => (
                            <SelectItem key={style} value={style}>
                              {t(`dotStyles.${style}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>{t("logo")}</Label>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        {t("useCompanyLogo")}
                        <Switch
                          checked={draft.logoUrl === company?.logoUrl && !!company?.logoUrl}
                          onCheckedChange={(checked) => setDraft({ ...draft, logoUrl: checked ? (company?.logoUrl ?? null) : null })}
                        />
                      </span>
                    </div>
                    <ImageUpload value={draft.logoUrl} onChange={(url) => setDraft({ ...draft, logoUrl: url })} shape="square" className="max-w-32" />
                  </div>

                  <div className="flex items-center justify-between border-t border-border/70 pt-5">
                    <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeletingId(selected.id)}>
                      <Trash2 className="size-4" />
                      {tc("delete")}
                    </Button>
                    <Button variant="glow" onClick={handleSave} loading={updateQr.isPending}>
                      {tc("save")}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="h-fit">
                <CardHeader>
                  <CardTitle>{t("preview")}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-5">
                  <div className="glow-ring rounded-3xl bg-white p-4">
                    <QrCanvas
                      ref={qrRef}
                      data={qrPayload}
                      dotsColor={draft.dotsColor}
                      backgroundColor={draft.backgroundColor}
                      dotsStyle={draft.dotsStyle}
                      cornerStyle={draft.cornerStyle}
                      logoUrl={draft.logoUrl}
                      size={220}
                    />
                  </div>
                  <div className="flex w-full gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => qrRef.current?.download("png", draft.name)}>
                      <Download className="size-3.5" />
                      {t("downloadPng")}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => qrRef.current?.download("svg", draft.name)}>
                      <Download className="size-3.5" />
                      {t("downloadSvg")}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {company ? (
                <div className="space-y-3">
                  <CatalogPhonePreview
                    size="compact"
                    src={catalogPreviewPath(company.slug, company.defaultLocale)}
                    label={t("pagePreview")}
                  />
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/admin/preview">
                      <Smartphone className="size-4" />
                      {t("openPagePreview")}
                    </Link>
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{tc("confirm")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{tc("delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
