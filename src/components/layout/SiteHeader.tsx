"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { useAppLanguage } from "@/components/language/AppLanguageProvider";
import { pickLocalizedText, weddingContent } from "@/content/wedding-content";
import type { AppLanguage } from "@/lib/i18n/app-language";

type NavItem = {
  label: string;
  href: string;
  active: boolean;
};

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function buildNavItems(pathname: string, language: AppLanguage): NavItem[] {
  return [
    {
      label: pickLocalizedText(weddingContent.navigation.home, language),
      href: weddingContent.routes.home,
      active: isActiveRoute(pathname, weddingContent.routes.home),
    },
    {
      label: pickLocalizedText(weddingContent.navigation.celebrations, language),
      href: weddingContent.routes.venueEvents,
      active:
        isActiveRoute(pathname, weddingContent.routes.venueEvents) ||
        (weddingContent.routes.legacyVenueEvents
          ? isActiveRoute(pathname, weddingContent.routes.legacyVenueEvents)
          : false),
    },
    {
      label: pickLocalizedText(weddingContent.navigation.familyRegistration, language),
      href: weddingContent.routes.familyRegistration,
      active: isActiveRoute(pathname, weddingContent.routes.familyRegistration),
    },
    ...(weddingContent.routes.sangeetPerformance
      ? [
          {
            label: pickLocalizedText(weddingContent.navigation.sangeet, language),
            href: weddingContent.routes.sangeetPerformance,
            active: isActiveRoute(pathname, weddingContent.routes.sangeetPerformance),
          },
        ]
      : []),
  ];
}

export function SiteHeader() {
  const pathname = usePathname();
  const { resolvedLanguage, setLanguage } = useAppLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = useMemo(() => buildNavItems(pathname, resolvedLanguage), [pathname, resolvedLanguage]);

  return (
    <header className="sticky top-0 z-30 border-b border-[rgba(196,145,58,0.16)] bg-[rgba(246,240,228,0.94)] backdrop-blur-md supports-[padding:max(0px)]:pt-[max(env(safe-area-inset-top),0px)]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Monogram logo — refined, no pill box */}
        <Link href={weddingContent.routes.home} className="focus-ring group flex items-baseline gap-2">
          <span
            className="font-display text-[1.1rem] font-light tracking-[0.1em]"
            style={{ color: "var(--primary)", fontFamily: "var(--font-display)" }}
          >
            {weddingContent.couple.monogram}
          </span>
          <span className="hidden text-[0.78rem] font-medium tracking-[0.04em] text-[var(--muted)] transition-colors group-hover:text-[var(--primary)] min-[360px]:inline sm:text-[0.82rem]">
            {pickLocalizedText(weddingContent.couple.names, resolvedLanguage)}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "focus-ring px-3 py-1.5 text-[0.8rem] font-medium tracking-[0.02em] transition-colors",
                item.active
                  ? "text-[var(--primary)] underline decoration-[var(--accent)] decoration-[1.5px] underline-offset-4"
                  : "text-[var(--muted-strong)] hover:text-[var(--primary)]",
              ].join(" ")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <div className="inline-flex rounded-full border border-[rgba(196,145,58,0.22)] bg-[var(--paper)] p-0.5">
            {(["hi", "en"] as const).map((option) => {
              const active = resolvedLanguage === option;
              return (
                <button
                  key={option}
                  type="button"
                  className={[
                    "focus-ring rounded-full px-3 py-1 text-[0.72rem] font-semibold transition-all",
                    active
                      ? "bg-[var(--primary)] text-[var(--paper)]"
                      : "text-[var(--muted-strong)] hover:text-[var(--primary)]",
                  ].join(" ")}
                  onClick={() => setLanguage(option)}
                >
                  {option === "hi" ? "हिन्दी" : "English"}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          aria-label={isMenuOpen ? pickLocalizedText(weddingContent.navigation.closeMenu, resolvedLanguage) : pickLocalizedText(weddingContent.navigation.menu, resolvedLanguage)}
          className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(196,145,58,0.22)] text-[var(--muted-strong)] lg:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          {isMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-[rgba(196,145,58,0.14)] bg-[var(--parchment)] px-4 pb-[max(calc(env(safe-area-inset-bottom)+1rem),1rem)] pt-3 lg:hidden">
          <nav className="flex flex-col gap-0.5" aria-label="Mobile">
            {navItems.map((item) => (
              <Link
                key={`${item.href}-mobile`}
                href={item.href}
                className={[
                  "focus-ring rounded-lg px-3 py-3 text-[0.9rem] font-medium",
                  item.active ? "text-[var(--primary)]" : "text-[var(--muted-strong)]",
                ].join(" ")}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-3 flex items-center gap-3 border-t border-[rgba(196,145,58,0.14)] pt-3">
            <span className="text-[0.68rem] uppercase tracking-[0.16em] text-[var(--muted)]">
              {pickLocalizedText(weddingContent.navigation.language, resolvedLanguage)}
            </span>
            <div className="inline-flex rounded-full border border-[rgba(196,145,58,0.22)] bg-[var(--paper)] p-0.5">
              {(["hi", "en"] as const).map((option) => {
                const active = resolvedLanguage === option;
                return (
                  <button
                    key={`${option}-mobile`}
                    type="button"
                    className={[
                      "focus-ring rounded-full px-3 py-1 text-[0.72rem] font-semibold",
                      active ? "bg-[var(--primary)] text-[var(--paper)]" : "text-[var(--muted-strong)]",
                    ].join(" ")}
                    onClick={() => setLanguage(option)}
                  >
                    {option === "hi" ? "हिन्दी" : "English"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
