import { AmbientBackground } from "@/components/landing/ambient-background";
import { ParticleField } from "@/components/landing/particle-field";

/**
 * Landing-page-only backdrop: pins the ambient grid/blobs and the WebGL
 * "glowing dust" particle layer to the viewport (`fixed`) so they stay put
 * while the page scrolls over them, instead of scrolling away with the
 * content like a normal background would.
 *
 * Deliberately separate from the shared `AmbientBackground` (also used by
 * the admin shell and auth layout) so the heavier particle canvas — and the
 * fixed/parallax behaviour — never leaks outside the marketing page.
 */
export function SiteBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <AmbientBackground />
      <div className="absolute inset-0">
        <ParticleField />
      </div>
    </div>
  );
}
