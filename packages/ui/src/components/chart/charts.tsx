import * as React from "react";
import type { EChartsType } from "echarts/core";
import { cn } from "../../utils/cn";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../table/Table";
import { Chart, type ChartOption, type ChartSize } from "./Chart";
import { chartDecal, prefersForcedColors, resolveSeriesColor, seriesCssColor, withAlpha, type ChartTokens } from "./theme";
import { useLocale, useMessages } from "../../i18n/LocaleProvider";

/* ═══ Formats ═══════════════════════════════════════════════════════════ */

/** Formats des nombres (valeurs, axes compacts, parts) dans la locale du `LocaleProvider`. */
function useChartFormats() {
  const locale = useLocale();
  return React.useMemo(() => {
    const number = new Intl.NumberFormat(locale);
    return {
      value: (v: number) => number.format(v),
      compact: new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }),
      percent: new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }),
    };
  }, [locale]);
}
const toNumber = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0));

/* ═══ Légende ═══════════════════════════════════════════════════════════ */

export interface ChartLegendItem {
  key: string;
  label: string;
  color: string;
  /** La clé imite la marque : trait pour une ligne, carré pour une barre ou une part. */
  shape: "line" | "rect";
}

export interface ChartLegendProps extends React.HTMLAttributes<HTMLUListElement> {
  items: ChartLegendItem[];
  /** Clés des séries masquées. */
  hiddenKeys?: ReadonlySet<string>;
  /** Rend les entrées cliquables (masquer / afficher une série). */
  onToggleSeries?: (key: string) => void;
}

/**
 * Légende HTML : toujours présente à partir de deux séries, pour que
 * l'identité ne repose jamais sur la seule couleur. Texte en encre du thème,
 * la couleur n'habille que la clé.
 */
export function ChartLegend({ items, hiddenKeys: hidden, onToggleSeries: onToggle, className, ...props }: ChartLegendProps) {
  const visibleCount = items.filter((i) => !hidden?.has(i.key)).length;
  return (
    <ul className={cn("ui-chart__legend", className)} {...props}>
      {items.map((item) => {
        const off = hidden?.has(item.key) ?? false;
        const key = <span className="ui-chart__key" data-shape={item.shape} style={{ background: item.color }} aria-hidden="true" />;
        return (
          <li key={item.key}>
            {onToggle ? (
              <button
                type="button"
                className="ui-chart__legend-item"
                aria-pressed={!off}
                // La dernière série visible ne se masque pas : un graphique vide n'apprend rien.
                disabled={!off && visibleCount <= 1}
                onClick={() => onToggle(item.key)}
              >
                {key}
                {item.label}
              </button>
            ) : (
              <span className="ui-chart__legend-item">
                {key}
                {item.label}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/* ═══ Vue tableau ═══════════════════════════════════════════════════════ */

export interface ChartDataTableProps {
  caption: string;
  columns: { key: string; label: string; numeric?: boolean }[];
  rows: Record<string, React.ReactNode>[];
  className?: string;
}

/** Jumeau tabulaire d'un graphique : toutes les valeurs, sans survol. */
export function ChartDataTable({ caption, columns, rows, className }: ChartDataTableProps) {
  return (
    <Table density="compact" containerClassName={className}>
      <TableCaption>{caption}</TableCaption>
      <TableHeader>
        <TableRow>
          {columns.map((c) => (
            <TableHead key={c.key} numeric={c.numeric}>{c.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={i}>
            {columns.map((c) => (
              <TableCell key={c.key} numeric={c.numeric}>{r[c.key]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/* ═══ Infobulle ═════════════════════════════════════════════════════════ */

interface TipRow {
  color: string;
  label: string;
  value: string;
  shape: "line" | "rect";
}

/**
 * Contenu de l'infobulle, construit en DOM avec textContent : les libellés
 * viennent des données (en-têtes CSV, API) et ne passent jamais par innerHTML.
 * La valeur mène, le libellé suit.
 */
function tipContent(header: string | null, rows: TipRow[]): HTMLElement {
  const root = document.createElement("div");
  root.className = "ui-chart-tip";
  if (header) {
    const h = document.createElement("div");
    h.className = "ui-chart-tip__header";
    h.textContent = header;
    root.append(h);
  }
  for (const r of rows) {
    const row = document.createElement("div");
    row.className = "ui-chart-tip__row";
    const key = document.createElement("span");
    key.className = "ui-chart__key";
    key.dataset.shape = r.shape;
    key.style.background = r.color;
    const value = document.createElement("strong");
    value.className = "ui-chart-tip__value";
    value.textContent = r.value;
    const label = document.createElement("span");
    label.className = "ui-chart-tip__label";
    label.textContent = r.label;
    row.append(key, value, label);
    root.append(row);
  }
  return root;
}

/** Habillage commun : l'infobulle ECharts est nue, `.ui-chart-tip` porte le style. */
const tooltipBase = {
  confine: true,
  className: "ui-chart-tooltip",
  backgroundColor: "transparent",
  borderWidth: 0,
  padding: 0,
  extraCssText: "box-shadow: none;",
  transitionDuration: 0.15,
};

/* ═══ Cadre commun ═════════════════════════════════════════════════════ */

export interface ChartSeries<T> {
  /** Colonne de `data` qui porte les valeurs. */
  key: Extract<keyof T, string>;
  label: string;
  /**
   * Emplacement de la palette (1-8), `var(--ui-…)` ou couleur CSS.
   * Par défaut, l'ordre de déclaration : la couleur suit la série, jamais son rang.
   */
  color?: number | string;
}

interface BaseChartProps {
  /** Nom accessible du graphique et légende de sa vue tableau. */
  title: string;
  /** Hauteur du tracé, axes compris. */
  height?: number;
  /** Format des valeurs (infobulle, étiquettes, tableau). Nombres français par défaut. */
  valueFormatter?: (value: number) => string;
  /** Légende ; affichée d'office à partir de deux séries. */
  legend?: boolean;
  /** `table` remplace le tracé par le tableau des données. */
  view?: "chart" | "table";
  loading?: boolean;
  /** Hachures en plus de la couleur (impression, daltonisme complet). */
  texture?: boolean;
  renderer?: "svg" | "canvas";
  className?: string;
}

interface FrameProps {
  title: string;
  legend: React.ReactNode;
  view: "chart" | "table";
  table: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** Figure : légende au-dessus, tracé (ou tableau) ; le tableau reste lu par les lecteurs d'écran. */
function ChartFrame({ title, legend, view, table, className, children }: FrameProps) {
  return (
    <figure className={cn("ui-chart", className)} aria-label={title}>
      {legend}
      {view === "table" ? table : children}
      {view === "chart" && <div className="ui-sr-only">{table}</div>}
    </figure>
  );
}

function useHidden() {
  const [hidden, setHidden] = React.useState<ReadonlySet<string>>(new Set());
  const toggle = React.useCallback(
    (key: string) =>
      setHidden((prev) => {
        const next = new Set(prev);
        next.has(key) ? next.delete(key) : next.add(key);
        return next;
      }),
    [],
  );
  return [hidden, toggle] as const;
}

/**
 * Parcours au clavier : flèches gauche / droite (ou haut / bas), Début, Fin ;
 * l'infobulle suit le point actif, Échap la referme.
 */
function useKeyboardTip(count: number) {
  const chartRef = React.useRef<EChartsType | null>(null);
  const index = React.useRef(-1);
  const show = (i: number) => {
    index.current = i;
    chartRef.current?.dispatchAction({ type: "showTip", seriesIndex: 0, dataIndex: i });
  };
  const hide = () => {
    index.current = -1;
    chartRef.current?.dispatchAction({ type: "hideTip" });
  };
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (count === 0) return;
    const i = index.current;
    const moves: Record<string, number> = {
      ArrowRight: Math.min(i + 1, count - 1),
      ArrowDown: Math.min(i + 1, count - 1),
      ArrowLeft: Math.max(i - 1, 0),
      ArrowUp: Math.max(i - 1, 0),
      Home: 0,
      End: count - 1,
    };
    if (event.key in moves) {
      event.preventDefault();
      show(moves[event.key]);
    } else if (event.key === "Escape") {
      hide();
    }
  };
  return { onInit: (c: EChartsType) => (chartRef.current = c), onKeyDown, onBlur: hide };
}

/** Textes des graphiques, pour le catalogue de langue. */
export interface ChartLabels {
  /** Colonne des abscisses du tableau. « Catégorie ». */
  category: string;
  /** Nom de la légende. « Légende : Chiffre d'affaires ». */
  legend: (title: string) => string;
  /** Consigne lue avec le nom du tracé. */
  keyboardHint: string;
  /** Rôle annoncé du tracé (`aria-roledescription`). « graphique ». */
  roleDescription: string;
  /** Centre de l'anneau. « Total ». */
  total: string;
  /** Regroupement des petites parts de l'anneau. « Autres ». */
  other: string;
  /** Colonnes du tableau de l'anneau. « Libellé », « Valeur », « Part ». */
  label: string;
  value: string;
  share: string;
}
export const CHART_LABELS: ChartLabels = {
  category: "Catégorie",
  legend: (title) => `Légende : ${title}`,
  keyboardHint: "Flèches pour parcourir les valeurs ; les données complètes sont dans le tableau qui suit.",
  roleDescription: "graphique",
  total: "Total",
  other: "Autres",
  label: "Libellé",
  value: "Valeur",
  share: "Part",
};

/* ═══ Lignes et aires ═══════════════════════════════════════════════════ */

export interface LineChartProps<T extends Record<string, unknown>> extends BaseChartProps {
  data: T[];
  /** Colonne des abscisses (dates, mois, catégories ordonnées). */
  x: Extract<keyof T, string>;
  /** Intitulé de la colonne des abscisses dans le tableau (« Catégorie » par défaut). */
  xLabel?: string;
  xFormatter?: (value: T[Extract<keyof T, string>]) => string;
  series: ChartSeries<T>[];
  /** Lavis à 10 % sous chaque ligne. */
  area?: boolean;
  /** Empile les séries (aires cumulées). */
  stacked?: boolean;
  curve?: "linear" | "smooth";
  /**
   * Étiquette en bout de ligne : la valeur pour une série seule, le nom de la
   * série jusqu'à quatre. Les étiquettes qui se chevauchent sont masquées.
   */
  directLabels?: boolean;
}

/**
 * Courbes : traits de 2 px, réticule vertical qui trouve l'abscisse, une
 * infobulle pour toutes les séries, lavis à 10 % en mode aire.
 */
export function LineChart<T extends Record<string, unknown>>({
  data,
  x,
  xLabel: xLabelProp,
  xFormatter,
  series,
  area,
  stacked,
  curve = "linear",
  directLabels,
  title,
  height = 280,
  valueFormatter: valueFormatterProp,
  legend,
  view = "chart",
  loading,
  texture,
  renderer,
  className,
}: LineChartProps<T>) {
  const labels = useMessages("chart", CHART_LABELS);
  const formats = useChartFormats();
  const valueFormatter = valueFormatterProp ?? formats.value;
  const xLabel = xLabelProp ?? labels.category;
  const [hidden, toggle] = useHidden();
  const plotRef = React.useRef<HTMLDivElement>(null);
  const keyboard = useKeyboardTip(data.length);
  const fmtX = React.useCallback((v: unknown) => (xFormatter ? xFormatter(v as T[Extract<keyof T, string>]) : String(v)), [xFormatter]);
  const showLegend = legend ?? series.length >= 2;
  const showDirect = directLabels ?? series.length <= 4;

  const option = React.useCallback(
    (t: ChartTokens): ChartOption => {
      const colors = series.map((s, i) => resolveSeriesColor(s.color, i, t, plotRef.current));
      const visible = series.filter((s) => !hidden.has(s.key));
      const single = series.length === 1;
      const last = data[data.length - 1];
      const longest = Math.max(0, ...visible.map((s) => (single ? valueFormatter(toNumber(last?.[s.key])) : s.label).length));
      return {
        grid: {
          left: 4,
          right: showDirect ? Math.min(160, longest * 7 + 20) : 12,
          top: 12,
          bottom: 4,
          outerBoundsMode: "same",
          outerBoundsContain: "axisLabel",
        },
        xAxis: { type: "category", boundaryGap: false, data: data.map((r) => fmtX(r[x])) },
        yAxis: { type: "value", axisLabel: { formatter: (v: number) => formats.compact.format(v) } },
        tooltip: {
          ...tooltipBase,
          trigger: "axis",
          axisPointer: { type: "line", lineStyle: { color: t.fg3, width: 1, type: "solid" } },
          formatter: (params: unknown) => {
            const list = params as { seriesId: string; seriesName: string; value: number; color: string; dataIndex: number }[];
            const header = list.length ? fmtX(data[list[0].dataIndex]?.[x]) : null;
            return tipContent(
              header,
              list.map((p) => ({ color: p.color, label: p.seriesName, value: valueFormatter(toNumber(p.value)), shape: "line" })),
            );
          },
        },
        series: visible.map((s) => {
          const i = series.indexOf(s);
          return {
            id: s.key,
            name: s.label,
            type: "line",
            data: data.map((r) => toNumber(r[s.key])),
            color: colors[i],
            stack: stacked ? "total" : undefined,
            smooth: curve === "smooth" ? 0.35 : false,
            showSymbol: false,
            symbolSize: 8,
            // Anneau de 2 px couleur du fond autour du point survolé.
            itemStyle: { color: colors[i], borderColor: t.surface, borderWidth: 2 },
            lineStyle: { width: 2, color: colors[i] },
            areaStyle: area || stacked ? { color: withAlpha(colors[i], stacked ? 0.16 : 0.1) } : undefined,
            emphasis: { focus: "none" },
            endLabel: showDirect
              ? {
                  show: true,
                  distance: 8,
                  color: t.fg2,
                  fontSize: 12,
                  fontFamily: t.fontFamily,
                  formatter: single ? (p: { value: number }) => valueFormatter(toNumber(p.value)) : s.label,
                }
              : undefined,
            labelLayout: { hideOverlap: true },
          };
        }),
      };
    },
    [data, x, series, hidden, area, stacked, curve, showDirect, valueFormatter, fmtX, formats],
  );


  const columns = [{ key: "__x", label: xLabel }, ...series.map((s) => ({ key: s.key, label: s.label, numeric: true }))];
  const rows = data.map((r) => ({
    __x: fmtX(r[x]),
    ...Object.fromEntries(series.map((s) => [s.key, valueFormatter(toNumber(r[s.key]))])),
  }));

  return (
    <ChartFrame
      title={title}
      view={view}
      className={className}
      legend={
        showLegend && (
          <ChartLegend
            aria-label={labels.legend(title)}
            items={series.map((s, i) => ({ key: s.key, label: s.label, color: seriesCssColor(s.color, i), shape: area || stacked ? "rect" : "line" }))}
            hiddenKeys={hidden}
            onToggleSeries={toggle}
          />
        )
      }
      table={<ChartDataTable caption={title} columns={columns} rows={rows} />}
    >
      <Chart
        ref={plotRef}
        option={option}
        height={height}
        loading={loading}
        texture={texture}
        renderer={renderer}
        role="img"
        aria-roledescription={labels.roleDescription}
        aria-label={`${title}. ${labels.keyboardHint}`}
        tabIndex={0}
        {...keyboard}
      />
    </ChartFrame>
  );
}

/* ═══ Barres ════════════════════════════════════════════════════════════ */

export interface BarChartProps<T extends Record<string, unknown>> extends BaseChartProps {
  data: T[];
  x: Extract<keyof T, string>;
  xLabel?: string;
  xFormatter?: (value: T[Extract<keyof T, string>]) => string;
  series: ChartSeries<T>[];
  stacked?: boolean;
  /** Barres horizontales : libellés longs, classements. */
  horizontal?: boolean;
}

/**
 * Barres : 24 px d'épaisseur au plus, bout arrondi de 4 px côté donnée et
 * carré côté ligne de base, écart de 2 px couleur du fond entre segments
 * empilés. Chaque barre porte sa propre infobulle.
 */
export function BarChart<T extends Record<string, unknown>>({
  data,
  x,
  xLabel: xLabelProp,
  xFormatter,
  series,
  stacked,
  horizontal,
  title,
  height = 280,
  valueFormatter: valueFormatterProp,
  legend,
  view = "chart",
  loading,
  texture,
  renderer,
  className,
}: BarChartProps<T>) {
  const labels = useMessages("chart", CHART_LABELS);
  const formats = useChartFormats();
  const valueFormatter = valueFormatterProp ?? formats.value;
  const xLabel = xLabelProp ?? labels.category;
  const [hidden, toggle] = useHidden();
  const plotRef = React.useRef<HTMLDivElement>(null);
  const keyboard = useKeyboardTip(data.length);
  const fmtX = React.useCallback((v: unknown) => (xFormatter ? xFormatter(v as T[Extract<keyof T, string>]) : String(v)), [xFormatter]);
  const showLegend = legend ?? series.length >= 2;
  const showTexture = texture ?? prefersForcedColors();

  const option = React.useCallback(
    (t: ChartTokens, size: ChartSize): ChartOption => {
      const colors = series.map((s, i) => resolveSeriesColor(s.color, i, t, plotRef.current));
      const visible = series.filter((s) => !hidden.has(s.key));
      // Toutes les catégories sont nommées ; trop longues, elles se tronquent à la largeur de bande.
      const band = horizontal ? 120 : Math.max(32, ((size.width || 320) - 56) / Math.max(1, data.length) - 6);
      const topKey = visible[visible.length - 1]?.key;
      const end = horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0];
      const category = {
        type: "category",
        data: data.map((r) => fmtX(r[x])),
        axisLabel: { interval: 0, width: band, overflow: "truncate" },
      };
      const value = { type: "value", axisLabel: { formatter: (v: number) => formats.compact.format(v) } };
      return {
        grid: { left: 4, right: 12, top: 12, bottom: 4, outerBoundsMode: "same", outerBoundsContain: "axisLabel" },
        xAxis: horizontal ? value : category,
        yAxis: horizontal ? { ...category, inverse: true } : value,
        tooltip: {
          ...tooltipBase,
          trigger: "item",
          formatter: (params: unknown) => {
            const p = params as { seriesName: string; value: number; color: string; dataIndex: number };
            return tipContent(fmtX(data[p.dataIndex]?.[x]), [
              { color: p.color, label: p.seriesName, value: valueFormatter(toNumber(p.value)), shape: "rect" },
            ]);
          },
        },
        series: visible.map((s) => {
          const i = series.indexOf(s);
          const rounded = !stacked || s.key === topKey;
          return {
            id: s.key,
            name: s.label,
            type: "bar",
            data: data.map((r) => toNumber(r[s.key])),
            color: colors[i],
            stack: stacked ? "total" : undefined,
            barMaxWidth: 24,
            barGap: "20%",
            barCategoryGap: "36%",
            itemStyle: {
              color: colors[i],
              borderRadius: rounded ? end : 0,
              // Écart de 2 px entre segments empilés : 1 px de fond de part et d'autre.
              borderColor: stacked ? t.surface : undefined,
              borderWidth: stacked ? 1 : 0,
              decal: showTexture ? chartDecal(i, t) : undefined,
            },
            emphasis: { focus: "none", itemStyle: { opacity: 0.82 } },
          };
        }),
      };
    },
    [data, x, series, hidden, stacked, horizontal, valueFormatter, fmtX, showTexture, formats],
  );


  const columns = [{ key: "__x", label: xLabel }, ...series.map((s) => ({ key: s.key, label: s.label, numeric: true }))];
  const rows = data.map((r) => ({
    __x: fmtX(r[x]),
    ...Object.fromEntries(series.map((s) => [s.key, valueFormatter(toNumber(r[s.key]))])),
  }));

  return (
    <ChartFrame
      title={title}
      view={view}
      className={className}
      legend={
        showLegend && (
          <ChartLegend
            aria-label={labels.legend(title)}
            items={series.map((s, i) => ({ key: s.key, label: s.label, color: seriesCssColor(s.color, i), shape: "rect" }))}
            hiddenKeys={hidden}
            onToggleSeries={toggle}
          />
        )
      }
      table={<ChartDataTable caption={title} columns={columns} rows={rows} />}
    >
      <Chart
        ref={plotRef}
        option={option}
        height={height}
        loading={loading}
        texture={showTexture}
        renderer={renderer}
        role="img"
        aria-roledescription={labels.roleDescription}
        aria-label={`${title}. ${labels.keyboardHint}`}
        tabIndex={0}
        {...keyboard}
      />
    </ChartFrame>
  );
}


/* ═══ Anneau ════════════════════════════════════════════════════════════ */

export interface DonutDatum {
  label: string;
  value: number;
  /** Emplacement de la palette (1-8), `var(--ui-…)` ou couleur CSS. */
  color?: number | string;
}

export interface DonutChartProps extends BaseChartProps {
  /** Parties d'un tout. Au-delà de six, les dernières se regroupent dans « Autres ». */
  data: DonutDatum[];
  /** Libellé sous le total, au centre (« Total » par défaut). */
  centerLabel?: string;
  /** Valeur au centre ; le total des parts visibles par défaut. */
  centerValue?: string;
  /** Libellé du regroupement des petites parts. */
  otherLabel?: string;
}

const MAX_SLICES = 6;

/**
 * Anneau : la part d'un tout, en un coup d'œil, six parts au plus. Pour
 * comparer des valeurs proches, préférer des barres. Écart de 2 px couleur
 * du fond entre les parts, total au centre.
 */
export function DonutChart({
  data,
  centerLabel: centerLabelProp,
  centerValue,
  otherLabel: otherLabelProp,
  title,
  height = 240,
  valueFormatter: valueFormatterProp,
  legend = true,
  view = "chart",
  loading,
  texture,
  renderer,
  className,
}: DonutChartProps) {
  const labels = useMessages("chart", CHART_LABELS);
  const formats = useChartFormats();
  const valueFormatter = valueFormatterProp ?? formats.value;
  const centerLabel = centerLabelProp ?? labels.total;
  const otherLabel = otherLabelProp ?? labels.other;
  const [hidden, toggle] = useHidden();
  const plotRef = React.useRef<HTMLDivElement>(null);
  const showTexture = texture ?? prefersForcedColors();

  // Regroupement : les cinq premières parts, puis « Autres ». L'ordre est celui des données.
  const slices = React.useMemo(() => {
    if (data.length <= MAX_SLICES) return data.map((d, i) => ({ ...d, key: `${i}:${d.label}`, other: false }));
    const head = data.slice(0, MAX_SLICES - 1).map((d, i) => ({ ...d, key: `${i}:${d.label}`, other: false }));
    const rest = data.slice(MAX_SLICES - 1).reduce((sum, d) => sum + d.value, 0);
    return [...head, { label: otherLabel, value: rest, key: "__other", other: true, color: undefined }];
  }, [data, otherLabel]);

  const visible = slices.filter((s) => !hidden.has(s.key));
  const total = visible.reduce((sum, s) => sum + s.value, 0);
  const keyboard = useKeyboardTip(visible.length);
  // L'espace fine insécable d'Intl (U+202F) ne fait que 0,13 em dans Inter : en grand et resserré,
  // « 1 241 000 » se lit « 1241000 ». L'espace insécable ordinaire garde les milliers séparés.
  const center = (centerValue ?? valueFormatter(total)).replace(/\u202f/g, "\u00a0");
  // Le total tient dans l'ouverture : diamètre intérieur ≈ 64 % de la hauteur.
  const centerSize = Math.round(Math.min(26, Math.max(14, (height * 0.64 * 0.8) / (center.length * 0.56))));

  const option = React.useCallback(
    (t: ChartTokens): ChartOption => ({
      tooltip: {
        ...tooltipBase,
        trigger: "item",
        formatter: (params: unknown) => {
          const p = params as { name: string; value: number; color: string; percent: number };
          return tipContent(p.name, [
            { color: p.color, label: formats.percent.format(p.percent / 100), value: valueFormatter(p.value), shape: "rect" },
          ]);
        },
      },
      series: [
        {
          id: "donut",
          type: "pie",
          radius: ["64%", "86%"],
          center: ["50%", "50%"],
          label: { show: false },
          labelLine: { show: false },
          emphasis: { scale: true, scaleSize: 4, label: { show: false } },
          itemStyle: { borderColor: t.surface, borderWidth: 2, borderRadius: 4 },
          data: visible.map((s) => {
            const i = slices.indexOf(s);
            const color = s.other ? t.neutral : resolveSeriesColor(s.color, i, t, plotRef.current);
            return { name: s.label, value: s.value, itemStyle: { color, decal: showTexture ? chartDecal(i, t) : undefined } };
          }),
        },
      ],
    }),
    [slices, visible, valueFormatter, showTexture, formats],
  );


  const rows = slices.map((s) => ({
    label: s.label,
    value: valueFormatter(s.value),
    share: formats.percent.format(s.value / (slices.reduce((sum, d) => sum + d.value, 0) || 1)),
  }));

  return (
    <ChartFrame
      title={title}
      view={view}
      className={className}
      legend={
        legend && (
          <ChartLegend
            aria-label={labels.legend(title)}
            items={slices.map((s, i) => ({ key: s.key, label: s.label, color: s.other ? "var(--ui-outline)" : seriesCssColor(s.color, i), shape: "rect" }))}
            hiddenKeys={hidden}
            onToggleSeries={toggle}
          />
        )
      }
      table={
        <ChartDataTable
          caption={title}
          columns={[
            { key: "label", label: labels.label },
            { key: "value", label: labels.value, numeric: true },
            { key: "share", label: labels.share, numeric: true },
          ]}
          rows={rows}
        />
      }
    >
      <div className="ui-chart__donut">
        <Chart
          ref={plotRef}
          option={option}
          height={height}
          loading={loading}
          texture={showTexture}
          renderer={renderer}
          role="img"
          aria-roledescription={labels.roleDescription}
          aria-label={`${title}. ${labels.keyboardHint}`}
          tabIndex={0}
          {...keyboard}
        />
        <div className="ui-chart__center" aria-hidden="true">
          <span className="ui-chart__center-value" style={{ fontSize: centerSize }}>{center}</span>
          <span className="ui-chart__center-label">{centerLabel}</span>
        </div>
      </div>
    </ChartFrame>
  );
}
