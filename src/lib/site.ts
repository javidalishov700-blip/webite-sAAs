export const SITE = {
  name: "QR-Universe",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+905413230002",
  phoneDisplay: process.env.NEXT_PUBLIC_CONTACT_PHONE_DISPLAY ?? "+90 541 323 00 02",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "https://wa.me/905413230002",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

/** Absolute origin used in emails and QR links. Never includes a trailing slash. */
export function appBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (explicit) return explicit;
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production.replace(/^https?:\/\//, "")}`;
  const preview = process.env.VERCEL_URL?.trim();
  if (preview) return `https://${preview.replace(/^https?:\/\//, "")}`;
  return SITE.url.replace(/\/$/, "");
}

export function telHref(phone = SITE.phone): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
