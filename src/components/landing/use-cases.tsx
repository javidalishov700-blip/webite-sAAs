"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Check,
  Cpu,
  Hammer,
  House,
  Package,
  ShoppingBasket,
  UtensilsCrossed,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TiltCard } from "@/components/landing/tilt-card";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

const TABS = [
  {
    key: "restaurant",
    icon: UtensilsCrossed,
    accent: "#FF6B4A",
    mock: {
      category: "Mains",
      items: [
        { title: "Truffle Pasta", price: "$14.50", tags: ["540 kcal", "Vegan"] },
        { title: "Ribeye Steak", price: "$24.90", tags: ["700 kcal", "Spicy"] },
      ],
    },
  },
  {
    key: "grocery",
    icon: ShoppingBasket,
    accent: "#33D69F",
    mock: {
      category: "Produce",
      items: [
        { title: "Organic tomatoes", price: "$2.40/kg", tags: ["Local", "1 kg"] },
        { title: "Sourdough loaf", price: "$3.90", tags: ["Bakery", "Fresh"] },
      ],
    },
  },
  {
    key: "home",
    icon: House,
    accent: "#FFD24A",
    mock: {
      category: "Living room",
      items: [
        { title: "Linen sofa", price: "$890", tags: ["3-seat", "Oak legs"] },
        { title: "Floor lamp", price: "$120", tags: ["Brass", "E27"] },
      ],
    },
  },
  {
    key: "hardware",
    icon: Hammer,
    accent: "#FF8A4C",
    mock: {
      category: "Tools",
      items: [
        { title: "Cordless drill 18V", price: "$79", tags: ["2 batteries"] },
        { title: "Interior paint 10L", price: "$34", tags: ["Washable"] },
      ],
    },
  },
  {
    key: "education",
    icon: BookOpen,
    accent: "#7C5CFF",
    mock: {
      category: "Courses",
      items: [
        { title: "Python from zero", price: "$149", tags: ["8 weeks", "Certificate"] },
        { title: "UI workshop", price: "$89", tags: ["Weekend", "Beginner"] },
      ],
    },
  },
  {
    key: "electronics",
    icon: Cpu,
    accent: "#3AD1C4",
    mock: {
      category: "Laptops",
      items: [
        { title: "NexusBook Air 14", price: "$1,299", tags: ["16GB RAM", "512GB"] },
        { title: "NexusBook Pro 16", price: "$1,899", tags: ["32GB", "24mo"] },
      ],
    },
  },
  {
    key: "custom",
    icon: Package,
    accent: "#A78BFA",
    mock: {
      category: "Your name",
      items: [
        { title: "Whatever you sell", price: "Your price", tags: ["Your field"] },
        { title: "Type it yourself", price: "—", tags: ["No template"] },
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
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h2>
        <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>
      </Reveal>

      <Reveal delay={0.1} className="mt-10 flex justify-center">
        <Tabs value={active} onValueChange={(v) => setActive(v as typeof active)}>
          <TabsList className="h-auto flex-wrap justify-center p-1.5">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key} className="h-10 gap-2 px-3 sm:px-4">
                <tab.icon className="size-4" />
                {t(`tabs.${tab.key}.label`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </Reveal>

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
            <TiltCard maxTilt={9}>
              <Card className="glow-border relative overflow-hidden p-5">
                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ background: `linear-gradient(90deg, ${activeTab.accent}, transparent)` }}
                />
                <div className="mb-4 flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {activeTab.mock.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{t("livePreview")}</span>
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
            </TiltCard>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
