import * as React from "react";
import { cn } from "../../utils/cn";
import { Sparkline } from "./Sparkline";
import { useLocale, useMessages } from "../../i18n/LocaleProvider";

/**
 * Tuile de chiffre clé. Contrat :
 * - `label` : casse de phrase, sans deux-points (« Chiffre d'affaires ») ;
 * - `value` : grand, 600, chiffres proportionnels, compacté en fr-FR à partir
 *   de 10 000 (« 12,9 k », « 4,2 M ») ; la valeur exacte reste annoncée ;
 * - `delta` (facultatif) : variation signée et sa période (« vs mois
 *   dernier ») ; sa couleur croise le sens et `positiveIsGood` (une baisse
 *   des dépenses est une bonne nouvelle), toujours doublée d'une flèche et
 *   du texte, jamais la couleur seule ;
 * - `trend` (facultatif) : `Sparkline` de 12 points, période courante en accent.
 *
 * `size="hero"` (valeur ≥ 48 px) : **une seule tuile héros par vue**, celle
 * du chiffre qui ouvre le tableau de bord.
 */
export type StatSize = "default" | "hero";
export type StatVariant = "filled" | "outlined" | "plain";
export type StatDeltaTone = "ok" | "err" | "neu";

/** Textes annoncés avec la variation, surchargeables. */
export interface StatLabels {
  increase: string;
  decrease: string;
  unchanged: string;
  favorable: string;
  unfavorable: string;
  /** Période de la tendance par défaut, au pluriel. « mois ». */
  trendPeriod: string;
}

export const STAT_LABELS: StatLabels = {
  increase: "Hausse de",
  decrease: "Baisse de",
  unchanged: "Stable",
  favorable: "favorable",
  unfavorable: "défavorable",
  trendPeriod: "mois",
};

export interface StatProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Ce que mesure le chiffre, en casse de phrase, sans deux-points. */
  label: React.ReactNode;
  /** Nombre (formaté en fr-FR) ou contenu déjà formaté (« 1 h 12 »). */
  value: React.ReactNode;
  /** Options `Intl.NumberFormat` de la valeur : devise, pourcentage, unité, décimales. */
  format?: Intl.NumberFormatOptions;
  /**
   * Compactage : `auto` (défaut) à partir de 10 000 (« 12,9 k »), `true`
   * toujours, `false` jamais. La valeur exacte reste dans l'infobulle et
   * pour les lecteurs d'écran.
   */
  compact?: boolean | "auto";
  /**
   * Variation signée. Par défaut une fraction affichée en pourcentage
   * (0,124 → « +12,4 % ») ; `deltaFormat` pour une variation absolue.
   */
  delta?: number;
  deltaFormat?: Intl.NumberFormatOptions;
  /** Période de comparaison : « vs mois dernier ». */
  deltaLabel?: React.ReactNode;
  /** Une hausse est-elle une bonne nouvelle ? `false` pour des dépenses, un délai, un taux d'erreur. */
  positiveIsGood?: boolean;
  /** Série de la tendance (12 points conseillés) ou `Sparkline` déjà configurée. */
  trend?: number[] | React.ReactElement;
  /** Texte de remplacement de la tendance ; généré sinon. */
  trendLabel?: string;
  /** Unité de période de la tendance, au pluriel (« mois » par défaut). */
  trendPeriod?: string;
  /** Icône discrète en haut à droite. */
  icon?: React.ReactNode;
  /** `hero` : valeur de 52 px, une seule par vue. */
  size?: StatSize;
  /** `filled` (défaut) : conteneur tonal. `outlined` : panneau à filet. `plain` : sans surface (dans une carte). */
  variant?: StatVariant;
  labels?: Partial<StatLabels>;
  /** Contenu libre sous la tuile (lien « Voir le rapport »…). */
  children?: React.ReactNode;
}

/** Signe moins typographique (U+2212) plutôt que le trait d'union d'Intl. */
const typographicMinus = (text: string) => text.replace(/-/g, "\u2212");

function formatValue(value: number, format: Intl.NumberFormatOptions | undefined, compact: boolean | "auto", locale: string) {
  const full = new Intl.NumberFormat(locale, format);
  const shouldCompact = compact === true || (compact === "auto" && Math.abs(value) >= 10_000);
  const formatter = shouldCompact
    ? new Intl.NumberFormat(locale, {
        ...format,
        notation: "compact",
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      })
    : full;
  return { parts: formatter.formatToParts(value), full: full.format(value), compacted: shouldCompact };
}

const AFFIXES = new Set<string>(["currency", "unit", "percentSign"]);

function renderParts(parts: Intl.NumberFormatPart[]) {
  return parts.map((part, i) =>
    AFFIXES.has(part.type) ? (
      <span key={i} className="ui-stat__affix">
        {part.value}
      </span>
    ) : part.type === "minusSign" ? (
      "\u2212"
    ) : (
      part.value
    ),
  );
}

const ArrowIcon = ({ direction }: { direction: "up" | "down" | "flat" }) => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
    <path
      d={direction === "up" ? "M8 12.5v-9m-4 4 4-4 4 4" : direction === "down" ? "M8 3.5v9m-4-4 4 4 4-4" : "M3.5 8h9"}
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Stat = React.forwardRef<HTMLDivElement, StatProps>(function Stat(
  {
    label,
    value,
    format,
    compact = "auto",
    delta,
    deltaFormat,
    deltaLabel,
    positiveIsGood = true,
    trend,
    trendLabel,
    trendPeriod: trendPeriodProp,
    icon,
    size = "default",
    variant = "filled",
    labels: labelsProp,
    className,
    children,
    ...props
  },
  ref,
) {
  const labels = { ...useMessages("stat", STAT_LABELS), ...labelsProp };
  const locale = useLocale();
  const trendPeriod = trendPeriodProp ?? labels.trendPeriod;
  const labelId = React.useId();

  /* ── Valeur ── */
  let valueNode: React.ReactNode = value;
  let valueTitle: string | undefined;
  if (typeof value === "number" && Number.isFinite(value)) {
    const formatted = formatValue(value, format, compact, locale);
    const fullText = typographicMinus(formatted.full);
    if (formatted.compacted) {
      valueTitle = fullText;
      valueNode = (
        <>
          <span aria-hidden="true">{renderParts(formatted.parts)}</span>
          <span className="ui-sr-only">{fullText}</span>
        </>
      );
    } else {
      valueNode = renderParts(formatted.parts);
    }
  }

  /* ── Variation ── */
  let deltaNode: React.ReactNode = null;
  if (typeof delta === "number" && Number.isFinite(delta)) {
    const direction = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
    const good = direction === "flat" ? null : (direction === "up") === positiveIsGood;
    const tone: StatDeltaTone = good == null ? "neu" : good ? "ok" : "err";
    const options: Intl.NumberFormatOptions = { style: "percent", maximumFractionDigits: 1, ...deltaFormat };
    const shown = typographicMinus(new Intl.NumberFormat(locale, { ...options, signDisplay: "exceptZero" }).format(delta));
    const magnitude = new Intl.NumberFormat(locale, { ...options, signDisplay: "never" }).format(Math.abs(delta));
    const spoken =
      direction === "flat"
        ? labels.unchanged
        : `${direction === "up" ? labels.increase : labels.decrease} ${magnitude}, ${good ? labels.favorable : labels.unfavorable}`;
    deltaNode = (
      <div className="ui-stat__delta">
        <span className="ui-stat__delta-chip" data-tone={tone} data-direction={direction}>
          <ArrowIcon direction={direction} />
          <span aria-hidden="true">{shown}</span>
          <span className="ui-sr-only">{spoken}</span>
        </span>
        {deltaLabel != null && <span className="ui-stat__delta-label">{deltaLabel}</span>}
      </div>
    );
  }

  /* ── Tendance ── */
  let trendNode: React.ReactNode = null;
  if (Array.isArray(trend)) {
    const full = new Intl.NumberFormat(locale, format);
    trendNode = (
      <Sparkline
        data={trend}
        height={size === "hero" ? 56 : 36}
        label={trendLabel}
        period={trendPeriod}
        format={(v) => typographicMinus(full.format(v))}
      />
    );
  } else if (trend != null) {
    trendNode = trend;
  }

  return (
    <div
      ref={ref}
      role="group"
      aria-labelledby={labelId}
      data-slot="stat"
      data-size={size}
      data-variant={variant}
      className={cn("ui-stat", className)}
      {...props}
    >
      <div className="ui-stat__header">
        <div id={labelId} className="ui-stat__label">
          {label}
        </div>
        {icon != null && (
          <span className="ui-stat__icon" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>
      <div className="ui-stat__value" title={valueTitle}>
        {valueNode}
      </div>
      {deltaNode}
      {trendNode != null && <div className="ui-stat__trend">{trendNode}</div>}
      {children}
    </div>
  );
});

export interface StatGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Largeur minimale d'une tuile avant le passage à la ligne (220 px par défaut). */
  minTileWidth?: number | string;
}

/**
 * Rangée de tuiles : autant de colonnes que la largeur en permet, chaque
 * tuile d'au moins `minTileWidth`, sur une ou plusieurs lignes. Une tuile
 * héros s'étale sur deux colonnes quand la place le permet.
 */
export const StatGroup = React.forwardRef<HTMLDivElement, StatGroupProps>(function StatGroup(
  { className, minTileWidth, style, ...props },
  ref,
) {
  const min = typeof minTileWidth === "number" ? `${minTileWidth}px` : minTileWidth;
  return (
    <div
      ref={ref}
      data-slot="stat-group"
      className={cn("ui-stat-group", className)}
      style={min ? ({ "--ui-stat-min": min, ...style } as React.CSSProperties) : style}
      {...props}
    />
  );
});
