"use client";

import type { WeddingParty } from "@/lib/validation/registration";
import { Crown, Gem } from "lucide-react";
import type { AppLanguage } from "./i18n";

type PartySelectorProps = {
  value: WeddingParty | undefined;
  onChange: (value: WeddingParty) => void;
  error?: string;
  language: AppLanguage;
  label: string;
  brideLabel: string;
  groomLabel: string;
};

const partyCards: Array<{
  value: WeddingParty;
  Icon: typeof Crown;
}> = [
  {
    value: "bride",
    Icon: Gem,
  },
  {
    value: "groom",
    Icon: Crown,
  },
];

export function PartySelector({ value, onChange, error, language, label, brideLabel, groomLabel }: PartySelectorProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="input-label text-[var(--primary)]">
        <span className="input-label__primary">{label}</span>
      </legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {partyCards.map(({ value: itemValue, Icon }) => {
          const isSelected = value === itemValue;
          const displayLabel = itemValue === "bride" ? brideLabel : groomLabel;

          return (
            <button
              key={itemValue}
              type="button"
              className={`party-option focus-ring w-full rounded-[1rem] p-4 text-left transition ${isSelected ? "party-option--selected" : ""}`}
              aria-pressed={isSelected}
              onClick={() => onChange(itemValue)}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-base text-[var(--foreground)] ${language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : "font-medium"}`}>
                    {displayLabel}
                  </p>
                </div>
                <Icon className={`h-5 w-5 ${isSelected ? "text-[var(--primary)]" : "text-[var(--muted)]"}`} />
              </div>
            </button>
          );
        })}
      </div>
      {error ? <p className="error-text">{error}</p> : null}
    </fieldset>
  );
}
