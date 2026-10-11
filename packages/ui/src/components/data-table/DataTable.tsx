import * as React from "react";
import type { Row, Table } from "@tanstack/react-table";
import { cn } from "../../utils/cn";
import type { PaginationVariant } from "../pagination/Pagination";
import { DataTableContext, defaultDataTableLabels, type DataTableContextValue } from "./context";
import { useMessages } from "../../i18n/LocaleProvider";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableToolbar, type DataTableBulkActions } from "./DataTableToolbar";
import { DataTableView, type DataTableRowEvent } from "./DataTableView";
import type { DataTableCsvOptions } from "./export";
import type { DataTableDensity, DataTableLabels } from "./types";
import { useDataTable, readPersistedDensity, type UseDataTableOptions } from "./useDataTable";
import { DEFAULT_PERSISTED_KEYS, writePersisted } from "./utils";

/* Réexports TanStack Table : l'appelant n'a pas besoin d'en dépendre directement. */
export { createColumnHelper, flexRender } from "@tanstack/react-table";
export type {
  CellContext,
  Column,
  ColumnDef,
  ColumnFiltersState,
  ColumnHelper,
  ColumnPinningState,
  ColumnSizingState,
  ExpandedState,
  Header,
  HeaderContext,
  OnChangeFn,
  PaginationState,
  Row,
  RowSelectionState,
  SortingState,
  Table as DataTableInstance,
  Updater,
  VisibilityState,
} from "@tanstack/react-table";

const alwaysExpandable = () => true;

export interface DataTableProps<TData>
  extends UseDataTableOptions<TData>,
    Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> {
  /** `card` (défaut) : table et pied dans un panneau arrondi à filet. `plain` : posée sur un panneau existant. */
  variant?: "plain" | "card";
  /** Densité (contrôlée). */
  density?: DataTableDensity;
  /** Densité initiale. Par défaut `default` (48 px). */
  defaultDensity?: DataTableDensity;
  onDensityChange?: (density: DataTableDensity) => void;

  /** Barre d'outils. Par défaut `true` ; `false` la retire entièrement. */
  toolbar?: boolean;
  /** Recherche globale. Par défaut `true`. */
  enableSearch?: boolean;
  /** Puces de filtres à facettes (colonnes avec `meta.filterOptions`). Par défaut `true`. */
  enableFacets?: boolean;
  /** Menu « Colonnes ». Par défaut `true`. */
  enableColumnVisibility?: boolean;
  /** Sélecteur de densité. Par défaut `true`. */
  enableDensity?: boolean;
  /** Bouton « Exporter » (CSV de la vue filtrée). Par défaut `false`. */
  enableExport?: boolean;
  /** Nom du fichier exporté, sans extension. Par défaut « export ». */
  exportFilename?: string;
  exportOptions?: DataTableCsvOptions;
  searchPlaceholder?: string;
  /** Délai de la recherche (ms). Par défaut 0, ou 300 en filtrage serveur. */
  searchDebounce?: number;
  /** Contenu à droite de la barre d'outils (« Nouvelle facture »…). */
  toolbarActions?: React.ReactNode;
  /** Actions groupées, affichées quand des lignes sont sélectionnées. */
  bulkActions?: DataTableBulkActions<TData>;

  /** Choix des lignes par page. Par défaut 10, 20, 50, 100. */
  pageSizeOptions?: number[];
  paginationVariant?: PaginationVariant;

  /** Chargement : squelettes sans données, contenu estompé au rechargement. */
  loading?: boolean;
  skeletonRows?: number;
  /** Remplace l'état vide. */
  emptyState?: React.ReactNode;
  /** Remplace l'état « aucun résultat ». */
  noResultsState?: React.ReactNode;

  /**
   * Panneau de détail d'une ligne, ouvert par le chevron de la colonne de
   * dépliage (ajoutée d'office) : une ligne pleine largeur sous la ligne.
   * Toutes les lignes se déplient, sauf restriction par `getRowCanExpand`.
   */
  renderSubComponent?: (row: Row<TData>) => React.ReactNode;
  /**
   * Ligne de totaux. Par défaut : dès qu'une colonne déclare `meta.aggregate`
   * ou que `aggregates` est fourni. Collée en bas avec `maxHeight` ou `virtualized`.
   */
  showFooter?: boolean;
  /**
   * Totaux calculés par le serveur, par identifiant de colonne (pagination
   * serveur : le client ne voit qu'une page). Un nombre passe par `meta.format`.
   */
  aggregates?: Record<string, React.ReactNode>;

  /** Clic ou Entrée sur une ligne : la ligne devient focalisable. */
  onRowClick?: (row: Row<TData>, event: DataTableRowEvent) => void;
  /** Libellé d'une ligne pour les noms accessibles (« Sélectionner F-2026-0012 »). */
  getRowLabel?: (row: TData) => string;
  rowClassName?: (row: Row<TData>) => string | undefined;

  /** Fige l'en-tête. Par défaut : avec `maxHeight` ou `virtualized`. */
  stickyHeader?: boolean;
  /** Hauteur maximale de la zone défilante. */
  maxHeight?: number | string;
  /** Virtualisation des lignes (pagination désactivée par défaut). */
  virtualized?: boolean;
  /** Hauteur de la zone défilante en mode virtualisé. Par défaut 480 px. */
  height?: number | string;
  overscan?: number;
  /** Légende visible sous la table. Sans légende, nommer la table par `aria-label`. */
  caption?: React.ReactNode;

  /** Reçoit l'instance TanStack une fois créée (cas avancés). */
  onTableReady?: (table: Table<TData>) => void;
  /** Référence vers l'instance TanStack (`useRef<DataTableInstance<T>>()`). */
  tableRef?: React.Ref<Table<TData> | null>;
  /** Libellés internes. */
  labels?: Partial<DataTableLabels>;
}

/**
 * Table de données de haut niveau, au-dessus de TanStack Table : tri
 * multi-colonnes, recherche, filtres à facettes, pagination, sélection et
 * actions groupées, colonnes masquables, figées et redimensionnables, lignes
 * dépliables (détail ou hiérarchie), ligne de totaux, densité, export CSV,
 * états de chargement et vides, virtualisation, mode serveur et persistance.
 *
 *   <DataTable columns={columns} data={factures} />
 *
 * Pour une mise en page sur mesure, composer `useDataTable` avec
 * `DataTableToolbar`, `DataTableView` et `DataTablePagination`.
 */
function DataTableInner<TData>(props: DataTableProps<TData>, ref: React.ForwardedRef<HTMLDivElement>) {
  const {
    // Instance
    data,
    columns,
    getRowId,
    enableSorting,
    enableMultiSort,
    enableRowSelection,
    enablePagination: enablePaginationProp,
    manualPagination,
    manualSorting,
    manualFiltering,
    rowCount,
    enableColumnPinning,
    enableColumnResizing,
    getSubRows,
    getRowCanExpand,
    enableExpanding,
    initialState,
    state,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    onPaginationChange,
    onRowSelectionChange,
    onColumnVisibilityChange,
    onColumnPinningChange,
    onColumnSizingChange,
    onExpandedChange,
    persistKey,
    persistState,
    tableOptions,
    // Présentation
    variant = "card",
    density: densityProp,
    defaultDensity = "default",
    onDensityChange,
    toolbar = true,
    enableSearch = true,
    enableFacets = true,
    enableColumnVisibility = true,
    enableDensity = true,
    enableExport = false,
    exportFilename = "export",
    exportOptions,
    searchPlaceholder,
    searchDebounce,
    toolbarActions,
    bulkActions,
    pageSizeOptions,
    paginationVariant,
    loading = false,
    skeletonRows,
    emptyState,
    noResultsState,
    renderSubComponent,
    showFooter,
    aggregates,
    onRowClick,
    getRowLabel,
    rowClassName,
    stickyHeader,
    maxHeight,
    virtualized = false,
    height,
    overscan,
    caption,
    onTableReady,
    tableRef,
    labels: labelsProp,
    className,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...rest
  } = props;

  const enablePagination = enablePaginationProp ?? !virtualized;
  const table = useDataTable<TData>({
    data,
    columns,
    getRowId,
    enableSorting,
    enableMultiSort,
    enableRowSelection,
    enablePagination,
    manualPagination,
    manualSorting,
    manualFiltering,
    rowCount,
    enableColumnPinning,
    enableColumnResizing,
    getSubRows,
    // Avec un panneau de détail, toute ligne se déplie (sauf restriction de l'appelant).
    getRowCanExpand: getRowCanExpand ?? (renderSubComponent ? alwaysExpandable : undefined),
    enableExpanding,
    initialState,
    state,
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    onPaginationChange,
    onRowSelectionChange,
    onColumnVisibilityChange,
    onColumnPinningChange,
    onColumnSizingChange,
    onExpandedChange,
    persistKey,
    persistState,
    tableOptions,
  });

  /* ── Densité (contrôlée ou non, mémorisée avec persistKey) ── */
  const [innerDensity, setInnerDensity] = React.useState<DataTableDensity>(
    () => readPersistedDensity(persistKey, persistState) ?? defaultDensity,
  );
  const density = densityProp ?? innerDensity;
  const changeDensity = React.useCallback(
    (next: DataTableDensity) => {
      if (densityProp === undefined) setInnerDensity(next);
      onDensityChange?.(next);
    },
    [densityProp, onDensityChange],
  );
  const persistDensity = Boolean(persistKey) && (persistState ?? DEFAULT_PERSISTED_KEYS).includes("density");
  React.useEffect(() => {
    if (persistDensity) writePersisted(persistKey, { density });
  }, [persistDensity, persistKey, density]);

  /* ── Accès à l'instance ── */
  React.useImperativeHandle(tableRef, () => table, [table]);
  const onTableReadyRef = React.useRef(onTableReady);
  onTableReadyRef.current = onTableReady;
  React.useEffect(() => {
    onTableReadyRef.current?.(table);
  }, [table]);

  /* ── Libellés et contexte des briques ── */
  const baseLabels = useMessages("dataTable", defaultDataTableLabels);
  const labels = React.useMemo(() => ({ ...baseLabels, ...labelsProp }), [baseLabels, labelsProp]);
  const context = React.useMemo<DataTableContextValue>(
    () => ({ labels, getRowLabel: getRowLabel ? (row: Row<any>) => getRowLabel(row.original as TData) : undefined }),
    [labels, getRowLabel],
  );

  /* ── Annonces pour les lecteurs d'écran ── */
  const tableState = table.getState();
  const resultCount = table.getRowCount();
  const selectedCount = Object.values(tableState.rowSelection).filter(Boolean).length;
  const filterSignature = JSON.stringify([tableState.globalFilter ?? "", tableState.columnFilters]);
  const [announcement, setAnnouncement] = React.useState("");
  const pendingResults = React.useRef(false);
  const firstFilter = React.useRef(true);
  React.useEffect(() => {
    if (firstFilter.current) {
      firstFilter.current = false;
      return;
    }
    pendingResults.current = true;
  }, [filterSignature]);
  React.useEffect(() => {
    if (pendingResults.current && !loading) {
      pendingResults.current = false;
      setAnnouncement(labels.results(resultCount));
    }
  }, [filterSignature, resultCount, loading, labels]);
  const previousSelected = React.useRef(selectedCount);
  React.useEffect(() => {
    if (previousSelected.current !== selectedCount) {
      setAnnouncement(selectedCount > 0 ? labels.selectedCount(selectedCount) : labels.selectionCleared);
    }
    previousSelected.current = selectedCount;
  }, [selectedCount, labels]);

  const showPagination = enablePagination && resultCount > 0;

  return (
    <DataTableContext.Provider value={context}>
      <div
        ref={ref}
        data-slot="data-table"
        data-variant={variant}
        data-density={density}
        data-loading={loading || undefined}
        className={cn("ui-data-table", className)}
        {...rest}
      >
        {toolbar && (
          <DataTableToolbar
            table={table}
            search={enableSearch}
            searchPlaceholder={searchPlaceholder}
            searchDebounce={searchDebounce}
            facets={enableFacets}
            columnVisibility={enableColumnVisibility}
            density={enableDensity ? density : undefined}
            onDensityChange={enableDensity ? changeDensity : undefined}
            exportCsv={enableExport ? { filename: exportFilename, options: exportOptions } : false}
            actions={toolbarActions}
            bulkActions={bulkActions}
          />
        )}
        <div className="ui-data-table__surface">
          <DataTableView
            table={table}
            variant={variant}
            density={density}
            loading={loading}
            skeletonRows={skeletonRows}
            emptyState={emptyState}
            noResultsState={noResultsState}
            renderSubComponent={renderSubComponent}
            showFooter={showFooter}
            aggregates={aggregates}
            onRowClick={onRowClick}
            rowClassName={rowClassName}
            stickyHeader={stickyHeader}
            maxHeight={maxHeight}
            virtualized={virtualized}
            height={height}
            overscan={overscan}
            caption={caption}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
          />
          {showPagination && (
            <DataTablePagination
              table={table}
              pageSizeOptions={pageSizeOptions}
              variant={paginationVariant}
              disabled={loading}
              className="ui-data-table__footer"
            />
          )}
        </div>
        <div className="ui-sr-only" aria-live="polite" aria-atomic="true" data-slot="data-table-status">
          {announcement}
        </div>
      </div>
    </DataTableContext.Provider>
  );
}

export const DataTable = React.forwardRef(DataTableInner) as (<TData>(
  props: DataTableProps<TData> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null) & { displayName?: string };
DataTable.displayName = "DataTable";
