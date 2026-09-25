"use client";

import { cn } from "@/lib/utils";

const PRESETS = ["#7C5CFF", "#00E5FF", "#FF6B4A", "#33D69F", "#FFD24A", "#FF5470", "#FFFFFF", "#0B0B14"];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {PRESETS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          style={{ backgroundColor: color }}
          className={cn(
            "size-7 shrink-0 rounded-full border border-black/15 ring-offset-2 dark:border-white/10 ring-offset-background transition-transform hover:scale-110",
            value.toLowerCase() === color.toLowerCase() && "ring-2 ring-primary",
          )}
          aria-label={color}
        />
      ))}
      <label className="relative flex size-7 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-border text-[10px] text-muted-foreground">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
        <span
          className="pointer-events-none absolute inset-1 rounded-full"
          style={{ background: "conic-gradient(from 180deg, red, yellow, lime, cyan, blue, magenta, red)" }}
        />
      </label>
      <span className="font-mono text-xs text-muted-foreground uppercase">{value}</span>
    </div>
  );
}
