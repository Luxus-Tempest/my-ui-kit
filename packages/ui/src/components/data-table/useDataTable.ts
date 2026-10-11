import * as React from "react";
import {
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnPinningState,
  type ColumnSizingState,
  type ExpandedState,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type Table,
  type TableOptions,
  type Updater,
  type VisibilityState,
} from "@tanstack/react-table";
import { DataTableDefaultCell, expandColumn, selectColumn } from "./columns";
import type { DataTablePersistedKey, DataTableState } from "./types";
import {
  createGlobalFilterFn,
  DEFAULT_MAX_COLUMN_WIDTH,
  DEFAULT_MIN_COLUMN_WIDTH,
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
  /**
   * Colonnes figées : entrées « Figer au début / à la fin / Libérer » du menu
   * de colonne, `meta.pin` et état `columnPinning`. Par défaut `true`. Les
   * colonnes de sélection, de dépliage et d'actions restent figées dans tous les cas.
   */
  enableColumnPinning?: boolean;
  /**
   * Colonnes redimensionnables : poignée dans chaque en-tête (souris, doigt,
   * clavier), mise en page fixe (`table-layout: fixed`), largeurs dans l'état
   * `columnSizing`. Largeur de départ : `size`, sinon `meta.width` en px, sinon
   * 150 ; bornes `meta.minWidth` / `meta.maxWidth`. Par défaut `false`.
   */
  enableColumnResizing?: boolean;
  /**
   * Lignes enfants (données hiérarchiques) : elles s'affichent sous leur parent
   * déplié, en retrait dans la première colonne de données. Le tri s'applique
   * dans chaque niveau ; une recherche ou un filtre garde les parents des lignes
   * trouvées ; avec la pagination, les enfants restent sur la page du parent.
   */
  getSubRows?: (row: TData, index: number) => TData[] | undefined;
  /**
   * Ligne dépliable. Avec un panneau de détail (`renderSubComponent` de
   * DataTable), toutes les lignes le sont par défaut ; sinon, celles qui ont
   * des lignes enfants.
   */
  getRowCanExpand?: (row: Row<TData>) => boolean;
  /**
   * Colonne de dépliage (chevron) ajoutée en tête si aucune colonne `expand`
   * n'est déclarée. Par défaut : avec `getSubRows` ou `getRowCanExpand`.
   */
  enableExpanding?: boolean;
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
  /** Colonnes figées par l'utilisateur (sans les colonnes figées d'office). */
  onColumnPinningChange?: (columnPinning: ColumnPinningState) => void;
  onColumnSizingChange?: (columnSizing: ColumnSizingState) => void;
  onExpandedChange?: (expanded: ExpandedState) => void;
  /**
   * Mémorise l'état dans `localStorage` sous cette clé (tri, filtres, colonnes,
   * lignes par page, densité, colonnes figées, largeurs).
   */
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

/** Colonnes feuilles (celles qui portent les cellules), dans l'ordre de déclaration. */
function leafDefs<TData>(columns: ColumnDef<TData, any>[], out: AnyColumnDef<TData>[] = []): AnyColumnDef<TData>[] {
  for (const def of columns as AnyColumnDef<TData>[]) {
    if (def.columns?.length) leafDefs(def.columns, out);
    else out.push(def);
  }
  return out;
}

interface PrepareOptions {
  withSelect: boolean;
  withExpand: boolean;
}

/**
 * Pose le filtre à facettes sur les colonnes qui déclarent `meta.filterOptions`
 * sans `filterFn`, traduit `meta.width` / `minWidth` / `maxWidth` en tailles
 * TanStack, et ajoute en tête les colonnes de sélection et de dépliage.
 */
function prepareColumns<TData>(columns: ColumnDef<TData, any>[], { withSelect, withExpand }: PrepareOptions): ColumnDef<TData, any>[] {
  const prepare = (def: AnyColumnDef<TData>): ColumnDef<TData, any> => {
    let next: AnyColumnDef<TData> = def;
    if (def.columns) next = { ...next, columns: def.columns.map((child) => prepare(child as AnyColumnDef<TData>)) } as AnyColumnDef<TData>;
    const meta = def.meta;
    if (meta?.filterOptions && def.filterFn === undefined) next = { ...next, filterFn: facetFilterFn } as AnyColumnDef<TData>;
    if (!def.columns && meta) {
      const sizes: Partial<Pick<ColumnDef<TData, any>, "size" | "minSize" | "maxSize">> = {};
      if (def.size === undefined && typeof meta.width === "number") sizes.size = meta.width;
      if (def.minSize === undefined && meta.minWidth != null) sizes.minSize = meta.minWidth;
      if (def.maxSize === undefined && meta.maxWidth != null) sizes.maxSize = meta.maxWidth;
      if (Object.keys(sizes).length) next = { ...next, ...sizes } as AnyColumnDef<TData>;
    }
    return next;
  };
  const prepared = (columns as AnyColumnDef<TData>[]).map(prepare);
  const ids = collectColumnIds(columns);
  if (withSelect && !ids.has("select")) prepared.unshift(selectColumn<TData>() as AnyColumnDef<TData>);
  if (withExpand && !ids.has("expand")) {
    // Le chevron se place juste après la case de sélection, sinon en tête.
    const after = prepared.findIndex((def) => columnId(def) === "select");
    prepared.splice(after + 1, 0, expandColumn<TData>() as AnyColumnDef<TData>);
  }
  return prepared;
}

/* ── Colonnes figées ───────────────────────────────────────────────── */

interface PinPlan {
  /** Figées pour de bon (`enablePinning: false` + `meta.pin`), dans l'ordre de déclaration. */
  forcedStart: string[];
  forcedEnd: string[];
  forced: Set<string>;
  /** Colonnes que l'utilisateur peut figer ou libérer. */
  pinnable: Set<string>;
  /** État de départ tiré de `meta.pin` (colonnes libérables). */
  initial: ColumnPinningState;
}

function planPinning<TData>(columns: ColumnDef<TData, any>[]): PinPlan {
  const plan: PinPlan = { forcedStart: [], forcedEnd: [], forced: new Set(), pinnable: new Set(), initial: { left: [], right: [] } };
  for (const def of leafDefs(columns)) {
    const id = columnId(def);
    if (!id) continue;
    const pin = def.meta?.pin;
    if (def.enablePinning === false) {
      if (pin === "start") plan.forcedStart.push(id);
      else if (pin === "end") plan.forcedEnd.push(id);
      if (pin) plan.forced.add(id);
      continue;
    }
    plan.pinnable.add(id);
    if (pin === "start") plan.initial.left!.push(id);
    else if (pin === "end") plan.initial.right!.push(id);
  }
  return plan;
}

const unique = (ids: string[]) => [...new Set(ids)];

/** Ne garde de l'état utilisateur que les colonnes qu'il peut figer. */
function userPinning(state: ColumnPinningState, plan: PinPlan): ColumnPinningState {
  const keep = (ids: string[] | undefined) => unique((ids ?? []).filter((id) => plan.pinnable.has(id) && !plan.forced.has(id)));
  const left = keep(state.left);
  const right = keep(state.right).filter((id) => !left.includes(id));
  return { left, right };
}

/** État transmis à TanStack : colonnes figées d'office aux bords, celles de l'utilisateur à l'intérieur. */
function effectivePinning(state: ColumnPinningState, plan: PinPlan, enabled: boolean): ColumnPinningState {
  const user = enabled ? userPinning(state, plan) : { left: [], right: [] };
  return { left: [...plan.forcedStart, ...user.left!], right: [...user.right!, ...plan.forcedEnd] };
}

const sameIds = (a: string[] = [], b: string[] = []) => a.length === b.length && a.every((id, i) => id === b[i]);
const samePinning = (a: ColumnPinningState, b: ColumnPinningState) => sameIds(a.left, b.left) && sameIds(a.right, b.right);

/* ── Persistance ───────────────────────────────────────────────────── */

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const stringList = (value: unknown, ids: Set<string>) =>
  Array.isArray(value) ? value.filter((id): id is string => typeof id === "string" && ids.has(id)) : [];

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
  if (keys.includes("columnPinning") && isObject(raw.columnPinning))
    out.columnPinning = { left: stringList(raw.columnPinning.left, ids), right: stringList(raw.columnPinning.right, ids) };
  if (keys.includes("columnSizing") && isObject(raw.columnSizing)) {
    out.columnSizing = Object.fromEntries(
      Object.entries(raw.columnSizing).filter(([id, size]) => ids.has(id) && typeof size === "number" && Number.isFinite(size) && size > 0),
    ) as ColumnSizingState;
  }
  return out;
}

const EMPTY_ARRAY: never[] = [];
const EMPTY_OBJECT = {};

/**
 * Crée l'instance TanStack Table configurée comme `DataTable` : tri français
 * multi-colonnes, recherche sans accents, filtres à facettes, pagination,
 * sélection, colonnes figées et redimensionnables, lignes dépliables, mode
 * serveur et persistance. À utiliser pour composer sa propre table avec
 * `DataTableView`, `DataTableToolbar`, `DataTablePagination`…
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
    enableColumnPinning = true,
    enableColumnResizing = false,
    getSubRows,
    getRowCanExpand,
    enableExpanding,
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

  const withSelect = enableRowSelection !== false;
  const withExpand = enableExpanding ?? Boolean(getSubRows || getRowCanExpand);
  const preparedColumns = React.useMemo(
    () => prepareColumns(columns, { withSelect, withExpand }),
    [columns, withSelect, withExpand],
  );
  const pinPlan = React.useMemo(() => planPinning(preparedColumns), [preparedColumns]);
  const pinPlanRef = React.useRef(pinPlan);
  pinPlanRef.current = pinPlan;

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
  const [columnPinning, setColumnPinning] = useStateSlice<ColumnPinningState>(
    state?.columnPinning,
    () => userPinning(persisted.columnPinning ?? initialState?.columnPinning ?? pinPlan.initial, pinPlan),
    options.onColumnPinningChange,
  );
  const [columnSizing, setColumnSizing] = useStateSlice<ColumnSizingState>(
    state?.columnSizing,
    () => persisted.columnSizing ?? initialState?.columnSizing ?? EMPTY_OBJECT,
    options.onColumnSizingChange,
  );
  const [expanded, setExpanded] = useStateSlice<ExpandedState>(
    state?.expanded,
    () => initialState?.expanded ?? EMPTY_OBJECT,
    options.onExpandedChange,
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

  // TanStack voit les colonnes figées d'office ; l'appelant et la persistance, seulement son choix.
  const pinningState = React.useMemo(
    () => effectivePinning(columnPinning, pinPlan, enableColumnPinning),
    [columnPinning, pinPlan, enableColumnPinning],
  );
  const pinningRef = React.useRef(pinningState);
  pinningRef.current = pinningState;
  const onColumnPinningChange = React.useCallback(
    (updater: Updater<ColumnPinningState>) => {
      const next = userPinning(resolveUpdater(updater, pinningRef.current), pinPlanRef.current);
      setColumnPinning((previous) => (samePinning(previous, next) ? previous : next));
    },
    [setColumnPinning],
  );

  const tableRef = React.useRef<Table<TData> | undefined>(undefined);
  const globalFilterFn = React.useMemo(() => createGlobalFilterFn(() => tableRef.current as Table<any> | undefined), []);

  const { defaultColumn, ...restTableOptions } = tableOptions ?? {};
  // Sans pagination côté client, les lignes enfants se déplient dans le modèle développé ;
  // avec, elles suivent leur parent sur sa page au lieu de compter dans la taille de page.
  const paginated = !manualPagination && enablePagination;

  const table = useReactTable<TData>({
    data,
    columns: preparedColumns,
    getRowId,
    getSubRows,
    // Données hiérarchiques : une recherche garde les parents des lignes trouvées.
    filterFromLeafRows: Boolean(getSubRows),
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      pagination,
      rowSelection,
      columnPinning: pinningState,
      columnSizing,
      expanded,
    },
    onSortingChange,
    onColumnFiltersChange,
    onGlobalFilterChange,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onColumnPinningChange,
    onColumnSizingChange: setColumnSizing,
    onExpandedChange: setExpanded,
    // Les modèles sont toujours fournis : TanStack les met en cache à la première
    // utilisation. Désactiver une fonction passe donc par le mode « manuel ».
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getExpandedRowModel: getExpandedRowModel(),
    manualPagination: !paginated,
    autoResetPageIndex: paginated,
    paginateExpandedRows: !paginated,
    manualSorting,
    manualFiltering,
    rowCount,
    enableSorting,
    enableMultiSort,
    enableRowSelection,
    enableColumnPinning,
    enableColumnResizing,
    columnResizeMode: "onChange",
    enableExpanding: withExpand,
    getRowCanExpand,
    // Premier clic : croissant, puis décroissant, puis sans tri, pour toutes les colonnes.
    sortDescFirst: false,
    globalFilterFn,
    getColumnCanGlobalFilter: () => true,
    defaultColumn: {
      cell: DataTableDefaultCell as NonNullable<ColumnDef<TData, unknown>["cell"]>,
      sortingFn: localeSortingFn,
      minSize: DEFAULT_MIN_COLUMN_WIDTH,
      maxSize: DEFAULT_MAX_COLUMN_WIDTH,
      ...defaultColumn,
    },
    ...restTableOptions,
  });
  tableRef.current = table;

  // Persistance : écrit la part de l'état choisie à chaque changement (pas pendant un glissement de poignée).
  const resizing = Boolean(table.getState().columnSizingInfo?.isResizingColumn);
  React.useEffect(() => {
    if (!persistKey || resizing) return;
    const keys = persistSignature.split(",") as DataTablePersistedKey[];
    const out: PersistedDataTableState = {};
    if (keys.includes("sorting")) out.sorting = sorting;
    if (keys.includes("columnFilters")) out.columnFilters = columnFilters;
    if (keys.includes("globalFilter")) out.globalFilter = globalFilter;
    if (keys.includes("columnVisibility")) out.columnVisibility = columnVisibility;
    if (keys.includes("pageSize")) out.pageSize = pagination.pageSize;
    if (keys.includes("columnPinning")) out.columnPinning = columnPinning;
    if (keys.includes("columnSizing")) out.columnSizing = columnSizing;
    writePersisted(persistKey, out);
  }, [
    persistKey,
    persistSignature,
    resizing,
    sorting,
    columnFilters,
    globalFilter,
    columnVisibility,
    pagination.pageSize,
    columnPinning,
    columnSizing,
  ]);

  return table;
}

/** Densité mémorisée avec `persistKey` (lue une fois au montage). */
export function readPersistedDensity(persistKey: string | undefined, persistState: DataTablePersistedKey[] = DEFAULT_PERSISTED_KEYS) {
  if (!persistKey || !persistState.includes("density")) return undefined;
  return sanitizePersisted(readPersisted(persistKey), new Set(), ["density"]).density;
}
