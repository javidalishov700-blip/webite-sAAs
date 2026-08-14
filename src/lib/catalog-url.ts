import { DEFAULT_LOCALE, LOCALES } from "@/lib/constants";
import type { AppLocale } from "@/lib/data/types";

export function isAppLocale(value: string): value is AppLocale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Public catalog path with a locale prefix (`localePrefix: "always"`). */
export function catalogPath(slug: string, locale: string = DEFAULT_LOCALE, qrId?: string | null): string {
  const loc = isAppLocale(locale) ? locale : DEFAULT_LOCALE;
  const base = `/${loc}/c/${encodeURIComponent(slug)}`;
  return qrId ? `${base}?qr=${encodeURIComponent(qrId)}` : base;
}

export function catalogAbsoluteUrl(origin: string, slug: string, locale?: string, qrId?: string | null): string {
  return `${origin.replace(/\/$/, "")}${catalogPath(slug, locale, qrId)}`;
}

/** Same-origin catalog URL for the admin phone preview (no scan counting). */
export function catalogPreviewPath(slug: string, locale: string = DEFAULT_LOCALE): string {
  const loc = isAppLocale(locale) ? locale : DEFAULT_LOCALE;
  return `/${loc}/c/${encodeURIComponent(slug)}?preview=1`;
}

/** Stable scan endpoint encoded into generated QR codes. */
export function qrGoPath(qrId: string): string {
  return `/api/qr/${encodeURIComponent(qrId)}/go`;
}

export function qrGoAbsoluteUrl(origin: string, qrId: string): string {
  return `${origin.replace(/\/$/, "")}${qrGoPath(qrId)}`;
}

/** Strip a leading /en|/ru|/tr|/az prefix so next-intl `router.push` does not double it. */
export function stripLocalePrefix(pathname: string): string {
  const match = pathname.match(/^\/(en|ru|tr|az)(?=\/|$)/);
  if (!match) return pathname || "/";
  return pathname.slice(match[0].length) || "/";
}
