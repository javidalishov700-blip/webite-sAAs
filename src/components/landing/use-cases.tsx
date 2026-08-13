"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { Check, Cpu, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TABS = [
  {
    key: "restaurant",
    icon: UtensilsCrossed,
    accent: "#FF6B4A",
    mock: {
      category: "Main Course",
      items: [
        { title: "Truffle Pasta", price: "$14.50", tags: ["540 kcal", "Vegan"] },
        { title: "Ribeye Steak", price: "$24.90", tags: ["700 kcal", "Spicy"] },
      ],
    },
  },
  {
    key: "retail",
    icon: ShoppingBag,
    accent: "#3AD1C4",
    mock: {
      category: "Sneakers",
      items: [
        { title: "Nova Runner X1", price: "$129.99", tags: ["Sizes 38–43", "Mesh"] },
        { title: "Cloud Step Pro", price: "$149.99", tags: ["Sizes 40–44", "Knit"] },
      ],
    },
  },
  {
    key: "electronics",
    icon: Cpu,
    accent: "#7C5CFF",
    mock: {
      category: "Laptops",
      items: [
        { title: "NexusBook Air 14", price: "$1,299", tags: ["16GB RAM", "512GB SSD"] },
        { title: "NexusBook Pro 16", price: "$1,899", tags: ["32GB RAM", "24mo warranty"] },
      ],
    },
  },
] as const;

export function UseCases() {
  const t = useTranslations("landing.useCases");
  const [active, setActive] = useState<(typeof TABS)[number]["key"]>("restaurant");
  const activeTab = TABS.find((tab) => tab.key === active) ?? TABS[0];

  return (
    <section id="use-cases" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">{t("eyebrow")}</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h2>
        <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="mt-10 flex justify-center">
        <Tabs value={active} onValueChange={(v) => setActive(v as typeof active)}>
          <TabsList className="h-auto flex-wrap p-1.5">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key} className="h-10 gap-2 px-4">
                <tab.icon className="size-4" />
                {t(`tabs.${tab.key}.label`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="relative mt-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.35 }}
          >
            <h3 className="font-display text-2xl font-semibold">{t(`tabs.${active}.title`)}</h3>
            <p className="mt-4 text-muted-foreground">{t(`tabs.${active}.description`)}</p>
            <ul className="mt-6 space-y-3">
              {t.raw(`tabs.${active}.bullets`).map((bullet: string) => (
                <li key={bullet} className="flex items-start gap-3 text-sm">
                  <span
                    className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${activeTab.accent}25`, color: activeTab.accent }}
                  >
                    <Check className="size-3" />
                  </span>
                  {bullet}
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={active + "-mock"}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.35 }}
          >
            <Card className="glow-border relative overflow-hidden p-5">
              <div
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: `linear-gradient(90deg, ${activeTab.accent}, transparent)` }}
              />
              <div className="mb-4 flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {activeTab.mock.category}
                </Badge>
                <span className="text-xs text-muted-foreground">Live preview</span>
              </div>
              <div className="space-y-3">
                {activeTab.mock.items.map((item) => (
                  <div key={item.title} className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/20 p-3">
                    <div
                      className="flex size-12 shrink-0 items-center justify-center rounded-lg text-white"
                      style={{ background: `linear-gradient(135deg, ${activeTab.accent}, transparent)` }}
                    >
                      <activeTab.icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium">{item.title}</p>
                        <p className="shrink-0 font-display text-sm font-semibold">{item.price}</p>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium text-muted-foreground", "bg-muted")}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
