import { pickLocalizedText, weddingContent } from "@/content/wedding-content";
import type { AppLanguage } from "@/lib/i18n/app-language";

type InvitationMessageProps = {
  language: AppLanguage;
};

export function InvitationMessage({ language }: InvitationMessageProps) {
  return (
    <section className="py-4 sm:py-6">
      {/* Chapter marker */}
      <p className="eyebrow mb-4 text-center">{pickLocalizedText(weddingContent.labels.byFamilies, language)}</p>

      <div className="mx-auto max-w-2xl text-center">
        <h2
          className={[
            "font-display font-light leading-[1.08]",
            "text-[1.85rem] sm:text-[2.3rem]",
            language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ color: "var(--primary)" }}
        >
          {pickLocalizedText(weddingContent.labels.invitationMessageHeading, language)}
        </h2>

        <div className="ornament-divider mx-auto my-5 max-w-xs">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 0 L8.2 5.8 L14 7 L8.2 8.2 L7 14 L5.8 8.2 L0 7 L5.8 5.8Z" fill="currentColor" />
          </svg>
        </div>

        <p
          className={[
            "text-[1rem] leading-[1.82] text-[var(--muted-strong)] sm:text-[1.08rem]",
            language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {pickLocalizedText(weddingContent.invitation.message, language)}
        </p>
      </div>
    </section>
  );
}
