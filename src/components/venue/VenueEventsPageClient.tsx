"use client";

import { HomeFooter } from "@/components/home/HomeFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { useAppLanguage } from "@/components/language/AppLanguageProvider";
import { getMainVenue, pickLocalizedText, weddingContent } from "@/content/wedding-content";
import { EventTimeline } from "./EventTimeline";
import { GuestInformation } from "./GuestInformation";
import { MainVenue } from "./MainVenue";
import { VenueHero } from "./VenueHero";

export function VenueEventsPageClient() {
  const { resolvedLanguage } = useAppLanguage();
  const mainVenue = getMainVenue();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />

      {weddingContent.isDemoContent && process.env.NODE_ENV !== "production" ? (
        <div className="border-b border-[rgba(165,138,97,0.38)] bg-[rgba(165,138,97,0.18)] px-4 py-2 text-center text-xs text-[var(--muted-strong)] sm:px-6">
          {pickLocalizedText(weddingContent.labels.demoIndicator, resolvedLanguage)}
        </div>
      ) : null}

      <main className="flex flex-1 flex-col overflow-x-hidden">
        <VenueHero language={resolvedLanguage} />

        <div className="royal-page-shell flex flex-1 justify-center px-3 sm:px-5">
          <div className="w-full max-w-6xl divide-y divide-[rgba(196,145,58,0.1)] sm:divide-y-0">
            <div className="py-8 sm:py-10"><MainVenue language={resolvedLanguage} venue={mainVenue} /></div>
            <div className="py-8 sm:py-10"><EventTimeline language={resolvedLanguage} /></div>
            <div className="py-8 sm:py-10"><GuestInformation language={resolvedLanguage} venue={mainVenue} /></div>
            <HomeFooter language={resolvedLanguage} />
          </div>
        </div>
      </main>
    </div>
  );
}
