"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ImageOff } from "lucide-react";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { AttributeDisplay } from "@/components/catalog/attribute-display";
import { formatCurrency } from "@/lib/utils";
import type { ItemWithAttributes } from "@/lib/data/types";

interface ItemSheetProps {
  item: ItemWithAttributes | null;
  onOpenChange: (open: boolean) => void;
  locale: string;
  accentColor: string;
}

export function ItemSheet({ item, onOpenChange, locale, accentColor }: ItemSheetProps) {
  const t = useTranslations("catalog");
  const outOfStock = item?.stockCount === 0;

  return (
    <Drawer open={!!item} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[88vh]">
        {item && (
          <div className="flex-1 overflow-y-auto pb-8" data-no-scrollbar>
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
              {item.images[0] ? (
                <Image src={item.images[0]} alt={item.title} fill unoptimized className="object-cover" priority />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <ImageOff className="size-8" />
                </div>
              )}
              {item.isFeatured && (
                <span
                  className="absolute top-3 left-3 rounded-full px-2.5 py-1 text-xs font-medium text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  {t("featured")}
                </span>
              )}
            </div>

            <div className="space-y-5 px-5 pt-5 sm:px-6">
              <div>
                <DrawerTitle className="text-xl">{item.title}</DrawerTitle>
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-display text-2xl font-bold" style={{ color: accentColor }}>
                    {formatCurrency(item.price, item.currency, locale)}
                  </span>
                  {item.compareAtPrice && item.compareAtPrice > item.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatCurrency(item.compareAtPrice, item.currency, locale)}
                    </span>
                  )}
                  {outOfStock ? (
                    <Badge variant="destructive" className="ml-auto">
                      {t("outOfStock")}
                    </Badge>
                  ) : (
                    typeof item.stockCount === "number" &&
                    item.stockCount > 0 &&
                    item.stockCount <= 5 && (
                      <Badge variant="warning" className="ml-auto">
                        {t("onlyLeft", { count: item.stockCount })}
                      </Badge>
                    )
                  )}
                </div>
              </div>

              {item.description && (
                <div>
                  <p className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("description")}</p>
                  <p className="text-sm leading-relaxed text-foreground/90">{item.description}</p>
                </div>
              )}

              {item.attributes.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{t("details")}</p>
                  <AttributeDisplay attributes={item.attributes} />
                </div>
              )}
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
