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
  download: (extension: "png" | "svg", name?: string, caption?: string | null) => void;
}

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Wraps the rendered code in a taller SVG with a caption strip, so the address
 * travels with the code wherever the file ends up — a printed stand, a poster
 * someone redraws in Canva, a photo in a group chat.
 */
function withCaption(source: SVGSVGElement, caption: string, background: string): SVGSVGElement {
  const box = source.viewBox.baseVal;
  const size = box && box.width ? box.width : Number(source.getAttribute("width")) || 300;
  const band = Math.round(size * 0.15);

  const outer = document.createElementNS(SVG_NS, "svg");
  outer.setAttribute("xmlns", SVG_NS);
  outer.setAttribute("width", String(size));
  outer.setAttribute("height", String(size + band));
  outer.setAttribute("viewBox", `0 0 ${size} ${size + band}`);

  const plate = document.createElementNS(SVG_NS, "rect");
  plate.setAttribute("width", String(size));
  plate.setAttribute("height", String(size + band));
  plate.setAttribute("fill", background);
  outer.appendChild(plate);

  const code = source.cloneNode(true) as SVGSVGElement;
  code.setAttribute("x", "0");
  code.setAttribute("y", "0");
  code.setAttribute("width", String(size));
  code.setAttribute("height", String(size));
  outer.appendChild(code);

  const text = document.createElementNS(SVG_NS, "text");
  text.setAttribute("x", String(size / 2));
  text.setAttribute("y", String(size + band * 0.68));
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("font-family", "Arial, Helvetica, sans-serif");
  text.setAttribute("font-size", String(Math.round(band * 0.46)));
  text.setAttribute("font-weight", "600");
  text.setAttribute("letter-spacing", String(size * 0.004));
  text.setAttribute("fill", "#6B6B7B");
  text.textContent = caption;
  outer.appendChild(text);

  return outer;
}

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export const QrCanvas = forwardRef<QrCanvasHandle, QrCanvasProps>(function QrCanvas(
  { data, dotsColor, backgroundColor, dotsStyle, cornerStyle, logoUrl, size = 260 },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<InstanceType<typeof import("qr-code-styling").default> | null>(null);

  useImperativeHandle(ref, () => ({
    download: (extension, name = "qr-code", caption = null) => {
      const rendered = containerRef.current?.querySelector("svg");
      if (!caption || !rendered) {
        instanceRef.current?.download({ name, extension });
        return;
      }

      const composed = withCaption(rendered, caption, backgroundColor);
      const markup = new XMLSerializer().serializeToString(composed);

      if (extension === "svg") {
        save(new Blob([markup], { type: "image/svg+xml" }), `${name}.svg`);
        return;
      }

      const scale = 4;
      const width = Number(composed.getAttribute("width"));
      const height = Number(composed.getAttribute("height"));
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => blob && save(blob, `${name}.png`), "image/png");
      };
      image.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(markup)))}`;
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
