import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  trendPct?: number;
  accent?: string;
}

export function StatCard({ icon: Icon, label, value, hint, trendPct, accent = "var(--primary)" }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden p-5">
      <div
        className="absolute -top-8 -right-8 size-24 rounded-full opacity-20 blur-2xl"
        style={{ backgroundColor: accent }}
      />
      <div className="relative flex items-start justify-between">
        <div
          className="flex size-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `color-mix(in oklab, ${accent} 18%, transparent)`, color: accent }}
        >
          <Icon className="size-5" />
        </div>
        {typeof trendPct === "number" && (
          <span
            className={cn(
              "flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
              trendPct >= 0 ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
            )}
          >
            {trendPct >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {Math.abs(trendPct)}%
          </span>
        )}
      </div>
      <p className="relative mt-4 font-display text-2xl font-bold">{value}</p>
      <p className="relative mt-1 text-sm text-muted-foreground">
        {label}
        {hint ? <span className="text-foreground/60"> · {hint}</span> : null}
      </p>
    </Card>
  );
}
