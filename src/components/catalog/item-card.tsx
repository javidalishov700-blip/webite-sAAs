"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { ImageOff, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ItemWithAttributes } from "@/lib/data/types";

interface ItemCardProps {
  item: ItemWithAttributes;
  onSelect: () => void;
  locale: string;
}

export function ItemCard({ item, onSelect, locale }: ItemCardProps) {
  const t = useTranslations("catalog");
  const outOfStock = item.stockCount === 0;

  return (
    <motion.button
      layoutId={`item-${item.id}`}
      onClick={onSelect}
      whileTap={{ scale: 0.97 }}
      className="glass-card glow-border group flex flex-col overflow-hidden rounded-2xl text-left"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {item.images[0] ? (
          <Image
            src={item.images[0]}
            alt={item.title}
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-6" />
          </div>
        )}
        {item.isFeatured && (
          <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur">
            <Star className="size-2.5 fill-warning text-warning" />
            {t("featured")}
          </span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-[1px]">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-white">{t("outOfStock")}</span>
          </div>
        )}
        {!outOfStock && typeof item.stockCount === "number" && item.stockCount > 0 && item.stockCount <= 5 && (
          <span className="absolute right-2 bottom-2 rounded-full bg-warning/90 px-2 py-0.5 text-[10px] font-medium text-warning-foreground">
            {t("onlyLeft", { count: item.stockCount })}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-1 text-sm font-medium">{item.title}</p>
        {item.description && <p className="line-clamp-1 text-xs text-muted-foreground">{item.description}</p>}
        <div className="mt-auto flex items-baseline gap-1.5 pt-1.5">
          <span className="font-display text-sm font-semibold">{formatCurrency(item.price, item.currency, locale)}</span>
          {item.compareAtPrice && item.compareAtPrice > item.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(item.compareAtPrice, item.currency, locale)}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
