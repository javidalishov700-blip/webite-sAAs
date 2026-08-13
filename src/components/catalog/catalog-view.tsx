"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { SearchX } from "lucide-react";
import { CatalogHeader } from "@/components/catalog/catalog-header";
import { CategoryNav } from "@/components/catalog/category-nav";
import { ItemCard } from "@/components/catalog/item-card";
import { ItemSheet } from "@/components/catalog/item-sheet";
import { LanguageFab } from "@/components/catalog/language-fab";
import { EmptyState } from "@/components/ui/empty-state";
import type { CompanyPublicView, ItemWithAttributes } from "@/lib/data/types";

export function CatalogView({ company, locale }: { company: CompanyPublicView; locale: string }) {
  const t = useTranslations("catalog");
  const [search, setSearch] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(company.categories[0]?.id ?? null);
  const [selectedItem, setSelectedItem] = useState<ItemWithAttributes | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
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

  useEffect(() => {
    if (searchResults) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const id = visible[0].target.getAttribute("data-category-id");
          if (id) setActiveCategoryId(id);
        }
      },
      { rootMargin: "-140px 0px -65% 0px", threshold: 0 },
    );
    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [searchResults, company.categories]);

  function handleSelectCategory(id: string) {
    setActiveCategoryId(id);
    const el = sectionRefs.current.get(id);
    if (el) {
      isClickScrolling.current = true;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => (isClickScrolling.current = false), 700);
    }
  }

  return (
    <div className="mx-auto min-h-[100svh] max-w-2xl pb-28">
      <CatalogHeader company={company} search={search} onSearchChange={setSearch} />

      {!searchResults && (
        <CategoryNav
          categories={company.categories}
          activeId={activeCategoryId}
          onSelect={handleSelectCategory}
          accentColor={company.accentColor}
        />
      )}

      <div className="px-4 pt-3">
        {searchResults ? (
          searchResults.length === 0 ? (
            <EmptyState icon={SearchX} title={t("noResults", { query: search })} className="mt-6" />
          ) : (
            <div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {searchResults.map((item) => (
                  <ItemCard key={item.id} item={item} locale={locale} onSelect={() => setSelectedItem(item)} />
                ))}
              </div>
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
                className="scroll-mt-36"
              >
                <h2 className="mb-3 font-display text-lg font-semibold">{category.name}</h2>
                {category.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("emptyCategory")}</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {category.items.map((item) => (
                      <ItemCard key={item.id} item={item} locale={locale} onSelect={() => setSelectedItem(item)} />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>

      <footer className="mt-10 flex flex-col items-center gap-1 px-4 py-8 text-center text-xs text-muted-foreground">
        {company.website && <p className="font-medium text-foreground/80">{company.website}</p>}
        <p>
          {t("poweredBy")} <span className="font-semibold text-foreground">QR-Universe</span>
        </p>
      </footer>

      <LanguageFab accentColor={company.accentColor} />

      <ItemSheet item={selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)} locale={locale} accentColor={company.accentColor} />
    </div>
  );
}
