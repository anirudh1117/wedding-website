"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { RoyalInvitationFrame } from "@/components/design-system/RoyalInvitationFrame";
import { useAppLanguage } from "@/components/language/AppLanguageProvider";
import { usePetalCelebration } from "@/hooks/usePetalCelebration";

const SangeetRegistrationForm = dynamic(
  () => import("./SangeetRegistrationForm").then((mod) => mod.SangeetRegistrationForm),
  {
    ssr: false,
    loading: () => <div className="h-[180px] w-full animate-pulse rounded-[1rem] bg-[rgba(165,138,97,0.14)]" aria-hidden="true" />,
  },
);

export function SangeetRegistrationPageClient() {
  const { resolvedLanguage } = useAppLanguage();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { overlay } = usePetalCelebration(prefersReducedMotion);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return (
    <>
      {overlay}
      <RoyalInvitationFrame>
        <div className="form-appear">
          <SangeetRegistrationForm language={resolvedLanguage} />
        </div>
      </RoyalInvitationFrame>
    </>
  );
}
