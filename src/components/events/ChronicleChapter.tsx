"use client";

import { useEffect, useRef, useState } from "react";
import { getVenueById, pickLocalizedText, type WeddingEvent, weddingContent } from "@/content/wedding-content";
import { GetDirectionsButton } from "@/components/ui/GetDirectionsButton";
import { formatWeddingDate, formatWeddingTime } from "@/lib/datetime/wedding-time";
import type { AppLanguage } from "@/lib/i18n/app-language";
import { EventArtwork } from "./EventArtwork";
import { EventSparkleLayer } from "./EventSparkleLayer";
import { EVENT_MOTIF_IDENTITY_REGISTRY, EVENT_THEME_REGISTRY, getChapterAccentStyle, getChapterBorderStyle } from "./event-identity-registry";

type Props = {
  event: WeddingEvent;
  index: number;
  total: number;
  language: AppLanguage;
  isActive: boolean;
  onActive: (index: number) => void;
};

function isReducedMotionPreferred() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ChronicleChapter({ event, index, total, language, isActive, onActive }: Props) {
  const chapterRef = useRef<HTMLElement | null>(null);
  /**
   * CSS animation is added once when the chapter enters the viewport.
   * Content starts VISIBLE (no initial opacity:0) so it is always accessible
   * even if the observer never fires or JS is slow.
   */
  const [enterClass, setEnterClass] = useState("");
  const hasAnimated = useRef(false);

  useEffect(() => {
    const node = chapterRef.current;
    if (!node) return;

    // Record whether this chapter started below the fold at mount time.
    const startedBelowFold = node.getBoundingClientRect().top > window.innerHeight * 0.9;
    const reduced = isReducedMotionPreferred();

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          if (!reduced && startedBelowFold && !hasAnimated.current) {
            setEnterClass(`chronicle-enter-${index % 2 === 0 ? "left" : "right"}`);
            hasAnimated.current = true;
          }
          if (entry.intersectionRatio >= 0.28) {
            onActive(index);
          }
        }
      },
      { threshold: [0, 0.28, 0.55] },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [index, onActive]);

  const theme = EVENT_THEME_REGISTRY[event.visual.theme];
  const identity = EVENT_MOTIF_IDENTITY_REGISTRY[event.visual.motif] ?? {
    artworkStyle: "generic" as const,
    sparkle: [
      { x: "20%", y: "25%", size: 16, delayMs: 800, durationMs: 3600 },
      { x: "70%", y: "60%", size: 18, delayMs: 1800, durationMs: 4400 },
    ],
  };

  const venue = getVenueById(event.venueId);

  const hasDate = Boolean(event.startDateTimeIso);
  const startDate = hasDate ? formatWeddingDate(event.startDateTimeIso ?? "", event.timeZone, language) : null;
  const startTime = hasDate ? formatWeddingTime(event.startDateTimeIso ?? "", event.timeZone, language) : null;
  const endTime = event.endDateTimeIso ? formatWeddingTime(event.endDateTimeIso, event.timeZone, language) : null;

  const dateLine = hasDate
    ? `${startDate}  ·  ${startTime}${endTime ? ` – ${endTime}` : ""}`
    : pickLocalizedText(weddingContent.labels.eventDatePending, language);

  const isFeaturedWedding = event.type === "wedding";

  return (
    <article
      ref={chapterRef}
      className={[
        "chronicle-chapter",
        isActive ? "chronicle-chapter--active" : "",
        isFeaturedWedding ? "chronicle-chapter--wedding" : "",
        enterClass,
      ]
        .filter(Boolean)
        .join(" ")}
      data-event-id={event.id}
    >
      {/* Chapter number eyebrow */}
      <div className="chronicle-chapter__eyebrow" style={getChapterAccentStyle(event.visual.theme)}>
        <span>
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* Mobile / inline artwork — hidden on desktop (shown in sticky panel instead) */}
      <div className="chronicle-chapter__artwork-wrap lg:hidden" style={getChapterBorderStyle(event.visual.theme)}>
        <EventArtwork
          style={identity.artworkStyle}
          tint={theme.artworkTint}
          artworkBg={theme.artworkBg}
          imageSrc={event.image?.src ?? null}
          imageAlt={event.image ? pickLocalizedText(event.image.alt, language) : pickLocalizedText(event.title, language)}
          size="chapter"
        />
        <EventSparkleLayer
          sparkles={identity.sparkle}
          palette={theme.sparkle}
        />
      </div>

      {/* Event content */}
      <div className="chronicle-chapter__content">
        <h3
          className={[
            "chronicle-chapter__title",
            language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={getChapterAccentStyle(event.visual.theme)}
        >
          {pickLocalizedText(event.title, language)}
        </h3>

        <p className="chronicle-chapter__date" style={getChapterBorderStyle(event.visual.theme)}>
          {dateLine}
        </p>

        <p className="chronicle-chapter__description">{pickLocalizedText(event.summary, language)}</p>

        {venue ? (
          <p className="chronicle-chapter__venue">
            <span className="font-medium" style={getChapterAccentStyle(event.visual.theme)}>
              {pickLocalizedText(venue.name, language)}
            </span>
            <span className="mx-1.5 opacity-40">·</span>
            <span>{pickLocalizedText(venue.shortAddress, language)}</span>
          </p>
        ) : null}

        {event.dressCode ? (
          <p className="chronicle-chapter__dress-code">
            <span className="font-medium" style={getChapterAccentStyle(event.visual.theme)}>
              {pickLocalizedText(weddingContent.labels.dressCode, language)}:
            </span>{" "}
            {pickLocalizedText(event.dressCode, language)}
          </p>
        ) : null}

        {event.directionsUrl ?? venue?.googleMapsDirectionsUrl ? (
          <GetDirectionsButton
            href={event.directionsUrl ?? venue?.googleMapsDirectionsUrl ?? "#"}
            compact
            className="chronicle-chapter__directions"
          >
            {pickLocalizedText(weddingContent.labels.directions, language)}
          </GetDirectionsButton>
        ) : null}
      </div>
    </article>
  );
}
