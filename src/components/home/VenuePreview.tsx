import Image from "next/image";
import Link from "next/link";
import { GetDirectionsButton } from "@/components/ui/GetDirectionsButton";
import { getMainVenue, pickLocalizedText, weddingContent } from "@/content/wedding-content";
import type { AppLanguage } from "@/lib/i18n/app-language";

type VenuePreviewProps = {
  language: AppLanguage;
};

export function VenuePreview({ language }: VenuePreviewProps) {
  const venue = getMainVenue();

  return (
    <section id="venue" className="py-4 sm:py-6">
      <p className="eyebrow mb-3">{pickLocalizedText(weddingContent.labels.venueHeading, language)}</p>
      <h2
        className={[
          "font-display font-light leading-[1.08]",
          "text-[1.9rem] text-[var(--primary)] sm:text-[2.4rem]",
          language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {pickLocalizedText(venue.name, language)}
      </h2>
      <p className="mt-1 text-sm font-medium text-[var(--accent)]">{pickLocalizedText(venue.city, language)}</p>
      <p
        className={`mt-1 text-[0.9rem] text-[var(--muted)] ${language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : ""}`}
      >
        {pickLocalizedText(venue.shortAddress, language)}
      </p>

      {venue.heroImage ? (
        <div className="mt-5 overflow-hidden rounded-[1rem] border border-[var(--gold-dim)]">
          <Image
            src={venue.heroImage.src}
            alt={pickLocalizedText(venue.heroImage.alt, language)}
            width={1400}
            height={800}
            className="h-auto w-full object-cover"
            sizes="(max-width: 768px) 100vw, 900px"
          />
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={weddingContent.routes.venueEvents} className="btn-secondary focus-ring px-4 py-2 text-sm">
          {pickLocalizedText(weddingContent.actions.exploreVenue, language)}
        </Link>
        {venue.googleMapsDirectionsUrl ? (
          <GetDirectionsButton href={venue.googleMapsDirectionsUrl} compact>
            {pickLocalizedText(weddingContent.labels.directions, language)}
          </GetDirectionsButton>
        ) : null}
      </div>
    </section>
  );
}
