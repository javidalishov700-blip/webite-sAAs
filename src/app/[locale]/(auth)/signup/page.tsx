"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "motion/react";
import { AlertCircle, ArrowRight, UserPlus } from "lucide-react";
import { useRouter, Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { signupSchema, type SignupInput } from "@/lib/validators/auth";
import { api, ApiError } from "@/lib/api-client";
import { IndustryPicker } from "@/components/industry-picker";
import type { Industry } from "@/lib/data/types";

export default function SignupPage() {
  const t = useTranslations("auth.signup");
  const locale = useLocale();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { industry: "RESTAURANT", acceptedTerms: false },
  });

  async function onSubmit(values: SignupInput) {
    setServerError(null);
    try {
      await api.post("/api/auth/signup", { ...values, locale });
      router.push(`/check-email?email=${encodeURIComponent(values.email)}`);
    } catch (err) {
      setServerError(err instanceof ApiError && err.status === 409 ? t("emailTaken") : t("unavailable"));
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-lg">
      <Card className="glow-border p-7 sm:p-9">
        <div className="glow-ring mb-5 flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
          <UserPlus className="size-5" />
        </div>
        <h1 className="font-display text-2xl font-bold">
          <span className="text-gradient">{t("title")}</span>
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{t("subtitle")}</p>

        {/* POST, so a submit that lands before the page is interactive never puts the password in the URL. */}
        <form method="post" onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">{t("name")}</Label>
              <Input id="name" autoComplete="name" placeholder="Jane Doe" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="companyName">{t("companyName")}</Label>
              <Input id="companyName" placeholder="Bella Foods" {...register("companyName")} />
              {errors.companyName && <p className="text-xs text-destructive">{errors.companyName.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" type="email" autoComplete="email" placeholder="you@company.com" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">{t("password")}</Label>
            <Input id="password" type="password" autoComplete="new-password" placeholder="••••••••" {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>{t("industry")}</Label>
            <p className="text-xs text-muted-foreground">{t("industryHint")}</p>
            <Controller
              control={control}
              name="industry"
              render={({ field }) => (
                <IndustryPicker value={field.value as Industry} onChange={field.onChange} />
              )}
            />
          </div>

          <div className="space-y-3 rounded-xl border border-border/80 bg-muted/25 p-3.5">
            <ul className="list-disc space-y-1.5 pl-4 text-[11px] leading-relaxed text-muted-foreground">
              {(t.raw("notice") as string[]).map((item) => (
                <li key={item.slice(0, 48)}>{item}</li>
              ))}
            </ul>
            <div className="flex items-start gap-2.5">
              <Controller
                control={control}
                name="acceptedTerms"
                render={({ field }) => (
                  <Checkbox
                    id="acceptedTerms"
                    className="mt-0.5"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                )}
              />
              <label htmlFor="acceptedTerms" className="cursor-pointer text-xs leading-relaxed text-foreground/90">
                {t.rich("acceptLabel", {
                  terms: (chunks) => (
                    <Link href="/terms" className="font-medium text-primary hover:underline">
                      {chunks}
                    </Link>
                  ),
                  privacy: (chunks) => (
                    <Link href="/privacy" className="font-medium text-primary hover:underline">
                      {chunks}
                    </Link>
                  ),
                })}
              </label>
            </div>
            {errors.acceptedTerms ? <p className="text-xs text-destructive">{t("mustAccept")}</p> : null}
          </div>

          {serverError && (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              {serverError}
            </div>
          )}

          <Button type="submit" variant="glow" size="lg" className="w-full" loading={isSubmitting}>
            {t("submit")}
            <ArrowRight className="size-4" />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("haveAccount")}{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t("loginLink")}
          </Link>
        </p>
      </Card>
    </motion.div>
  );
}
