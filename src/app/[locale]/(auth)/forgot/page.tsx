"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { AlertCircle, KeyRound, MailCheck } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { emailLocaleSchema, resetCodeSchema, type EmailLocaleInput, type ResetCodeInput } from "@/lib/validators/auth";
import { api, ApiError } from "@/lib/api-client";

const RESEND_WAIT_SECONDS = 30;

/**
 * Step one asks for the address, step two takes the 6-digit code from the mail
 * together with the new password, the same shape as confirming a sign-up.
 */
export default function ForgotPage() {
  const t = useTranslations("auth.forgot");
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return;
    const timer = window.setTimeout(() => setWait((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [wait]);

  const emailForm = useForm<EmailLocaleInput>({ resolver: zodResolver(emailLocaleSchema) });
  const codeForm = useForm<ResetCodeInput>({ resolver: zodResolver(resetCodeSchema) });

  function explain(err: unknown) {
    if (err instanceof ApiError && err.status === 429) return t("rateLimited");
    if (err instanceof ApiError && err.message === "locked") return t("locked");
    if (err instanceof ApiError && err.message === "banned") return t("banned");
    if (err instanceof ApiError && err.status === 400) return t("invalid");
    return t("unavailable");
  }

  async function sendCode(address: string) {
    setError(null);
    await api.post("/api/auth/forgot", { email: address, locale });
    setEmail(address);
    codeForm.setValue("email", address);
    setWait(RESEND_WAIT_SECONDS);
  }

  async function onEmail(values: EmailLocaleInput) {
    try {
      await sendCode(values.email.trim());
    } catch (err) {
      setError(explain(err));
    }
  }

  async function onResend() {
    if (!email) return;
    try {
      await sendCode(email);
      setNotice(t("resent"));
    } catch (err) {
      setError(explain(err));
    }
  }

  async function onReset(values: ResetCodeInput) {
    setError(null);
    try {
      await api.post("/api/auth/reset", values);
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(explain(err));
    }
  }

  const errorBox = error ? (
    <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
      <AlertCircle className="size-4 shrink-0" />
      {error}
    </div>
  ) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <Card className="glow-border p-7 sm:p-9">
        <div className="glow-ring mb-5 flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
          {email ? <MailCheck className="size-5" /> : <KeyRound className="size-5" />}
        </div>
        <h1 className="font-display text-2xl font-bold">
          <span className="text-gradient">{t("title")}</span>
        </h1>

        {!email ? (
          <>
            <p className="mt-1.5 text-sm text-muted-foreground">{t("subtitle")}</p>
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
          </>
        ) : (
          <>
            <p className="mt-1.5 text-sm text-muted-foreground">{t("codeSent", { email })}</p>
            <form method="post" onSubmit={codeForm.handleSubmit(onReset)} className="mt-7 space-y-4">
              <input type="hidden" {...codeForm.register("email")} />
              <div className="space-y-1.5">
                <Label htmlFor="code">{t("code")}</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  placeholder="123456"
                  className="text-center text-lg tracking-[0.5em]"
                  {...codeForm.register("code")}
                />
                {codeForm.formState.errors.code && (
                  <p className="text-xs text-destructive">{codeForm.formState.errors.code.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">{t("password")}</Label>
                <Input id="password" type="password" autoComplete="new-password" placeholder="••••••••" {...codeForm.register("password")} />
                {codeForm.formState.errors.password && (
                  <p className="text-xs text-destructive">{codeForm.formState.errors.password.message}</p>
                )}
              </div>
              {errorBox}
              {notice && !error ? <p className="text-sm text-success">{notice}</p> : null}
              <Button type="submit" variant="glow" size="lg" className="w-full" loading={codeForm.formState.isSubmitting}>
                {t("save")}
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
                  setEmail(null);
                  setError(null);
                  setNotice(null);
                  codeForm.reset();
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                {t("changeEmail")}
              </button>
            </div>
          </>
        )}

        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t("backToLogin")}
          </Link>
        </p>
      </Card>
    </motion.div>
  );
}
