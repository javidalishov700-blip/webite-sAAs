"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ImageOff, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getCalorieLabel } from "@/lib/calories";
import type { ItemWithAttributes } from "@/lib/data/types";

interface ItemCardProps {
  item: ItemWithAttributes;
  onSelect: () => void;
  locale: string;
  fractionDigits?: number;
}

export function ItemCard({ item, onSelect, locale, fractionDigits }: ItemCardProps) {
  const t = useTranslations("catalog");
  const outOfStock = item.stockCount === 0;
  // Restaurants want the calorie figure on the card; it sits in the price row
  // rather than as a fourth pill over the photo.
  const calories = getCalorieLabel(item.attributes);
  const lowStock =
    !outOfStock && typeof item.stockCount === "number" && item.stockCount > 0 && item.stockCount <= 5
      ? item.stockCount
      : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex flex-col overflow-hidden rounded-[1.25rem] border border-border/50 bg-card text-left transition-transform active:scale-[0.98]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {item.images[0] ? (
          <Image
            src={item.images[0]}
            alt={item.title}
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 text-primary/50">
            <ImageOff className="size-6" />
          </div>
        )}
        {/* One badge at most: a grid of photos each carrying three pills reads as noise. */}
        {outOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white">{t("outOfStock")}</span>
          </div>
        ) : lowStock ? (
          <span className="absolute top-2 left-2 rounded-full bg-warning/90 px-2 py-0.5 text-[10px] font-medium text-warning-foreground">
            {t("onlyLeft", { count: lowStock })}
          </span>
        ) : item.isFeatured ? (
          <span className="absolute top-2 left-2 flex size-6 items-center justify-center rounded-full bg-black/60">
            <Star className="size-3 fill-warning text-warning" />
          </span>
        ) : null}
      </div>
      {/* Title over two lines and no teaser text: the name is what the guest is
          looking for, and a clamped half-sentence under it only added noise. */}
      <div className="flex flex-1 flex-col gap-1.5 px-3 pt-2.5 pb-3">
        <p className="line-clamp-2 text-sm leading-snug font-medium text-foreground/95">{item.title}</p>
        <div className="mt-auto flex items-baseline gap-1.5">
          <span className="font-display text-[15px] font-semibold">
            {formatCurrency(item.price, item.currency, locale, fractionDigits)}
          </span>
          {item.compareAtPrice && item.compareAtPrice > item.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(item.compareAtPrice, item.currency, locale, fractionDigits)}
            </span>
          )}
          {calories && <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">{calories}</span>}
        </div>
      </div>
    </button>
  );
}
