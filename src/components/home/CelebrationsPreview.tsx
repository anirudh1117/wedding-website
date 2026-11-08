import Link from "next/link";
import { getEnabledEvents, getVenueById, pickLocalizedText, type WeddingEvent, weddingContent } from "@/content/wedding-content";
import { formatWeddingDate, formatWeddingTime } from "@/lib/datetime/wedding-time";
import type { AppLanguage } from "@/lib/i18n/app-language";
import { EventArtwork } from "@/components/events/EventArtwork";
import { EVENT_MOTIF_IDENTITY_REGISTRY, EVENT_THEME_REGISTRY, getChapterAccentStyle, getChapterBorderStyle } from "@/components/events/event-identity-registry";

type CelebrationsPreviewProps = {
  language: AppLanguage;
};

/** Return: [wedding | first-event, second non-wedding, last non-wedding], deduplicated, max 3 */
function getCuratedEvents(all: WeddingEvent[]): WeddingEvent[] {
  const sorted = all.slice().sort((a, b) => a.sequence - b.sequence);
  const wedding = sorted.find((e) => e.type === "wedding");
  const others = sorted.filter((e) => e.type !== "wedding");
  const hero = wedding ?? sorted[0];
  if (!hero) return [];
  const rest = others.filter((e) => e.id !== hero.id);
  // dedupe in case first and last are the same event
  const deduped = Array.from(new Map([hero, ...rest.slice(0, 2)].map((e) => [e.id, e])).values());
  return deduped.slice(0, 3);
}

export function CelebrationsPreview({ language }: CelebrationsPreviewProps) {
  const allEnabled = getEnabledEvents();
  const curated = getCuratedEvents(allEnabled);
  const [heroEvent, ...supportEvents] = curated;

  if (!heroEvent) return null;

  return (
    <section id="celebrations" className="space-y-8 sm:space-y-10">
      {/* Section heading */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">{pickLocalizedText(weddingContent.labels.eventsHeading, language)}</p>
          <h2 className={`mt-2 text-[1.9rem] text-[var(--primary)] sm:text-[2.4rem] ${language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : ""}`}>
            {pickLocalizedText(weddingContent.navigation.celebrations, language)}
          </h2>
        </div>
        <Link href={weddingContent.routes.venueEvents} className="btn-outline focus-ring min-h-[42px] px-4 py-2 text-sm">
          {pickLocalizedText(weddingContent.actions.viewCelebrations, language)}
        </Link>
      </div>

      {/* Hero event — larger editorial treatment */}
      <HeroEventCard event={heroEvent} language={language} />

      {/* Supporting events — compact editorial strips */}
      {supportEvents.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {supportEvents.map((event) => (
            <SupportEventCard key={event.id} event={event} language={language} />
          ))}
        </div>
      ) : null}

      {/* CTA */}
      <div className="text-center">
        <Link href={weddingContent.routes.venueEvents} className="btn-secondary focus-ring px-6 py-2.5 text-sm">
          {pickLocalizedText(weddingContent.actions.viewCelebrations, language)} →
        </Link>
      </div>
    </section>
  );
}

function HeroEventCard({ event, language }: { event: WeddingEvent; language: AppLanguage }) {
  const theme = EVENT_THEME_REGISTRY[event.visual.theme];
  const identity = EVENT_MOTIF_IDENTITY_REGISTRY[event.visual.motif] ?? { artworkStyle: "generic" as const, sparkle: [] };
  const venue = getVenueById(event.venueId);

  const hasDate = Boolean(event.startDateTimeIso);
  const startDate = hasDate ? formatWeddingDate(event.startDateTimeIso ?? "", event.timeZone, language) : null;
  const startTime = hasDate ? formatWeddingTime(event.startDateTimeIso ?? "", event.timeZone, language) : null;

  return (
    <article
      className="overflow-hidden rounded-2xl border"
      style={{ background: theme.artworkBg, borderColor: theme.border }}
      data-event-id={event.id}
    >
      {/* Artwork — full width, taller */}
      <div className="relative h-[240px] sm:h-[300px]">
        <EventArtwork
          style={identity.artworkStyle}
          tint={theme.artworkTint}
          artworkBg={theme.artworkBg}
          imageSrc={event.image?.src ?? null}
          imageAlt={event.image ? pickLocalizedText(event.image.alt, language) : pickLocalizedText(event.title, language)}
          size="stage"
        />
      </div>

      {/* Text content below artwork */}
      <div className="p-5 sm:p-6" style={{ borderTopColor: theme.border, borderTopWidth: 1, borderTopStyle: "solid" }}>
        <h3
          className={`mb-2 text-[1.75rem] leading-tight sm:text-[2.1rem] ${language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : ""}`}
          style={getChapterAccentStyle(event.visual.theme)}
        >
          {pickLocalizedText(event.title, language)}
        </h3>
        <p className="mb-3 text-[1rem] leading-relaxed text-[var(--muted)]">{pickLocalizedText(event.summary, language)}</p>
        {startDate ? (
          <p className="text-[0.9rem] font-medium text-[var(--muted-strong)]">
            {startDate}{startTime ? <span className="ml-1 font-normal opacity-70">· {startTime}</span> : null}
          </p>
        ) : null}
        {venue ? (
          <p className="mt-1 text-[0.88rem] text-[var(--muted)]">
            <span style={getChapterAccentStyle(event.visual.theme)}>{pickLocalizedText(venue.name, language)}</span>
          </p>
        ) : null}
      </div>
    </article>
  );
}

function SupportEventCard({ event, language }: { event: WeddingEvent; language: AppLanguage }) {
  const theme = EVENT_THEME_REGISTRY[event.visual.theme];
  const identity = EVENT_MOTIF_IDENTITY_REGISTRY[event.visual.motif] ?? { artworkStyle: "generic" as const, sparkle: [] };

  const hasDate = Boolean(event.startDateTimeIso);
  const startDate = hasDate ? formatWeddingDate(event.startDateTimeIso ?? "", event.timeZone, language) : null;

  return (
    <article
      className="overflow-hidden rounded-xl border"
      style={{ background: theme.artworkBg, borderColor: theme.border }}
      data-event-id={event.id}
    >
      {/* Compact artwork */}
      <div className="relative h-[160px]">
        <EventArtwork
          style={identity.artworkStyle}
          tint={theme.artworkTint}
          artworkBg={theme.artworkBg}
          imageSrc={event.image?.src ?? null}
          imageAlt={event.image ? pickLocalizedText(event.image.alt, language) : pickLocalizedText(event.title, language)}
          size="chapter"
        />
      </div>

      <div className="p-4" style={{ borderTopColor: theme.border, borderTopWidth: 1, borderTopStyle: "solid" }}>
        <h3
          className={`mb-1 text-[1.25rem] leading-tight ${language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : ""}`}
          style={getChapterAccentStyle(event.visual.theme)}
        >
          {pickLocalizedText(event.title, language)}
        </h3>
        {startDate ? (
          <p className="text-[0.83rem] text-[var(--muted)]">{startDate}</p>
        ) : null}
        <p
          className="mt-2 border-t pt-2 text-[0.85rem] leading-relaxed text-[var(--muted)]"
          style={getChapterBorderStyle(event.visual.theme)}
        >
          {pickLocalizedText(event.summary, language)}
        </p>
      </div>
    </article>
  );
}
