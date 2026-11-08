"use client";

import { CelebrationsPreview } from "@/components/home/CelebrationsPreview";
import { GuestActions } from "@/components/home/GuestActions";
import { HomeFooter } from "@/components/home/HomeFooter";
import { HomeHero } from "@/components/home/HomeHero";
import { InvitationMessage } from "@/components/home/InvitationMessage";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { VenuePreview } from "@/components/home/VenuePreview";
import { WeddingCountdown } from "@/components/home/WeddingCountdown";
import { useAppLanguage } from "@/components/language/AppLanguageProvider";
import { pickLocalizedText, weddingContent } from "@/content/wedding-content";

export function HomePageClient() {
  const { resolvedLanguage } = useAppLanguage();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />

      {weddingContent.isDemoContent && process.env.NODE_ENV !== "production" ? (
        <div className="border-b border-[rgba(165,138,97,0.38)] bg-[rgba(165,138,97,0.18)] px-4 py-2 text-center text-xs text-[var(--muted-strong)] sm:px-6">
          {pickLocalizedText(weddingContent.labels.demoIndicator, resolvedLanguage)}
        </div>
      ) : null}

      <main className="flex flex-1 flex-col overflow-x-hidden">
        {/* Dark invitation hero — full bleed */}
        <HomeHero language={resolvedLanguage} />

        {/* Light content — parchment background */}
        <div className="royal-page-shell flex flex-1 justify-center px-3 sm:px-5">
          <div className="w-full max-w-5xl divide-y divide-[rgba(196,145,58,0.12)] sm:divide-y-0">
            <div className="py-8 sm:py-10"><WeddingCountdown language={resolvedLanguage} /></div>
            <div className="py-8 sm:py-10"><InvitationMessage language={resolvedLanguage} /></div>
            <div className="py-8 sm:py-10"><CelebrationsPreview language={resolvedLanguage} /></div>
            <div className="py-8 sm:py-10"><VenuePreview language={resolvedLanguage} /></div>
            <div className="py-6 sm:py-8"><GuestActions language={resolvedLanguage} /></div>
            <HomeFooter language={resolvedLanguage} />
          </div>
        </div>
      </main>
    </div>
  );
}
