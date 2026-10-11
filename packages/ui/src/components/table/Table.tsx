import * as React from "react";
import { cn } from "../../utils/cn";
import { syncScrollableFocus } from "../../utils/scrollable-focus";

/**
 * Table, à la manière de la vue liste de Drive : en-tête en casse de phrase,
 * lignes séparées par un filet, survol tonal, ligne retenue en conteneur de
 * sélection.
 *
 * - `variant="plain"` (défaut) : posée sur un panneau.
 * - `variant="card"` : enveloppée dans un panneau arrondi à filet, pour une
 *   table seule sur le fond d'application (tableau de bord, réglages).
 * - `density` : 40 / 48 / 56 px par ligne.
 *
 * Le conteneur défile horizontalement ; `stickyHeader` fige l'en-tête quand
 * le conteneur a une hauteur maximale.
 */
export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  variant?: "plain" | "card";
  density?: "compact" | "default" | "comfortable";
  stickyHeader?: boolean;
  /** Classe du conteneur défilant ; `className` va au `<table>`. */
  containerClassName?: string;
  /** Style du conteneur (par ex. `maxHeight` avec `stickyHeader`). */
  containerStyle?: React.CSSProperties;
  /** Référence vers le conteneur défilant (virtualisation, défilement programmé). */
  containerRef?: React.Ref<HTMLDivElement>;
}

/**
 * Suit le défilement horizontal du conteneur : `data-overflow-start` et
 * `data-overflow-end` signalent du contenu caché de chaque côté (le CSS y pose
 * un fondu). Écrit directement dans le DOM : aucun rendu React au défilement.
 */
function watchScrollEdges(el: HTMLDivElement) {
  const update = () => {
    const max = el.scrollWidth - el.clientWidth;
    // En RTL, scrollLeft va de 0 à -max : seule la distance au bord de départ compte.
    const fromStart = Math.abs(el.scrollLeft);
    el.toggleAttribute("data-overflow-start", max > 1 && fromStart > 1);
    el.toggleAttribute("data-overflow-end", max > 1 && fromStart < max - 1);
    // Une table qui défile sans rien de focalisable (pas de case, pas de lien) le devient.
    syncScrollableFocus(el);
  };
  update();
  el.addEventListener("scroll", update, { passive: true });
  const observer = new ResizeObserver(update);
  observer.observe(el);
  if (el.firstElementChild) observer.observe(el.firstElementChild);
  return () => {
    el.removeEventListener("scroll", update);
    observer.disconnect();
  };
}

function useScrollEdgesRef(forwarded: React.Ref<HTMLDivElement> | undefined) {
  const forwardedRef = React.useRef(forwarded);
  forwardedRef.current = forwarded;
  const cleanup = React.useRef<(() => void) | null>(null);
  // Référence stable : l'observation n'est posée qu'au montage du conteneur.
  return React.useCallback((node: HTMLDivElement | null) => {
    cleanup.current?.();
    cleanup.current = node ? watchScrollEdges(node) : null;
    const target = forwardedRef.current;
    if (typeof target === "function") target(node);
    else if (target) (target as React.MutableRefObject<HTMLDivElement | null>).current = node;
  }, []);
}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(function Table(
  { className, variant = "plain", density = "default", stickyHeader, containerClassName, containerStyle, containerRef, ...props },
  ref,
) {
  const scrollRef = useScrollEdgesRef(containerRef);
  return (
    <div
      ref={scrollRef}
      data-slot="table-container"
      data-variant={variant}
      data-density={density}
      data-sticky={stickyHeader || undefined}
      className={cn("ui-table-container", containerClassName)}
      style={containerStyle}
    >
      <table ref={ref} data-slot="table" className={cn("ui-table", className)} {...props} />
    </div>
  );
});

export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  function TableHeader({ className, ...props }, ref) {
    return <thead ref={ref} data-slot="table-header" className={cn("ui-table__header", className)} {...props} />;
  },
);

export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  function TableBody({ className, ...props }, ref) {
    return <tbody ref={ref} data-slot="table-body" className={cn("ui-table__body", className)} {...props} />;
  },
);

export const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  function TableFooter({ className, ...props }, ref) {
    return <tfoot ref={ref} data-slot="table-footer" className={cn("ui-table__footer", className)} {...props} />;
  },
);

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /**
   * Ligne retenue : conteneur de sélection. Annoncer la sélection par une
   * case à cocher dans la ligne ; `data-state="selected"` est aussi accepté.
   */
  selected?: boolean;
}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { className, selected, ...props },
  ref,
) {
  return (
    <tr
      ref={ref}
      data-slot="table-row"
      data-state={selected ? "selected" : undefined}
      className={cn("ui-table__row", className)}
      {...props}
    />
  );
});

export type TableSortDirection = "asc" | "desc";

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  /** Colonne de nombres : alignée à droite. */
  numeric?: boolean;
  /**
   * Sens du tri actif sur cette colonne, ou `false` si elle est triable mais
   * pas triée. Avec `onSort`, l'intitulé devient un bouton et `aria-sort` est posé.
   */
  sort?: TableSortDirection | false;
  /** Rend la colonne triable : appelé au clic sur l'intitulé. */
  /** L'événement permet le tri multi-colonnes (Maj+clic). */
  onSort?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const SortIcon = () => (
  <svg className="ui-table__sort-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 12.5v-9M4.5 7 8 3.5 11.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(function TableHead(
  { className, numeric, sort, onSort, children, scope = "col", ...props },
  ref,
) {
  const sortable = onSort != null;
  return (
    <th
      ref={ref}
      scope={scope}
      data-slot="table-head"
      data-numeric={numeric || undefined}
      aria-sort={sortable ? (sort === "asc" ? "ascending" : sort === "desc" ? "descending" : "none") : undefined}
      className={cn("ui-table__head", className)}
      {...props}
    >
      {sortable ? (
        <button type="button" className="ui-table__sort" data-direction={sort || undefined} onClick={onSort}>
          {children}
          <SortIcon />
        </button>
      ) : (
        children
      )}
    </th>
  );
});

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /** Nombres : alignés à droite, chiffres tabulaires. */
  numeric?: boolean;
}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { className, numeric, ...props },
  ref,
) {
  return (
    <td
      ref={ref}
      data-slot="table-cell"
      data-numeric={numeric || undefined}
      className={cn("ui-table__cell", className)}
      {...props}
    />
  );
});

export const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  function TableCaption({ className, ...props }, ref) {
    return <caption ref={ref} data-slot="table-caption" className={cn("ui-table__caption", className)} {...props} />;
  },
);
