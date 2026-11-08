import Link from "next/link";
import { pickLocalizedText, weddingContent } from "@/content/wedding-content";
import type { AppLanguage } from "@/lib/i18n/app-language";

type HomeFooterProps = {
  language: AppLanguage;
};

export function HomeFooter({ language }: HomeFooterProps) {
  return (
    <footer className="py-10 text-center sm:py-14">
      {/* Ornamental divider */}
      <div className="ornament-divider mx-auto mb-8 max-w-sm">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8Z" fill="currentColor" />
        </svg>
      </div>

      <p
        className={`mx-auto max-w-lg text-[0.95rem] leading-relaxed text-[var(--muted-strong)] sm:text-[1rem] ${language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : ""}`}
      >
        {pickLocalizedText(weddingContent.labels.closingMessage, language)}
      </p>

      <p
        className={[
          "mt-6 font-display font-light",
          "text-[2.2rem] leading-none text-[var(--primary)] sm:text-[2.8rem]",
          language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {pickLocalizedText(weddingContent.couple.names, language)}
      </p>

      <p className="mt-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
        {pickLocalizedText(weddingContent.labels.footerBlessing, language)}
      </p>

      <div className="royal-divider mx-auto mt-8 max-w-sm" aria-hidden="true" />

      <nav className="mt-6 flex flex-wrap justify-center gap-6 text-[0.82rem] text-[var(--muted)]" aria-label="Footer">
        <Link href={weddingContent.routes.home} className="focus-ring hover:text-[var(--primary)]">
          {pickLocalizedText(weddingContent.navigation.home, language)}
        </Link>
        <Link href={weddingContent.routes.venueEvents} className="focus-ring hover:text-[var(--primary)]">
          {pickLocalizedText(weddingContent.navigation.venue, language)}
        </Link>
        <Link href={weddingContent.routes.familyRegistration} className="focus-ring hover:text-[var(--primary)]">
          {pickLocalizedText(weddingContent.navigation.familyRegistration, language)}
        </Link>
      </nav>
    </footer>
  );
}
