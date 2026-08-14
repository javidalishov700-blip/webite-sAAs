"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, ApiError } from "@/lib/api-client";
import { SITE } from "@/lib/site";
import { ABUSE_REASONS, type AbuseReasonInput } from "@/lib/abuse-reasons";

export function ReportAbuse({ slug, locale }: { slug: string; locale: string }) {
  const t = useTranslations("catalog.report");
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<AbuseReasonInput | "">("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!reason) {
      toast.error(t("needReason"));
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/catalog/report", {
        slug,
        reason,
        details: details.trim() || undefined,
        locale,
      });
      toast.success(t("sent"));
      setOpen(false);
      setReason("");
      setDetails("");
    } catch (err) {
      toast.error(err instanceof ApiError && err.status === 429 ? t("rateLimited") : t("error"));
    } finally {
      setSubmitting(false);
    }
  }

  const whatsappHref = `${SITE.whatsapp}${SITE.whatsapp.includes("?") ? "&" : "?"}text=${encodeURIComponent(
    `QR-Universe report: /c/${slug}`,
  )}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-muted-foreground/80 underline-offset-2 hover:text-foreground hover:underline"
      >
        <Flag className="size-3" />
        {t("link")}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{t("title")}</DialogTitle>
              <DialogDescription>{t("subtitle")}</DialogDescription>
            </DialogHeader>

            <div className="space-y-1.5">
              <Label htmlFor="abuse-reason">{t("reason")}</Label>
              <select
                id="abuse-reason"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value as AbuseReasonInput | "")}
                className="flex h-10 w-full rounded-xl border border-input bg-input/30 px-3.5 text-sm text-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                <option value="">{t("reasonPlaceholder")}</option>
                {ABUSE_REASONS.map((value) => (
                  <option key={value} value={value}>
                    {t(`reasons.${value}`)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="abuse-details">{t("details")}</Label>
              <Textarea
                id="abuse-details"
                maxLength={500}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder={t("detailsPlaceholder")}
              />
            </div>

            <DialogFooter className="gap-2 sm:justify-between">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                {t("whatsapp")}
              </a>
              <Button type="submit" size="sm" loading={submitting} disabled={!reason}>
                {t("submit")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
