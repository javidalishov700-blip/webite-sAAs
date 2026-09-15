import "server-only";
import { sendMail, verificationMail, resetMail, newSignupMail } from "@/lib/mailer";
import { issueAuthToken, generateNumericCode, RESET_TTL_MS, VERIFY_TTL_MS } from "@/lib/auth/tokens";
import { appBaseUrl } from "@/lib/site";
import { platformAdminEmails } from "@/lib/platform-admin";
import { DEFAULT_LOCALE } from "@/lib/constants";
import { localizedPath } from "@/lib/catalog-url";
import type { AppLocale } from "@/lib/data/types";

function localeOrEn(locale?: string | null): AppLocale {
  if (locale === "az" || locale === "tr" || locale === "ru" || locale === "en") return locale;
  return "en";
}

export async function sendVerificationCode(user: { id: string; email: string }, locale?: string | null) {
  const loc = localeOrEn(locale);
  const code = await issueAuthToken(user.id, "EMAIL_VERIFY", VERIFY_TTL_MS, generateNumericCode);
  const sent = await sendMail({ to: user.email, ...verificationMail(loc, code) });
  if (!sent.sent && process.env.NODE_ENV !== "production") {
    console.info(`[auth] verify code for ${user.email}: ${code}`);
  }
  return sent;
}

export async function sendPasswordResetLink(user: { id: string; email: string }, locale?: string | null) {
  const loc = localeOrEn(locale);
  const raw = await issueAuthToken(user.id, "PASSWORD_RESET", RESET_TTL_MS);
  const url = `${appBaseUrl()}${localizedPath(loc, "/reset")}?token=${encodeURIComponent(raw)}`;
  const sent = await sendMail({ to: user.email, ...resetMail(loc, url) });
  if (!sent.sent && process.env.NODE_ENV !== "production") {
    console.info(`[auth] reset link for ${user.email}: ${url}`);
  }
  return sent;
}

/// Lets the owner activate a plan as soon as a new workspace registers, without polling Control.
export async function sendSignupAlert(details: { companyName: string; ownerName: string; ownerEmail: string }) {
  const opsUrl = `${appBaseUrl()}${localizedPath(DEFAULT_LOCALE, "/admin/ops")}`;
  const mail = newSignupMail({ ...details, opsUrl });
  await Promise.all(
    platformAdminEmails().map(async (to) => {
      try {
        await sendMail({ to, ...mail });
      } catch (error) {
        console.error("[auth] signup alert failed", to, error);
      }
    }),
  );
}
