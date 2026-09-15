import { DEFAULT_LOCALE, LOCALES } from "@/lib/constants";
import type { AppLocale } from "@/lib/data/types";

export function isAppLocale(value: string): value is AppLocale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * Path for `localePrefix: "as-needed"` — bare for the default locale
 * (English), `/az`, `/ru`, `/tr`-prefixed otherwise. Anywhere a URL is
 * hand-built outside next-intl's own `Link`/`router` (redirects, emails,
 * sitemap, metadata) needs this instead of always prepending the locale.
 */
export function localizedPath(locale: string, path: string): string {
  const loc = isAppLocale(locale) ? locale : DEFAULT_LOCALE;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  if (loc === DEFAULT_LOCALE) return suffix;
  const prefixed = `/${loc}${suffix}`;
  // Avoid "/az/" for the homepage — the locale root has no trailing slash.
  return prefixed === `/${loc}/` ? `/${loc}` : prefixed;
}

/** Public catalog path, respecting `localePrefix: "as-needed"`. */
export function catalogPath(slug: string, locale: string = DEFAULT_LOCALE, qrId?: string | null): string {
  const base = localizedPath(locale, `/c/${encodeURIComponent(slug)}`);
  return qrId ? `${base}?qr=${encodeURIComponent(qrId)}` : base;
}

export function catalogAbsoluteUrl(origin: string, slug: string, locale?: string, qrId?: string | null): string {
  return `${origin.replace(/\/$/, "")}${catalogPath(slug, locale, qrId)}`;
}

/** Same-origin catalog URL for the admin phone preview (no scan counting). */
export function catalogPreviewPath(slug: string, locale: string = DEFAULT_LOCALE): string {
  return `${localizedPath(locale, `/c/${encodeURIComponent(slug)}`)}?preview=1`;
}

/** Stable scan endpoint encoded into generated QR codes. */
export function qrGoPath(qrId: string): string {
  return `/api/qr/${encodeURIComponent(qrId)}/go`;
}

export function qrGoAbsoluteUrl(origin: string, qrId: string): string {
  return `${origin.replace(/\/$/, "")}${qrGoPath(qrId)}`;
}

export function qrClosedPath(locale: string, reason: "missing" | "paused" | "banned"): string {
  return `${localizedPath(locale, "/qr-closed")}?reason=${reason}`;
}

/** Strip a leading /en|/ru|/tr|/az prefix so next-intl `router.push` does not double it. */
export function stripLocalePrefix(pathname: string): string {
  const match = pathname.match(/^\/(en|ru|tr|az)(?=\/|$)/);
  if (!match) return pathname || "/";
  return pathname.slice(match[0].length) || "/";
}
