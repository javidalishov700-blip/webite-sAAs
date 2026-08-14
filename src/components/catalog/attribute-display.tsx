import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ItemAttribute } from "@/lib/data/types";

export function AttributeDisplay({ attributes }: { attributes: ItemAttribute[] }) {
  if (attributes.length === 0) return null;

  const badges = attributes.filter((a) => a.type === "BOOLEAN" && a.value === "true");
  const lists = attributes.filter((a) => a.type === "LIST" && a.value.trim());
  const rows = attributes.filter((a) => (a.type === "TEXT" || a.type === "NUMBER") && a.value.trim());

  return (
    <div className="space-y-4">
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {badges.map((attr) => (
            <Badge key={attr.id} variant="success" className="gap-1 py-1">
              <Check className="size-3" />
              {attr.key}
            </Badge>
          ))}
        </div>
      )}

      {lists.map((attr) => (
        <div key={attr.id}>
          <p className="mb-1.5 text-xs font-medium text-muted-foreground">{attr.key}</p>
          <div className="flex flex-wrap gap-1.5">
            {attr.value
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean)
              .map((value) => (
                <Badge key={`${attr.id}-${value}`} variant="outline" className="py-1">
                  {value}
                </Badge>
              ))}
          </div>
        </div>
      ))}

      {rows.length > 0 && (
        <dl className="divide-y divide-border/70 overflow-hidden rounded-xl border border-border/70">
          {rows.map((attr) => (
            <div key={attr.id} className="flex items-center justify-between gap-4 bg-muted/10 px-3.5 py-2.5 text-sm">
              <dt className="text-muted-foreground">{attr.key}</dt>
              <dd className="font-medium">
                {attr.value}
                {attr.unit ? ` ${attr.unit}` : ""}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
