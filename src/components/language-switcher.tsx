"use client";

import { Suspense } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useLocaleSwitcher } from "@/hooks/use-locale-switcher";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

function LanguageSwitcherInner({
  variant = "ghost",
  className,
}: {
  variant?: "ghost" | "glass" | "outline";
  className?: string;
}) {
  const { locale, locales, localeMeta, setLocale } = useLocaleSwitcher();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className={cn("gap-1.5 rounded-full border border-border px-3", className)}
          aria-label={localeMeta[locale].nativeLabel}
        >
          <Globe className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium sm:hidden">{locale.toUpperCase()}</span>
          <span className="hidden text-sm font-medium sm:inline">{localeMeta[locale].nativeLabel}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        {locales.map((l) => (
          <DropdownMenuItem key={l} onSelect={() => setLocale(l)} className="justify-between">
            <span className="flex items-center gap-2">
              <span>{localeMeta[l].flag}</span>
              <span>{localeMeta[l].nativeLabel}</span>
            </span>
            {l === locale && <Check className="size-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function LanguageSwitcher(props: {
  variant?: "ghost" | "glass" | "outline";
  className?: string;
}) {
  return (
    <Suspense
      fallback={
        <Button variant={props.variant ?? "ghost"} size="sm" className={cn("gap-1.5 px-2.5", props.className)} disabled>
          <Globe className="size-4" />
        </Button>
      }
    >
      <LanguageSwitcherInner {...props} />
    </Suspense>
  );
}
