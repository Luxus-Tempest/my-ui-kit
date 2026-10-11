import * as React from "react";
import { cn } from "../../utils/cn";

/**
 * Micro-graphique de tendance, en SVG pur (sans ECharts) : trait de 2 px
 * arrondi dans une teinte effacée, lavis à 10 % jusqu'à la ligne de base
 * implicite (le bas du cadre, non tracé), période courante (dernier point)
 * en accent, point final de 8 px détouré d'un anneau de 2 px de la couleur
 * du fond. Variante `bars` : barres séparées de 2 px, la dernière en accent.
 *
 * Le dessin est masqué aux technologies d'assistance ; une phrase le
 * remplace : « Tendance : de 120 à 148 sur 12 mois » (ou `label`).
 *
 * Couleurs : `color` (accent, `--ui-c1` par défaut) et le fond derrière le
 * tracé, `--ui-sparkline-surface` (panneau par défaut ; `Stat` le pose).
 */
export interface SparklineProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children" | "color"> {
  /** Valeurs dans l'ordre chronologique ; la dernière est la période courante. */
  data: number[];
  /** `line` (défaut) ou `bars`. */
  variant?: "line" | "bars";
  /** `linear` (défaut, comme LineChart) ou `smooth` (monotone, sans dépassement). */
  curve?: "linear" | "smooth";
  /** Largeur fixe en pixels. Sans elle, le tracé prend toute la largeur de son conteneur. */
  width?: number;
  /** Hauteur en pixels (32 par défaut). */
  height?: number;
  /** Couleur d'accent, toute couleur CSS (`var(--ui-c1)` par défaut). */
  color?: string;
  /** Inclure zéro dans l'échelle d'une ligne (les barres partent toujours de zéro). */
  includeZero?: boolean;
  /** Texte de remplacement pour les lecteurs d'écran ; généré sinon. */
  label?: string;
  /** Unité de période, au pluriel, pour le texte généré : « mois », « jours », « semaines ». */
  period?: string;
  /** Format des valeurs du texte généré (fr-FR par défaut). */
  format?: (value: number) => string;
}

const defaultFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
const FALLBACK_WIDTH = 120;
/** Réserve autour du tracé : rayon du point final (4) + anneau (2). */
const INSET = 6;

const useIsoLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;
const r2 = (n: number) => Math.round(n * 100) / 100;

interface Point {
  x: number;
  y: number;
}

/** Segments « C … » d'une interpolation monotone (Fritsch–Carlson) : ni bosse ni creux inventés. */
function monotoneSegments(points: Point[]): string[] {
  const n = points.length;
  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i++) slopes.push((points[i + 1]!.y - points[i]!.y) / (points[i + 1]!.x - points[i]!.x));
  const tangents = points.map((_, i) => {
    if (i === 0) return slopes[0]!;
    if (i === n - 1) return slopes[n - 2]!;
    const a = slopes[i - 1]!;
    const b = slopes[i]!;
    return a * b <= 0 ? 0 : (a + b) / 2;
  });
  for (let i = 0; i < n - 1; i++) {
    const s = slopes[i]!;
    if (s === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      continue;
    }
    const a = tangents[i]! / s;
    const b = tangents[i + 1]! / s;
    const h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      tangents[i] = t * a * s;
      tangents[i + 1] = t * b * s;
    }
  }
  return points.slice(1).map((p, i) => {
    const p0 = points[i]!;
    const dx = (p.x - p0.x) / 3;
    return `C${r2(p0.x + dx)} ${r2(p0.y + tangents[i]! * dx)} ${r2(p.x - dx)} ${r2(p.y - tangents[i + 1]! * dx)} ${r2(p.x)} ${r2(p.y)}`;
  });
}

/** Barre à bout arrondi côté donnée, carrée côté ligne de base. */
function barPath(x: number, width: number, base: number, end: number) {
  const up = end <= base;
  const length = Math.max(1, Math.abs(base - end));
  const tip = up ? base - length : base + length;
  const r = Math.min(2, width / 2, length);
  const dir = up ? 1 : -1;
  return [
    `M${r2(x)} ${r2(base)}`,
    `V${r2(tip + dir * r)}`,
    `Q${r2(x)} ${r2(tip)} ${r2(x + r)} ${r2(tip)}`,
    `H${r2(x + width - r)}`,
    `Q${r2(x + width)} ${r2(tip)} ${r2(x + width)} ${r2(tip + dir * r)}`,
    `V${r2(base)}Z`,
  ].join("");
}

export const Sparkline = React.forwardRef<HTMLSpanElement, SparklineProps>(function Sparkline(
  {
    data,
    variant = "line",
    curve = "linear",
    width,
    height = 32,
    color,
    includeZero = false,
    label,
    period = "périodes",
    format = defaultFormat.format,
    className,
    style,
    ...props
  },
  forwardedRef,
) {
  const ref = React.useRef<HTMLSpanElement>(null);
  React.useImperativeHandle(forwardedRef, () => ref.current as HTMLSpanElement);

  // Largeur fluide : mesurée avant la première peinture, puis suivie.
  const [measured, setMeasured] = React.useState<number | null>(null);
  useIsoLayoutEffect(() => {
    if (width != null) return;
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const next = Math.round(el.clientWidth);
      if (next > 0) setMeasured((prev) => (prev === next ? prev : next));
    };
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [width]);

  const w = width ?? measured ?? FALLBACK_WIDTH;
  const h = height;
  const values = data.filter((v) => Number.isFinite(v));
  const n = values.length;

  const text =
    label ??
    (n === 0
      ? "Tendance : aucune donnée"
      : `Tendance : de ${format(values[0]!)} à ${format(values[n - 1]!)} sur ${n} ${period}`);

  let drawing: React.ReactNode = null;
  if (n > 0 && variant === "bars") {
    const lo = Math.min(0, ...values);
    const hi = Math.max(0, ...values);
    const span = hi - lo || 1;
    const top = 1;
    const y = (v: number) => top + (1 - (v - lo) / span) * (h - top);
    const base = y(0);
    const slot = w / n;
    const barWidth = Math.max(1, Math.min(slot - 2, 24));
    drawing = values.map((v, i) => (
      <path
        key={i}
        className="ui-sparkline__bar"
        data-current={i === n - 1 || undefined}
        d={barPath(i * slot + (slot - barWidth) / 2, barWidth, base, y(v))}
      />
    ));
  } else if (n > 0) {
    let lo = Math.min(...values);
    let hi = Math.max(...values);
    if (includeZero) {
      lo = Math.min(lo, 0);
      hi = Math.max(hi, 0);
    }
    if (hi === lo) {
      hi += 1;
      lo -= 1;
    }
    const left = 1;
    const right = w - INSET;
    const y = (v: number) => INSET + (1 - (v - lo) / (hi - lo)) * (h - 2 * INSET);
    const points = values.map((v, i) => ({ x: n === 1 ? right : left + (i * (right - left)) / (n - 1), y: y(v) }));
    const last = points[n - 1]!;

    if (n > 1) {
      const segments =
        curve === "smooth" ? monotoneSegments(points) : points.slice(1).map((p) => `L${r2(p.x)} ${r2(p.y)}`);
      const start = `M${r2(points[0]!.x)} ${r2(points[0]!.y)}`;
      const line = `${start}${segments.join("")}`;
      const before = points[n - 2]!;
      drawing = (
        <>
          <path className="ui-sparkline__area" d={`${line}L${r2(last.x)} ${h}L${r2(points[0]!.x)} ${h}Z`} />
          <path className="ui-sparkline__line" d={line} />
          <path className="ui-sparkline__current" d={`M${r2(before.x)} ${r2(before.y)}${segments[n - 2]}`} />
        </>
      );
    }
    drawing = (
      <>
        {drawing}
        <circle className="ui-sparkline__ring" cx={r2(last.x)} cy={r2(last.y)} r={6} />
        <circle className="ui-sparkline__dot" cx={r2(last.x)} cy={r2(last.y)} r={4} />
      </>
    );
  }

  return (
    <span
      ref={ref}
      data-slot="sparkline"
      data-variant={variant}
      data-fluid={width == null || undefined}
      className={cn("ui-sparkline", className)}
      style={{
        ...(color ? { "--ui-sparkline-color": color } : null),
        ...(width != null ? { width } : null),
        height: h,
        ...style,
      } as React.CSSProperties}
      {...props}
    >
      <svg
        className="ui-sparkline__svg"
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        aria-hidden="true"
        focusable="false"
      >
        {drawing}
      </svg>
      <span className="ui-sr-only">{text}</span>
    </span>
  );
});
