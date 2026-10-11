import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";
import { useMessages } from "../../i18n/LocaleProvider";

/**
 * Fil d'Ariane, à la manière de Drive : chaque niveau est une pilule avec
 * couche d'état au survol, l'élément courant est en encre pleine.
 *
 * - `size="default"` : 14 px, au-dessus d'un contenu.
 * - `size="lg"` : 22 px / 400, le chemin-titre de Drive (« Mon Drive › Projets › 2026 »).
 *
 * Composition : `Breadcrumb` > `BreadcrumbList` > `BreadcrumbItem` >
 * `BreadcrumbLink` | `BreadcrumbPage`, séparés par `BreadcrumbSeparator`.
 */
export const breadcrumbVariants = cva("ui-breadcrumb", {
  variants: {
    size: {
      default: "ui-breadcrumb--size-default",
      /** Chemin-titre d'en-tête de page. */
      lg: "ui-breadcrumb--size-lg",
    },
  },
  defaultVariants: { size: "default" },
});

export type BreadcrumbSize = NonNullable<VariantProps<typeof breadcrumbVariants>["size"]>;

export interface BreadcrumbLabels {
  /** Nom du repère de navigation. « Fil d'Ariane ». */
  label: string;
  /** Niveaux repliés (`BreadcrumbEllipsis`). « Plus de niveaux ». */
  more: string;
}
export const BREADCRUMB_LABELS: BreadcrumbLabels = { label: "Fil d'Ariane", more: "Plus de niveaux" };

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  size?: BreadcrumbSize;
  /** Nom accessible du repère de navigation. Par défaut « Fil d'Ariane ». */
  label?: string;
}

export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { className, size, label: labelProp, ...props },
  ref,
) {
  const labelLabels = useMessages("breadcrumb", BREADCRUMB_LABELS);
  const label = labelProp ?? labelLabels.label;
  return (
    <nav
      ref={ref}
      aria-label={label}
      data-slot="breadcrumb"
      className={cn(breadcrumbVariants({ size }), className)}
      {...props}
    />
  );
});

export type BreadcrumbListProps = React.OlHTMLAttributes<HTMLOListElement>;

/** Liste ordonnée des niveaux, du plus haut au plus profond. */
export const BreadcrumbList = React.forwardRef<HTMLOListElement, BreadcrumbListProps>(function BreadcrumbList(
  { className, ...props },
  ref,
) {
  return <ol ref={ref} data-slot="breadcrumb-list" className={cn("ui-breadcrumb__list", className)} {...props} />;
});

export type BreadcrumbItemProps = React.LiHTMLAttributes<HTMLLIElement>;

export const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(function BreadcrumbItem(
  { className, ...props },
  ref,
) {
  return <li ref={ref} data-slot="breadcrumb-item" className={cn("ui-breadcrumb__item", className)} {...props} />;
});

export interface BreadcrumbLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Rend l'enfant (le `Link` de Next.js, de React Router…) avec le style du niveau. */
  asChild?: boolean;
}

/** Niveau parent, cliquable : pilule avec couche d'état. */
export const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(function BreadcrumbLink(
  { className, asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "a";
  return <Comp ref={ref} data-slot="breadcrumb-link" className={cn("ui-breadcrumb__link", className)} {...props} />;
});

export type BreadcrumbPageProps = React.HTMLAttributes<HTMLSpanElement>;

/** Élément courant : non cliquable, annoncé par `aria-current="page"`. */
export const BreadcrumbPage = React.forwardRef<HTMLSpanElement, BreadcrumbPageProps>(function BreadcrumbPage(
  { className, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      aria-current="page"
      data-slot="breadcrumb-page"
      className={cn("ui-breadcrumb__page", className)}
      {...props}
    />
  );
});

export type BreadcrumbSeparatorProps = React.LiHTMLAttributes<HTMLLIElement>;

/** Séparateur décoratif (chevron par défaut), masqué aux technologies d'assistance. */
export const BreadcrumbSeparator = React.forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>(
  function BreadcrumbSeparator({ className, children, ...props }, ref) {
    return (
      <li
        ref={ref}
        role="presentation"
        aria-hidden="true"
        data-slot="breadcrumb-separator"
        className={cn("ui-breadcrumb__separator", className)}
        {...props}
      >
        {children ?? (
          <svg viewBox="0 0 16 16" fill="none">
            <path d="m6 3.5 4.5 4.5L6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </li>
    );
  },
);

export interface BreadcrumbEllipsisProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Texte lu par les lecteurs d'écran. Par défaut « Plus de niveaux ». */
  label?: string;
}

/**
 * Niveaux intermédiaires repliés : « … ». Pour les rendre accessibles, le
 * poser dans un bouton qui ouvre un `Menu` (le libellé masqué nomme le bouton).
 */
export const BreadcrumbEllipsis = React.forwardRef<HTMLSpanElement, BreadcrumbEllipsisProps>(
  function BreadcrumbEllipsis({ className, label: labelProp, ...props }, ref) {
    const labelLabels = useMessages("breadcrumb", BREADCRUMB_LABELS);
    const label = labelProp ?? labelLabels.more;
    return (
      <span ref={ref} data-slot="breadcrumb-ellipsis" className={cn("ui-breadcrumb__ellipsis", className)} {...props}>
        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <circle cx="3.5" cy="8" r="1.25" />
          <circle cx="8" cy="8" r="1.25" />
          <circle cx="12.5" cy="8" r="1.25" />
        </svg>
        <span className="ui-sr-only">{label}</span>
      </span>
    );
  },
);
