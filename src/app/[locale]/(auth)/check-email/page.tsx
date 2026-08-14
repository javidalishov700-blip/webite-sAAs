"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { MailCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { SITE } from "@/lib/site";

function CheckEmailForm() {
  const t = useTranslations("auth.checkEmail");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const preset = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(preset);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function resend() {
    setLoading(true);
    try {
      await api.post("/api/auth/resend", { email: email.trim() || preset, locale });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <Card className="glow-border p-7 sm:p-9">
        <div className="glow-ring mb-5 flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
          <MailCheck className="size-5" />
        </div>
        <h1 className="font-display text-2xl font-bold">
          <span className="text-gradient">{t("title")}</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("body")}</p>
        {preset ? <p className="mt-2 font-medium text-sm">{preset}</p> : null}

        <div className="mt-6 space-y-3">
          {!preset ? (
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
            />
          ) : null}
          <Button variant="glow" className="w-full" loading={loading} onClick={() => void resend()}>
            {t("resend")}
          </Button>
          {sent ? <p className="text-center text-xs text-muted-foreground">{t("resent")}</p> : null}
        </div>

        <p className="mt-6 text-sm text-muted-foreground">{t("noMail")}</p>
        <Button variant="outline" className="mt-3 w-full" asChild>
          <a href={SITE.whatsapp} target="_blank" rel="noreferrer">
            {t("whatsapp")}
          </a>
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t("backToLogin")}
          </Link>
        </p>
      </Card>
    </motion.div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={null}>
      <CheckEmailForm />
    </Suspense>
  );
}
