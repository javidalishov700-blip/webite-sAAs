"use client";

import { Suspense, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { AlertCircle, LockKeyhole } from "lucide-react";
import { useRouter, Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { z } from "zod";
import { api, ApiError } from "@/lib/api-client";

function ResetForm() {
  const t = useTranslations("auth.reset");
  const tc = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [serverError, setServerError] = useState<string | null>(token ? null : t("invalid"));

  const schema = useMemo(
    () =>
      z
        .object({ password: z.string().min(6, tc("passwordShort")), confirmPassword: z.string() })
        .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: tc("passwordMismatch") }),
    [tc],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  async function onSubmit(values: z.infer<typeof schema>) {
    setServerError(null);
    try {
      await api.post("/api/auth/reset", { token, password: values.password });
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setServerError(err instanceof ApiError && err.status === 403 ? t("banned") : t("invalid"));
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <Card className="glow-border p-7 sm:p-9">
        <div className="glow-ring mb-5 flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
          <LockKeyhole className="size-5" />
        </div>
        <h1 className="font-display text-2xl font-bold">
          <span className="text-gradient">{t("title")}</span>
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{t("subtitle")}</p>

        {/* POST, so a submit that lands before the page is interactive never puts the password in the URL. */}
        <form method="post" onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">{t("password")}</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">{tc("passwordRepeat")}</Label>
            <Input id="confirmPassword" type="password" autoComplete="new-password" {...register("confirmPassword")} />
            {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
          </div>
          {serverError && (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {serverError}
            </div>
          )}
          <Button type="submit" variant="glow" size="lg" className="w-full" loading={isSubmitting} disabled={!token}>
            {t("submit")}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t("backToLogin")}
          </Link>
        </p>
      </Card>
    </motion.div>
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
