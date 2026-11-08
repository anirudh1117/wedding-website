import { pickLocalizedText, weddingContent } from "@/content/wedding-content";
import type { AppLanguage } from "@/lib/i18n/app-language";
import { WeddingChronicle } from "@/components/events/WeddingChronicle";

type EventTimelineProps = {
  language: AppLanguage;
};

export function EventTimeline({ language }: EventTimelineProps) {
  const header = (
    <header className="chronicle-header mb-6 sm:mb-8">
      <p className="eyebrow text-[var(--accent)]">{pickLocalizedText(weddingContent.labels.eventsHeading, language)}</p>
      <h2 className={`mt-2 text-[2rem] text-[var(--primary)] sm:text-[2.5rem] ${language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : ""}`}>
        {pickLocalizedText(weddingContent.labels.scheduleHeading, language)}
      </h2>
    </header>
  );

  return (
    <section id="celebrations">
      <WeddingChronicle language={language} header={header} />
    </section>
  );
}
