"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { ParticleField } from "@/components/landing/particle-field";

/** The WebGL dust only exists in the dark theme; by day it would be noise on white. */
export function NightParticles() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || resolvedTheme !== "dark") return null;
  return (
    <div className="absolute inset-0">
      <ParticleField />
    </div>
  );
}
