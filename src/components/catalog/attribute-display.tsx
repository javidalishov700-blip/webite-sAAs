"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { parseListOptions, isSizeChoiceList } from "@/lib/list-options";
import { cn } from "@/lib/utils";
import type { ItemAttribute } from "@/lib/data/types";

export function AttributeDisplay({
  attributes,
  accentColor,
}: {
  attributes: ItemAttribute[];
  accentColor?: string;
}) {
  if (attributes.length === 0) return null;

  const badges = attributes.filter((a) => a.type === "BOOLEAN" && a.value === "true");
  const lists = attributes.filter((a) => a.type === "LIST" && a.value.trim());
  const rows = attributes.filter((a) => (a.type === "TEXT" || a.type === "NUMBER") && a.value.trim());

  return (
    <div className="min-w-0 space-y-4">
      {badges.length > 0 && (
        <div className="flex min-w-0 flex-wrap gap-1.5">
          {badges.map((attr) => (
            <Badge key={attr.id} variant="success" className="max-w-full gap-1 overflow-hidden py-1">
              <Check className="size-3 shrink-0" />
              <span className="truncate">{attr.key}</span>
            </Badge>
          ))}
        </div>
      )}

      {lists.map((attr) =>
        isSizeChoiceList(attr.key, attr.value) ? (
          <SizeChoiceList key={attr.id} attribute={attr} accentColor={accentColor} />
        ) : (
          <div key={attr.id} className="min-w-0">
            <p className="mb-1.5 truncate text-xs font-medium text-muted-foreground">{attr.key}</p>
            <div className="flex min-w-0 flex-wrap gap-1.5">
              {parseListOptions(attr.value).map((option) => (
                <Badge
                  key={`${attr.id}-${option.label}`}
                  variant={option.available ? "outline" : "muted"}
                  className={cn("max-w-full overflow-hidden py-1", !option.available && "line-through")}
                >
                  <span className="truncate">{option.label}</span>
                </Badge>
              ))}
            </div>
          </div>
        ),
      )}

      {rows.length > 0 && (
        <dl className="divide-y divide-border/70 overflow-hidden rounded-xl border border-border/70">
          {rows.map((attr) => (
            <div key={attr.id} className="flex min-w-0 items-center justify-between gap-4 bg-muted/10 px-3.5 py-2.5 text-sm">
              <dt className="min-w-0 truncate text-muted-foreground">{attr.key}</dt>
              <dd className="shrink-0 font-medium">
                {attr.value}
                {attr.unit ? ` ${attr.unit}` : ""}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function SizeChoiceList({ attribute, accentColor }: { attribute: ItemAttribute; accentColor?: string }) {
  const t = useTranslations("catalog");
  const options = parseListOptions(attribute.value);
  const [selected, setSelected] = useState<string | null>(options.find((option) => option.available)?.label ?? null);

  if (options.length === 0) return null;

  return (
    <div className="min-w-0">
      <div className="mb-2 flex min-w-0 items-center justify-between gap-2">
        <p className="truncate text-xs font-medium text-muted-foreground">{attribute.key}</p>
        <p className="shrink-0 text-[11px] text-muted-foreground">{t("pickSize")}</p>
      </div>
      <div className="flex min-w-0 flex-wrap gap-1.5">
        {options.map((option) => {
          const active = selected === option.label;
          return (
            <button
              key={option.label}
              type="button"
              disabled={!option.available}
              onClick={() => setSelected(option.label)}
              className={cn(
                "inline-flex h-10 min-w-10 max-w-full items-center justify-center overflow-hidden rounded-xl border px-3 text-sm font-semibold",
                option.available && active && "border-transparent text-white",
                option.available && active && !accentColor && "bg-primary",
                option.available && !active && "border-border bg-muted/20 text-foreground",
                !option.available && "cursor-not-allowed border-border/60 bg-muted/30 text-muted-foreground line-through opacity-60",
              )}
              style={option.available && active && accentColor ? { backgroundColor: accentColor } : undefined}
              aria-pressed={option.available ? active : undefined}
            >
              <span className="max-w-[6.5rem] truncate">{option.label}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
        <span>{t("sizeAvailable")}</span>
        {options.some((option) => !option.available) ? <span>{t("sizeUnavailable")}</span> : null}
      </div>
    </div>
  );
}
