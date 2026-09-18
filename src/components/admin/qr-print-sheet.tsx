"use client";

import { useTranslations } from "next-intl";
import { QrCanvas } from "@/components/admin/qr-canvas";
import { siteHost } from "@/lib/site";
import type { QrCode } from "@/lib/data/types";

export type PrintLayout = "cards" | "tent" | "poster";

interface QrPrintSheetProps {
  qr: QrCode;
  payload: string;
  accentColor: string;
  dotsColor: string;
  cardColor: string;
  headline: string;
  hint: string;
  venue: string;
  layout: PrintLayout;
}

export function luminance(hex: string): number {
  const value = hex.replace("#", "").trim();
  const full = value.length === 3 ? value.replace(/./g, (c) => c + c) : value;
  if (!/^[0-9a-f]{6}$/i.test(full)) return 1;
  const channels = [0, 2, 4].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/** WCAG-style ratio; a phone camera wants roughly 3:1 or better off paper. */
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/**
 * Starting colours for a sheet: paper is white, and the stored palette is built
 * for a dark screen. The owner is free to change both afterwards.
 */
export function printSafeColors(qr: Pick<QrCode, "dotsColor">) {
  const card = "#FFFFFF";
  return {
    card,
    dots: contrastRatio(qr.dotsColor, card) >= 3 ? qr.dotsColor : "#111114",
  };
}

/** QR block sized in millimetres so the sheet is the same on screen and on paper. */
function Code({
  qr,
  payload,
  dotsColor,
  cardColor,
  mm,
}: {
  qr: QrCode;
  payload: string;
  dotsColor: string;
  cardColor: string;
  mm: number;
}) {
  return (
    <div className="[&_svg]:block [&_svg]:h-auto [&_svg]:w-full" style={{ width: `${mm}mm` }}>
      <QrCanvas
        data={payload}
        dotsColor={dotsColor}
        backgroundColor={cardColor}
        dotsStyle={qr.dotsStyle}
        cornerStyle={qr.cornerStyle}
        logoUrl={qr.logoUrl}
        size={520}
      />
    </div>
  );
}

function Card({
  qr,
  payload,
  accentColor,
  dotsColor,
  cardColor,
  headline,
  hint,
  venue,
  size,
}: Omit<QrPrintSheetProps, "layout"> & { size: "card" | "tent" | "poster" }) {
  const scale = { card: 1, tent: 1.35, poster: 2.2 }[size];
  const qrMm = { card: 44, tent: 62, poster: 108 }[size];
  // Text has to survive whatever the card was painted, light or dark.
  const ink = luminance(cardColor) > 0.5 ? "0 0 0" : "255 255 255";
  const title = contrastRatio(accentColor, cardColor) >= 2.5 ? accentColor : `rgb(${ink})`;

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-[3mm] px-[6mm] py-[5mm] text-center"
      style={{ backgroundColor: cardColor }}
    >
      <p className="font-display leading-tight font-bold" style={{ fontSize: `${5.2 * scale}mm`, color: title }}>
        {headline}
      </p>
      {venue ? (
        <p
          className="leading-tight font-medium"
          style={{ fontSize: `${3 * scale}mm`, color: `rgb(${ink} / 0.7)` }}
        >
          {venue}
        </p>
      ) : null}
      <Code qr={qr} payload={payload} dotsColor={dotsColor} cardColor={cardColor} mm={qrMm} />
      <p
        className="leading-tight font-medium"
        style={{ fontSize: `${3.2 * scale}mm`, color: `rgb(${ink} / 0.78)` }}
      >
        {hint}
      </p>
      <p className="leading-none" style={{ fontSize: `${2.4 * scale}mm`, color: `rgb(${ink} / 0.35)` }}>
        {siteHost()}
      </p>
    </div>
  );
}

/**
 * One A4 page, laid out in millimetres. The screen preview and the printed
 * sheet are the same element — what is on screen is what comes out.
 */
export function QrPrintSheet({ layout, ...card }: QrPrintSheetProps) {
  const t = useTranslations("admin.qr.print");

  return (
    <div className="print-sheet" data-layout={layout} style={{ backgroundColor: card.cardColor }}>
      {layout === "cards" ? (
        <div className="grid h-full w-full grid-cols-2 grid-rows-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="border border-dashed border-black/15">
              <Card {...card} size="card" />
            </div>
          ))}
        </div>
      ) : layout === "tent" ? (
        <div className="flex h-full w-full flex-col">
          {/* Upside down above the fold, so both faces read correctly once folded. */}
          <div className="h-1/2 w-full rotate-180">
            <Card {...card} size="tent" />
          </div>
          <div className="relative w-full border-t border-dashed border-black/25">
            <span
              className="absolute -top-[2mm] left-1/2 -translate-x-1/2 px-[2mm] text-[2.6mm] text-black/40"
              style={{ backgroundColor: card.cardColor }}
            >
              {t("foldHere")}
            </span>
          </div>
          <div className="h-1/2 w-full">
            <Card {...card} size="tent" />
          </div>
        </div>
      ) : (
        <Card {...card} size="poster" />
      )}
    </div>
  );
}
