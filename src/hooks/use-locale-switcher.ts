"use client";

import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/navigation";
import { LOCALES, LOCALE_META } from "@/lib/constants";
import type { AppLocale } from "@/lib/data/types";

export function useLocaleSwitcher() {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setLocale(next: AppLocale) {
    const query = searchParams?.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    router.replace(href, { locale: next, scroll: false });
  }

  return {
    locale,
    locales: LOCALES,
    localeMeta: LOCALE_META,
    setLocale,
  };
}
