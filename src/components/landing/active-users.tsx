"use client";

import { useTranslations } from "next-intl";
import { useOnlineCount } from "@/components/presence-beacon";

export function ActiveUsersBadge({ className }: { className?: string }) {
  const t = useTranslations("landing.hero");
  const { data: count } = useOnlineCount();
  const n = count ?? 1;

  return (
    <div className={className}>
      <span className="relative flex size-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-success" />
      </span>
      {t("badgeLive")} — {n} {t("onlineNow")}
    </div>
  );
}
