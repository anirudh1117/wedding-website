"use client";

import { Fragment, useEffect, useState } from "react";
import { pickLocalizedText, weddingContent } from "@/content/wedding-content";
import type { AppLanguage } from "@/lib/i18n/app-language";

type WeddingCountdownProps = {
  language: AppLanguage;
};

type CountdownParts = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  complete: boolean;
};

function toParts(diffMs: number): CountdownParts {
  if (diffMs <= 0) {
    return { days: "00", hours: "00", minutes: "00", seconds: "00", complete: true };
  }
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    days: String(days),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    complete: false,
  };
}

export function WeddingCountdown({ language }: WeddingCountdownProps) {
  const targetMs = new Date(weddingContent.wedding.dateTimeIso).getTime();
  const [nowMs, setNowMs] = useState<number | null>(null);

  useEffect(() => {
    const t0 = window.setTimeout(() => setNowMs(Date.now()), 0);
    const t1 = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => { window.clearTimeout(t0); window.clearInterval(t1); };
  }, []);

  const isInit = nowMs === null;
  const parts = isInit ? null : toParts(Math.max(0, targetMs - nowMs));

  const units = [
    { key: "days", value: parts?.days ?? "·", label: pickLocalizedText(weddingContent.labels.countdownDays, language) },
    { key: "hours", value: parts?.hours ?? "·", label: pickLocalizedText(weddingContent.labels.countdownHours, language) },
    { key: "minutes", value: parts?.minutes ?? "·", label: pickLocalizedText(weddingContent.labels.countdownMinutes, language) },
    { key: "seconds", value: parts?.seconds ?? "·", label: pickLocalizedText(weddingContent.labels.countdownSeconds, language) },
  ];

  return (
    <section className="py-8 text-center sm:py-10" aria-live="polite">
      <p className="eyebrow mb-6">{pickLocalizedText(weddingContent.labels.countdownHeading, language)}</p>

      {!isInit && parts?.complete ? (
        <p className={`text-[1.1rem] text-[var(--muted-strong)] ${language === "hi" ? "font-[family-name:var(--font-hindi-display)]" : ""}`}>
          {pickLocalizedText(weddingContent.labels.countdownEnded, language)}
        </p>
      ) : (
        <div className="flex flex-wrap items-end justify-center gap-x-3 gap-y-2 sm:gap-x-5">
          {units.map((item, i) => (
            <Fragment key={item.key}>
              <div className="flex flex-col items-center">
                <span
                  className="font-display font-light leading-none"
                  style={{ fontSize: "clamp(3rem, 11vw, 5.5rem)", color: isInit ? "var(--muted)" : "var(--primary)" }}
                >
                  {item.value}
                </span>
                <span className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                  {item.label}
                </span>
              </div>
              {i < 3 ? (
                <span className="mb-6 hidden text-[1.8rem] font-light text-[var(--accent)] sm:inline" aria-hidden="true">
                  ·
                </span>
              ) : null}
            </Fragment>
          ))}
        </div>
      )}
    </section>
  );
}
