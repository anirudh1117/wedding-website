export const SUPPORTED_APP_LANGUAGES = ["hi", "en"] as const;

export type AppLanguage = (typeof SUPPORTED_APP_LANGUAGES)[number];

export const APP_LANGUAGE_STORAGE_KEY = "wedding.website.language";

export function isAppLanguage(value: string | null | undefined): value is AppLanguage {
  if (!value) {
    return false;
  }

  return SUPPORTED_APP_LANGUAGES.includes(value as AppLanguage);
}
