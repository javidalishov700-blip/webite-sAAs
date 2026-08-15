"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTranslations } from "next-intl";
import { GripVertical, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getCategoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/data/types";

interface SortableCategoryRowProps {
  category: Category;
  itemCount: number;
  onToggleVisible: (visible: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddProduct: () => void;
}

export function SortableCategoryRow({
  category,
  itemCount,
  onToggleVisible,
  onEdit,
  onDelete,
  onAddProduct,
}: SortableCategoryRowProps) {
  const t = useTranslations("admin.categories");
  const tc = useTranslations("common");
  const Icon = getCategoryIcon(category.icon);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex flex-wrap items-center gap-3 p-3.5 sm:p-4", isDragging && "z-10 opacity-70 shadow-2xl")}
    >
      <button
        {...attributes}
        {...listeners}
        className="flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-muted-foreground hover:bg-muted active:cursor-grabbing"
        aria-label={t("dragHint")}
      >
        <GripVertical className="size-4" />
      </button>

      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary">
        <Icon className="size-5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{category.name}</p>
        <p className="text-xs text-muted-foreground">{t("itemsCount", { count: itemCount })}</p>
      </div>

      {!category.isVisible && (
        <Badge variant="muted" className="hidden sm:inline-flex">
          {tc("hidden")}
        </Badge>
      )}

      <Button type="button" variant="glow" size="sm" className="shrink-0" onClick={onAddProduct}>
        <Plus className="size-3.5" />
        <span className="hidden sm:inline">{t("addProduct")}</span>
        <span className="sm:hidden">{t("addProductShort")}</span>
      </Button>

      <Switch checked={category.isVisible} onCheckedChange={onToggleVisible} aria-label={tc("visible")} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={onEdit}>
            <Pencil className="size-4" />
            {tc("edit")}
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={onDelete}>
            <Trash2 className="size-4" />
            {tc("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
}
