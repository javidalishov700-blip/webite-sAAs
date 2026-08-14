"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AmbientBackground } from "@/components/landing/ambient-background";

export default function LocaleError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("pages.error");

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <AmbientBackground />
      <p className="font-display text-6xl font-bold text-gradient">500</p>
      <h1 className="mt-4 font-display text-2xl font-semibold">{t("title")}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{t("body")}</p>
      <Button variant="glow" className="mt-6" onClick={() => reset()}>
        {t("retry")}
      </Button>
    </div>
  );
}
