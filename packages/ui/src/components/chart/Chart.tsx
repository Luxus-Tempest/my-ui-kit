import * as React from "react";
import type { EChartsCoreOption, EChartsType } from "echarts/core";
import { cn } from "../../utils/cn";
import { echarts, ensureChartModules } from "./echarts";
import { buildChartTheme, chartDecal, prefersForcedColors, useChartTokens, type ChartTokens } from "./theme";

export type ChartOption = EChartsCoreOption;

/** Taille du tracé en pixels, transmise à une option fonction (rappelée au redimensionnement). */
export interface ChartSize {
  width: number;
  height: number;
}

export interface ChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onLoad"> {
  /**
   * Option ECharts (voir les exemples officiels), ou fonction qui la construit
   * à partir des jetons du thème et de la taille du tracé : elle est rappelée
   * quand le thème bascule ou que le conteneur change de taille.
   */
  option: ChartOption | ((tokens: ChartTokens, size: ChartSize) => ChartOption);
  /** Hauteur du tracé, axes compris. 280 px par défaut. */
  height?: number | string;
  /** `svg` (défaut) : net et léger. `canvas` : au-delà de quelques milliers de points. */
  renderer?: "svg" | "canvas";
  /** Rechargement : le tracé précédent reste affiché, estompé (pas de squelette, pas de saut). */
  loading?: boolean;
  /**
   * Texture de hachures (45° / 135°) en plus de la couleur : impression,
   * daltonisme complet. Activée d'office en mode contraste élevé.
   */
  texture?: boolean;
  /** Gestionnaires d'événements ECharts : `{ click: (params) => … }`. */
  onEvents?: Record<string, (params: unknown) => void>;
  /** Accès à l'instance ECharts (dispatchAction, export d'image…). */
  onInit?: (chart: EChartsType) => void;
}

/**
 * Graphique ECharts générique, habillé par le thème : couleurs, encres,
 * filets, police et mouvement viennent des jetons. Se redimensionne avec son
 * conteneur et suit la bascule clair / sombre sans être recréé.
 *
 * Pour les cas courants, préférer `LineChart`, `BarChart` et `DonutChart`,
 * qui ajoutent légende, infobulle, navigation au clavier et vue tableau.
 * Avec `Chart`, ces garanties sont à la charge de l'appelant : donner un nom
 * (`aria-label`) et une alternative textuelle aux données.
 */
export const Chart = React.forwardRef<HTMLDivElement, ChartProps>(function Chart(
  { option, height = 280, renderer = "svg", loading, texture, onEvents, onInit, className, style, ...props },
  forwardedRef,
) {
  const elRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(forwardedRef, () => elRef.current as HTMLDivElement);
  const chartRef = React.useRef<EChartsType | null>(null);
  const appliedTokens = React.useRef<ChartTokens | null>(null);
  const tokens = useChartTokens(elRef);
  const onInitRef = React.useRef(onInit);
  onInitRef.current = onInit;

  const [size, setSize] = React.useState<ChartSize>({ width: 0, height: 0 });
  const tokensRef = React.useRef(tokens);
  tokensRef.current = tokens;
  const ready = tokens != null;

  // Création une fois les jetons lus, thème compris : ECharts ignore setTheme
  // tant qu'aucune option n'a été posée. Le changement de moteur recrée l'instance.
  React.useEffect(() => {
    const el = elRef.current;
    const initial = tokensRef.current;
    if (!el || !initial) return;
    ensureChartModules();
    const chart = echarts.init(el, buildChartTheme(initial), { renderer });
    chartRef.current = chart;
    appliedTokens.current = initial;
    onInitRef.current?.(chart);
    const observer = new ResizeObserver(() => {
      chart.resize();
      const next = { width: Math.round(el.clientWidth), height: Math.round(el.clientHeight) };
      setSize((prev) => (prev.width === next.width && prev.height === next.height ? prev : next));
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, [renderer, ready]);

  // Bascule de thème, puis option. Les séries sont remplacées (pas fusionnées)
  // pour qu'une série masquée disparaisse vraiment ; le reste se fusionne et s'anime.
  React.useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !tokens) return;
    const resolved = typeof option === "function" ? option(tokens, size) : option;
    const showTexture = texture ?? prefersForcedColors();
    const withAria = {
      ...resolved,
      aria: {
        enabled: showTexture,
        label: { enabled: false },
        decal: { show: showTexture, decals: tokens.series.map((_, i) => chartDecal(i, tokens)) },
      },
    };
    chart.setOption(withAria, { replaceMerge: ["series"] });
    if (appliedTokens.current !== tokens) {
      chart.setTheme(buildChartTheme(tokens));
      appliedTokens.current = tokens;
    }
  }, [tokens, option, texture, renderer, ready, size]);

  // Événements
  React.useEffect(() => {
    const chart = chartRef.current;
    if (!chart || !onEvents) return;
    const entries = Object.entries(onEvents);
    entries.forEach(([name, handler]) => chart.on(name, handler));
    return () => entries.forEach(([name, handler]) => chart.off(name, handler));
  }, [onEvents, renderer, ready]);

  return (
    <div
      ref={elRef}
      data-slot="chart"
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      className={cn("ui-chart__plot", className)}
      style={{ height, ...style }}
      // Nommé par l'appelant : c'est une image (le nom sans rôle serait ignoré).
      role={props["aria-label"] != null || props["aria-labelledby"] != null ? "img" : undefined}
      {...props}
    />
  );
});
