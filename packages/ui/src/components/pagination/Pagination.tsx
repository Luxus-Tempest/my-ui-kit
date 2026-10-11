import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

/* ── Calcul de la plage ────────────────────────────────────────────── */

export type PaginationRangeItem = number | "start-ellipsis" | "end-ellipsis";

const range = (start: number, end: number) =>
  Array.from({ length: Math.max(end - start + 1, 0) }, (_, i) => start + i);

/**
 * Plage de pages à afficher, ellipses comprises (algorithme de MUI).
 * Le nombre d'entrées est constant tant que `pageCount` est assez grand :
 * la pagination ne change pas de largeur d'une page à l'autre.
 *
 * @example getPaginationRange(5, 10) // [1, "start-ellipsis", 4, 5, 6, "end-ellipsis", 10]
 */
export function getPaginationRange(
  page: number,
  pageCount: number,
  siblingCount = 1,
  boundaryCount = 1,
): PaginationRangeItem[] {
  const count = Math.max(0, Math.floor(pageCount));
  if (count === 0) return [];
  const current = Math.min(Math.max(1, Math.floor(page)), count);
  const siblings = Math.max(0, Math.floor(siblingCount));
  const boundary = Math.max(0, Math.floor(boundaryCount));

  const startPages = range(1, Math.min(boundary, count));
  const endPages = range(Math.max(count - boundary + 1, boundary + 1), count);

  const siblingsStart = Math.max(
    Math.min(current - siblings, count - boundary - siblings * 2 - 1),
    boundary + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(current + siblings, boundary + siblings * 2 + 2),
    count - boundary - 1,
  );

  // Une ellipse ne remplace jamais une seule page : on affiche la page.
  const startGap: PaginationRangeItem[] =
    siblingsStart > boundary + 2
      ? ["start-ellipsis"]
      : boundary + 1 < count - boundary
        ? [boundary + 1]
        : [];
  const endGap: PaginationRangeItem[] =
    siblingsEnd < count - boundary - 1
      ? ["end-ellipsis"]
      : count - boundary > boundary
        ? [count - boundary]
        : [];

  const items = [...startPages, ...startGap, ...range(siblingsStart, siblingsEnd), ...endGap, ...endPages];
  // Garde-fou pour les petites valeurs (boundaryCount = 0…) : pas de doublon, ordre croissant.
  return items.filter((item, i) => typeof item !== "number" || items.indexOf(item) === i);
}

/* ── Composant ─────────────────────────────────────────────────────── */

export const paginationVariants = cva("ui-pagination", {
  variants: {
    variant: {
      /** Précédent / suivant circulaires et pastilles de pages, ellipses. */
      pages: "ui-pagination--pages",
      /** « Page 3 sur 12 » et deux flèches, à la manière d'iOS. */
      compact: "ui-pagination--compact",
    },
  },
  defaultVariants: { variant: "pages" },
});

export type PaginationVariant = NonNullable<VariantProps<typeof paginationVariants>["variant"]>;

export interface PaginationLabels {
  /** Nom du repère de navigation. Par défaut « Pagination ». */
  nav?: string;
  /** Par défaut « Page précédente ». */
  previous?: string;
  /** Par défaut « Page suivante ». */
  next?: string;
  /** Nom d'une pastille de page. Par défaut « Page {n} ». */
  page?: (page: number) => string;
  /** Texte de la variante compacte. Par défaut « Page {n} sur {total} ». */
  status?: (page: number, pageCount: number) => React.ReactNode;
}

export interface PaginationProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** Page courante, à partir de 1 (contrôlé). */
  page?: number;
  /** Page initiale (non contrôlé). Par défaut 1. */
  defaultPage?: number;
  /** Nombre total de pages. */
  pageCount: number;
  /** Appelé avec la nouvelle page (1-based). */
  onPageChange?: (page: number) => void;
  /** Pages affichées de part et d'autre de la page courante. Par défaut 1. */
  siblingCount?: number;
  /** Pages toujours affichées au début et à la fin. Par défaut 1. */
  boundaryCount?: number;
  variant?: PaginationVariant;
  /** Désactive toute la pagination (chargement en cours…). */
  disabled?: boolean;
  /** Libellés internes, à traduire ou préciser. */
  labels?: PaginationLabels;
}

const DEFAULT_LABELS: Required<PaginationLabels> = {
  nav: "Pagination",
  previous: "Page précédente",
  next: "Page suivante",
  page: (n) => `Page ${n}`,
  status: (n, total) => `Page ${n} sur ${total}`,
};

const ChevronLeft = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M10 3.5 5.5 8l4.5 4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChevronRight = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="m6 3.5 4.5 4.5L6 12.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Pagination de haut niveau. `variant="pages"` (défaut) : boutons
 * précédent / suivant circulaires, pastilles de pages, page courante en
 * conteneur de sélection et `aria-current="page"`. `variant="compact"` :
 * « Page 3 sur 12 » entre deux flèches.
 *
 * Les bornes sont marquées `aria-disabled` plutôt que `disabled` : le focus
 * reste sur « Page suivante » quand on atteint la dernière page.
 */
export const Pagination = React.forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    className,
    page: pageProp,
    defaultPage = 1,
    pageCount,
    onPageChange,
    siblingCount = 1,
    boundaryCount = 1,
    variant,
    disabled = false,
    labels: labelsProp,
    ...props
  },
  ref,
) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const [uncontrolled, setUncontrolled] = React.useState(defaultPage);
  const count = Math.max(1, Math.floor(pageCount));
  const page = Math.min(Math.max(1, pageProp ?? uncontrolled), count);

  const go = (next: number) => {
    if (disabled || next < 1 || next > count || next === page) return;
    if (pageProp === undefined) setUncontrolled(next);
    onPageChange?.(next);
  };

  const isFirst = page <= 1;
  const isLast = page >= count;

  const arrow = (direction: "previous" | "next") => {
    const blocked = disabled || (direction === "previous" ? isFirst : isLast);
    return (
      <button
        type="button"
        className="ui-pagination__button ui-pagination__arrow"
        aria-label={labels[direction]}
        aria-disabled={blocked || undefined}
        data-direction={direction}
        onClick={() => go(direction === "previous" ? page - 1 : page + 1)}
      >
        {direction === "previous" ? <ChevronLeft /> : <ChevronRight />}
      </button>
    );
  };

  const resolvedVariant = variant ?? "pages";

  return (
    <nav
      ref={ref}
      aria-label={labels.nav}
      data-slot="pagination"
      data-disabled={disabled || undefined}
      className={cn(paginationVariants({ variant }), className)}
      {...props}
    >
      {resolvedVariant === "compact" ? (
        <div className="ui-pagination__list">
          {arrow("previous")}
          <span className="ui-pagination__status" aria-live="polite" aria-atomic="true">
            {labels.status(page, count)}
          </span>
          {arrow("next")}
        </div>
      ) : (
        <ul className="ui-pagination__list">
          <li>{arrow("previous")}</li>
          {getPaginationRange(page, count, siblingCount, boundaryCount).map((item) =>
            typeof item === "number" ? (
              <li key={`page-${item}`}>
                <button
                  type="button"
                  className="ui-pagination__button ui-pagination__page"
                  aria-label={labels.page(item)}
                  aria-current={item === page ? "page" : undefined}
                  aria-disabled={disabled || undefined}
                  onClick={() => go(item)}
                >
                  {item}
                </button>
              </li>
            ) : (
              <li key={item} className="ui-pagination__ellipsis" aria-hidden="true">
                …
              </li>
            ),
          )}
          <li>{arrow("next")}</li>
        </ul>
      )}
    </nav>
  );
});
