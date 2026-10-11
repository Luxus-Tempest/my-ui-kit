import * as React from "react";
import { flexRender, type Header, type Row, type Table as TanstackTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "../../utils/cn";
import { Button } from "../button/Button";
import { EmptyState } from "../empty-state/EmptyState";
import { Skeleton } from "../skeleton/Skeleton";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, type TableProps } from "../table/Table";
import { useDataTableLabels } from "./context";
import { DataTableColumnHeader } from "./DataTableColumnHeader";
import type { DataTableDensity, DataTableLabels } from "./types";
import { getColumnLabel, isFromNestedControl } from "./utils";

/* Hauteurs de ligne de `Table` (table.css) : estimation de la virtualisation. */
const ROW_HEIGHT: Record<DataTableDensity, number> = { compact: 40, default: 48, comfortable: 56 };

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const InboxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3.5 13.5 6 5.75A1.5 1.5 0 0 1 7.43 4.75h9.14A1.5 1.5 0 0 1 18 5.75l2.5 7.75" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M3.5 13.5h4.25l1.25 2.5h6l1.25-2.5h4.25v4.25a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5V13.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);
const SearchOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="1.6" />
    <path d="m15 15 5 5M8.25 8.25l4.5 4.5M12.75 8.25l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export type DataTableRowEvent = React.MouseEvent<HTMLTableRowElement> | React.KeyboardEvent<HTMLTableRowElement>;

export interface DataTableViewProps<TData> extends Omit<TableProps, "children" | "density"> {
  table: TanstackTable<TData>;
  /** Hauteur des lignes : 40 / 48 / 56 px. */
  density?: DataTableDensity;
  /**
   * Chargement. Sans lignes : lignes squelettes. Avec des lignes (rechargement) :
   * l'ancien contenu reste en place, estompé, sous une barre de progression.
   */
  loading?: boolean;
  /** Nombre de lignes squelettes. Par défaut : la taille de page, 10 au plus. */
  skeletonRows?: number;
  /** Hauteur maximale de la zone défilante ; fige l'en-tête. */
  maxHeight?: number | string;
  /** Ne rend que les lignes visibles (10 000 lignes et plus) ; exige `height`. */
  virtualized?: boolean;
  /** Hauteur de la zone défilante en mode virtualisé. Par défaut 480 px. */
  height?: number | string;
  /** Lignes rendues hors écran en mode virtualisé. Par défaut 8. */
  overscan?: number;
  /**
   * Clic sur une ligne (hors cases, boutons et liens). La ligne devient
   * focalisable : flèches pour passer d'une ligne à l'autre, Entrée pour l'ouvrir,
   * Espace pour la (dé)sélectionner.
   */
  onRowClick?: (row: Row<TData>, event: DataTableRowEvent) => void;
  /** Classe d'une ligne. */
  rowClassName?: (row: Row<TData>) => string | undefined;
  /** Remplace l'état vide (aucune donnée). */
  emptyState?: React.ReactNode;
  /** Remplace l'état « aucun résultat » (recherche ou filtres sans correspondance). */
  noResultsState?: React.ReactNode;
  /** « Effacer les filtres ». Par défaut : vide recherche et filtres de la table. */
  onClearFilters?: () => void;
  /** Légende visible sous la table (elle nomme aussi la table). */
  caption?: React.ReactNode;
  labels?: Partial<DataTableLabels>;
}

type ViewStatus = "ready" | "loading" | "reloading" | "empty" | "no-results";

const SKELETON_WIDTHS = ["72%", "54%", "64%", "46%", "80%", "58%"];
const SKELETON_NUMERIC = ["56px", "72px", "48px", "64px"];

function skeletonStyle(id: string, numeric: boolean | undefined, row: number, col: number): React.CSSProperties {
  if (id === "select") return { width: 18, height: 18 };
  if (id === "actions") return { width: 24, height: 24 };
  const widths = numeric ? SKELETON_NUMERIC : SKELETON_WIDTHS;
  return { width: widths[(row * 3 + col) % widths.length] };
}

/**
 * Vue de la table : en-têtes (tri, `aria-sort`, menu de colonne), lignes,
 * états de chargement, vide et « aucun résultat », virtualisation. S'appuie
 * sur `Table` ; à composer avec `useDataTable` et les autres briques.
 */
function DataTableViewInner<TData>(
  {
    table,
    density = "default",
    loading = false,
    skeletonRows,
    maxHeight,
    virtualized = false,
    height = 480,
    overscan = 8,
    onRowClick,
    rowClassName,
    emptyState,
    noResultsState,
    onClearFilters,
    caption,
    labels: labelsProp,
    variant,
    stickyHeader,
    containerStyle,
    containerClassName,
    className,
    ...props
  }: DataTableViewProps<TData>,
  ref: React.ForwardedRef<HTMLTableElement>,
) {
  const labels = useDataTableLabels(labelsProp);
  const tableRef = React.useRef<HTMLTableElement | null>(null);
  const setTableRef = React.useCallback(
    (node: HTMLTableElement | null) => {
      tableRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const rows = table.getRowModel().rows;
  const state = table.getState();
  const leafColumns = table.getVisibleLeafColumns();
  const headerGroups = table.getHeaderGroups();
  const isFiltered = state.columnFilters.length > 0 || Boolean(state.globalFilter);
  const status: ViewStatus =
    rows.length === 0 ? (loading ? "loading" : isFiltered ? "no-results" : "empty") : loading ? "reloading" : "ready";

  /* ── Virtualisation ── */
  const [headHeight, setHeadHeight] = React.useState(0);
  useIsomorphicLayoutEffect(() => {
    if (virtualized) setHeadHeight(tableRef.current?.tHead?.offsetHeight ?? 0);
  }, [virtualized, density]);
  const estimate = ROW_HEIGHT[density];
  const virtualizer = useVirtualizer<HTMLDivElement, HTMLTableRowElement>({
    count: virtualized ? rows.length : 0,
    enabled: virtualized,
    getScrollElement: () => (tableRef.current?.parentElement as HTMLDivElement | null) ?? null,
    estimateSize: () => estimate,
    // Hauteur réelle de la ligne ; repli sur l'estimation quand le navigateur ne mesure pas (tests).
    measureElement: (element) => element.getBoundingClientRect().height || estimate,
    getItemKey: (index) => rows[index]?.id ?? index,
    overscan,
    scrollMargin: headHeight,
    initialRect: { width: 0, height: typeof height === "number" ? height : 480 },
  });
  React.useEffect(() => {
    if (virtualized) virtualizer.measure();
  }, [virtualized, density, virtualizer]);
  const virtualItems = virtualized ? virtualizer.getVirtualItems() : [];
  const paddingTop = virtualItems.length ? virtualItems[0].start - headHeight : 0;
  const paddingBottom = virtualItems.length
    ? virtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1].end - headHeight)
    : 0;

  /* ── Lignes cliquables : une seule ligne dans l'ordre de tabulation (tabindex mobile) ── */
  const clickable = Boolean(onRowClick);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const active = Math.min(activeIndex, Math.max(rows.length - 1, 0));
  const bodyRef = React.useRef<HTMLTableSectionElement | null>(null);

  const focusRow = (index: number) => {
    const target = Math.max(0, Math.min(index, rows.length - 1));
    setActiveIndex(target);
    if (virtualized) virtualizer.scrollToIndex(target, { align: "auto" });
    const find = () => bodyRef.current?.querySelector<HTMLElement>(`[data-row-index="${target}"]`);
    const element = find();
    if (element) element.focus();
    else setTimeout(() => find()?.focus(), 0);
  };

  const onRowKeyDown = (row: Row<TData>, index: number, event: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (event.target !== event.currentTarget) return;
    const page = Math.max(1, Math.floor((tableRef.current?.parentElement?.clientHeight ?? 0) / estimate) - 1);
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusRow(index + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusRow(index - 1);
        break;
      case "PageDown":
        event.preventDefault();
        focusRow(index + page);
        break;
      case "PageUp":
        event.preventDefault();
        focusRow(index - page);
        break;
      case "Home":
        event.preventDefault();
        focusRow(0);
        break;
      case "End":
        event.preventDefault();
        focusRow(rows.length - 1);
        break;
      case "Enter":
        event.preventDefault();
        onRowClick?.(row, event);
        break;
      case " ":
        if (row.getCanSelect()) {
          event.preventDefault();
          row.toggleSelected();
        }
        break;
    }
  };

  const renderRow = (row: Row<TData>, index: number) => (
    <TableRow
      key={row.id}
      ref={virtualized ? virtualizer.measureElement : undefined}
      data-index={virtualized ? index : undefined}
      data-row-index={index}
      aria-rowindex={virtualized ? headerGroups.length + index + 1 : undefined}
      selected={row.getIsSelected()}
      data-clickable={clickable || undefined}
      tabIndex={clickable ? (index === active ? 0 : -1) : undefined}
      className={cn("ui-data-table__row", rowClassName?.(row))}
      onClick={
        clickable
          ? (event) => {
              if (isFromNestedControl(event)) return;
              // Une sélection de texte à la souris n'ouvre pas la ligne.
              if (typeof window !== "undefined" && window.getSelection?.()?.type === "Range") return;
              setActiveIndex(index);
              onRowClick?.(row, event);
            }
          : undefined
      }
      onKeyDown={clickable ? (event) => onRowKeyDown(row, index, event) : undefined}
      onFocus={
        clickable
          ? (event) => {
              if (event.target === event.currentTarget) setActiveIndex(index);
            }
          : undefined
      }
    >
      {row.getVisibleCells().map((cell) => {
        const meta = cell.column.columnDef.meta;
        return (
          <TableCell
            key={cell.id}
            numeric={meta?.numeric}
            className={meta?.cellClassName}
            data-column-id={cell.column.id}
            data-wrap={meta?.wrap || undefined}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        );
      })}
    </TableRow>
  );

  const renderHeader = (header: Header<TData, unknown>) => {
    const column = header.column;
    const def = column.columnDef;
    const isLeaf = header.subHeaders.length === 0;
    // En-tête fourni par l'appelant (fonction ou composant) : rendu tel quel.
    if (typeof def.header === "function" && def.header !== table._getDefaultColumnDef().header) {
      return flexRender(def.header, header.getContext());
    }
    // Intitulé : l'en-tête texte s'il existe (« Montant TTC »), sinon `meta.label`, sinon l'identifiant.
    const title = typeof def.header === "string" ? def.header : getColumnLabel(column);
    if (!isLeaf) return <span className="ui-data-table__group-title">{title}</span>;
    return <DataTableColumnHeader column={column} table={table} title={title} />;
  };

  const clearFilters = () => {
    if (onClearFilters) onClearFilters();
    else {
      table.resetColumnFilters(true);
      table.resetGlobalFilter(true);
    }
  };

  const stateRow = (content: React.ReactNode) => (
    <TableRow className="ui-data-table__state-row">
      <TableCell colSpan={Math.max(leafColumns.length, 1)} className="ui-data-table__state-cell">
        {content}
      </TableCell>
    </TableRow>
  );

  let body: React.ReactNode;
  if (status === "loading") {
    const count = skeletonRows ?? Math.min(state.pagination.pageSize || 10, 10);
    body = Array.from({ length: count }, (_, r) => (
      <TableRow key={`skeleton-${r}`} aria-hidden="true" className="ui-data-table__skeleton-row">
        {leafColumns.map((column, c) => (
          <TableCell key={column.id} numeric={column.columnDef.meta?.numeric} className={column.columnDef.meta?.cellClassName}>
            <Skeleton
              className="ui-data-table__skeleton"
              circle={column.id === "actions"}
              style={skeletonStyle(column.id, column.columnDef.meta?.numeric, r, c)}
            />
          </TableCell>
        ))}
      </TableRow>
    ));
  } else if (status === "empty") {
    body = stateRow(
      emptyState ?? (
        <EmptyState icon={<InboxIcon />} title={labels.emptyTitle} description={labels.emptyDescription} titleAs="p" />
      ),
    );
  } else if (status === "no-results") {
    body = stateRow(
      noResultsState ?? (
        <EmptyState
          icon={<SearchOffIcon />}
          title={labels.noResultsTitle}
          description={labels.noResultsDescription}
          titleAs="p"
          actions={
            <Button variant="outline" size="sm" onClick={clearFilters}>
              {labels.clearFilters}
            </Button>
          }
        />
      ),
    );
  } else if (virtualized) {
    body = (
      <>
        {paddingTop > 0 && (
          <tr aria-hidden="true" className="ui-data-table__spacer">
            <td colSpan={leafColumns.length} style={{ height: paddingTop }} />
          </tr>
        )}
        {virtualItems.map((item) => renderRow(rows[item.index], item.index))}
        {paddingBottom > 0 && (
          <tr aria-hidden="true" className="ui-data-table__spacer">
            <td colSpan={leafColumns.length} style={{ height: paddingBottom }} />
          </tr>
        )}
      </>
    );
  } else {
    body = rows.map((row, index) => renderRow(row, index));
  }

  return (
    <div className="ui-data-table__view" data-state={status} data-virtualized={virtualized || undefined}>
      {status === "reloading" && <div className="ui-data-table__progress" role="progressbar" aria-label={labels.loading} />}
      <Table
        ref={setTableRef}
        variant={variant}
        density={density}
        stickyHeader={stickyHeader ?? (maxHeight != null || virtualized)}
        containerClassName={cn("ui-data-table__container", containerClassName)}
        containerStyle={{ maxHeight: virtualized ? undefined : maxHeight, height: virtualized ? height : undefined, ...containerStyle }}
        className={cn("ui-data-table__table", className)}
        aria-busy={loading || undefined}
        aria-rowcount={virtualized ? rows.length + headerGroups.length : undefined}
        {...props}
      >
        <TableHeader>
          {headerGroups.map((group, groupIndex) => (
            <TableRow key={group.id} aria-rowindex={virtualized ? groupIndex + 1 : undefined}>
              {group.headers.map((header) => {
                const column = header.column;
                const meta = column.columnDef.meta;
                const isLeaf = header.subHeaders.length === 0;
                const sortable = isLeaf && !header.isPlaceholder && column.getCanSort();
                const sorted = column.getIsSorted();
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan > 1 ? header.colSpan : undefined}
                    numeric={isLeaf ? meta?.numeric : undefined}
                    aria-sort={sortable ? (sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none") : undefined}
                    className={meta?.headerClassName}
                    style={meta?.width != null ? { width: meta.width } : undefined}
                    data-column-id={column.id}
                    data-group={!isLeaf || undefined}
                  >
                    {header.isPlaceholder ? null : renderHeader(header)}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody ref={bodyRef}>{body}</TableBody>
        {caption != null && <TableCaption>{caption}</TableCaption>}
      </Table>
    </div>
  );
}

export const DataTableView = React.forwardRef(DataTableViewInner) as <TData>(
  props: DataTableViewProps<TData> & React.RefAttributes<HTMLTableElement>,
) => React.ReactElement | null;
