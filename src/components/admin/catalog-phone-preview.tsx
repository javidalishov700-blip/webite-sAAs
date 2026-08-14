"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function CatalogPhonePreview({
  src,
  label,
  caption,
  size = "full",
  className,
}: {
  src: string;
  label?: string;
  caption?: string;
  size?: "compact" | "full";
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const timer = window.setTimeout(() => setLoaded(true), 8000);
    return () => window.clearTimeout(timer);
  }, [src]);

  const compact = size === "compact";

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {label ? (
        <p className="mb-3 text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">{label}</p>
      ) : null}
      <div className="relative">
        <div className="absolute -inset-12 -z-10 rounded-[4rem] bg-gradient-to-b from-primary/35 via-accent/20 to-transparent blur-3xl" />
        <div
          className={cn(
            "relative overflow-hidden bg-[#0b0b12]",
            "rounded-[2.7rem] border-[11px] border-[#1a1a26]",
            "shadow-[0_40px_90px_-28px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.14)]",
            compact ? "h-[540px] w-[270px]" : "h-[min(74vh,740px)] w-[min(100%,360px)]",
          )}
        >
          <div className="pointer-events-none absolute top-[78px] -left-[15px] h-8 w-[3px] rounded-l-sm bg-[#2e2e3c]" />
          <div className="pointer-events-none absolute top-[124px] -left-[15px] h-14 w-[3px] rounded-l-sm bg-[#2e2e3c]" />
          <div className="pointer-events-none absolute top-[118px] -right-[15px] h-[72px] w-[3px] rounded-r-sm bg-[#2e2e3c]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-11 bg-gradient-to-b from-black/40 to-transparent">
            <div className="mx-auto mt-2.5 h-[22px] w-[108px] rounded-full bg-[#05050a] shadow-inner" />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-1.5 z-20 flex justify-center">
            <div className="h-1 w-28 rounded-full bg-white/25" />
          </div>
          {!loaded ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#0e0e16]">
              <span className="size-8 animate-spin rounded-full border-2 border-white/15 border-t-white/70" />
            </div>
          ) : null}
          {src ? (
            <iframe
              key={src}
              title={label ?? "Catalog preview"}
              src={src}
              className="h-full w-full border-0 bg-background"
              onLoad={() => setLoaded(true)}
            />
          ) : null}
        </div>
      </div>
      {caption ? <p className="mt-4 max-w-[22rem] text-center text-sm leading-relaxed text-muted-foreground">{caption}</p> : null}
    </div>
  );
}
