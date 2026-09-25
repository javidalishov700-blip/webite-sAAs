import { cn } from "@/lib/utils";

/** A hairline that fades out away from the title, ending in a dot and a lozenge beside it. */
function Flourish({ side, color }: { side: "left" | "right"; color: string }) {
  return (
    <span className={cn("flex min-w-6 flex-1 items-center gap-1.5", side === "right" && "flex-row-reverse")} aria-hidden>
      <span
        className={cn(
          "h-px flex-1 from-transparent to-foreground/25",
          side === "left" ? "bg-gradient-to-r" : "bg-gradient-to-l",
        )}
      />
      <span className="size-1 shrink-0 rounded-full opacity-50" style={{ backgroundColor: color }} />
      <span className="size-[7px] shrink-0 rotate-45 rounded-[1px]" style={{ backgroundColor: color }} />
    </span>
  );
}

/**
 * Section titles are centred between two ornaments, the way a printed menu
 * sets them, so each section reads as its own page rather than a list label.
 */
export function CategoryHeading({
  name,
  accentColor,
  className,
  as: Tag = "h2",
  compact = false,
}: {
  name: string;
  accentColor: string;
  className?: string;
  as?: "h2" | "p";
  compact?: boolean;
}) {
  return (
    <Tag className={cn("flex items-center", compact ? "gap-2" : "gap-3", className)}>
      <Flourish side="left" color={accentColor} />
      <span
        className={cn(
          "max-w-[70%] text-center font-serif leading-tight font-semibold text-balance",
          compact ? "text-[15px]" : "text-[1.35rem]",
        )}
      >
        {name}
      </span>
      <Flourish side="right" color={accentColor} />
    </Tag>
  );
}
