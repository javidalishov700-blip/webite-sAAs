"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { ArrowUpRight, QrCode, Search, Star } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { TiltCard } from "@/components/landing/tilt-card";
import { Reveal, RevealGroup, RevealItem } from "@/components/landing/reveal";

const DEMO_ITEMS = [
  { title: "Classic Cheeseburger", price: "$12.90", tag: "Chef's pick", img: "1568901346375-23c9450c58cd" },
  { title: "Margherita Pizza", price: "$11.00", tag: "Vegetarian", img: "1565299624946-b28f40a0ae38" },
  { title: "Molten Chocolate Cake", price: "$6.90", tag: "Dessert", img: "1578985545062-69928b1d9587" },
];

const STEP_KEYS = ["step1", "step2", "step3"] as const;

export function LiveDemo() {
  const t = useTranslations("landing.demo");

  return (
    <section id="demo" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">{t("eyebrow")}</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h2>
        <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <RevealGroup className="order-2 flex flex-col gap-6 lg:order-1" stagger={0.12}>
          {STEP_KEYS.map((key, i) => (
            <RevealItem key={key} className="flex items-start gap-4">
              <span className="glass-card flex size-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold text-primary">
                {i + 1}
              </span>
              <p className="pt-1.5 text-sm leading-relaxed text-foreground/90 sm:text-base">{t(key)}</p>
            </RevealItem>
          ))}
          <RevealItem>
            <Button variant="glow" size="lg" className="mt-2 w-fit" asChild>
              <Link href="/c/bella-foods">
                {t("cta")}
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </RevealItem>
        </RevealGroup>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="order-1 mx-auto lg:order-2"
        >
          <TiltCard maxTilt={8} hoverScale={1.02}>
            <div className="glow-ring relative h-[560px] w-[280px] rounded-[2.75rem] border-[6px] border-[#161622] bg-[#050508] p-2 shadow-2xl">
              <div className="absolute top-2 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[#161622]" />
              <div className="flex h-full flex-col overflow-hidden rounded-[2.1rem] bg-gradient-to-b from-[#0c0c16] to-[#08080f]">
                <div className="flex items-center gap-2.5 px-4 pt-9 pb-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B4A] to-[#ffb347] text-sm font-bold text-white">
                    BF
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">Bella Foods</p>
                    <p className="text-[11px] text-white/50">Open · closes 11PM</p>
                  </div>
                  <QrCode className="ml-auto size-4 text-white/40" />
                </div>

                <div className="px-4">
                  <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs text-white/40">
                    <Search className="size-3.5" />
                    Search the menu…
                  </div>
                </div>

                <div className="mt-3 flex gap-2 overflow-hidden px-4">
                  {["Starters", "Main Course", "Desserts", "Drinks"].map((cat, i) => (
                    <span
                      key={cat}
                      className={
                        "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium " +
                        (i === 1 ? "bg-[#FF6B4A] text-white" : "bg-white/5 text-white/50")
                      }
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex-1 space-y-2.5 overflow-hidden px-4 pb-6">
                  {DEMO_ITEMS.map((item) => (
                    <div key={item.title} className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-2">
                      <div
                        className="size-14 shrink-0 rounded-xl bg-cover bg-center"
                        style={{ backgroundImage: `url(https://images.unsplash.com/photo-${item.img}?auto=format&fit=crop&w=200&q=60)` }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-white">{item.title}</p>
                        <p className="mt-0.5 flex items-center gap-1 text-[10px] text-white/40">
                          <Star className="size-2.5 fill-[#FFD24A] text-[#FFD24A]" />
                          {item.tag}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs font-semibold text-white">{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TiltCard>
        </motion.div>
      </div>
    </section>
  );
}
