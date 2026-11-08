import { InvitationVideo } from "@/components/home/InvitationVideo";
import { pickLocalizedText, weddingContent } from "@/content/wedding-content";
import type { AppLanguage } from "@/lib/i18n/app-language";

type HomeHeroProps = {
  language: AppLanguage;
};

export function HomeHero({ language }: HomeHeroProps) {
  return (
    <section id="hero" className="invit-hero -mx-3 -mt-5 sm:-mx-5 sm:-mt-8 overflow-hidden">
      <div className="relative z-10 px-5 pb-10 pt-12 sm:px-8 sm:pb-14 sm:pt-16 lg:px-12">
        {/* Monogram crest */}
        <div className="mb-6 flex justify-center lg:justify-start">
          <div
            className="inline-flex h-16 w-16 items-center justify-center rounded-full border sm:h-20 sm:w-20"
            style={{ borderColor: "rgba(196, 145, 58, 0.4)", background: "rgba(196, 145, 58, 0.08)" }}
          >
            <span
              className="font-display text-[1.5rem] font-light tracking-[0.14em] sm:text-[1.75rem]"
              style={{ color: "var(--gold-on-dark, #e0b96a)", fontFamily: "var(--font-display)" }}
            >
              {weddingContent.couple.monogram}
            </span>
          </div>
        </div>

        {/* Couple names — the centrepiece */}
        <h1
          className={[
            "font-display font-light leading-[0.88] tracking-[-0.01em]",
            "text-[3.2rem] sm:text-[4.5rem] lg:text-[5.5rem]",
            language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ color: "var(--cream-on-dark)" }}
        >
          {pickLocalizedText(weddingContent.couple.names, language)}
        </h1>

        {/* Gold ornament divider */}
        <div className="my-5 flex items-center gap-3 sm:my-6 lg:max-w-lg">
          <div style={{ height: 1, flex: 1, background: "linear-gradient(90deg, transparent, rgba(196,145,58,0.5))" }} />
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M9 0 L10.5 7.5 L18 9 L10.5 10.5 L9 18 L7.5 10.5 L0 9 L7.5 7.5Z" fill="rgba(196,145,58,0.7)" />
          </svg>
          <div style={{ height: 1, flex: 1, background: "linear-gradient(90deg, rgba(196,145,58,0.5), transparent)" }} />
        </div>

        {/* Date and location */}
        <div className="space-y-1 text-center lg:text-left">
          <p
            className="font-display text-[1.3rem] font-light tracking-wide sm:text-[1.55rem]"
            style={{ color: "var(--gold-on-dark, #e0b96a)" }}
          >
            {pickLocalizedText(weddingContent.wedding.dateDisplay, language)}
          </p>
          <p
            className={`text-[0.95rem] tracking-[0.06em] ${language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : ""}`}
            style={{ color: "var(--muted-on-dark)" }}
          >
            {pickLocalizedText(weddingContent.wedding.location, language)}
          </p>
        </div>

        {/* Invitation message */}
        <p
          className={[
            "mt-7 max-w-xl text-[1rem] leading-[1.72] sm:text-[1.1rem]",
            language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ color: "var(--muted-on-dark)" }}
        >
          {pickLocalizedText(weddingContent.invitation.message, language)}
        </p>
      </div>

      {/* Invitation video — below the opening text */}
      <div className="relative z-10 border-t px-5 py-8 sm:px-8 sm:py-10 lg:px-12" style={{ borderColor: "rgba(196,145,58,0.16)" }}>
        <InvitationVideo language={language} />
      </div>
    </section>
  );
}
