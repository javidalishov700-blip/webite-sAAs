import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "glass-card flex flex-col items-center justify-center gap-3 rounded-2xl border-dashed px-6 py-14 text-center",
        className,
      )}
    >
      {Icon && (
        <div className="glass-card flex size-14 items-center justify-center rounded-2xl text-primary">
          <Icon className="size-6" />
        </div>
      )}
      <div className="space-y-1">
        <p className="font-display text-base font-semibold text-foreground">{title}</p>
        {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
