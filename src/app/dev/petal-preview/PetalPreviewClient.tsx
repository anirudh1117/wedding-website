"use client";

import { useEffect, useState } from "react";
import { usePetalCelebration } from "@/hooks/usePetalCelebration";

export function PetalPreviewClient() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { triggerPetalCelebration, overlay } = usePetalCelebration(prefersReducedMotion);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return (
    <section className="editorial-panel relative w-full max-w-2xl overflow-hidden rounded-[1.2rem] p-6 sm:p-8">
      {overlay}
      <header className="relative z-10 mb-6 space-y-2">
        <p className="eyebrow">Developer Tooling</p>
        <h1 className="text-[2rem] leading-[1] text-[var(--primary)] sm:text-[2.4rem]">Petal Animation Preview</h1>
        <p className="text-sm text-[var(--muted)] sm:text-base">
          Manual trigger harness for registration celebrations. This page is available in development only.
        </p>
      </header>

      <div className="relative z-10 grid gap-3 sm:grid-cols-3">
        <button type="button" className="btn-secondary focus-ring" onClick={() => triggerPetalCelebration("add-guest")}>
          Add Guest Effect
        </button>
        <button type="button" className="btn-secondary focus-ring" onClick={() => triggerPetalCelebration("upload-success")}>
          Upload Success Effect
        </button>
        <button type="button" className="btn-primary focus-ring" onClick={() => triggerPetalCelebration("registration-success")}>
          Registration Success Effect
        </button>
      </div>

      <p className="relative z-10 mt-5 text-xs uppercase tracking-[0.12em] text-[var(--muted-strong)]">
        Reduced motion: {prefersReducedMotion ? "enabled" : "disabled"}
      </p>
    </section>
  );
}
