"use client";

import type { WeddingParty } from "@/lib/validation/registration";
import type { AppLanguage } from "./i18n";

type ReviewGuest = {
  fullName: string;
  fileName: string;
};

type RegistrationReviewProps = {
  weddingParty?: WeddingParty;
  familyName: string;
  contactNumber: string;
  guests: ReviewGuest[];
  language: AppLanguage;
  labels: {
    heading: string;
    party: string;
    familyName: string;
    contactNumber: string;
    guests: string;
    notSelected: string;
    notProvided: string;
    namePending: string;
    documentPrefix: string;
    partyBride: string;
    partyGroom: string;
    noFileSelected: string;
  };
};

export function RegistrationReview({
  weddingParty,
  familyName,
  contactNumber,
  guests,
  language,
  labels,
}: RegistrationReviewProps) {
  const partyMap: Record<WeddingParty, string> = {
    groom: labels.partyGroom,
    bride: labels.partyBride,
  };

  return (
    <section className="review-panel rounded-[1.2rem] p-4 sm:p-5">
      <h3 className={`text-lg text-[var(--primary)] ${language === "hi" ? "font-[family-name:var(--font-hindi-display)] text-[1.2rem]" : "text-[1.1rem]"}`}>{labels.heading}</h3>
      <dl className="mt-3 space-y-3 text-sm">
        <div>
          <dt className="text-[var(--muted-strong)] uppercase tracking-[0.12em]">{labels.party}</dt>
          <dd className="mt-1 text-[var(--foreground)]">{weddingParty ? partyMap[weddingParty] : labels.notSelected}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted-strong)] uppercase tracking-[0.12em]">{labels.familyName}</dt>
          <dd className="mt-1 text-[var(--foreground)]">{familyName || labels.notProvided}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted-strong)] uppercase tracking-[0.12em]">{labels.contactNumber}</dt>
          <dd className="mt-1 text-[var(--foreground)]">{contactNumber || labels.notProvided}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted-strong)] uppercase tracking-[0.12em]">{labels.guests}</dt>
          <dd className="mt-1">
            <ul className="space-y-2">
              {guests.map((guest, index) => (
                <li key={`${guest.fullName}-${index}`} className="review-item rounded-lg p-2.5">
                  <p className="font-medium text-[var(--foreground)]">
                    {index + 1}. {guest.fullName || labels.namePending}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {labels.documentPrefix}: {guest.fileName || labels.noFileSelected}
                  </p>
                </li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
    </section>
  );
}
