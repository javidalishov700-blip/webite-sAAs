"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { AlertCircle, ArrowRight, LogIn } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { TiltCard } from "@/components/landing/tilt-card";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import { api, ApiError } from "@/lib/api-client";
import { stripLocalePrefix } from "@/lib/catalog-url";

const DEMO_ACCOUNTS = [
  { email: "demo@bellafoods.com", name: "Bella Foods", industry: "Restaurant", initials: "BF", color: "#FF6B4A" },
  { email: "demo@urbansole.com", name: "Urban Sole", industry: "Retail", initials: "US", color: "#3AD1C4" },
  { email: "demo@nexustech.com", name: "NexusTech", industry: "Electronics", initials: "NT", color: "#7C5CFF" },
];
const DEMO_PASSWORD = "demo1234";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/admin";
  const stripped = stripLocalePrefix(raw);
  if (!stripped.startsWith("/") || stripped.startsWith("//")) return "/admin";
  return stripped;
}

function LoginForm() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    try {
      await api.post("/api/auth/login", values);
      router.push(safeNextPath(searchParams.get("next")));
      router.refresh();
    } catch (err) {
      setServerError(err instanceof ApiError ? t("invalid") : "Something went wrong");
    }
  }

  function fillDemo(email: string) {
    setValue("email", email, { shouldValidate: true });
    setValue("password", DEMO_PASSWORD, { shouldValidate: true });
    setServerError(null);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid w-full max-w-4xl grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]"
    >
      <Card className="glow-border p-7 sm:p-9">
        <div className="glow-ring mb-5 flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
          <LogIn className="size-5" />
        </div>
        <h1 className="font-display text-2xl font-bold">
          <span className="text-gradient">{t("title")}</span>
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{t("subtitle")}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" type="email" autoComplete="email" placeholder="you@company.com" {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">{t("password")}</Label>
            <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
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
          {t("noAccount")}{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            {t("signupLink")}
          </Link>
        </p>
      </Card>

      <Card className="glow-border flex flex-col justify-center p-7 sm:p-9">
        <p className="font-display text-base font-semibold">{t("demoTitle")}</p>
        <p className="mt-1.5 text-sm text-muted-foreground">{t("demoHint")}</p>
        <div className="mt-5 space-y-2.5">
          {DEMO_ACCOUNTS.map((account) => (
            <TiltCard key={account.email} maxTilt={8} hoverScale={1.02} className="rounded-xl">
              <button
                type="button"
                onClick={() => fillDemo(account.email)}
                className="glass-card flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:border-primary/50"
              >
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${account.color}, transparent)`, backgroundColor: account.color }}
                >
                  {account.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{account.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{account.email}</span>
                </span>
                <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
                  {account.industry}
                </span>
              </button>
            </TiltCard>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
