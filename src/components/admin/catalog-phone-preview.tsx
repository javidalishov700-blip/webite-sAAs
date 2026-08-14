"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function CatalogPhonePreview({
  src,
  label,
  size = "full",
  className,
}: {
  src: string;
  label?: string;
  size?: "compact" | "full";
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {label ? (
        <p className="mb-3 text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">{label}</p>
      ) : null}
      <div className="relative">
        <div className="absolute -inset-10 -z-10 rounded-[3.5rem] bg-gradient-to-b from-primary/30 via-accent/15 to-transparent blur-3xl" />
        <div
          className={cn(
            "relative overflow-hidden bg-[#12121a] shadow-[0_28px_80px_-24px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.12)]",
            "rounded-[2.55rem] border-[10px] border-[#1c1c28]",
            size === "compact" ? "h-[540px] w-[270px]" : "h-[min(72vh,720px)] w-[min(100%,340px)]",
          )}
        >
          <div className="pointer-events-none absolute top-[72px] -left-[14px] h-10 w-[4px] rounded-l-sm bg-[#2a2a38]" />
          <div className="pointer-events-none absolute top-[128px] -left-[14px] h-16 w-[4px] rounded-l-sm bg-[#2a2a38]" />
          <div className="pointer-events-none absolute top-[120px] -right-[14px] h-20 w-[4px] rounded-r-sm bg-[#2a2a38]" />
          <div className="pointer-events-none absolute top-2.5 left-1/2 z-20 h-[22px] w-[108px] -translate-x-1/2 rounded-full bg-[#0a0a10]" />
          {!loaded ? <div className="absolute inset-0 z-10 animate-pulse bg-[#0e0e16]" /> : null}
          <iframe
            key={src}
            title={label ?? "Catalog preview"}
            src={src}
            className="h-full w-full border-0 bg-background"
            onLoad={() => setLoaded(true)}
          />
        </div>
      </div>
    </div>
  );
}
