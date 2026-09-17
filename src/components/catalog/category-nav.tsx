"use client";

import { useEffect, useRef } from "react";
import { getCategoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/data/types";

interface CategoryNavProps {
  categories: Category[];
  activeId: string | null;
  onSelect: (id: string) => void;
  accentColor: string;
}

export function CategoryNav({ categories, activeId, onSelect, accentColor }: CategoryNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const btn = activeRef.current;
    const box = containerRef.current;
    if (!btn || !box) return;
    const left = btn.offsetLeft - box.clientWidth / 2 + btn.clientWidth / 2;
    box.scrollTo({ left: Math.max(0, left), behavior: "auto" });
  }, [activeId]);

  return (
    <div
      ref={containerRef}
      data-no-scrollbar
      className="flex snap-x gap-2 overflow-x-auto overscroll-x-contain px-4 pt-0.5 pb-2.5 [touch-action:pan-x]"
    >
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.icon);
        const active = category.id === activeId;
        return (
          <button
            type="button"
            key={category.id}
            ref={active ? activeRef : undefined}
            onClick={() => onSelect(category.id)}
            className={cn(
              "flex shrink-0 snap-start items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium whitespace-nowrap",
              active ? "border-transparent text-white shadow-md" : "border-border/70 bg-muted/30 text-muted-foreground",
            )}
            style={active ? { backgroundColor: accentColor } : undefined}
          >
            <Icon className="size-3.5" />
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
