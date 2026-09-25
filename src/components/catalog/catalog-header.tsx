"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowLeft, Check, MapPin, Phone, Search, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useOnlineCount } from "@/components/presence-beacon";
import type { Company } from "@/lib/data/types";

interface CatalogHeaderProps {
  company: Company;
  search: string;
  onSearchChange: (value: string) => void;
}

export function CatalogHeader({ company, search, onSearchChange }: CatalogHeaderProps) {
  const t = useTranslations("catalog");
  const [copied, setCopied] = useState(false);
  // A permanent search field cost a sixth of the screen on every phone; it now
  // takes the header's place only while it is being used.
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: viewing } = useOnlineCount(`catalog:${company.slug}`);
  const hasViewers = typeof viewing === "number" && viewing > 0;

  useEffect(() => {
    if (searching) inputRef.current?.focus();
  }, [searching]);

  function closeSearch() {
    setSearching(false);
    onSearchChange("");
  }

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: company.name, url });
        return;
      }
    } catch {
      // fall through to clipboard copy
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success(t("linkCopied"));
    setTimeout(() => setCopied(false), 2000);
  }

  if (searching) {
    return (
      <div className="flex items-center gap-2 px-4 pt-3 pb-2.5">
        <button
          type="button"
          onClick={closeSearch}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground"
          aria-label={t("close")}
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-10 rounded-full bg-muted/40 pl-10"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute top-1/2 right-3 flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-muted-foreground/20"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 pt-3 pb-2.5">
      <div className="relative size-10 shrink-0 overflow-hidden rounded-2xl bg-muted ring-1 ring-black/5 dark:ring-white/10">
        {company.logoUrl ? (
          <Image src={company.logoUrl} alt={company.name} fill unoptimized className="object-cover" />
        ) : (
          <div
            className="flex size-full items-center justify-center text-sm font-bold text-white"
            style={{ backgroundColor: company.accentColor }}
          >
            {company.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-base font-semibold">{company.name}</h1>
        <div className="flex items-center gap-2 truncate text-xs text-muted-foreground">
          {hasViewers && <span className="shrink-0 text-success">{t("viewingNow", { count: viewing })}</span>}
          {/* One line, one fact: on a phone both together only ever truncated. */}
          {company.address && (
            <span className={cn("items-center gap-1 truncate", hasViewers ? "hidden sm:flex" : "flex")}>
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{company.address}</span>
            </span>
          )}
          {company.phone && (
            <span className="hidden shrink-0 items-center gap-1 sm:flex">
              <Phone className="size-3" />
              {company.phone}
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setSearching(true)}
        className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted"
        aria-label={t("searchPlaceholder")}
      >
        <Search className="size-4" />
      </button>
      <ThemeToggle className="size-9 shrink-0 rounded-full" />
      <button
        type="button"
        onClick={handleShare}
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-colors hover:bg-muted"
        aria-label={t("share")}
      >
        {copied ? <Check className="size-4 text-success" /> : <Share2 className="size-4" />}
      </button>
    </div>
  );
}
