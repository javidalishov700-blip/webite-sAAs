"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { AmbientBackground } from "@/components/landing/ambient-background";

export default function NotFound() {
  const t = useTranslations("pages.notFound");
  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <AmbientBackground />
      <p className="font-display text-6xl font-bold text-gradient">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold">{t("title")}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{t("body")}</p>
      <Button variant="glow" className="mt-6" asChild>
        <Link href="/">{t("home")}</Link>
      </Button>
    </div>
  );
}
