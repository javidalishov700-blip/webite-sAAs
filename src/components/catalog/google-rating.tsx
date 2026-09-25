"use client";

import { useTranslations } from "next-intl";
import { ChevronRight, Star } from "lucide-react";
import { isGoogleUrl } from "@/lib/validators/company";
import { cn, formatNumber } from "@/lib/utils";
import type { Company } from "@/lib/data/types";

/** Google's four-colour "G", inline so the badge costs no request. */
export function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

/** Five stars, the gold layer cut to the rating so 4.6 shows as 4.6. */
function Stars({ value }: { value: number }) {
  const filled = Math.max(0, Math.min(100, (value / 5) * 100));
  const row = (tone: string) => (
    <span className={cn("flex gap-0.5", tone)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className="size-3.5 shrink-0 fill-current" />
      ))}
    </span>
  );
  return (
    <span className="relative inline-flex" aria-hidden>
      {row("text-foreground/15")}
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${filled}%` }}>
        {row("text-[#FBBC05]")}
      </span>
    </span>
  );
}

/** Outlined, not grey: an empty grey row would read as a zero rating. */
function InviteStars() {
  return (
    <span className="flex gap-1 text-[#FBBC05]" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className="size-4 shrink-0" strokeWidth={1.8} />
      ))}
    </span>
  );
}

/**
 * Sits at the top of the menu, above the first dish. With the owner's figures
 * it shows the rating Google shows; without them it only asks for a review.
 * Every tap goes to Google — no filtering of who gets asked.
 */
export function GoogleRating({
  company,
  locale,
  accentColor,
  className,
}: {
  company: Company;
  locale: string;
  accentColor: string;
  className?: string;
}) {
  const t = useTranslations("catalog");
  const url = company.googleReviewUrl;
  if (!url || !isGoogleUrl(url)) return null;

  const rating = company.googleRating;
  const count = company.googleReviewCount;
  const hasRating = typeof rating === "number" && rating >= 1 && rating <= 5;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-[0_1px_2px_rgb(15_15_30/0.04)] transition-transform active:scale-[0.99]",
        className,
      )}
    >
      <GoogleMark className="size-7 shrink-0" />
      {hasRating ? (
        <>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="text-lg leading-none font-semibold">{formatNumber(rating, locale, 1)}</span>
              <Stars value={rating} />
            </span>
            <span className="mt-1 block truncate text-xs text-muted-foreground">
              {typeof count === "number" && count > 0
                ? t("googleRatingWithCount", { count, shown: formatNumber(count, locale) })
                : t("googleRating")}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-0.5 text-sm font-medium" style={{ color: accentColor }}>
            {t("googleWrite")}
            <ChevronRight className="size-4" />
          </span>
        </>
      ) : (
        <>
          <span className="min-w-0 flex-1">
            <span className="block text-sm leading-snug font-medium">{t("googleRateUs")}</span>
            <span className="mt-1.5 block">
              <InviteStars />
            </span>
          </span>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
        </>
      )}
    </a>
  );
}
