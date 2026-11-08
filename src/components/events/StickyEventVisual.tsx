"use client";

import type { WeddingEvent } from "@/content/wedding-content";
import { pickLocalizedText } from "@/content/wedding-content";
import { formatWeddingDate, formatWeddingTime } from "@/lib/datetime/wedding-time";
import type { AppLanguage } from "@/lib/i18n/app-language";
import { EventArtwork } from "./EventArtwork";
import { EventSparkleLayer } from "./EventSparkleLayer";
import { EVENT_MOTIF_IDENTITY_REGISTRY, EVENT_THEME_REGISTRY, getChapterAccentStyle } from "./event-identity-registry";

type Props = {
  events: WeddingEvent[];
  activeIndex: number;
  language: AppLanguage;
};

export function StickyEventVisual({ events, activeIndex, language }: Props) {
  const activeEvent = events[activeIndex];
  if (!activeEvent) return null;

  const activeTheme = EVENT_THEME_REGISTRY[activeEvent.visual.theme];

  const hasDate = Boolean(activeEvent.startDateTimeIso);
  const startDate = hasDate ? formatWeddingDate(activeEvent.startDateTimeIso ?? "", activeEvent.timeZone, language) : null;
  const startTime = hasDate ? formatWeddingTime(activeEvent.startDateTimeIso ?? "", activeEvent.timeZone, language) : null;

  return (
    <div className="chronicle-visual" aria-hidden="true">
      {/* Stacked artwork layers — only the active one is visible */}
      <div className="chronicle-visual__stage">
        {events.map((event, index) => {
          const identity = EVENT_MOTIF_IDENTITY_REGISTRY[event.visual.motif] ?? {
            artworkStyle: "generic" as const,
            sparkle: [
              { x: "25%", y: "25%", size: 16, delayMs: 800, durationMs: 3600 },
              { x: "75%", y: "65%", size: 18, delayMs: 2000, durationMs: 4400 },
            ],
          };
          const theme = EVENT_THEME_REGISTRY[event.visual.theme];
          const isActive = index === activeIndex;

          return (
            <div
              key={event.id}
              className={`chronicle-visual__artwork-layer ${isActive ? "chronicle-visual__artwork-layer--active" : ""}`}
            >
              <EventArtwork
                style={identity.artworkStyle}
                tint={theme.artworkTint}
                artworkBg={theme.artworkBg}
                imageSrc={event.image?.src ?? null}
                imageAlt={event.image ? pickLocalizedText(event.image.alt, language) : pickLocalizedText(event.title, language)}
                size="stage"
              />
              {isActive ? (
                <EventSparkleLayer
                  sparkles={identity.sparkle}
                  palette={theme.sparkle}
                />
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Metadata below artwork */}
      <div className="chronicle-visual__meta">
        <span className="chronicle-visual__chapter-number">
          {String(activeIndex + 1).padStart(2, "0")} / {String(events.length).padStart(2, "0")}
        </span>
        <h3
          className={`chronicle-visual__title ${language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : ""}`}
          style={getChapterAccentStyle(activeEvent.visual.theme)}
        >
          {pickLocalizedText(activeEvent.title, language)}
        </h3>
        {startDate ? (
          <p className="chronicle-visual__date" style={{ color: activeTheme.accent }}>
            {startDate}
            {startTime ? <span className="opacity-70"> · {startTime}</span> : null}
          </p>
        ) : null}
      </div>

      {/* Timeline progress dots */}
      <div className="chronicle-visual__dots" role="presentation">
        {events.map((event, index) => (
          <div
            key={event.id}
            className={`chronicle-dot ${index === activeIndex ? "chronicle-dot--active" : ""}`}
            style={index === activeIndex ? { background: activeTheme.accent } : undefined}
          />
        ))}
      </div>
    </div>
  );
}
