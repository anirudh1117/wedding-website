import Link from "next/link";
import { pickLocalizedText, weddingContent } from "@/content/wedding-content";
import type { AppLanguage } from "@/lib/i18n/app-language";

type GuestActionsProps = {
  language: AppLanguage;
};

export function GuestActions({ language }: GuestActionsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2">
      <Link href={weddingContent.routes.familyRegistration} className="btn-primary focus-ring w-full justify-center px-4 py-3 text-sm">
        {pickLocalizedText(weddingContent.actions.openRegistration, language)}
      </Link>
      {weddingContent.routes.sangeetPerformance ? (
        <Link href={weddingContent.routes.sangeetPerformance} className="btn-secondary focus-ring w-full justify-center px-4 py-3 text-sm">
          {pickLocalizedText(weddingContent.navigation.sangeet, language)}
        </Link>
      ) : (
        <div className="flex min-h-[46px] items-center justify-center rounded-[0.85rem] border border-[var(--border)] bg-[rgba(255,252,247,0.75)] px-4 py-3 text-center text-sm text-[var(--muted)]">
          {pickLocalizedText(weddingContent.actions.sangeetUnavailable, language)}
        </div>
      )}
    </section>
  );
}
