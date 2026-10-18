/**
 * Langues proposées. Ce fichier ne dépend de rien : il sert au serveur (`lib/locale.ts`, qui pose
 * `<html lang dir>`) comme au client (menu de langue, palette ⌘K).
 *
 * `ar-MA` (arabe du Maroc) affiche des chiffres latins ; `ar` seul afficherait des chiffres
 * arabes orientaux.
 */
export const LOCALES = {
  fr: { tag: "fr-FR", dir: "ltr", label: "Français" },
  en: { tag: "en-US", dir: "ltr", label: "English" },
  ar: { tag: "ar-MA", dir: "rtl", label: "العربية" },
} as const;

export type Locale = keyof typeof LOCALES;

export const DEFAULT_LOCALE: Locale = "fr";

/** Nom du cookie qui mémorise la langue. */
export const LOCALE_COOKIE = "locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && value in LOCALES;
}
