"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Pause, Play, QrCode } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";

const SCENE_MS = 4500;
const SCENES = ["scene1", "scene2", "scene3", "scene4"] as const;

export function HowItWorks() {
  const t = useTranslations("landing.howItWorks");
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % SCENES.length);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(next, SCENE_MS);
    return () => window.clearInterval(id);
  }, [playing, next]);

  const scene = SCENES[index] ?? "scene1";
  const titles = {
    scene1: t("scene1Title"),
    scene2: t("scene2Title"),
    scene3: t("scene3Title"),
    scene4: t("scene4Title"),
  };
  const bodies = {
    scene1: t("scene1Body"),
    scene2: t("scene2Body"),
    scene3: t("scene3Body"),
    scene4: t("scene4Body"),
  };
  const progress = ((index + 1) / SCENES.length) * 100;

  return (
    <section id="how-it-works" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-6">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold tracking-wide text-accent uppercase">{t("eyebrow")}</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h2>
        <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>
      </Reveal>

      <div className="glow-ring mx-auto mt-12 max-w-3xl overflow-hidden rounded-3xl border border-border/80 bg-[#07070f] shadow-2xl">
        <div className="relative aspect-video">
          <HowItWorksScene index={index} />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-5 pt-16 pb-4">
            <p className="font-display text-lg font-semibold text-white sm:text-xl">{titles[scene]}</p>
            <p className="mt-1 text-sm text-white/70">{bodies[scene]}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-white/10 px-4 py-3">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label={playing ? t("pause") : t("play")}
          >
            {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          </button>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="w-10 text-right font-mono text-xs text-white/50">
            0{index + 1}/04
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {SCENES.map((key, i) => (
          <button
            type="button"
            key={key}
            onClick={() => {
              setIndex(i);
              setPlaying(false);
            }}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              i === index ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {titles[key]}
          </button>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Button variant="glow" size="lg" asChild>
          <Link href="/c/live-demo">{t("cta")}</Link>
        </Button>
      </div>
    </section>
  );
}

function HowItWorksScene({ index }: { index: number }) {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(124,92,255,0.25),_transparent_55%),linear-gradient(180deg,#0b0b16,#050508)]">
      <div className="absolute inset-0 grid-mask opacity-40" />
      <div className="flex h-full items-center justify-center gap-8 px-8">
        {index === 0 && <SceneQr />}
        {index === 1 && <ScenePhone label="Scan" />}
        {index === 2 && <ScenePhone catalog />}
        {index === 3 && <SceneAdmin />}
      </div>
    </div>
  );
}

function SceneQr() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-3xl border border-white/10 bg-white p-5 shadow-2xl">
        <QrCode className="size-28 text-[#111] sm:size-36" strokeWidth={1.4} />
      </div>
      <p className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">table · shelf · window</p>
    </div>
  );
}

function ScenePhone({ catalog, label }: { catalog?: boolean; label?: string }) {
  return (
    <div className="relative h-[78%] w-[42%] max-w-[220px] min-h-[240px] rounded-[1.8rem] border-[5px] border-[#1c1c28] bg-[#09090f] shadow-2xl">
      <div className="mx-auto mt-1.5 h-3 w-16 rounded-full bg-[#1c1c28]" />
      {catalog ? (
        <div className="space-y-2 px-3 pt-4">
          <div className="h-3 w-24 rounded bg-white/20" />
          <div className="flex gap-1.5">
            <span className="h-5 w-12 rounded-full bg-[#FF6B4A]" />
            <span className="h-5 w-12 rounded-full bg-white/10" />
            <span className="h-5 w-12 rounded-full bg-white/10" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-2 rounded-xl bg-white/5 p-1.5">
              <div className="size-9 rounded-lg bg-white/10" />
              <div className="flex-1 space-y-1.5 pt-1">
                <div className="h-2 w-16 rounded bg-white/25" />
                <div className="h-2 w-10 rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-[80%] flex-col items-center justify-center gap-3">
          <div className="rounded-2xl bg-white p-3">
            <QrCode className="size-16 text-[#111]" />
          </div>
          {label && <p className="text-xs font-medium text-white/70">{label}</p>}
        </div>
      )}
    </div>
  );
}

function SceneAdmin() {
  return (
    <div className="w-[78%] max-w-lg rounded-2xl border border-white/10 bg-[#101018] p-4 shadow-2xl">
      <div className="mb-3 flex gap-2">
        <span className="h-2 w-2 rounded-full bg-red-400/80" />
        <span className="h-2 w-2 rounded-full bg-yellow-400/80" />
        <span className="h-2 w-2 rounded-full bg-green-400/80" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {["Scans", "Items", "Live"].map((label) => (
          <div key={label} className="rounded-xl bg-white/5 p-3">
            <p className="text-[10px] text-white/40">{label}</p>
            <p className="mt-1 font-display text-lg font-bold text-white">{label === "Live" ? "●" : "↑"}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 h-16 rounded-xl bg-gradient-to-r from-primary/40 to-accent/30" />
    </div>
  );
}
