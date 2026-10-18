"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { DirectionProvider, LocaleProvider, localeAr, localeEn, Toaster, type UiMessagesInput } from "@rovia/ui";
import { LOCALES, type Locale } from "@/config/locales";

const MESSAGES: Partial<Record<Locale, UiMessagesInput>> = { en: localeEn, ar: localeAr };

/**
 * Thème (next-themes : classe `dark` sur `<html>`, que les jetons de @rovia/ui suivent), langue
 * et sens des composants, et le Toaster (un seul pour toute l'application).
 */
export function Providers({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const { tag, dir } = LOCALES[locale];
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <LocaleProvider locale={tag} messages={MESSAGES[locale]}>
        <DirectionProvider dir={dir}>
          {children}
          <Toaster />
        </DirectionProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
