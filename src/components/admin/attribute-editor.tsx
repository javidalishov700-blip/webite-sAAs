"use client";

import { useTranslations } from "next-intl";
import { Plus, Sparkles, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListOptionEditor } from "@/components/admin/list-option-editor";
import { resolveAttributePresets, type AttributePreset } from "@/lib/attribute-presets";
import type { AttributeInput } from "@/lib/validators/item";
import type { AttributeType, Industry } from "@/lib/data/types";

interface AttributeEditorProps {
  industry: Industry;
  categoryName?: string;
  value: AttributeInput[];
  onChange: (attributes: AttributeInput[]) => void;
}

export function AttributeEditor({ industry, categoryName, value, onChange }: AttributeEditorProps) {
  const t = useTranslations("admin.products.form");
  const tp = useTranslations("attributes");

  function updateRow(index: number, patch: Partial<AttributeInput>) {
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function removeRow(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function localizedUnit(unit?: string) {
    if (!unit) return "";
    if (unit === "months") return tp("units.months");
    return unit;
  }

  function addRow(preset?: AttributePreset) {
    onChange([
      ...value,
      {
        key: preset ? tp(`names.${preset.id}`) : "",
        value: preset?.type === "BOOLEAN" ? "false" : "",
        type: preset?.type ?? "TEXT",
        unit: localizedUnit(preset?.unit),
      },
    ]);
  }

  const presets = resolveAttributePresets(industry, categoryName);
  const usedKeys = new Set(value.map((v) => v.key.trim().toLowerCase()));
  const availablePresets = presets.filter((p) => !usedKeys.has(tp(`names.${p.id}`).toLowerCase()));

  return (
    <div className="min-w-0 space-y-3">
      {availablePresets.length > 0 && (
        <div className="min-w-0">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5" />
            {t("presets")}
          </p>
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {availablePresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => addRow(preset)}
                className="max-w-full truncate rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
              >
                + {tp(`names.${preset.id}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      {value.length === 0 && <p className="text-sm text-muted-foreground">{t("noAttributes")}</p>}

      <div className="min-w-0 space-y-2.5">
        {value.map((attr, index) => (
          <div key={`${attr.key}-${index}`} className="min-w-0 space-y-2 overflow-hidden rounded-xl border border-border/70 bg-muted/10 p-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <Input
                className="h-9 min-w-0 flex-1"
                placeholder={t("attributeKey")}
                value={attr.key}
                onChange={(e) => updateRow(index, { key: e.target.value })}
              />
              <Select value={attr.type} onValueChange={(v) => updateRow(index, { type: v as AttributeType })}>
                <SelectTrigger className="h-9 w-[7.25rem] shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["TEXT", "NUMBER", "BOOLEAN", "LIST"] as const).map((type) => (
                    <SelectItem key={type} value={type}>
                      {tp(`types.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground" onClick={() => removeRow(index)}>
                <Trash2 className="size-3.5" />
              </Button>
            </div>

            {attr.type === "BOOLEAN" ? (
              <div className="flex h-9 items-center px-1">
                <Switch checked={attr.value === "true"} onCheckedChange={(checked) => updateRow(index, { value: checked ? "true" : "false" })} />
              </div>
            ) : attr.type === "LIST" ? (
              <ListOptionEditor attributeKey={attr.key} value={attr.value} onChange={(next) => updateRow(index, { value: next })} />
            ) : (
              <Input
                className="h-9 min-w-0"
                placeholder={t("attributeValue")}
                value={attr.value}
                onChange={(e) => updateRow(index, { value: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={() => addRow()}>
        <Plus className="size-3.5" />
        {t("addAttribute")}
      </Button>
    </div>
  );
}
