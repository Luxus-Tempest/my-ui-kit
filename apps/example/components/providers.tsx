"use client";

import * as React from "react";
import { ThemeProvider } from "next-themes";
import { DirectionProvider, getLocaleDirection, LocaleProvider, localeAr, localeEn, Toaster, type UiMessagesInput } from "@rovia/ui";

export type Langue = "fr" | "en" | "ar";

const LANGUES: Record<Langue, { locale: string; messages?: UiMessagesInput }> = {
  fr: { locale: "fr-FR" },
  en: { locale: "en-US", messages: localeEn },
  ar: { locale: "ar-MA", messages: localeAr },
};

const LangueContext = React.createContext<{ langue: Langue; setLangue: (langue: Langue) => void }>({
  langue: "fr",
  setLangue: () => {},
});

/** Langue choisie par l'utilisateur (menu de la barre d'application). */
export function useLangue() {
  return React.useContext(LangueContext);
}

/**
 * Le thème vient de next-themes (classe `dark` sur <html>) : les jetons de
 * @rovia/ui suivent cette classe, le ThemeProvider de la librairie n'est pas
 * nécessaire. La langue des composants vient de `LocaleProvider` ; l'arabe
 * passe aussi l'interface de droite à gauche.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  // Français au rendu serveur ; la préférence enregistrée est relue après l'hydratation.
  const [langue, setLangue] = React.useState<Langue>("fr");
  React.useEffect(() => {
    const saved = window.localStorage.getItem("langue");
    if (saved === "en" || saved === "ar") setLangue(saved);
  }, []);

  const { locale, messages } = LANGUES[langue];
  const dir = getLocaleDirection(locale);
  React.useEffect(() => {
    document.documentElement.lang = locale.split("-")[0]!;
    document.documentElement.dir = dir;
    window.localStorage.setItem("langue", langue);
  }, [langue, locale, dir]);

  const value = React.useMemo(() => ({ langue, setLangue }), [langue]);
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <LangueContext.Provider value={value}>
        <LocaleProvider locale={locale} messages={messages}>
          <DirectionProvider dir={dir}>
            {children}
            <Toaster />
          </DirectionProvider>
        </LocaleProvider>
      </LangueContext.Provider>
    </ThemeProvider>
  );
}
