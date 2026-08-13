"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Menu, QrCode } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { UserMenu } from "@/components/admin/user-menu";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { AmbientBackground } from "@/components/landing/ambient-background";
import type { SessionUser } from "@/lib/data/types";

export function AdminShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const t = useTranslations("admin.sidebar");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      <AmbientBackground className="opacity-60" />

      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/70 p-4 lg:flex">
          <Link href="/" className="mb-6 flex items-center gap-2 px-2 font-display text-base font-semibold">
            <span className="glow-ring flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
              <QrCode className="size-4.5" />
            </span>
            QR-Universe
          </Link>
          <SidebarNav />
          <div className="mt-auto space-y-2 pt-4">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2.5 text-muted-foreground" asChild>
              <Link href="/">
                <ArrowLeft className="size-4" />
                {t("backToSite")}
              </Link>
            </Button>
            <div className="border-t border-border/70 pt-3">
              <UserMenu user={user} />
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border/70 bg-background/70 px-4 py-3 backdrop-blur-xl sm:px-6 lg:justify-end">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="size-5" />
            </Button>
            <div className="flex items-center gap-1.5 lg:hidden">
              <span className="font-display text-sm font-semibold">QR-Universe</span>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <LanguageSwitcher variant="ghost" />
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>

      <Drawer open={mobileOpen} onOpenChange={setMobileOpen} direction="left">
        <DrawerContent showHandle={false} className="flex flex-col p-4">
          <Link href="/" className="mb-6 flex items-center gap-2 px-2 font-display text-base font-semibold">
            <span className="glow-ring flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
              <QrCode className="size-4.5" />
            </span>
            QR-Universe
          </Link>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
          <div className="mt-auto space-y-2 pt-4">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2.5 text-muted-foreground" asChild>
              <Link href="/">
                <ArrowLeft className="size-4" />
                {t("backToSite")}
              </Link>
            </Button>
            <div className="border-t border-border/70 pt-3">
              <UserMenu user={user} />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
