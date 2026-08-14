import "server-only";
import { sendMail, verificationMail, resetMail } from "@/lib/mailer";
import { issueAuthToken, RESET_TTL_MS, VERIFY_TTL_MS } from "@/lib/auth/tokens";
import { appBaseUrl } from "@/lib/site";
import type { AppLocale } from "@/lib/data/types";

function localeOrEn(locale?: string | null): AppLocale {
  if (locale === "az" || locale === "tr" || locale === "ru" || locale === "en") return locale;
  return "en";
}

export async function sendVerificationLink(user: { id: string; email: string }, locale?: string | null) {
  const loc = localeOrEn(locale);
  const raw = await issueAuthToken(user.id, "EMAIL_VERIFY", VERIFY_TTL_MS);
  const url = `${appBaseUrl()}/${loc}/verify?token=${encodeURIComponent(raw)}`;
  const sent = await sendMail({ to: user.email, ...verificationMail(loc, url) });
  if (!sent.sent && process.env.NODE_ENV !== "production") {
    console.info(`[auth] verify link for ${user.email}: ${url}`);
  }
  return sent;
}

export async function sendPasswordResetLink(user: { id: string; email: string }, locale?: string | null) {
  const loc = localeOrEn(locale);
  const raw = await issueAuthToken(user.id, "PASSWORD_RESET", RESET_TTL_MS);
  const url = `${appBaseUrl()}/${loc}/reset?token=${encodeURIComponent(raw)}`;
  const sent = await sendMail({ to: user.email, ...resetMail(loc, url) });
  if (!sent.sent && process.env.NODE_ENV !== "production") {
    console.info(`[auth] reset link for ${user.email}: ${url}`);
  }
  return sent;
}
