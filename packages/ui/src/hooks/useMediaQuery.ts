import * as React from "react";

/**
 * Suit une media query CSS (`"(max-width: 640px)"`, `"(prefers-reduced-motion: reduce)"`).
 * Sûr côté serveur : renvoie `defaultValue` tant que le navigateur n'a pas répondu,
 * puis se met à jour à chaque changement.
 *
 *   const compact = useMediaQuery("(max-width: 640px)");
 */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener?.("change", onChange);
      return () => mql.removeEventListener?.("change", onChange);
    },
    [query],
  );
  const getSnapshot = () =>
    typeof window !== "undefined" && window.matchMedia ? window.matchMedia(query).matches : defaultValue;
  return React.useSyncExternalStore(subscribe, getSnapshot, () => defaultValue);
}

/** Points de rupture de la librairie (alignés sur les comportements responsives des composants). */
export const breakpoints = {
  /** Téléphone : un seul mois de calendrier, barre latérale en feuille. */
  sm: "(max-width: 640px)",
  /** Tablette portrait et moins. */
  md: "(max-width: 768px)",
  /** Petit ordinateur et moins. */
  lg: "(max-width: 1024px)",
} as const;
