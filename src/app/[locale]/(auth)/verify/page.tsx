"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { useRouter, Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api-client";

function VerifyForm() {
  const t = useTranslations("auth.verify");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"working" | "ok" | "error">(token ? "working" : "error");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api
      .post("/api/auth/verify", { token })
      .then(() => {
        if (cancelled) return;
        setStatus("ok");
        router.push("/onboarding");
        router.refresh();
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <Card className="glow-border p-7 sm:p-9">
        <div className="glow-ring mb-5 flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
          <ShieldCheck className="size-5" />
        </div>
        <h1 className="font-display text-2xl font-bold">
          <span className="text-gradient">{t("title")}</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {status === "working" ? t("working") : status === "ok" ? t("ok") : t("invalid")}
        </p>
        {status === "error" ? (
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {t("invalid")}
            </div>
            <Button variant="glow" className="w-full" asChild>
              <Link href="/check-email">{t("resend")}</Link>
            </Button>
          </div>
        ) : null}
      </Card>
    </motion.div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyForm />
    </Suspense>
  );
}
