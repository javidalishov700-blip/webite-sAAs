"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { KeyRound } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { emailLocaleSchema, type EmailLocaleInput } from "@/lib/validators/auth";
import { api } from "@/lib/api-client";

export default function ForgotPage() {
  const t = useTranslations("auth.forgot");
  const locale = useLocale();
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmailLocaleInput>({ resolver: zodResolver(emailLocaleSchema) });

  async function onSubmit(values: EmailLocaleInput) {
    await api.post("/api/auth/forgot", { ...values, locale });
    setDone(true);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <Card className="glow-border p-7 sm:p-9">
        <div className="glow-ring mb-5 flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
          <KeyRound className="size-5" />
        </div>
        <h1 className="font-display text-2xl font-bold">
          <span className="text-gradient">{t("title")}</span>
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{done ? t("sent") : t("subtitle")}</p>

        {done ? (
          <Button variant="glow" className="mt-7 w-full" asChild>
            <Link href="/login">{t("backToLogin")}</Link>
          </Button>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <Button type="submit" variant="glow" size="lg" className="w-full" loading={isSubmitting}>
              {t("submit")}
            </Button>
          </form>
        )}
      </Card>
    </motion.div>
  );
}
