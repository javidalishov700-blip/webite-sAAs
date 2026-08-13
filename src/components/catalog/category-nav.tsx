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
    activeRef.current?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeId]);

  return (
    <div
      ref={containerRef}
      data-no-scrollbar
      className="scroll-px-4 flex snap-x gap-2 overflow-x-auto px-4 py-2.5 [-webkit-overflow-scrolling:touch]"
    >
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.icon);
        const active = category.id === activeId;
        return (
          <button
            key={category.id}
            ref={active ? activeRef : undefined}
            onClick={() => onSelect(category.id)}
            className={cn(
              "flex shrink-0 snap-start items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-all active:scale-95",
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
