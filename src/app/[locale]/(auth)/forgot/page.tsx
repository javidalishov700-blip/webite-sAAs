"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { AlertCircle, KeyRound, LockKeyhole, MailCheck } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { api, ApiError } from "@/lib/api-client";

const RESEND_WAIT_SECONDS = 30;

type Step = "email" | "code" | "password";
const STEP_NUMBER: Record<Step, number> = { email: 1, code: 2, password: 3 };

/**
 * Email, then the emailed code on its own, and only once the server has
 * accepted the code, the new password. The password step cannot be reached
 * by typing a code and a password together.
 */
export default function ForgotPage() {
  const t = useTranslations("auth.forgot");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = window.setTimeout(() => setWait((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [wait]);

  // The server checks the same rules; these copies exist to speak the page's language.
  const emailSchema = useMemo(() => z.object({ email: z.string().trim().email(tc("emailInvalid")) }), [tc]);
  const codeSchema = useMemo(() => z.object({ code: z.string().trim().regex(/^\d{6}$/, tc("codeFormat")) }), [tc]);
  const passwordSchema = useMemo(
    () =>
      z
        .object({ password: z.string().min(6, tc("passwordShort")), confirmPassword: z.string() })
        .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: tc("passwordMismatch") }),
    [tc],
  );
  const emailForm = useForm<z.infer<typeof emailSchema>>({ resolver: zodResolver(emailSchema) });
  const codeForm = useForm<z.infer<typeof codeSchema>>({ resolver: zodResolver(codeSchema) });
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema) });

  function explain(err: unknown) {
    if (err instanceof ApiError && err.status === 429) return t("rateLimited");
    if (err instanceof ApiError && err.message === "locked") return t("locked");
    if (err instanceof ApiError && err.message === "expired") return t("expired");
    if (err instanceof ApiError && err.message === "banned") return t("banned");
    if (err instanceof ApiError && err.status === 400) return t("invalid");
    return t("unavailable");
  }

  function clearMessages() {
    setError(null);
    setNotice(null);
    setExpired(false);
  }

  async function sendCode(address: string) {
    await api.post("/api/auth/forgot", { email: address, locale });
    setEmail(address);
    codeForm.reset();
    passwordForm.reset();
    setStep("code");
    setWait(RESEND_WAIT_SECONDS);
  }

  async function onEmail(values: z.infer<typeof emailSchema>) {
    clearMessages();
    try {
      await sendCode(values.email.trim());
    } catch (err) {
      setError(explain(err));
    }
  }

  async function onResend() {
    clearMessages();
    try {
      await sendCode(email);
      setNotice(t("resent"));
    } catch (err) {
      setError(explain(err));
    }
  }

  async function onCode(values: z.infer<typeof codeSchema>) {
    clearMessages();
    try {
      await api.post("/api/auth/reset/verify", { email, code: values.code });
      setStep("password");
    } catch (err) {
      setError(explain(err));
    }
  }

  async function onPassword(values: z.infer<typeof passwordSchema>) {
    clearMessages();
    try {
      await api.post("/api/auth/reset", { password: values.password });
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(explain(err));
      setExpired(err instanceof ApiError && err.message === "expired");
    }
  }

  const errorBox = error ? (
    <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
      <AlertCircle className="size-4 shrink-0" />
      {error}
    </div>
  ) : null;

  const Icon = step === "email" ? KeyRound : step === "code" ? MailCheck : LockKeyhole;
  const subtitle = step === "email" ? t("subtitle") : step === "code" ? t("codeSent", { email }) : t("verified");

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <Card className="glow-border p-7 sm:p-9">
        <div className="mb-5 flex items-center justify-between">
          <div className="glow-ring flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
            <Icon className="size-5" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {t("step", { current: STEP_NUMBER[step], total: 3 })}
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold">
          <span className="text-gradient">{t("title")}</span>
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>

        {step === "email" ? (
          <form method="post" onSubmit={emailForm.handleSubmit(onEmail)} className="mt-7 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("email")}</Label>
              <Input id="email" type="email" autoComplete="email" {...emailForm.register("email")} />
              {emailForm.formState.errors.email && (
                <p className="text-xs text-destructive">{emailForm.formState.errors.email.message}</p>
              )}
            </div>
            {errorBox}
            <Button type="submit" variant="glow" size="lg" className="w-full" loading={emailForm.formState.isSubmitting}>
              {t("submit")}
            </Button>
          </form>
        ) : null}

        {step === "code" ? (
          <>
            <form method="post" onSubmit={codeForm.handleSubmit(onCode)} className="mt-7 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="code">{t("code")}</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="123456"
                  autoFocus
                  className="text-center text-lg tracking-[0.5em]"
                  {...codeForm.register("code")}
                />
                {codeForm.formState.errors.code && (
                  <p className="text-xs text-destructive">{codeForm.formState.errors.code.message}</p>
                )}
              </div>
              {errorBox}
              {notice && !error ? <p className="text-sm text-success">{notice}</p> : null}
              <Button type="submit" variant="glow" size="lg" className="w-full" loading={codeForm.formState.isSubmitting}>
                {t("verify")}
              </Button>
            </form>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
              <button
                type="button"
                onClick={onResend}
                disabled={wait > 0}
                className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
              >
                {wait > 0 ? t("resendIn", { seconds: wait }) : t("resend")}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearMessages();
                  setStep("email");
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                {t("changeEmail")}
              </button>
            </div>
          </>
        ) : null}

        {step === "password" ? (
          <form method="post" onSubmit={passwordForm.handleSubmit(onPassword)} className="mt-7 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                autoFocus
                {...passwordForm.register("password")}
              />
              {passwordForm.formState.errors.password && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.password.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">{tc("passwordRepeat")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...passwordForm.register("confirmPassword")}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            {errorBox}
            {expired ? (
              <Button type="button" variant="outline" className="w-full" onClick={onResend}>
                {t("startOver")}
              </Button>
            ) : (
              <Button type="submit" variant="glow" size="lg" className="w-full" loading={passwordForm.formState.isSubmitting}>
                {t("save")}
              </Button>
            )}
          </form>
        ) : null}

        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t("backToLogin")}
          </Link>
        </p>
      </Card>
    </motion.div>
  );
}
