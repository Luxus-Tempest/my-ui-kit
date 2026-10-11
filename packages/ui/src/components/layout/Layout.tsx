import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../utils/cn";
import { compactStyle, space, type Space } from "../../utils/space";

/* ── Box ─────────────────────────────────────────────────────────────── */

export type Surface = "app" | "panel" | "panel-2" | "card" | "card-2" | "sel";
export type Radius = "xs" | "sm" | "ctl" | "md" | "lg" | "full";
export type Elevation = 1 | 2 | 3 | 4;

export interface BoxProps extends React.HTMLAttributes<HTMLElement> {
  /** Élément rendu (`div` par défaut) : `section`, `ul`, `header`… */
  as?: React.ElementType;
  /** Rend l'enfant unique à la place, en lui passant style et classes. */
  asChild?: boolean;
  p?: Space;
  px?: Space;
  py?: Space;
  /** Fond pris dans les surfaces du thème. */
  bg?: Surface;
  /** Filet `line` (true) ou `line-2`. */
  border?: boolean | "strong";
  radius?: Radius;
  shadow?: Elevation;
}

const RADIUS: Record<Radius, string> = {
  xs: "var(--ui-r-xs)",
  sm: "var(--ui-r-sm)",
  ctl: "var(--ui-r-ctl)",
  md: "var(--ui-r-md)",
  lg: "var(--ui-r-lg)",
  full: "999px",
};

/**
 * Brique de base : une boîte qui ne connaît que les jetons. Toute valeur
 * visuelle passe par une prop typée, jamais par une couleur en dur.
 */
export const Box = React.forwardRef<HTMLElement, BoxProps>(function Box(
  { as: Tag = "div", asChild, p, px, py, bg, border, radius, shadow, style, className, ...props },
  ref,
) {
  const Comp = asChild ? Slot : Tag;
  const boxStyle = compactStyle({
    padding: space(p),
    paddingInline: space(px),
    paddingBlock: space(py),
    background: bg ? `var(--ui-${bg})` : undefined,
    border: border ? `1px solid var(--ui-${border === "strong" ? "line-2" : "line"})` : undefined,
    borderRadius: radius ? RADIUS[radius] : undefined,
    boxShadow: shadow ? `var(--ui-sh${shadow})` : undefined,
    ...style,
  }) as React.CSSProperties;
  return <Comp ref={ref} data-slot="box" className={cn("ui-box", className)} style={boxStyle} {...props} />;
});

/* ── Stack ───────────────────────────────────────────────────────────── */

type Align = "start" | "center" | "end" | "stretch" | "baseline";
type Justify = "start" | "center" | "end" | "between" | "around" | "evenly";

const ALIGN: Record<Align, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline",
};
const JUSTIFY: Record<Justify, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
};

export interface StackProps extends Omit<BoxProps, "border"> {
  /** `column` (défaut) empile ; `row` aligne. */
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  /** Écart entre les enfants, en pas de 4 px. Défaut : 2 (8 px). */
  gap?: Space;
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
  /** Le conteneur prend toute la largeur disponible. */
  full?: boolean;
  border?: BoxProps["border"];
}

/** Empile ou aligne ses enfants avec un écart régulier (flexbox). */
export const Stack = React.forwardRef<HTMLElement, StackProps>(function Stack(
  { direction = "column", gap = 2, align, justify, wrap, full, style, className, ...props },
  ref,
) {
  return (
    <Box
      ref={ref}
      data-slot="stack"
      className={cn("ui-stack", className)}
      style={compactStyle({
        display: "flex",
        flexDirection: direction,
        gap: space(gap),
        alignItems: align ? ALIGN[align] : undefined,
        justifyContent: justify ? JUSTIFY[justify] : undefined,
        flexWrap: wrap ? "wrap" : undefined,
        width: full ? "100%" : undefined,
        ...style,
      })}
      {...props}
    />
  );
});

/** Raccourci : `<Stack direction="row" align="center">`. */
export const HStack = React.forwardRef<HTMLElement, StackProps>(function HStack(props, ref) {
  return <Stack ref={ref} direction="row" align="center" {...props} />;
});

/* ── Grid ────────────────────────────────────────────────────────────── */

export interface GridProps extends BoxProps {
  /** Nombre de colonnes égales, ou un gabarit CSS (`"240px 1fr"`). */
  columns?: number | string;
  /**
   * Grille fluide : autant de colonnes que possible, chacune d'au moins
   * cette largeur. Remplace `columns`. Ex. `minChildWidth={220}`.
   */
  minChildWidth?: number | string;
  gap?: Space;
  rowGap?: Space;
  columnGap?: Space;
  align?: Align;
}

export const Grid = React.forwardRef<HTMLElement, GridProps>(function Grid(
  { columns, minChildWidth, gap = 3, rowGap, columnGap, align, style, className, ...props },
  ref,
) {
  const min = typeof minChildWidth === "number" ? `${minChildWidth}px` : minChildWidth;
  const template = min
    ? `repeat(auto-fill, minmax(min(${min}, 100%), 1fr))`
    : typeof columns === "number"
      ? `repeat(${columns}, minmax(0, 1fr))`
      : columns;
  return (
    <Box
      ref={ref}
      data-slot="grid"
      className={cn("ui-grid", className)}
      style={compactStyle({
        display: "grid",
        gridTemplateColumns: template,
        gap: space(gap),
        rowGap: space(rowGap),
        columnGap: space(columnGap),
        alignItems: align ? ALIGN[align] : undefined,
        ...style,
      })}
      {...props}
    />
  );
});

/* ── Container ───────────────────────────────────────────────────────── */

const CONTAINER: Record<"sm" | "md" | "lg" | "xl", number> = { sm: 640, md: 960, lg: 1200, xl: 1440 };

export interface ContainerProps extends BoxProps {
  /** Largeur maximale : 640 / 960 / 1200 / 1440 px. */
  size?: keyof typeof CONTAINER;
}

/** Centre le contenu avec une largeur maximale et une marge latérale de 24 px. */
export const Container = React.forwardRef<HTMLElement, ContainerProps>(function Container(
  { size = "lg", px = 6, style, className, ...props },
  ref,
) {
  return (
    <Box
      ref={ref}
      data-slot="container"
      px={px}
      className={cn("ui-container", className)}
      style={{ width: "100%", maxWidth: CONTAINER[size], marginInline: "auto", ...style }}
      {...props}
    />
  );
});
