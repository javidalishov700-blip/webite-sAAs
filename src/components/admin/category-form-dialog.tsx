"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CATEGORY_ICON_NAMES, getCategoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/data/types";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  suggestions?: string[];
  onSubmit: (values: { name: string; icon: string }) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  suggestions = [],
  onSubmit,
  isSubmitting,
}: CategoryFormDialogProps) {
  const t = useTranslations("admin.categories");
  const tc = useTranslations("common");
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(CATEGORY_ICON_NAMES[0]);

  useEffect(() => {
    if (open) {
      setName(category?.name ?? "");
      setIcon(category?.icon ?? CATEGORY_ICON_NAMES[0]);
    }
  }, [open, category]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? tc("edit") : t("add")}</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            onSubmit({ name: name.trim(), icon });
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="category-name">{tc("required")}</Label>
            <Input
              id="category-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
            />
            <p className="text-xs text-muted-foreground">{t("typeYourOwn")}</p>
            {!category && suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {suggestions.map((suggestion) => (
                  <button
                    type="button"
                    key={suggestion}
                    onClick={() => setName(suggestion)}
                    className="rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>{t("iconLabel")}</Label>
            <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-11">
              {CATEGORY_ICON_NAMES.map((iconName) => {
                const Icon = getCategoryIcon(iconName);
                return (
                  <button
                    type="button"
                    key={iconName}
                    onClick={() => setIcon(iconName)}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg border transition-colors",
                      icon === iconName
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/40",
                    )}
                  >
                    <Icon className="size-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tc("cancel")}
            </Button>
            <Button type="submit" variant="glow" loading={isSubmitting} disabled={!name.trim()}>
              {category ? tc("save") : tc("create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
