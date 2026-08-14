import "server-only";
import { SITE } from "@/lib/site";
import type { AppLocale } from "@/lib/data/types";

type MailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function fromAddress(): string {
  const host = "resend" + "." + "dev";
  return process.env.EMAIL_FROM?.trim() || `QR-Universe <beth.t@${host}>`;
}

export function mailerStatus(): { configured: boolean; from: string; usingOnboardingDomain: boolean } {
  const from = fromAddress();
  return {
    configured: Boolean(process.env.RESEND_API_KEY?.trim()),
    from,
    usingOnboardingDomain: from.toLowerCase().includes("resend.dev"),
  };
}

export async function sendMail(payload: MailPayload): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.info(`[mailer] RESEND_API_KEY missing — skip send to ${payload.to}: ${payload.subject}`);
    return { sent: false, error: "missing_key" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("[mailer] Resend failed", response.status, body.slice(0, 400));
    return { sent: false, error: body.slice(0, 240) || `http_${response.status}` };
  }
  return { sent: true };
}

function wrapHtml(title: string, body: string, ctaLabel: string, url: string): string {
  return `<!doctype html>
<html><body style="font-family:system-ui,sans-serif;background:#0b0b14;color:#f5f5f7;padding:24px">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#161622;border-radius:16px;padding:28px">
    <tr><td>
      <p style="font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:#a78bfa;margin:0 0 12px">QR-Universe</p>
      <h1 style="font-size:22px;margin:0 0 16px">${title}</h1>
      <p style="line-height:1.55;color:#d4d4d8">${body}</p>
      <p style="margin:28px 0"><a href="${url}" style="display:inline-block;background:#7c5cff;color:white;text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:600">${ctaLabel}</a></p>
      <p style="font-size:12px;color:#a1a1aa;word-break:break-all">${url}</p>
      <p style="font-size:12px;color:#71717a;margin-top:24px">WhatsApp: ${SITE.phoneDisplay}</p>
    </td></tr>
  </table>
</body></html>`;
}

const COPY: Record<AppLocale, {
  verifySubject: string;
  verifyTitle: string;
  verifyBody: string;
  verifyCta: string;
  resetSubject: string;
  resetTitle: string;
  resetBody: string;
  resetCta: string;
}> = {
  en: {
    verifySubject: "Confirm your QR-Universe email",
    verifyTitle: "Verify your email",
    verifyBody: "Thanks for signing up. Confirm this address to activate your catalog. Nobody else can take this account.",
    verifyCta: "Verify email",
    resetSubject: "Reset your QR-Universe password",
    resetTitle: "Reset your password",
    resetBody: "Use this link to choose a new password. If you did not ask for this, ignore the email.",
    resetCta: "Choose a new password",
  },
  az: {
    verifySubject: "QR-Universe e-poçtunu təsdiqlə",
    verifyTitle: "E-poçtu təsdiqlə",
    verifyBody: "Qeydiyyat üçün təşəkkürlər. Kataloqunu aktiv etmək üçün bu ünvanı təsdiqlə. Başqa heç kim bu hesabı ələ keçirə bilməz.",
    verifyCta: "E-poçtu təsdiqlə",
    resetSubject: "QR-Universe şifrəsini sıfırla",
    resetTitle: "Şifrəni sıfırla",
    resetBody: "Yeni şifrə seçmək üçün bu linkə kliklə. Sən istəməmisənsə, bu məktubu nəzərə alma.",
    resetCta: "Yeni şifrə seç",
  },
  tr: {
    verifySubject: "QR-Universe e-postanı doğrula",
    verifyTitle: "E-postanı doğrula",
    verifyBody: "Kayıt için teşekkürler. Kataloğunu açmak için bu adresi doğrula. Başka kimse bu hesabı alamaz.",
    verifyCta: "E-postayı doğrula",
    resetSubject: "QR-Universe şifreni sıfırla",
    resetTitle: "Şifreyi sıfırla",
    resetBody: "Yeni şifre seçmek için bu bağlantıya tıkla. Sen istemediysen bu maili yok say.",
    resetCta: "Yeni şifre seç",
  },
  ru: {
    verifySubject: "Подтвердите email QR-Universe",
    verifyTitle: "Подтвердите email",
    verifyBody: "Спасибо за регистрацию. Подтвердите адрес, чтобы открыть каталог. Никто другой не сможет забрать этот аккаунт.",
    verifyCta: "Подтвердить email",
    resetSubject: "Сброс пароля QR-Universe",
    resetTitle: "Сброс пароля",
    resetBody: "По этой ссылке можно задать новый пароль. Если вы не запрашивали сброс — просто игнорируйте письмо.",
    resetCta: "Выбрать новый пароль",
  },
};

export function verificationMail(locale: AppLocale, url: string): Omit<MailPayload, "to"> {
  const copy = COPY[locale] ?? COPY.en;
  return {
    subject: copy.verifySubject,
    html: wrapHtml(copy.verifyTitle, copy.verifyBody, copy.verifyCta, url),
    text: `${copy.verifyTitle}\n\n${copy.verifyBody}\n\n${url}`,
  };
}

export function resetMail(locale: AppLocale, url: string): Omit<MailPayload, "to"> {
  const copy = COPY[locale] ?? COPY.en;
  return {
    subject: copy.resetSubject,
    html: wrapHtml(copy.resetTitle, copy.resetBody, copy.resetCta, url),
    text: `${copy.resetTitle}\n\n${copy.resetBody}\n\n${url}`,
  };
}
