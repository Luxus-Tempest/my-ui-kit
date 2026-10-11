import * as React from "react";
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type Table,
  type TableOptions,
  type Updater,
  type VisibilityState,
} from "@tanstack/react-table";
import { DataTableDefaultCell, selectColumn } from "./columns";
import type { DataTablePersistedKey, DataTableState } from "./types";
import {
  createGlobalFilterFn,
  DEFAULT_PERSISTED_KEYS,
  facetFilterFn,
  localeSortingFn,
  readPersisted,
  resolveUpdater,
  writePersisted,
  type PersistedDataTableState,
} from "./utils";

export interface UseDataTableOptions<TData> {
  /** Lignes à afficher (en mode serveur : la page courante). */
  data: TData[];
  /** Colonnes TanStack (`createColumnHelper`, `ColumnDef[]`). */
  columns: ColumnDef<TData, any>[];
  /** Identifiant stable d'une ligne : indispensable pour garder la sélection quand les données changent. */
  getRowId?: (row: TData, index: number) => string;
  /** Tri au clic sur les en-têtes. Par défaut `true`. */
  enableSorting?: boolean;
  /** Maj+clic ajoute une colonne au tri. Par défaut `true`. */
  enableMultiSort?: boolean;
  /**
   * Sélection de lignes ; ajoute une colonne de cases en tête si aucune colonne
   * `select` n'est déclarée. Une fonction limite les lignes sélectionnables.
   */
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean);
  /** Pagination. Par défaut `true`. */
  enablePagination?: boolean;
  /** Pagination faite par le serveur : `data` est la page courante, `rowCount` le total. */
  manualPagination?: boolean;
  /** Tri fait par le serveur : suivre `onSortingChange`. */
  manualSorting?: boolean;
  /** Recherche et filtres faits par le serveur : suivre `onGlobalFilterChange` et `onColumnFiltersChange`. */
  manualFiltering?: boolean;
  /** Nombre total de lignes côté serveur (mode `manualPagination`). */
  rowCount?: number;
  /** État de départ (non contrôlé). */
  initialState?: Partial<DataTableState>;
  /** État contrôlé, partie par partie : ce qui est fourni ici n'est plus géré en interne. */
  state?: Partial<DataTableState>;
  /** Reçoivent la **nouvelle valeur** (pas une fonction de mise à jour). */
  onSortingChange?: (sorting: SortingState) => void;
  onColumnFiltersChange?: (columnFilters: ColumnFiltersState) => void;
  onGlobalFilterChange?: (globalFilter: string) => void;
  onPaginationChange?: (pagination: PaginationState) => void;
  onRowSelectionChange?: (rowSelection: RowSelectionState) => void;
  onColumnVisibilityChange?: (columnVisibility: VisibilityState) => void;
  /** Mémorise l'état dans `localStorage` sous cette clé (tri, filtres, colonnes, lignes par page, densité). */
  persistKey?: string;
  /** Parties de l'état mémorisées avec `persistKey`. */
  persistState?: DataTablePersistedKey[];
  /** Options TanStack supplémentaires, appliquées en dernier (cas avancés). */
  tableOptions?: Partial<TableOptions<TData>>;
}

/** Une partie d'état contrôlable : valeur courante et mise à jour qui accepte une fonction. */
function useStateSlice<T>(controlled: T | undefined, initial: () => T, onChange?: (value: T) => void) {
  const [inner, setInner] = React.useState(initial);
  const isControlled = controlled !== undefined;
  const value = isControlled ? (controlled as T) : inner;
  const valueRef = React.useRef(value);
  valueRef.current = value;
  const controlledRef = React.useRef(isControlled);
  controlledRef.current = isControlled;
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  const set = React.useCallback((updater: Updater<T>) => {
    const next = resolveUpdater(updater, valueRef.current);
    if (Object.is(next, valueRef.current)) return;
    // Plusieurs mises à jour dans le même tour (filtre puis retour en page 1) voient la précédente.
    valueRef.current = next;
    if (!controlledRef.current) setInner(next);
    onChangeRef.current?.(next);
  }, []);

  return [value, set] as const;
}

type AnyColumnDef<TData> = ColumnDef<TData, any> & { columns?: ColumnDef<TData, any>[]; accessorKey?: unknown };

/** Identifiant que TanStack donnera à la colonne (id, accessorKey avec « . » → « _ », ou en-tête texte). */
function columnId<TData>(def: AnyColumnDef<TData>): string | undefined {
  if (def.id) return def.id;
  if (typeof def.accessorKey === "string") return def.accessorKey.replace(/\./g, "_");
  return typeof def.header === "string" ? def.header : undefined;
}

function collectColumnIds<TData>(columns: ColumnDef<TData, any>[], ids = new Set<string>()): Set<string> {
  for (const def of columns as AnyColumnDef<TData>[]) {
    const id = columnId(def);
    if (id) ids.add(id);
    if (def.columns) collectColumnIds(def.columns, ids);
  }
  return ids;
}

/** Pose le filtre à facettes sur les colonnes qui déclarent `meta.filterOptions` sans `filterFn`. */
function prepareColumns<TData>(columns: ColumnDef<TData, any>[], withSelect: boolean): ColumnDef<TData, any>[] {
  const prepare = (def: AnyColumnDef<TData>): ColumnDef<TData, any> => {
    let next: AnyColumnDef<TData> = def;
    if (def.columns) next = { ...next, columns: def.columns.map((child) => prepare(child as AnyColumnDef<TData>)) } as AnyColumnDef<TData>;
    if (def.meta?.filterOptions && def.filterFn === undefined) next = { ...next, filterFn: facetFilterFn } as AnyColumnDef<TData>;
    return next;
  };
  const prepared = (columns as AnyColumnDef<TData>[]).map(prepare);
  return withSelect && !collectColumnIds(columns).has("select") ? [selectColumn<TData>(), ...prepared] : prepared;
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

/** Garde ce qui est utilisable dans l'état relu (colonnes disparues, valeurs corrompues). */
function sanitizePersisted(raw: PersistedDataTableState, ids: Set<string>, keys: DataTablePersistedKey[]): PersistedDataTableState {
  const out: PersistedDataTableState = {};
  if (keys.includes("sorting") && Array.isArray(raw.sorting))
    out.sorting = raw.sorting.filter((s) => isObject(s) && typeof s.id === "string" && ids.has(s.id) && typeof s.desc === "boolean");
  if (keys.includes("columnFilters") && Array.isArray(raw.columnFilters))
    out.columnFilters = raw.columnFilters.filter((f) => isObject(f) && typeof f.id === "string" && ids.has(f.id));
  if (keys.includes("globalFilter") && typeof raw.globalFilter === "string") out.globalFilter = raw.globalFilter;
  if (keys.includes("columnVisibility") && isObject(raw.columnVisibility)) {
    out.columnVisibility = Object.fromEntries(
      Object.entries(raw.columnVisibility).filter(([id, visible]) => ids.has(id) && typeof visible === "boolean"),
    ) as VisibilityState;
  }
  if (keys.includes("pageSize") && typeof raw.pageSize === "number" && raw.pageSize > 0) out.pageSize = raw.pageSize;
  if (keys.includes("density") && (raw.density === "compact" || raw.density === "default" || raw.density === "comfortable"))
    out.density = raw.density;
  return out;
}

const EMPTY_ARRAY: never[] = [];
const EMPTY_OBJECT = {};

/**
 * Crée l'instance TanStack Table configurée comme `DataTable` : tri français
 * multi-colonnes, recherche sans accents, filtres à facettes, pagination,
 * sélection, mode serveur et persistance. À utiliser pour composer sa propre
 * table avec `DataTableView`, `DataTableToolbar`, `DataTablePagination`…
 *
 *   const table = useDataTable({ data, columns, enableRowSelection: true });
 *   return (
 *     <>
 *       <DataTableToolbar table={table} />
 *       <DataTableView table={table} />
 *       <DataTablePagination table={table} />
 *     </>
 *   );
 */
export function useDataTable<TData>(options: UseDataTableOptions<TData>): Table<TData> {
  const {
    data,
    columns,
    getRowId,
    enableSorting = true,
    enableMultiSort = true,
    enableRowSelection = false,
    enablePagination = true,
    manualPagination = false,
    manualSorting = false,
    manualFiltering = false,
    rowCount,
    initialState,
    state,
    persistKey,
    persistState = DEFAULT_PERSISTED_KEYS,
    tableOptions,
  } = options;

  const persistSignature = persistState.join(",");
  const persisted = React.useState(() =>
    persistKey ? sanitizePersisted(readPersisted(persistKey), collectColumnIds(columns), persistState) : {},
  )[0];

  const [sorting, setSorting] = useStateSlice<SortingState>(
    state?.sorting,
    () => persisted.sorting ?? initialState?.sorting ?? EMPTY_ARRAY,
    options.onSortingChange,
  );
  const [columnFilters, setColumnFilters] = useStateSlice<ColumnFiltersState>(
    state?.columnFilters,
    () => persisted.columnFilters ?? initialState?.columnFilters ?? EMPTY_ARRAY,
    options.onColumnFiltersChange,
  );
  const [globalFilter, setGlobalFilter] = useStateSlice<string>(
    state?.globalFilter,
    () => persisted.globalFilter ?? initialState?.globalFilter ?? "",
    options.onGlobalFilterChange,
  );
  const [columnVisibility, setColumnVisibility] = useStateSlice<VisibilityState>(
    state?.columnVisibility,
    () => persisted.columnVisibility ?? initialState?.columnVisibility ?? EMPTY_OBJECT,
    options.onColumnVisibilityChange,
  );
  const [pagination, setPagination] = useStateSlice<PaginationState>(
    state?.pagination,
    () => ({
      pageIndex: initialState?.pagination?.pageIndex ?? 0,
      pageSize: persisted.pageSize ?? initialState?.pagination?.pageSize ?? 10,
    }),
    options.onPaginationChange,
  );
  const [rowSelection, setRowSelection] = useStateSlice<RowSelectionState>(
    state?.rowSelection,
    () => initialState?.rowSelection ?? EMPTY_OBJECT,
    options.onRowSelectionChange,
  );

  // En mode serveur, un nouveau tri ou un nouveau filtre ramène en page 1
  // (en mode client, TanStack s'en charge lui-même).
  const backToFirstPage = React.useCallback(() => {
    if (manualPagination) setPagination((p) => (p.pageIndex === 0 ? p : { ...p, pageIndex: 0 }));
  }, [manualPagination, setPagination]);
  const onSortingChange = React.useCallback(
    (updater: Updater<SortingState>) => {
      setSorting(updater);
      backToFirstPage();
    },
    [setSorting, backToFirstPage],
  );
  const onColumnFiltersChange = React.useCallback(
    (updater: Updater<ColumnFiltersState>) => {
      setColumnFilters(updater);
      backToFirstPage();
    },
    [setColumnFilters, backToFirstPage],
  );
  const onGlobalFilterChange = React.useCallback(
    (updater: Updater<string>) => {
      setGlobalFilter((previous) => {
        const next = resolveUpdater(updater, previous);
        return next == null ? "" : String(next);
      });
      backToFirstPage();
    },
    [setGlobalFilter, backToFirstPage],
  );

  const withSelect = enableRowSelection !== false;
  const preparedColumns = React.useMemo(() => prepareColumns(columns, withSelect), [columns, withSelect]);

  const tableRef = React.useRef<Table<TData> | undefined>(undefined);
  const globalFilterFn = React.useMemo(() => createGlobalFilterFn(() => tableRef.current as Table<any> | undefined), []);

  const { defaultColumn, ...restTableOptions } = tableOptions ?? {};

  const table = useReactTable<TData>({
    data,
    columns: preparedColumns,
    getRowId,
    state: { sorting, columnFilters, globalFilter, columnVisibility, pagination, rowSelection },
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    // Les modèles sont toujours fournis : TanStack les met en cache à la première
    // utilisation. Désactiver une fonction passe donc par le mode « manuel ».
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: manualPagination || !enablePagination,
    autoResetPageIndex: !manualPagination && enablePagination,
    manualSorting,
    manualFiltering,
    rowCount,
    enableSorting,
    enableMultiSort,
    enableRowSelection,
    // Premier clic : croissant, puis décroissant, puis sans tri, pour toutes les colonnes.
    sortDescFirst: false,
    globalFilterFn,
    getColumnCanGlobalFilter: () => true,
    defaultColumn: {
      cell: DataTableDefaultCell as NonNullable<ColumnDef<TData, unknown>["cell"]>,
      sortingFn: localeSortingFn,
      ...defaultColumn,
    },
    ...restTableOptions,
  });
  tableRef.current = table;

  // Persistance : écrit la part de l'état choisie à chaque changement.
  React.useEffect(() => {
    if (!persistKey) return;
    const keys = persistSignature.split(",") as DataTablePersistedKey[];
    const out: PersistedDataTableState = {};
    if (keys.includes("sorting")) out.sorting = sorting;
    if (keys.includes("columnFilters")) out.columnFilters = columnFilters;
    if (keys.includes("globalFilter")) out.globalFilter = globalFilter;
    if (keys.includes("columnVisibility")) out.columnVisibility = columnVisibility;
    if (keys.includes("pageSize")) out.pageSize = pagination.pageSize;
    writePersisted(persistKey, out);
  }, [persistKey, persistSignature, sorting, columnFilters, globalFilter, columnVisibility, pagination.pageSize]);

  return table;
}

/** Densité mémorisée avec `persistKey` (lue une fois au montage). */
export function readPersistedDensity(persistKey: string | undefined, persistState: DataTablePersistedKey[] = DEFAULT_PERSISTED_KEYS) {
  if (!persistKey || !persistState.includes("density")) return undefined;
  return sanitizePersisted(readPersisted(persistKey), new Set(), ["density"]).density;
}
