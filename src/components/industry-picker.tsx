"use client";

import { useTranslations } from "next-intl";
import { INDUSTRY_ICONS, INDUSTRY_VALUES } from "@/lib/industries";
import { cn } from "@/lib/utils";
import type { Industry } from "@/lib/data/types";

export function IndustryPicker({
  value,
  onChange,
  className,
}: {
  value: Industry;
  onChange: (value: Industry) => void;
  className?: string;
}) {
  const t = useTranslations("industries");

  return (
    <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5", className)}>
      {INDUSTRY_VALUES.map((id) => {
        const Icon = INDUSTRY_ICONS[id];
        const selected = value === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center text-xs font-medium transition-colors",
              selected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/40",
            )}
          >
            <Icon className="size-4.5" />
            {t(id)}
          </button>
        );
      })}
    </div>
  );
}
