"use client";

import { useTranslations } from "next-intl";
import { BarChart3, LayoutGrid, Package, QrCode, Settings, Shield, Smartphone } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", icon: BarChart3, key: "overview", exact: true, opsOnly: false },
  { href: "/admin/categories", icon: LayoutGrid, key: "categories", exact: false, opsOnly: false },
  { href: "/admin/products", icon: Package, key: "products", exact: false, opsOnly: false },
  { href: "/admin/preview", icon: Smartphone, key: "preview", exact: false, opsOnly: false },
  { href: "/admin/qr-studio", icon: QrCode, key: "qrStudio", exact: false, opsOnly: false },
  { href: "/admin/ops", icon: Shield, key: "ops", exact: false, opsOnly: true },
  { href: "/admin/settings", icon: Settings, key: "settings", exact: false, opsOnly: false },
] as const;

export function SidebarNav({
  onNavigate,
  isPlatformAdmin = false,
}: {
  onNavigate?: () => void;
  isPlatformAdmin?: boolean;
}) {
  const t = useTranslations("admin.sidebar");
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.filter((item) => !item.opsOnly || isPlatformAdmin).map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/15 text-primary shadow-[0_0_24px_-8px_var(--primary)]"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
            )}
          >
            <item.icon className={cn("size-[18px] shrink-0", active && "text-primary")} />
            {t(item.key)}
            {active && <span className="ml-auto size-1.5 rounded-full bg-primary" />}
          </Link>
        );
      })}
    </nav>
  );
}
