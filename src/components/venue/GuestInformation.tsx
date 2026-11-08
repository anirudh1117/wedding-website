import { pickLocalizedText, weddingContent, type WeddingVenue } from "@/content/wedding-content";
import type { AppLanguage } from "@/lib/i18n/app-language";

type GuestInformationProps = {
  venue: WeddingVenue;
  language: AppLanguage;
};

export function GuestInformation({ venue, language }: GuestInformationProps) {
  const blocks = [
    {
      key: "arrival",
      heading: pickLocalizedText(weddingContent.labels.arrivalGuidance, language),
      body: venue.arrivalGuidance ? pickLocalizedText(venue.arrivalGuidance, language) : null,
    },
    {
      key: "parking",
      heading: pickLocalizedText(weddingContent.labels.parkingInfo, language),
      body: venue.parkingInfo ? pickLocalizedText(venue.parkingInfo, language) : null,
    },
    {
      key: "accommodation",
      heading: pickLocalizedText(weddingContent.labels.accommodationInfo, language),
      body: venue.accommodationInfo ? pickLocalizedText(venue.accommodationInfo, language) : null,
    },
    {
      key: "transport",
      heading: pickLocalizedText(weddingContent.labels.transportInfo, language),
      body: venue.transportInfo ? pickLocalizedText(venue.transportInfo, language) : null,
    },
    {
      key: "assistance",
      heading: pickLocalizedText(weddingContent.labels.assistanceContact, language),
      body: venue.assistanceContact ? pickLocalizedText(venue.assistanceContact, language) : null,
    },
  ].filter((item) => Boolean(item.body));

  if (!blocks.length) {
    return null;
  }

  return (
    <section className="editorial-surface rounded-[1.2rem] p-5 sm:p-7">
      <p className="eyebrow">{pickLocalizedText(weddingContent.labels.guestInfoHeading, language)}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {blocks.map((block) => (
          <article key={block.key} className="rounded-[0.9rem] border border-[var(--border)] bg-[rgba(255,252,247,0.76)] p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--primary)]">{block.heading}</h3>
            <p className={`mt-2 text-sm leading-relaxed text-[var(--muted)] ${language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : ""}`}>
              {block.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
