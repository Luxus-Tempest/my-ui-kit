import * as React from "react";
import { DirectionProvider, type Direction } from "./DirectionProvider";

export type ThemeMode = "light" | "dark";
/** Surcharge de jetons : { pri: "#e11d48" } → --ui-pri */
export type ThemeOverrides = Partial<Record<string, string>>;

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
  /** Mode initial (non contrôlé). */
  defaultMode?: ThemeMode;
  /** Mode contrôlé : à utiliser avec `onModeChange`. */
  mode?: ThemeMode;
  onModeChange?: (mode: ThemeMode) => void;
  overrides?: ThemeOverrides;
  /**
   * `global` (défaut) : le thème est aussi posé sur `<html>`, pour que les
   * menus, infobulles et modales — rendus dans un portail hors du provider —
   * suivent le mode et les surcharges. `local` : seulement sur le conteneur
   * (utile pour afficher un aperçu sombre dans une page claire).
   */
  scope?: "global" | "local";
  /**
   * Sens de lecture : `rtl` pour l'arabe. Posé sur le conteneur (et sur
   * `<html>` en portée globale) et transmis aux primitives Radix, dont la
   * navigation au clavier s'inverse.
   */
  dir?: Direction;
}

export function ThemeProvider({
  children,
  defaultMode = "light",
  mode: modeProp,
  onModeChange,
  overrides,
  scope = "global",
  dir,
}: ThemeProviderProps) {
  const [innerMode, setInnerMode] = React.useState<ThemeMode>(defaultMode);
  const mode = modeProp ?? innerMode;
  const setMode = React.useCallback(
    (next: ThemeMode) => {
      if (modeProp === undefined) setInnerMode(next);
      onModeChange?.(next);
    },
    [modeProp, onModeChange],
  );

  const vars = React.useMemo(() => {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(overrides ?? {})) {
      if (value != null) out[`--ui-${key}`] = value;
    }
    return out;
  }, [overrides]);

  React.useEffect(() => {
    if (scope !== "global" || typeof document === "undefined") return;
    const root = document.documentElement;
    const previous = root.getAttribute("data-theme");
    const previousDir = root.getAttribute("dir");
    root.setAttribute("data-theme", mode);
    if (dir) root.setAttribute("dir", dir);
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
    return () => {
      if (previous == null) root.removeAttribute("data-theme");
      else root.setAttribute("data-theme", previous);
      if (dir) {
        if (previousDir == null) root.removeAttribute("dir");
        else root.setAttribute("dir", previousDir);
      }
      for (const k of Object.keys(vars)) root.style.removeProperty(k);
    };
  }, [scope, mode, vars, dir]);

  const value = React.useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return (
    <ThemeContext.Provider value={value}>
      <div data-theme={mode} dir={dir} className="ui-root" style={vars as React.CSSProperties}>
        {dir ? <DirectionProvider dir={dir}>{children}</DirectionProvider> : children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme doit être utilisé dans un <ThemeProvider>");
  return ctx;
}
