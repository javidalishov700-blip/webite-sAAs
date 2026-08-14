"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { SearchX, Store } from "lucide-react";
import { CatalogHeader } from "@/components/catalog/catalog-header";
import { CategoryNav } from "@/components/catalog/category-nav";
import { ItemCard } from "@/components/catalog/item-card";
import { ItemSheet } from "@/components/catalog/item-sheet";
import { LanguageFab } from "@/components/catalog/language-fab";
import { ReportAbuse } from "@/components/catalog/report-abuse";
import { EmptyState } from "@/components/ui/empty-state";
import type { CompanyPublicView, ItemWithAttributes } from "@/lib/data/types";

export function CatalogView({
  company,
  locale,
  preview = false,
}: {
  company: CompanyPublicView;
  locale: string;
  preview?: boolean;
}) {
  const t = useTranslations("catalog");
  const [search, setSearch] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(company.categories[0]?.id ?? null);
  const [selectedItem, setSelectedItem] = useState<ItemWithAttributes | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const chromeRef = useRef<HTMLDivElement>(null);
  const chromeHeight = useRef(128);
  const isClickScrolling = useRef(false);

  const normalizedSearch = search.trim().toLowerCase();

  const searchResults = useMemo(() => {
    if (!normalizedSearch) return null;
    return company.categories.flatMap((category) =>
      category.items.filter(
        (item) =>
          item.title.toLowerCase().includes(normalizedSearch) ||
          item.description?.toLowerCase().includes(normalizedSearch),
      ),
    );
  }, [company.categories, normalizedSearch]);

  useLayoutEffect(() => {
    const el = chromeRef.current;
    if (!el) return;
    const apply = () => {
      const height = Math.round(el.getBoundingClientRect().height);
      chromeHeight.current = height;
      const root = el.closest("[data-catalog-page]");
      (root instanceof HTMLElement ? root : el).style.setProperty("--catalog-chrome", `${height}px`);
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => observer.disconnect();
  }, [searchResults]);

  useEffect(() => {
    if (searchResults) return;
    let ticking = false;

    const syncActive = () => {
      ticking = false;
      if (isClickScrolling.current) return;
      const marker = chromeHeight.current + 2;
      let current = company.categories[0]?.id ?? null;
      for (const category of company.categories) {
        const el = sectionRefs.current.get(category.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= marker) current = category.id;
      }
      setActiveCategoryId((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(syncActive);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    syncActive();
    return () => window.removeEventListener("scroll", onScroll);
  }, [searchResults, company.categories]);

  function handleSelectCategory(id: string) {
    setActiveCategoryId(id);
    const el = sectionRefs.current.get(id);
    if (!el) return;
    isClickScrolling.current = true;
    const offset = chromeHeight.current;
    const top = window.scrollY + el.getBoundingClientRect().top - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
    window.setTimeout(() => {
      isClickScrolling.current = false;
    }, 200);
  }

  function handleSelectItem(item: ItemWithAttributes) {
    setSelectedItem(item);
    if (preview) return;
    const key = `qru-view:${item.id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* continue */
    }
    fetch("/api/catalog/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: company.slug, itemId: item.id }),
      keepalive: true,
    }).catch(() => {
      try {
        sessionStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    });
  }

  return (
    <div data-catalog-page className="mx-auto min-h-[100svh] max-w-2xl touch-pan-y pb-28">
      <div ref={chromeRef} className="catalog-chrome sticky top-0 z-20 pt-[env(safe-area-inset-top)]">
        <CatalogHeader company={company} search={search} onSearchChange={setSearch} />
        {!searchResults && (
          <CategoryNav
            categories={company.categories}
            activeId={activeCategoryId}
            onSelect={handleSelectCategory}
            accentColor={company.accentColor}
          />
        )}
      </div>

      <div className="px-4 pt-3">
        {company.categories.length === 0 ? (
          <EmptyState icon={Store} title={t("emptyCatalog")} description={t("emptyCatalogHint")} className="mt-6 border border-border bg-card" />
        ) : searchResults ? (
          searchResults.length === 0 ? (
            <EmptyState icon={SearchX} title={t("noResults", { query: search })} className="mt-6" />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {searchResults.map((item) => (
                <ItemCard key={item.id} item={item} locale={locale} onSelect={() => handleSelectItem(item)} />
              ))}
            </div>
          )
        ) : (
          <div className="space-y-8">
            {company.categories.map((category) => (
              <section
                key={category.id}
                data-category-id={category.id}
                ref={(el) => {
                  if (el) sectionRefs.current.set(category.id, el);
                  else sectionRefs.current.delete(category.id);
                }}
                className="scroll-mt-[var(--catalog-chrome,8rem)]"
              >
                <h2 className="mb-3 font-display text-lg font-semibold">{category.name}</h2>
                {category.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("emptyCategory")}</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {category.items.map((item) => (
                      <ItemCard key={item.id} item={item} locale={locale} onSelect={() => handleSelectItem(item)} />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>

      <footer className="mt-10 flex flex-col items-center gap-1.5 px-4 py-8 text-center text-xs text-muted-foreground">
        {company.website && <p className="font-medium text-foreground/80">{company.website}</p>}
        <p>
          {t("poweredBy")} <span className="font-semibold text-foreground">QR-Universe</span>
        </p>
        {!preview ? <ReportAbuse slug={company.slug} locale={locale} /> : null}
      </footer>

      <LanguageFab accentColor={company.accentColor} locales={company.supportedLocales} />

      <ItemSheet item={selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)} locale={locale} accentColor={company.accentColor} />
    </div>
  );
}
