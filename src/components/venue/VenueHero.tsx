import { pickLocalizedText, weddingContent } from "@/content/wedding-content";
import type { AppLanguage } from "@/lib/i18n/app-language";

type VenueHeroProps = {
  language: AppLanguage;
};

export function VenueHero({ language }: VenueHeroProps) {
  return (
    <section className="invit-hero -mx-3 -mt-5 overflow-hidden px-5 pb-10 pt-10 sm:-mx-5 sm:-mt-8 sm:px-8 sm:pb-12 sm:pt-12">
      <div className="relative z-10">
        <p className="mb-4 text-[0.68rem] font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--muted-on-dark)" }}>
          {pickLocalizedText(weddingContent.labels.eventsHeading, language)}
        </p>
        <h1
          className={[
            "font-display font-light leading-[0.9]",
            "text-[2.5rem] sm:text-[3.5rem]",
            language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ color: "var(--cream-on-dark)" }}
        >
          {pickLocalizedText(weddingContent.labels.venuePageHeading, language)}
        </h1>
        <p
          className={[
            "mt-4 max-w-2xl text-[0.95rem] leading-[1.72] sm:text-[1.05rem]",
            language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ color: "var(--muted-on-dark)" }}
        >
          {pickLocalizedText(weddingContent.labels.venuePageIntro, language)}
        </p>
      </div>
    </section>
  );
}
