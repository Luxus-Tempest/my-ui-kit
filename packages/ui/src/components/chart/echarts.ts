/*
 * ECharts en import découpé : seuls les graphiques et composants enregistrés
 * ici entrent dans le bundle. Pour un autre type (radar, sankey, heatmap,
 * calendrier…), l'application l'enregistre une fois au démarrage :
 *
 *   import { registerChartModules } from "@acme/ui";
 *   import { HeatmapChart } from "echarts/charts";
 *   import { VisualMapComponent } from "echarts/components";
 *   registerChartModules([HeatmapChart, VisualMapComponent]);
 */
import * as echarts from "echarts/core";
import { BarChart, LineChart, PieChart, ScatterChart } from "echarts/charts";
import {
  AriaComponent,
  AxisPointerComponent,
  DatasetComponent,
  GraphicComponent,
  GridComponent,
  MarkLineComponent,
  TooltipComponent,
} from "echarts/components";
import { LabelLayout, UniversalTransition } from "echarts/features";
import { CanvasRenderer, SVGRenderer } from "echarts/renderers";

const DEFAULT_MODULES = [
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  AriaComponent,
  AxisPointerComponent,
  DatasetComponent,
  GraphicComponent,
  GridComponent,
  MarkLineComponent,
  TooltipComponent,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
  SVGRenderer,
];

let registered = false;

/**
 * Enregistre les modules par défaut au premier graphique, pas au chargement :
 * le module reste sans effet de bord et un bundler l'écarte (ECharts compris)
 * d'une application qui n'affiche aucun graphique.
 */
export function ensureChartModules() {
  if (registered) return;
  registered = true;
  echarts.use(DEFAULT_MODULES);
}

export { echarts };

/** Enregistre des graphiques ou composants ECharts supplémentaires. */
export const registerChartModules: typeof echarts.use = (modules) => echarts.use(modules);
