export const SITE = {
  name: "QR-Universe",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+905413230002",
  phoneDisplay: process.env.NEXT_PUBLIC_CONTACT_PHONE_DISPLAY ?? "+90 541 323 00 02",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_URL ?? "https://wa.me/905413230002",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export function telHref(phone = SITE.phone): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
