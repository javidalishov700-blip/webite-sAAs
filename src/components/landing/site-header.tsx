"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Menu, QrCode, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Drawer, DrawerContent } from "@/components/ui/drawer";

const NAV_ITEMS = [
  { href: "/#features", key: "features" },
  { href: "/#use-cases", key: "useCases" },
  { href: "/#pricing", key: "pricing" },
  { href: "/faq", key: "faq", internal: true },
  { href: "/contact", key: "contact", internal: true },
] as const;

export function SiteHeader() {
  const t = useTranslations("landing.header");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-3 sm:px-6 sm:pt-4"
    >
      <div
        className={cn(
          "glass relative flex w-full max-w-6xl items-center justify-between gap-3 rounded-2xl px-4 py-2.5 transition-[box-shadow,border-color] duration-300",
          scrolled && "border-white/15 shadow-lg shadow-black/25",
        )}
      >
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <span className="glow-ring flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white">
            <QrCode className="size-4.5" />
          </span>
          QR-Universe
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) =>
            "internal" in item && item.internal ? (
              <Link
                key={item.key}
                href={item.href}
                className="group relative rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {t(item.key)}
                <span className="absolute inset-x-3 -bottom-0.5 h-px origin-center scale-x-0 bg-gradient-to-r from-primary to-accent transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ) : (
              <a
                key={item.key}
                href={item.href}
                className="group relative rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {t(item.key)}
                <span className="absolute inset-x-3 -bottom-0.5 h-px origin-center scale-x-0 bg-gradient-to-r from-primary to-accent transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <ThemeToggle />
          <LanguageSwitcher />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">{t("login")}</Link>
          </Button>
          <Button variant="glow" size="sm" asChild>
            <Link href="/signup">{t("getStarted")}</Link>
          </Button>
        </div>

        <div className="flex items-center gap-1.5 sm:hidden">
          <ThemeToggle />
          <LanguageSwitcher />
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      <Drawer open={mobileOpen} onOpenChange={setMobileOpen} direction="right">
        <DrawerContent showHandle={false} className="p-5">
          <div className="flex items-center justify-between">
            <span className="font-display text-lg font-semibold">QR-Universe</span>
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
              <X className="size-5" />
            </Button>
          </div>
          <nav className="mt-8 flex flex-col gap-1">
            {NAV_ITEMS.map((item) =>
              "internal" in item && item.internal ? (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-3 text-base text-foreground/90 hover:bg-white/5"
                >
                  {t(item.key)}
                </Link>
              ) : (
                <a
                  key={item.key}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-3 text-base text-foreground/90 hover:bg-white/5"
                >
                  {t(item.key)}
                </a>
              ),
            )}
          </nav>
          <div className="mt-auto flex flex-col gap-2 pt-8">
            <Button variant="outline" asChild>
              <Link href="/login">{t("login")}</Link>
            </Button>
            <Button variant="glow" asChild>
              <Link href="/signup">{t("getStarted")}</Link>
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </motion.header>
  );
}
