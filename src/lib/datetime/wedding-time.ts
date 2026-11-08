import type { AppLanguage } from "@/lib/i18n/app-language";

function getLocale(language: AppLanguage): string {
  return language === "hi" ? "hi-IN" : "en-IN";
}

export function formatWeddingDate(dateTimeIso: string, timeZone: string, language: AppLanguage): string {
  return new Intl.DateTimeFormat(getLocale(language), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone,
  }).format(new Date(dateTimeIso));
}

export function formatWeddingTime(dateTimeIso: string, timeZone: string, language: AppLanguage): string {
  return new Intl.DateTimeFormat(getLocale(language), {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone,
  }).format(new Date(dateTimeIso));
}

export function formatWeddingDateTimeRange(
  startDateTimeIso: string,
  endDateTimeIso: string | null | undefined,
  timeZone: string,
  language: AppLanguage,
): string {
  const startDate = formatWeddingDate(startDateTimeIso, timeZone, language);
  const startTime = formatWeddingTime(startDateTimeIso, timeZone, language);

  if (!endDateTimeIso) {
    return `${startDate} · ${startTime}`;
  }

  const endDate = formatWeddingDate(endDateTimeIso, timeZone, language);
  const endTime = formatWeddingTime(endDateTimeIso, timeZone, language);

  if (startDate === endDate) {
    return `${startDate} · ${startTime} - ${endTime}`;
  }

  return `${startDate} ${startTime} - ${endDate} ${endTime}`;
}
