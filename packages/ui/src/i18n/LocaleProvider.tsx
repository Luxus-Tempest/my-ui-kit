import * as React from "react";
import type { UiMessages, UiMessagesInput } from "./messages";

/**
 * Langue de l'interface : locale `Intl` (dates, nombres, tri) et catalogue de
 * libellés. Sans provider, tout est en français (`fr-FR`) : les textes par
 * défaut vivent dans chaque composant, le catalogue ne fait que les remplacer.
 *
 *   import { LocaleProvider, localeEn } from "@rovia/ui";
 *   <LocaleProvider locale="en-US" messages={localeEn}>…</LocaleProvider>
 *
 * Les providers s'emboîtent : un provider intérieur hérite de la locale et des
 * libellés du parent et ne remplace que ce qu'il précise. La prop `labels`
 * d'un composant l'emporte toujours sur le catalogue.
 */
export interface LocaleProviderProps {
  /** Locale BCP 47 : `fr-FR` (défaut), `en-US`, `ar-MA`… Hérite du parent si absente. */
  locale?: string;
  /** Catalogue de libellés (`localeEn`, `localeAr`, ou le vôtre), complet ou partiel. */
  messages?: UiMessagesInput;
  children: React.ReactNode;
}

interface LocaleContextValue {
  locale: string;
  messages: UiMessagesInput;
}

const DEFAULT_LOCALE = "fr-FR";
const LocaleContext = React.createContext<LocaleContextValue>({ locale: DEFAULT_LOCALE, messages: {} });

function mergeMessages(parent: UiMessagesInput, child: UiMessagesInput | undefined): UiMessagesInput {
  if (!child) return parent;
  const merged: Record<string, unknown> = { ...parent };
  for (const [ns, value] of Object.entries(child)) {
    merged[ns] = { ...(parent as Record<string, object | undefined>)[ns], ...value };
  }
  return merged as UiMessagesInput;
}

export function LocaleProvider({ locale, messages, children }: LocaleProviderProps) {
  const parent = React.useContext(LocaleContext);
  const resolved = locale ?? parent.locale;
  const value = React.useMemo(
    () => ({ locale: resolved, messages: mergeMessages(parent.messages, messages) }),
    [resolved, parent.messages, messages],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

/** Locale courante (`fr-FR` sans provider) : à passer aux `Intl.*Format` et `toLocale*`. */
export function useLocale(): string {
  return React.useContext(LocaleContext).locale;
}

/**
 * Libellés d'un composant : ses valeurs par défaut (françaises), complétées par
 * le catalogue du `LocaleProvider`. `defaults` doit être une constante de
 * module, pour que le résultat reste stable d'un rendu à l'autre.
 */
export function useMessages<K extends keyof UiMessages>(namespace: K, defaults: UiMessages[K]): UiMessages[K] {
  const catalog = React.useContext(LocaleContext).messages[namespace];
  return React.useMemo(() => (catalog ? { ...defaults, ...catalog } : defaults), [catalog, defaults]);
}

const RTL_LANGUAGES = new Set(["ar", "he", "fa", "ur", "ps", "sd", "ug", "yi", "dv", "ckb"]);

/** Sens de lecture d'une locale : `rtl` pour l'arabe, l'hébreu, le persan… (à passer à `ThemeProvider dir`). */
export function getLocaleDirection(locale: string): "ltr" | "rtl" {
  return RTL_LANGUAGES.has(locale.toLowerCase().split(/[-_]/)[0]!) ? "rtl" : "ltr";
}
