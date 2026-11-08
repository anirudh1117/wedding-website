import { pickLocalizedText, weddingContent, type WeddingVenue } from "@/content/wedding-content";
import type { AppLanguage } from "@/lib/i18n/app-language";

type VenueMapProps = {
  venue: WeddingVenue;
  language: AppLanguage;
};

export function VenueMap({ venue, language }: VenueMapProps) {
  const mapEmbedUrl = venue.googleMapsEmbedUrl;

  if (!mapEmbedUrl) {
    return (
      <div className="editorial-surface rounded-[1rem] p-5 sm:p-6">
        <p className="eyebrow">{pickLocalizedText(weddingContent.labels.venueMapHeading, language)}</p>
        <p className={`mt-3 text-[1.1rem] text-[var(--primary)] sm:text-[1.2rem] ${language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : ""}`}>
          {pickLocalizedText(venue.name, language)}
        </p>
        <p className={`mt-2 text-sm text-[var(--muted-strong)] sm:text-base ${language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : ""}`}>
          {pickLocalizedText(venue.fullAddress, language)}
        </p>
        <p className={`mt-4 text-[1rem] text-[var(--primary)] ${language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : ""}`}>
          {pickLocalizedText(weddingContent.labels.mapPlaceholderHeading, language)}
        </p>
        <p className={`mt-2 text-sm text-[var(--muted)] sm:text-base ${language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : ""}`}>
          {pickLocalizedText(weddingContent.labels.mapPlaceholderBody, language)}
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-3">
      {/*<p className="eyebrow">{pickLocalizedText(weddingContent.labels.venueMapHeading, language)}</p> */}
      <div className="overflow-hidden rounded-[1rem] border border-[var(--border)] bg-[radial-gradient(circle_at_top,_rgba(209,170,86,0.18),_transparent_55%),var(--surface)] p-4 sm:p-5">
        <div className="min-w-0">
          <p className={`text-base font-medium text-[var(--primary)] ${language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : ""}`}>
            {pickLocalizedText(venue.name, language)}
          </p>
          <p className={`mt-1 text-sm text-[var(--muted-strong)] ${language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : ""}`}>
            {pickLocalizedText(venue.fullAddress, language)}
          </p>
        </div>

        <div className="venue-map-frame-wrap mt-4">
          <iframe
            src={mapEmbedUrl}
            title={`Map showing ${pickLocalizedText(venue.name, language)}`}
            loading="lazy"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="venue-map-frame"
          />
        </div>
      </div>
    </section>
  );
}
