"use client";

import { useTranslations } from "next-intl";
import { ShieldOff } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { AmbientBackground } from "@/components/landing/ambient-background";

export function AccountBanned() {
  const t = useTranslations("admin.banned");
  const tc = useTranslations("common");
  const router = useRouter();

  async function handleSignOut() {
    await api.post("/api/auth/logout");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <AmbientBackground className="opacity-60" />
      <Card className="glow-border max-w-md p-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-destructive/15 text-destructive">
          <ShieldOff className="size-6" />
        </div>
        <h1 className="font-display text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("body")}</p>
        <Button variant="outline" className="mt-6" onClick={handleSignOut}>
          {tc("signOut")}
        </Button>
      </Card>
    </div>
  );
}
