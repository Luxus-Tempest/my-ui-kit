import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, LOCALES, type Locale } from "@/config/locales";

/**
 * Langue de la requête, lue dans le cookie `locale` (serveur seulement). Aucune fonction de
 * @rovia/ui n'est appelée ici : ses modules sont des composants clients.
 */
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Attributs de `<html>` pour une langue. */
export function htmlAttributes(locale: Locale) {
  return { lang: LOCALES[locale].tag.split("-")[0]!, dir: LOCALES[locale].dir };
}
