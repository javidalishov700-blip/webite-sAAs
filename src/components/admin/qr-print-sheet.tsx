"use client";

import { useTranslations } from "next-intl";
import { QrCanvas } from "@/components/admin/qr-canvas";
import type { QrCode } from "@/lib/data/types";

export type PrintLayout = "cards" | "tent" | "poster";

interface QrPrintSheetProps {
  qr: QrCode;
  payload: string;
  accentColor: string;
  headline: string;
  hint: string;
  venue: string;
  layout: PrintLayout;
}

function luminance(hex: string): number {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.replace(/./g, (c) => c + c) : value;
  const channels = [0, 2, 4].map((i) => {
    const c = parseInt(full.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/**
 * Paper is white. The stored palette is built for a dark screen, so a dark
 * plate would waste ink and a pale dot colour would not scan off a print.
 */
function printColors(dotsColor: string) {
  return {
    dots: Number.isNaN(luminance(dotsColor)) || luminance(dotsColor) > 0.35 ? "#111114" : dotsColor,
    background: "#ffffff",
  };
}

/** QR block sized in millimetres so the sheet is the same on screen and on paper. */
function Code({ qr, payload, mm }: { qr: QrCode; payload: string; mm: number }) {
  const colors = printColors(qr.dotsColor);
  return (
    <div
      className="rounded-[3mm] bg-white p-[2mm] [&_svg]:block [&_svg]:h-auto [&_svg]:w-full"
      style={{ width: `${mm}mm` }}
    >
      <QrCanvas
        data={payload}
        dotsColor={colors.dots}
        backgroundColor={colors.background}
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
  headline,
  hint,
  venue,
  size,
}: Omit<QrPrintSheetProps, "layout"> & { size: "card" | "tent" | "poster" }) {
  const scale = { card: 1, tent: 1.35, poster: 2.2 }[size];
  const qrMm = { card: 44, tent: 62, poster: 108 }[size];

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-[3mm] px-[6mm] py-[5mm] text-center">
      <p
        className="font-display leading-tight font-bold"
        style={{ fontSize: `${5.2 * scale}mm`, color: accentColor }}
      >
        {headline}
      </p>
      {venue ? (
        <p className="leading-tight font-medium text-black/70" style={{ fontSize: `${3 * scale}mm` }}>
          {venue}
        </p>
      ) : null}
      <Code qr={qr} payload={payload} mm={qrMm} />
      <p className="leading-tight font-medium text-black/75" style={{ fontSize: `${3.2 * scale}mm` }}>
        {hint}
      </p>
      <p className="leading-none text-black/35" style={{ fontSize: `${2.4 * scale}mm` }}>
        qruniverse.net
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
    <div className="print-sheet bg-white text-black" data-layout={layout}>
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
            <span className="absolute -top-[2mm] left-1/2 -translate-x-1/2 bg-white px-[2mm] text-[2.6mm] text-black/40">
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

