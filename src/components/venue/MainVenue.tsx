import Image from "next/image";
import { pickLocalizedText, weddingContent, type WeddingVenue } from "@/content/wedding-content";
import type { AppLanguage } from "@/lib/i18n/app-language";
import { VenueGallery } from "./VenueGallery";
import { VenueLocationShare } from "./VenueLocationShare";
import { VenueMap } from "./VenueMap";

type MainVenueProps = {
  language: AppLanguage;
  venue: WeddingVenue;
};

export function MainVenue({ language, venue }: MainVenueProps) {
  return (
    <section className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <article className="space-y-4 rounded-[1.2rem] border border-[var(--gold-dim)] bg-[var(--paper)] p-5 sm:p-6">
          <div>
            <p className="eyebrow mb-2">{pickLocalizedText(weddingContent.labels.venueDescription, language)}</p>
            <h2 className={`font-display font-light text-[1.9rem] text-[var(--primary)] sm:text-[2.3rem] ${language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : ""}`}>
              {pickLocalizedText(venue.name, language)}
            </h2>
            <p className="mt-1 text-sm font-medium text-[var(--accent)]">{pickLocalizedText(venue.city, language)}</p>
          </div>
          <p className={`text-sm leading-relaxed text-[var(--muted)] sm:text-base ${language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : ""}`}>
            {pickLocalizedText(venue.description, language)}
          </p>

          <div className="rounded-[0.8rem] border border-[rgba(196,145,58,0.16)] bg-[rgba(196,145,58,0.05)] p-3">
            <p className="text-[0.68rem] uppercase tracking-[0.16em] text-[var(--accent)]">{pickLocalizedText(weddingContent.labels.venueAddress, language)}</p>
            <p className={`mt-2 text-sm leading-relaxed text-[var(--muted-strong)] sm:text-base ${language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : ""}`}>
              {pickLocalizedText(venue.fullAddress, language)}
            </p>
          </div>

          <VenueLocationShare venue={venue} language={language} />

        </article>


        
        <div className="space-y-4">
            {/* 
          {venue.heroImage ? (
            <div className="overflow-hidden rounded-[1.1rem] border border-[var(--border)] bg-[var(--surface)]">
              <Image
                src={venue.heroImage.src}
                alt={pickLocalizedText(venue.heroImage.alt, language)}
                width={1400}
                height={900}
                className="h-[260px] w-full object-cover sm:h-[320px]"
                sizes="(max-width: 1024px) 100vw, 42vw"
                priority={false}
              />
            </div>
          ) : null}

          */}

          <VenueMap venue={venue} language={language} />
        </div>
      </div>

      {venue.gallery.length ? <VenueGallery venue={venue} language={language} /> : null}
    </section>
  );
}
