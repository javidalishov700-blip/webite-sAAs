"use client";

import { useTranslations } from "next-intl";
import { ExternalLink, LogOut, User } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { catalogPath } from "@/lib/catalog-url";
import type { SessionUser } from "@/lib/data/types";

export function UserMenu({ user }: { user: SessionUser }) {
  const t = useTranslations("admin.sidebar");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  async function handleSignOut() {
    await api.post("/api/auth/logout");
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition-colors hover:bg-white/5">
        <Avatar className="size-9">
          <AvatarFallback>{initials(user.name) || <User className="size-4" />}</AvatarFallback>
        </Avatar>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{user.name}</span>
          <span className="block truncate text-xs text-muted-foreground">{user.companyName}</span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href={catalogPath(user.companySlug, locale)} target="_blank" rel="noreferrer">
            <ExternalLink className="size-4" />
            {t("viewCatalog")}
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={handleSignOut}>
          <LogOut className="size-4" />
          {tc("signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
