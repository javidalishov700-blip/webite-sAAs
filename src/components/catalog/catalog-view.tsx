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
import { GoogleRating } from "@/components/catalog/google-rating";
import { CategoryHeading } from "@/components/catalog/category-heading";
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
  const chromeHeight = useRef(220);
  const isClickScrolling = useRef(false);
  // The section the guest last tapped, while the page cannot scroll it to the top.
  const pinnedId = useRef<string | null>(null);

  function applyChromeMetrics() {
    const el = chromeRef.current;
    const measured = el ? Math.ceil(el.getBoundingClientRect().height) : chromeHeight.current;
    const height = Math.max(measured, 1);
    chromeHeight.current = height;
    // Keep the section title fully below the sticky search + category chips.
    const offset = height + 16;
    const value = `${offset}px`;
    const root = el?.closest("[data-catalog-page]");
    (root instanceof HTMLElement ? root : el)?.style.setProperty("--catalog-chrome", value);
    document.documentElement.style.setProperty("--catalog-chrome", value);
    return offset;
  }

  // One shape for every price in the catalog: a column mixing "11 ₼" with
  // "12,90 ₼" reads as a mistake even though both are correct.
  const priceFractionDigits = useMemo(
    () =>
      company.categories.some((category) =>
        category.items.some((item) => !Number.isInteger(item.price) || !Number.isInteger(item.compareAtPrice ?? 0)),
      )
        ? 2
        : 0,
    [company.categories],
  );

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
    applyChromeMetrics();
    const observer = new ResizeObserver(() => applyChromeMetrics());
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--catalog-chrome");
    };
  }, [searchResults]);

  useEffect(() => {
    if (searchResults) return;
    let ticking = false;

    const syncActive = () => {
      ticking = false;
      if (isClickScrolling.current) return;
      const marker = chromeHeight.current + 16;
      const ids = company.categories.map((category) => category.id);
      let current: string | null = ids[0] ?? null;
      for (const id of ids) {
        const el = sectionRefs.current.get(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= marker) current = id;
      }
      // The last sections are usually too short to reach the marker before the
      // page runs out, so "Drinks" never lit up. The bottom of the page belongs
      // to the last section — or to the one just tapped, if it is on screen.
      const { scrollHeight } = document.documentElement;
      const scrollable = scrollHeight - window.innerHeight > 4;
      const atBottom = scrollable && window.scrollY > 0 && window.innerHeight + window.scrollY >= scrollHeight - 4;
      if (atBottom && ids.length) {
        const tapped = pinnedId.current ? sectionRefs.current.get(pinnedId.current) : null;
        current = tapped && tapped.getBoundingClientRect().top < window.innerHeight ? pinnedId.current : ids[ids.length - 1];
      } else {
        pinnedId.current = null;
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
    pinnedId.current = id;
    const section = sectionRefs.current.get(id);
    if (!section) return;
    isClickScrolling.current = true;
    const offset = applyChromeMetrics();
    const heading = section.querySelector("h2");
    const target = heading instanceof HTMLElement ? heading : section;
    const top = window.scrollY + target.getBoundingClientRect().top - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
    window.setTimeout(() => {
      isClickScrolling.current = false;
    }, 250);
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
        {preview ? (
          <p className="px-4 pt-2 text-center text-[11px] font-medium text-warning">{t("previewBanner")}</p>
        ) : null}
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
        {!searchResults ? (
          <GoogleRating company={company} locale={locale} accentColor={company.accentColor} className="mb-7" />
        ) : null}
        {company.categories.length === 0 ? (
          <EmptyState icon={Store} title={t("emptyCatalog")} description={t("emptyCatalogHint")} className="mt-6 border border-border bg-card" />
        ) : searchResults ? (
          searchResults.length === 0 ? (
            <EmptyState icon={SearchX} title={t("noResults", { query: search })} className="mt-6" />
          ) : (
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3">
              {searchResults.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  locale={locale}
                  fractionDigits={priceFractionDigits}
                  onSelect={() => handleSelectItem(item)}
                />
              ))}
            </div>
          )
        ) : (
          <div className="space-y-10">
            {company.categories.map((category) => (
              <section
                key={category.id}
                data-category-id={category.id}
                ref={(el) => {
                  if (el) sectionRefs.current.set(category.id, el);
                  else sectionRefs.current.delete(category.id);
                }}
                className="scroll-mt-[var(--catalog-chrome,14.5rem)]"
              >
                <CategoryHeading
                  name={category.name}
                  accentColor={company.accentColor}
                  className="mb-4 scroll-mt-[var(--catalog-chrome,14.5rem)]"
                />
                {category.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("emptyCategory")}</p>
                ) : (
                  <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3">
                    {category.items.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        locale={locale}
                        fractionDigits={priceFractionDigits}
                        onSelect={() => handleSelectItem(item)}
                      />
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

      <ItemSheet
        item={selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        locale={locale}
        accentColor={company.accentColor}
        fractionDigits={priceFractionDigits}
      />
    </div>
  );
}
