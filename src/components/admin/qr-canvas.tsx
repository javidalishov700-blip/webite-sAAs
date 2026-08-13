"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { QrDotStyle } from "@/lib/data/types";

const STYLE_MAP: Record<QrDotStyle, string> = {
  SQUARE: "square",
  DOTS: "dots",
  ROUNDED: "rounded",
  CLASSY: "classy",
  CLASSY_ROUNDED: "classy-rounded",
  EXTRA_ROUNDED: "extra-rounded",
};

export interface QrCanvasProps {
  data: string;
  dotsColor: string;
  backgroundColor: string;
  dotsStyle: QrDotStyle;
  cornerStyle: QrDotStyle;
  logoUrl?: string | null;
  size?: number;
}

export interface QrCanvasHandle {
  download: (extension: "png" | "svg", name?: string) => void;
}

export const QrCanvas = forwardRef<QrCanvasHandle, QrCanvasProps>(function QrCanvas(
  { data, dotsColor, backgroundColor, dotsStyle, cornerStyle, logoUrl, size = 260 },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<InstanceType<typeof import("qr-code-styling").default> | null>(null);

  useImperativeHandle(ref, () => ({
    download: (extension, name = "qr-code") => {
      instanceRef.current?.download({ name, extension });
    },
  }));

  useEffect(() => {
    let cancelled = false;

    import("qr-code-styling").then(({ default: QRCodeStyling }) => {
      if (cancelled || !containerRef.current) return;
      containerRef.current.innerHTML = "";
      instanceRef.current = new QRCodeStyling({
        width: size,
        height: size,
        type: "svg",
        data: data || "https://qr-universe.app",
        margin: 8,
        qrOptions: { errorCorrectionLevel: logoUrl ? "H" : "Q" },
        image: logoUrl ?? undefined,
        imageOptions: { crossOrigin: "anonymous", imageSize: 0.38, margin: 6, hideBackgroundDots: true },
        dotsOptions: { type: STYLE_MAP[dotsStyle] as never, color: dotsColor },
        cornersSquareOptions: { type: STYLE_MAP[cornerStyle] as never, color: dotsColor },
        cornersDotOptions: { type: STYLE_MAP[cornerStyle] as never, color: dotsColor },
        backgroundOptions: { color: backgroundColor, round: 0.06 },
      });
      instanceRef.current.append(containerRef.current);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    instanceRef.current?.update({
      data: data || "https://qr-universe.app",
      image: logoUrl ?? undefined,
      qrOptions: { errorCorrectionLevel: logoUrl ? "H" : "Q" },
      dotsOptions: { type: STYLE_MAP[dotsStyle] as never, color: dotsColor },
      cornersSquareOptions: { type: STYLE_MAP[cornerStyle] as never, color: dotsColor },
      cornersDotOptions: { type: STYLE_MAP[cornerStyle] as never, color: dotsColor },
      backgroundOptions: { color: backgroundColor, round: 0.06 },
    });
  }, [data, dotsColor, backgroundColor, dotsStyle, cornerStyle, logoUrl]);

  return <div ref={containerRef} className="flex items-center justify-center [&>svg]:rounded-2xl" />;
});
