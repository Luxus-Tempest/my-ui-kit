import * as React from "react";

/**
 * Jetons lus dans le CSS au moment du rendu : ECharts dessine en SVG/canvas
 * et ne comprend pas `var(--ui-…)`. Ils sont relus quand le thème change.
 */
export interface ChartTokens {
  /** Palette catégorielle, dans l'ordre fixe des jetons --ui-c1…c8. */
  series: string[];
  /** Gamme séquentielle --ui-seq-1…7 (proche de zéro → fort). */
  sequential: string[];
  diverging: { negative: string; midpoint: string; positive: string };
  status: { ok: string; warn: string; err: string };
  fg: string;
  fg2: string;
  fg3: string;
  grid: string;
  axis: string;
  /** Neutre des regroupements « Autres ». */
  neutral: string;
  /** Fond réel derrière le graphique : couleur des écarts de 2 px entre marques. */
  surface: string;
  fontFamily: string;
  dark: boolean;
}

const read = (style: CSSStyleDeclaration, name: string, fallback: string) =>
  style.getPropertyValue(name).trim() || fallback;

/** Premier fond opaque en remontant depuis l'élément : c'est lui que voient les écarts entre marques. */
function resolveSurface(el: HTMLElement, fallback: string): string {
  let node: HTMLElement | null = el;
  while (node) {
    const bg = getComputedStyle(node).backgroundColor;
    if (bg && bg !== "transparent" && !/rgba\(.*,\s*0\)$/.test(bg)) return bg;
    node = node.parentElement;
  }
  return fallback;
}

export function readChartTokens(el: HTMLElement): ChartTokens {
  const style = getComputedStyle(el);
  const panel = read(style, "--ui-panel", "#ffffff");
  return {
    series: Array.from({ length: 8 }, (_, i) => read(style, `--ui-c${i + 1}`, "#2a78d6")),
    sequential: Array.from({ length: 7 }, (_, i) => read(style, `--ui-seq-${i + 1}`, "#3987e5")),
    diverging: {
      negative: read(style, "--ui-div-neg", "#2a78d6"),
      midpoint: read(style, "--ui-div-mid", "#f0efec"),
      positive: read(style, "--ui-div-pos", "#e34948"),
    },
    status: {
      ok: read(style, "--ui-ok", "#146c2e"),
      warn: read(style, "--ui-warn", "#8f4c00"),
      err: read(style, "--ui-err", "#b3261e"),
    },
    fg: read(style, "--ui-fg", "#1f1f1f"),
    fg2: read(style, "--ui-fg-2", "#444746"),
    fg3: read(style, "--ui-fg-3", "#5f6368"),
    grid: read(style, "--ui-chart-grid", "#eceef1"),
    axis: read(style, "--ui-chart-axis", "#c4c7c5"),
    neutral: read(style, "--ui-outline", "#747775"),
    surface: resolveSurface(el, panel),
    fontFamily: read(style, "--ui-font-sans", "system-ui, sans-serif"),
    dark: style.colorScheme === "dark",
  };
}

/**
 * Jetons du graphique, relus quand le thème bascule : attribut `data-theme`
 * ou classe `.dark` sur `<html>` ou sur le conteneur de thème le plus proche,
 * et surcharges posées en style par ThemeProvider.
 */
export function useChartTokens(ref: React.RefObject<HTMLElement | null>): ChartTokens | null {
  const [tokens, setTokens] = React.useState<ChartTokens | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Lecture regroupée en micro-tâche : plusieurs mutations d'un même tour
    // donnent une seule lecture. Pas de requestAnimationFrame, suspendu dans
    // un onglet ou une iframe masqués : le graphique n'y serait jamais créé.
    let scheduled = false;
    let active = true;
    let last = "";
    const update = () => {
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(() => {
        scheduled = false;
        if (!active) return;
        const next = readChartTokens(el);
        const key = JSON.stringify(next);
        if (key !== last) {
          last = key;
          setTokens(next);
        }
      });
    };
    update();

    const observer = new MutationObserver(update);
    const watched = new Set<Element>([document.documentElement]);
    const scope = el.closest("[data-theme]");
    if (scope) watched.add(scope);
    watched.forEach((node) =>
      observer.observe(node, { attributes: true, attributeFilter: ["data-theme", "class", "style"] }),
    );
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [ref]);

  return tokens;
}

/** Résout une couleur de série : numéro d'emplacement (1-8), `var(--ui-…)` ou couleur CSS. */
export function resolveSeriesColor(spec: number | string | undefined, index: number, tokens: ChartTokens, el: HTMLElement | null) {
  if (spec == null) return tokens.series[index % tokens.series.length];
  if (typeof spec === "number") return tokens.series[(spec - 1) % tokens.series.length];
  const varMatch = /^var\((--[\w-]+)\)$/.exec(spec.trim());
  if (varMatch && el) return getComputedStyle(el).getPropertyValue(varMatch[1]).trim() || tokens.series[index];
  return spec;
}

/** Ajoute une opacité à une couleur hexadécimale ou rgb() ; ECharts ne lit pas color-mix(). */
export function withAlpha(color: string, alpha: number): string {
  const hex = /^#([\da-f]{3}|[\da-f]{6})$/i.exec(color);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.replace(/./g, (c) => c + c);
    const n = parseInt(h, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  }
  const rgb = /^rgba?\(([^)]+)\)$/.exec(color);
  if (rgb) {
    const [r, g, b] = rgb[1].split(/[\s,/]+/);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

/** Couleur CSS d'une série pour le DOM (légende) : suit le thème sans relecture. */
export function seriesCssColor(spec: number | string | undefined, index: number) {
  if (spec == null) return `var(--ui-c${(index % 8) + 1})`;
  if (typeof spec === "number") return `var(--ui-c${((spec - 1) % 8) + 1})`;
  return spec;
}

/**
 * Hachures de la série `index` (canal de secours : impression, daltonisme
 * complet, contraste élevé) : alternance 45° / 135°, densité qui varie par paire,
 * encre ton sur ton.
 */
export function chartDecal(index: number, tokens: ChartTokens) {
  return {
    symbol: "rect",
    symbolSize: 1,
    dashArrayX: [1, 0],
    dashArrayY: [2, 3 + 2 * Math.floor(index / 2)],
    rotation: index % 2 === 0 ? Math.PI / 4 : -Math.PI / 4,
    color: withAlpha(tokens.dark ? "#ffffff" : "#000000", 0.32),
  };
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}

export function prefersForcedColors() {
  return typeof window !== "undefined" && window.matchMedia?.("(forced-colors: active)").matches === true;
}

/**
 * Thème ECharts dérivé des jetons : texte en encres du thème (jamais la
 * couleur de série), grille et axe en filets pleins de 1 px, pas de
 * graduations, barres de 24 px au plus, lignes de 2 px.
 */
export function buildChartTheme(t: ChartTokens) {
  const axisLabel = { color: t.fg3, fontSize: 12, fontFamily: t.fontFamily };
  const category = {
    axisLine: { show: true, lineStyle: { color: t.axis, width: 1 } },
    axisTick: { show: false },
    axisLabel: { ...axisLabel, margin: 12 },
    splitLine: { show: false },
  };
  const value = {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { ...axisLabel, margin: 12 },
    splitLine: { show: true, lineStyle: { color: t.grid, width: 1, type: "solid" } },
  };
  return {
    color: t.series,
    backgroundColor: "transparent",
    textStyle: { fontFamily: t.fontFamily, color: t.fg2, fontSize: 12 },
    animation: !prefersReducedMotion(),
    animationDuration: 500,
    animationEasing: "cubicOut",
    animationDurationUpdate: 300,
    categoryAxis: category,
    timeAxis: category,
    valueAxis: value,
    logAxis: value,
    line: { lineStyle: { width: 2, cap: "round", join: "round" }, symbol: "circle", symbolSize: 8 },
    bar: { barMaxWidth: 24 },
  };
}
