"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Check, MapPin, Phone, Search, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import type { Company } from "@/lib/data/types";

interface CatalogHeaderProps {
  company: Company;
  search: string;
  onSearchChange: (value: string) => void;
}

export function CatalogHeader({ company, search, onSearchChange }: CatalogHeaderProps) {
  const t = useTranslations("catalog");
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="glass sticky top-0 z-20 pt-[env(safe-area-inset-top)]">
      <div className="flex items-center gap-3 px-4 pt-3 pb-2.5">
        <div className="relative size-11 shrink-0 overflow-hidden rounded-2xl bg-muted ring-1 ring-white/10">
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
            {company.address && (
              <span className="flex items-center gap-1 truncate">
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
          onClick={handleShare}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted/60 text-muted-foreground transition-colors hover:bg-muted"
          aria-label={t("share")}
        >
          {copied ? <Check className="size-4 text-success" /> : <Share2 className="size-4" />}
        </button>
      </div>

      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-11 rounded-full bg-muted/40 pl-10"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute top-1/2 right-3 flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-muted-foreground/20"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
