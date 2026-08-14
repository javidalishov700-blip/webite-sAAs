"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "qru-cookie-consent";

export function CookieBanner() {
  const t = useTranslations("pages.cookies.banner");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(!localStorage.getItem(STORAGE_KEY));
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  return (
    <div className="glass fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-2xl p-4 shadow-2xl sm:inset-x-6 sm:p-5">
      <p className="text-sm leading-relaxed text-foreground/90">{t("text")}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="sm" variant="glow" onClick={accept}>
          {t("accept")}
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href="/cookies">{t("cookies")}</Link>
        </Button>
        <Button size="sm" variant="ghost" asChild>
          <Link href="/privacy">{t("privacy")}</Link>
        </Button>
      </div>
    </div>
  );
}
