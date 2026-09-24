"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Hero3D } from "@/components/landing/hero-3d";
import { formatCurrency } from "@/lib/utils";

const DISHES = [
  { name: "Cheeseburger", price: 12.9, kcal: 780 },
  { name: "Caesar", price: 9.9, kcal: 410 },
  { name: "Pasta Alfredo", price: 14.5, kcal: 640 },
] as const;

const DRINKS = [
  { name: "Latte", price: 4.5 },
  { name: "Ayran", price: 2 },
] as const;

/** A static QR-like mark — decorative, so it is not a scannable code. */
function QrMark() {
  const rows = ["1110111", "1010101", "1110111", "0001000", "1101011", "0110110", "1011101"];
  return (
    <svg viewBox="0 0 7 7" className="size-full" aria-hidden>
      {rows.flatMap((row, y) =>
        [...row].map((cell, x) =>
          cell === "1" ? <rect key={`${x}-${y}`} x={x} y={y} width="0.92" height="0.92" rx="0.18" fill="currentColor" /> : null,
        ),
      )}
    </svg>
  );
}

/**
 * The daytime hero shows the product itself: the menu a guest opens, and the
 * card on the table that opens it. Plain type, no photos to go stale.
 */
function MenuPreview() {
  const t = useTranslations("landing.hero.preview");
  const locale = useLocale();
  const chips = t.raw("chips") as string[];
  const price = (value: number) => formatCurrency(value, "AZN", locale, 2);

  return (
    <div className="relative mx-auto flex h-full w-full max-w-[26rem] items-center justify-center sm:justify-end">
      <div className="relative w-[17.5rem] rounded-[2.4rem] border border-black/10 bg-white p-2.5 shadow-[0_40px_80px_-30px_rgb(20_20_40/0.35)] sm:w-[19rem]">
        <div className="overflow-hidden rounded-[1.9rem] border border-black/5 bg-white">
          <div className="flex items-center gap-2.5 px-4 pt-5 pb-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-xs font-bold text-white">
              NK
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-900">Nizami Kafe</p>
              <p className="truncate text-[11px] text-neutral-500">{t("address")}</p>
            </div>
          </div>

          <div className="flex gap-1.5 overflow-hidden px-4 pb-3">
            {chips.map((chip, i) => (
              <span
                key={chip}
                className={
                  i === 0
                    ? "shrink-0 rounded-full bg-primary px-3 py-1 text-[11px] font-medium text-white"
                    : "shrink-0 rounded-full border border-black/10 px-3 py-1 text-[11px] font-medium text-neutral-600"
                }
              >
                {chip}
              </span>
            ))}
          </div>

          <div className="border-t border-black/5 px-4 pt-3 pb-5">
            <p className="font-serif text-lg font-semibold text-neutral-900">{chips[0]}</p>
            <ul className="mt-2 divide-y divide-black/5">
              {DISHES.map((dish) => (
                <li key={dish.name} className="flex items-baseline justify-between gap-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium text-neutral-900">{dish.name}</span>
                    <span className="text-[10px] text-neutral-400">{dish.kcal} kcal</span>
                  </span>
                  <span className="shrink-0 text-[13px] font-semibold text-neutral-900">{price(dish.price)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 font-serif text-lg font-semibold text-neutral-900">{t("drinks")}</p>
            <ul className="mt-1 divide-y divide-black/5">
              {DRINKS.map((drink) => (
                <li key={drink.name} className="flex items-baseline justify-between gap-3 py-2">
                  <span className="text-[13px] font-medium text-neutral-900">{drink.name}</span>
                  <span className="text-[13px] font-semibold text-neutral-900">{price(drink.price)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* the table card that opens it */}
      <div className="absolute bottom-8 left-0 hidden w-32 -rotate-6 rounded-2xl border border-black/10 bg-white p-3 text-center shadow-[0_24px_50px_-24px_rgb(20_20_40/0.4)] sm:block">
        <p className="font-serif text-sm font-semibold text-primary">{t("cardTitle")}</p>
        <div className="mx-auto mt-2 size-16 text-neutral-900">
          <QrMark />
        </div>
        <p className="mt-2 text-[9px] leading-tight text-neutral-500">{t("cardHint")}</p>
      </div>
    </div>
  );
}

/**
 * Night keeps the WebGL scene it was designed around; day gets the product.
 * Before mount the theme is unknown, so the light preview renders first and
 * three.js is never downloaded for anyone who stays in the default theme.
 */
export function HeroVisual() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (mounted && resolvedTheme === "dark") return <Hero3D />;
  return <MenuPreview />;
}
