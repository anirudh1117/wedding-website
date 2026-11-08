"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useEffect } from "react";
import { weddingContent } from "@/content/wedding-content";
import {
  APP_LANGUAGE_STORAGE_KEY,
  isAppLanguage,
  type AppLanguage,
} from "@/lib/i18n/app-language";

type AppLanguageContextValue = {
  language: AppLanguage;
  resolvedLanguage: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
};

const AppLanguageContext = createContext<AppLanguageContextValue | null>(null);

export function AppLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(weddingContent.site.defaultLanguage);

  useEffect(() => {
    const restoreId = window.setTimeout(() => {
      const stored = window.localStorage.getItem(APP_LANGUAGE_STORAGE_KEY);
      if (isAppLanguage(stored)) {
        setLanguageState(stored);
      }
    }, 0);

    return () => window.clearTimeout(restoreId);
  }, []);

  const setLanguage = (nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(APP_LANGUAGE_STORAGE_KEY, nextLanguage);
  };

  const value = useMemo<AppLanguageContextValue>(
    () => ({
      language,
      resolvedLanguage: language,
      setLanguage,
    }),
    [language],
  );

  return <AppLanguageContext.Provider value={value}>{children}</AppLanguageContext.Provider>;
}

export function useAppLanguage() {
  const context = useContext(AppLanguageContext);
  if (!context) {
    throw new Error("useAppLanguage must be used inside AppLanguageProvider");
  }

  return context;
}
