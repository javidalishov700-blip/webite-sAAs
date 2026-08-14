"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { Check, Cpu, Download, ExternalLink, Salad, Shirt, Sparkles } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/image-upload";
import { QrCanvas, type QrCanvasHandle } from "@/components/admin/qr-canvas";
import { useCompany, useUpdateCompany } from "@/hooks/use-company";
import { useCreateQrCode, useQrCodes } from "@/hooks/use-qr-codes";
import { cn } from "@/lib/utils";
import { qrGoAbsoluteUrl } from "@/lib/catalog-url";
import type { Industry } from "@/lib/data/types";

const ACCENTS = ["#7C5CFF", "#00E5FF", "#FF6B4A", "#33D69F", "#FFD24A", "#FF5470"];

const INDUSTRY_OPTIONS: { value: Industry; icon: typeof Salad }[] = [
  { value: "RESTAURANT", icon: Salad },
  { value: "RETAIL", icon: Shirt },
  { value: "ELECTRONICS", icon: Cpu },
  { value: "SERVICES", icon: Sparkles },
];

const TOTAL_STEPS = 3;

export default function OnboardingPage() {
  const t = useTranslations("auth.onboarding");
  const tc = useTranslations("common");
  const router = useRouter();
  const { data: company } = useCompany();
  const updateCompany = useUpdateCompany();
  const createQr = useCreateQrCode();
  const { data: qrCodes } = useQrCodes();
  const qrRef = useRef<QrCanvasHandle>(null);

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [industry, setIndustry] = useState<Industry>("RESTAURANT");
  const [accent, setAccent] = useState(ACCENTS[0]);
  const [qrCreated, setQrCreated] = useState(false);

  useEffect(() => {
    if (company) {
      setName(company.name);
      setLogoUrl(company.logoUrl ?? null);
      setIndustry(company.industry);
      setAccent(company.accentColor);
    }
  }, [company]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const catalogHref = company ? `/c/${company.slug}` : "";
  const catalogUrl = company ? `${origin}/${company.defaultLocale}/c/${company.slug}` : "";
  const existingQr = qrCodes?.[0];
  const qrPayload = existingQr ? qrGoAbsoluteUrl(origin, existingQr.id) : catalogUrl;

  async function goNext() {
    if (step === 1) {
      await updateCompany.mutateAsync({ name, logoUrl });
    }
    if (step === 2) {
      await updateCompany.mutateAsync({ industry, accentColor: accent });
    }
    if (step === 3) {
      router.push("/admin");
      router.refresh();
      return;
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }

  useEffect(() => {
    if (step === 3 && !existingQr && !qrCreated && company) {
      setQrCreated(true);
      createQr.mutate({ name: "Storefront QR", targetUrl: catalogHref });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, existingQr, qrCreated, company]);

  return (
    <div className="w-full max-w-xl">
      <div className="mb-6 flex items-center justify-center gap-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i + 1 <= step ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </div>
      <p className="mb-2 text-center text-xs font-medium text-muted-foreground">
        {t("step", { current: step, total: TOTAL_STEPS })}
      </p>

      <Card className="glow-border overflow-hidden p-7 sm:p-9">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="font-display text-2xl font-bold">
                <span className="text-gradient">{t("step1.title")}</span>
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">{t("step1.subtitle")}</p>

              <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-[1fr_140px]">
                <div className="space-y-1.5">
                  <Label htmlFor="company-name">{t("step1.nameLabel")}</Label>
                  <Input id="company-name" value={name} onChange={(e) => setName(e.target.value)} />

                  <div className="pt-4">
                    <Label>{t("step1.accentLabel")}</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {ACCENTS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setAccent(color)}
                          style={{ backgroundColor: color }}
                          className={cn(
                            "size-8 rounded-full ring-offset-2 ring-offset-background transition-transform hover:scale-110",
                            accent === color && "ring-2 ring-white/80",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("step1.logoLabel")}</Label>
                  <ImageUpload value={logoUrl} onChange={setLogoUrl} shape="square" />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="font-display text-2xl font-bold">{t("step2.title")}</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">{t("step2.subtitle")}</p>

              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {INDUSTRY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setIndustry(option.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border p-4 text-xs font-medium transition-colors",
                      industry === option.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/40",
                    )}
                  >
                    <option.icon className="size-5" />
                    {option.value.charAt(0) + option.value.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h1 className="font-display text-2xl font-bold">{t("step3.title")}</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">{t("step3.subtitle")}</p>

              <div className="mt-7 flex flex-col items-center gap-5">
                <div className="glow-ring rounded-3xl bg-white p-4">
                    <QrCanvas
                    ref={qrRef}
                    data={qrPayload}
                    dotsColor={existingQr?.dotsColor ?? accent}
                    backgroundColor="#ffffff"
                    dotsStyle={existingQr?.dotsStyle ?? "EXTRA_ROUNDED"}
                    cornerStyle={existingQr?.cornerStyle ?? "EXTRA_ROUNDED"}
                    logoUrl={logoUrl}
                    size={220}
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => qrRef.current?.download("png", name || "qr-universe")}>
                    <Download className="size-3.5" />
                    PNG
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => qrRef.current?.download("svg", name || "qr-universe")}>
                    <Download className="size-3.5" />
                    SVG
                  </Button>
                </div>

                <div className="w-full rounded-xl border border-border/70 bg-muted/20 p-3 text-center">
                  <p className="text-xs text-muted-foreground">{t("step3.catalogLive")}</p>
                  <a
                    href={catalogHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 flex items-center justify-center gap-1.5 font-mono text-sm font-medium text-primary hover:underline"
                  >
                    {catalogUrl.replace(/^https?:\/\//, "")}
                    <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button variant="glow" size="lg" className="mt-8 w-full" onClick={goNext} loading={updateCompany.isPending}>
          {step === TOTAL_STEPS ? (
            <>
              <Check className="size-4" />
              {t("step3.goToDashboard")}
            </>
          ) : (
            tc("continue")
          )}
        </Button>
      </Card>
    </div>
  );
}
