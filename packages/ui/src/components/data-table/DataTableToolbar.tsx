import * as React from "react";
import type { Row, Table } from "@tanstack/react-table";
import { useLocale } from "../../i18n/LocaleProvider";
import { cn } from "../../utils/cn";
import { Button } from "../button/Button";
import { SearchBar } from "../search-bar/SearchBar";
import { ToggleGroup, ToggleGroupItem } from "../toggle/ToggleGroup";
import { useDataTableLabels } from "./context";
import { DataTableFacetedFilter } from "./DataTableFacetedFilter";
import { DataTableViewOptions } from "./DataTableViewOptions";
import { exportCsv, type DataTableCsvOptions } from "./export";
import type { DataTableDensity, DataTableLabels } from "./types";

/* ── Pictogrammes ──────────────────────────────────────────────────── */

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);
const DownloadIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2.75v7.5M4.75 7 8 10.25 11.25 7M3 13.25h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const DensityIcon = ({ lines }: { lines: number }) => {
  const gap = 10 / (lines - 1);
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <path key={i} d={`M3 ${3 + i * gap}h10`} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      ))}
    </svg>
  );
};

/* ── Densité ───────────────────────────────────────────────────────── */

export interface DataTableDensityToggleProps {
  value: DataTableDensity;
  onValueChange: (density: DataTableDensity) => void;
  labels?: Partial<DataTableLabels>;
  className?: string;
}

/** Segmented control compact / standard / confortable. */
export function DataTableDensityToggle({ value, onValueChange, labels: labelsProp, className }: DataTableDensityToggleProps) {
  const labels = useDataTableLabels(labelsProp);
  return (
    <ToggleGroup
      type="single"
      size="sm"
      variant="segmented"
      aria-label={labels.density}
      value={value}
      onValueChange={(next) => {
        if (next) onValueChange(next as DataTableDensity);
      }}
      className={cn("ui-data-table__density", className)}
    >
      <ToggleGroupItem value="compact" aria-label={labels.densityCompact}>
        <DensityIcon lines={4} />
      </ToggleGroupItem>
      <ToggleGroupItem value="default" aria-label={labels.densityDefault}>
        <DensityIcon lines={3} />
      </ToggleGroupItem>
      <ToggleGroupItem value="comfortable" aria-label={labels.densityComfortable}>
        <DensityIcon lines={2} />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

/* ── Barre de sélection ────────────────────────────────────────────── */

export interface DataTableBulkActionsContext<TData = any> {
  /** Données des lignes sélectionnées (chargées), dans l'ordre affiché. */
  rows: TData[];
  /** Lignes TanStack sélectionnées. */
  selectedRows: Row<TData>[];
  table: Table<TData>;
  /** Vide la sélection. */
  clear: () => void;
}

export type DataTableBulkActions<TData = any> =
  | React.ReactNode
  | ((context: DataTableBulkActionsContext<TData>) => React.ReactNode);

export interface DataTableSelectionBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  table: Table<any>;
  /** Actions groupées : nœud React, ou fonction qui reçoit les lignes sélectionnées. */
  children?: DataTableBulkActions;
  labels?: Partial<DataTableLabels>;
  /** Appelé après « Tout désélectionner » (par défaut, le focus revient à la case d'en-tête). */
  onClear?: () => void;
}

/**
 * Barre d'actions groupées, à la manière de Drive : « × 3 sélectionnées »,
 * « Sélectionner les 132 lignes » quand toute la page est cochée, puis les
 * actions. Échap vide la sélection.
 */
export const DataTableSelectionBar = React.forwardRef<HTMLDivElement, DataTableSelectionBarProps>(
  function DataTableSelectionBar({ table, children, labels: labelsProp, onClear, className, onKeyDown, ...props }, ref) {
    const labels = useDataTableLabels(labelsProp);
    const selection = table.getState().rowSelection;
    const count = Object.values(selection).filter(Boolean).length;
    const selectedRows = table.getPrePaginationRowModel().rows.filter((row) => row.getIsSelected());
    const filteredCount = table.getFilteredRowModel().rows.length;
    const canSelectAll =
      !table.options.manualPagination &&
      table.getIsAllPageRowsSelected() &&
      !table.getIsAllRowsSelected() &&
      filteredCount > table.getRowModel().rows.length;

    const clear = () => {
      table.resetRowSelection(true);
      onClear?.();
    };

    const actions =
      typeof children === "function"
        ? children({ rows: selectedRows.map((row) => row.original), selectedRows, table, clear })
        : children;

    return (
      <div
        ref={ref}
        role="group"
        aria-label={labels.bulkActions}
        data-slot="data-table-selection-bar"
        className={cn("ui-data-table__selection", className)}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.key === "Escape" && !event.defaultPrevented) {
            event.preventDefault();
            clear();
          }
        }}
        {...props}
      >
        <Button size="icon-sm" variant="ghost" aria-label={labels.clearSelection} onClick={clear}>
          <CloseIcon />
        </Button>
        <span className="ui-data-table__selection-count">{labels.selectedCount(count)}</span>
        {canSelectAll && (
          <Button size="sm" variant="link" onClick={() => table.toggleAllRowsSelected(true)}>
            {labels.selectAllRows(filteredCount)}
          </Button>
        )}
        {actions != null && actions !== false && <div className="ui-data-table__selection-actions">{actions}</div>}
      </div>
    );
  },
);

/* ── Recherche ─────────────────────────────────────────────────────── */

function useDebouncedCommit(commit: (value: string) => void, delay: number) {
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const commitRef = React.useRef(commit);
  commitRef.current = commit;
  React.useEffect(() => () => clearTimeout(timer.current), []);
  return React.useCallback(
    (value: string, immediate = false) => {
      clearTimeout(timer.current);
      if (immediate || delay <= 0) commitRef.current(value);
      else timer.current = setTimeout(() => commitRef.current(value), delay);
    },
    [delay],
  );
}

export interface DataTableSearchProps {
  table: Table<any>;
  placeholder?: string;
  /** Délai avant d'appliquer la frappe (ms). Par défaut 0, ou 300 en filtrage serveur. */
  debounce?: number;
  labels?: Partial<DataTableLabels>;
  className?: string;
}

/** Recherche globale (`SearchBar`) branchée sur la table ; Échap vide le champ. */
export function DataTableSearch({ table, placeholder, debounce, labels: labelsProp, className }: DataTableSearchProps) {
  const labels = useDataTableLabels(labelsProp);
  const globalFilter = String(table.getState().globalFilter ?? "");
  const [value, setValue] = React.useState(globalFilter);
  const committed = React.useRef(globalFilter);
  const commit = useDebouncedCommit((next) => {
    committed.current = next;
    table.setGlobalFilter(next);
  }, debounce ?? (table.options.manualFiltering ? 300 : 0));

  // Changement venu d'ailleurs (« Réinitialiser », état contrôlé) : le champ suit.
  React.useEffect(() => {
    if (globalFilter !== committed.current) {
      committed.current = globalFilter;
      setValue(globalFilter);
    }
  }, [globalFilter]);

  return (
    <SearchBar
      value={value}
      onValueChange={(next) => {
        setValue(next);
        commit(next, next === "");
      }}
      placeholder={placeholder ?? labels.searchPlaceholder}
      aria-label={labels.searchLabel}
      containerClassName={cn("ui-data-table__search", className)}
    />
  );
}

/* ── Barre d'outils ────────────────────────────────────────────────── */

export interface DataTableToolbarProps<TData = any> extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  table: Table<TData>;
  /** Recherche globale. Par défaut `true`. */
  search?: boolean;
  searchPlaceholder?: string;
  /** Délai de la recherche (ms). Par défaut 0, ou 300 en filtrage serveur. */
  searchDebounce?: number;
  /** Une puce de filtre par colonne qui déclare `meta.filterOptions`. Par défaut `true`. */
  facets?: boolean;
  /** Menu « Colonnes ». Par défaut `true`. */
  columnVisibility?: boolean;
  /** Densité courante ; avec `onDensityChange`, affiche le sélecteur de densité. */
  density?: DataTableDensity;
  onDensityChange?: (density: DataTableDensity) => void;
  /** Bouton « Exporter » (CSV de la vue filtrée). `true` ou options de nom et de format. */
  exportCsv?: boolean | { filename?: string; options?: DataTableCsvOptions };
  /** Contenu à droite de la barre (« Nouvelle facture »…). */
  actions?: React.ReactNode;
  /**
   * Barre d'actions groupées : remplace la barre d'outils tant que des lignes
   * sont sélectionnées. Nœud React, ou fonction qui reçoit les lignes.
   */
  bulkActions?: DataTableBulkActions<TData>;
  /** Afficher la barre de sélection quand des lignes sont cochées. Par défaut : si la sélection est active. */
  selectionBar?: boolean;
  /** Filtres supplémentaires, posés après les puces de facettes. */
  children?: React.ReactNode;
  labels?: Partial<DataTableLabels>;
}

/**
 * Barre d'outils : recherche, puces de filtres à facettes, « Réinitialiser »,
 * puis à droite actions, densité, colonnes et export. Quand des lignes sont
 * sélectionnées, elle laisse place à la barre d'actions groupées.
 */
function DataTableToolbarInner<TData>(
  {
    table,
    search = true,
    searchPlaceholder,
    searchDebounce,
    facets = true,
    columnVisibility = true,
    density,
    onDensityChange,
    exportCsv: exportOption = false,
    actions,
    bulkActions,
    selectionBar,
    children,
    labels: labelsProp,
    className,
    ...props
  }: DataTableToolbarProps<TData>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const labels = useDataTableLabels(labelsProp);
  const locale = useLocale();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const state = table.getState();
  const selectedCount = Object.values(state.rowSelection).filter(Boolean).length;
  const selectionEnabled = table.options.enableRowSelection !== false && table.options.enableRowSelection !== undefined;
  const showSelectionBar = (selectionBar ?? selectionEnabled) && selectedCount > 0;
  const isFiltered = state.columnFilters.length > 0 || Boolean(state.globalFilter);
  const facetColumns = facets
    ? table.getAllLeafColumns().filter((column) => column.columnDef.meta?.filterOptions && column.getCanFilter())
    : [];
  const exportSettings = typeof exportOption === "object" ? exportOption : {};

  const setRef = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  // Après « Tout désélectionner », la barre disparaît : le focus revient à la case d'en-tête.
  const focusSelectAll = () => {
    const scope = rootRef.current?.closest<HTMLElement>("[data-slot='data-table']") ?? rootRef.current?.ownerDocument;
    setTimeout(() => scope?.querySelector<HTMLElement>("[data-slot='data-table-select-all']")?.focus(), 0);
  };

  return (
    <div
      ref={setRef}
      data-slot="data-table-toolbar"
      data-selection={showSelectionBar || undefined}
      className={cn("ui-data-table__toolbar", className)}
      {...props}
    >
      {showSelectionBar ? (
        <DataTableSelectionBar table={table} labels={labelsProp} onClear={focusSelectAll}>
          {bulkActions as DataTableBulkActions}
        </DataTableSelectionBar>
      ) : (
        <>
          <div className="ui-data-table__filters">
            {search && <DataTableSearch table={table} placeholder={searchPlaceholder} debounce={searchDebounce} labels={labelsProp} />}
            {facetColumns.map((column) => (
              <DataTableFacetedFilter
                key={column.id}
                column={column}
                showCounts={!table.options.manualFiltering}
                labels={labelsProp}
              />
            ))}
            {children}
            {isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                className="ui-data-table__reset"
                onClick={() => {
                  table.resetColumnFilters(true);
                  table.resetGlobalFilter(true);
                }}
              >
                {labels.reset}
                <CloseIcon />
              </Button>
            )}
          </div>
          <div className="ui-data-table__toolbar-end">
            {actions}
            {density && onDensityChange && <DataTableDensityToggle value={density} onValueChange={onDensityChange} labels={labelsProp} />}
            {columnVisibility && <DataTableViewOptions table={table} labels={labelsProp} />}
            {exportOption !== false && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  exportCsv(table, exportSettings.filename ?? "export", {
                    locale,
                    booleans: [labels.yes, labels.no],
                    ...exportSettings.options,
                  })
                }
              >
                <DownloadIcon />
                {labels.exportCsv}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export const DataTableToolbar = React.forwardRef(DataTableToolbarInner) as <TData>(
  props: DataTableToolbarProps<TData> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement | null;
