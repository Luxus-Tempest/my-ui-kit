import * as React from "react";
import { flexRender, type Column, type Header, type Row, type Table as TanstackTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useLocale } from "../../i18n/LocaleProvider";
import { cn } from "../../utils/cn";
import { Button } from "../button/Button";
import { EmptyState } from "../empty-state/EmptyState";
import { Skeleton } from "../skeleton/Skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  type TableProps,
} from "../table/Table";
import { computeAggregate, formatAggregate } from "./aggregate";
import { DataTableViewContext, useDataTableLabels, type DataTableViewContextValue } from "./context";
import { DataTableColumnHeader } from "./DataTableColumnHeader";
import { DataTableColumnResizer } from "./DataTableColumnResizer";
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
  /** Hauteur maximale de la zone défilante ; fige l'en-tête (et la ligne de totaux). */
  maxHeight?: number | string;
  /** Ne rend que les lignes visibles (10 000 lignes et plus) ; exige `height`. */
  virtualized?: boolean;
  /** Hauteur de la zone défilante en mode virtualisé. Par défaut 480 px. */
  height?: number | string;
  /** Lignes rendues hors écran en mode virtualisé. Par défaut 8. */
  overscan?: number;
  /**
   * Clic sur une ligne (hors cases, boutons et liens). La ligne devient
   * focalisable : flèches haut et bas pour passer d'une ligne à l'autre,
   * Entrée pour l'ouvrir, Espace pour la (dé)sélectionner, flèches de côté
   * pour la déplier ou la replier.
   */
  onRowClick?: (row: Row<TData>, event: DataTableRowEvent) => void;
  /** Classe d'une ligne. */
  rowClassName?: (row: Row<TData>) => string | undefined;
  /**
   * Panneau de détail d'une ligne dépliée, rendu dans une ligne pleine largeur
   * sous elle. La table doit savoir quelles lignes se déplient
   * (`getRowCanExpand` de `useDataTable` ; `DataTable` s'en charge).
   */
  renderSubComponent?: (row: Row<TData>) => React.ReactNode;
  /**
   * Ligne de totaux (`<tfoot>`). Par défaut : dès qu'une colonne déclare
   * `meta.aggregate` (ou `footer`), ou que `aggregates` est fourni.
   */
  showFooter?: boolean;
  /**
   * Totaux fournis par l'appelant, par identifiant de colonne : en pagination
   * serveur, le client ne voit pas toutes les lignes. Un nombre passe par `meta.format`.
   */
  aggregates?: Record<string, React.ReactNode>;
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
  if (id === "actions" || id === "expand") return { width: 24, height: 24 };
  const widths = numeric ? SKELETON_NUMERIC : SKELETON_WIDTHS;
  return { width: widths[(row * 3 + col) % widths.length] };
}

/* ── Colonnes figées ───────────────────────────────────────────────── */

type PinSide = "start" | "end";

interface PinnedLayout {
  /** Décalage de chaque colonne figée depuis son bord (px). */
  offsets: Record<string, number>;
  /** Largeur des colonnes utilitaires de tête (sélection, dépliage) : retrait du panneau de détail. */
  lead: number;
  /** Largeur visible de la zone défilante : largeur du panneau de détail. */
  view: number;
}

const sameLayout = (a: PinnedLayout | null, b: PinnedLayout) =>
  a != null &&
  a.lead === b.lead &&
  a.view === b.view &&
  Object.keys(b.offsets).length === Object.keys(a.offsets).length &&
  Object.entries(b.offsets).every(([id, offset]) => a.offsets[id] === offset);

/**
 * Décalages des colonnes figées. Au premier rendu (et sans mise en page,
 * comme dans jsdom), ils viennent des largeurs théoriques (`getSize()`) ;
 * dès que la table est affichée, ils sont mesurés sur les en-têtes et suivis
 * par un ResizeObserver (contenu, densité, redimensionnement, conteneur).
 */
function usePinnedLayout(
  tableRef: React.RefObject<HTMLTableElement | null>,
  start: Column<any, unknown>[],
  end: Column<any, unknown>[],
  lead: string[],
  enabled: boolean,
): PinnedLayout {
  // Signature stable des colonnes suivies (un identifiant peut contenir n'importe quel caractère).
  const signature = JSON.stringify([start.map((c) => c.id), end.map((c) => c.id), lead]);

  const fallback: PinnedLayout = { offsets: {}, lead: 0, view: 0 };
  let acc = 0;
  for (const column of start) {
    fallback.offsets[column.id] = acc;
    acc += column.getSize();
  }
  acc = 0;
  for (const column of [...end].reverse()) {
    fallback.offsets[column.id] = acc;
    acc += column.getSize();
  }
  for (const column of start) if (lead.includes(column.id)) fallback.lead += column.getSize();

  const [measured, setMeasured] = React.useState<PinnedLayout | null>(null);
  useIsomorphicLayoutEffect(() => {
    const element = tableRef.current;
    const container = element?.parentElement;
    if (!enabled || !element || !container) return;
    const [startList, endList, leadList] = JSON.parse(signature) as [string[], string[], string[]];
    const headerCells = () => {
      const head = element.tHead;
      return Array.from(head?.rows[head.rows.length - 1]?.cells ?? []);
    };
    const measure = () => {
      const view = container.clientWidth;
      // Pas de mise en page (jsdom, table masquée) : on garde les largeurs théoriques.
      if (!view) return;
      const widths = new Map<string, number>();
      for (const cell of headerCells()) {
        const id = cell.getAttribute("data-column-id");
        if (id) widths.set(id, cell.getBoundingClientRect().width);
      }
      const next: PinnedLayout = { offsets: {}, lead: 0, view };
      let offset = 0;
      for (const id of startList) {
        next.offsets[id] = offset;
        offset += widths.get(id) ?? 0;
      }
      offset = 0;
      for (const id of [...endList].reverse()) {
        next.offsets[id] = offset;
        offset += widths.get(id) ?? 0;
      }
      for (const id of leadList) next.lead += widths.get(id) ?? 0;
      setMeasured((previous) => (sameLayout(previous, next) ? previous : next));
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    const watched = new Set([...startList, ...endList, ...leadList]);
    for (const cell of headerCells()) if (watched.has(cell.getAttribute("data-column-id") ?? "")) observer.observe(cell);
    return () => observer.disconnect();
  }, [signature, enabled, tableRef]);

  return measured && enabled ? measured : fallback;
}

/** Identifiant DOM sûr tiré d'un identifiant de ligne (espaces, points…). */
const domSafe = (value: string) => value.replace(/[^\w-]/g, (char) => `_${char.charCodeAt(0).toString(36)}`);

type CustomProperties = React.CSSProperties & Record<`--${string}`, string | number | undefined>;

/**
 * Vue de la table : en-têtes (tri, `aria-sort`, menu de colonne, poignées de
 * redimensionnement), lignes, colonnes figées, lignes dépliables, ligne de
 * totaux, états de chargement, vide et « aucun résultat », virtualisation.
 * S'appuie sur `Table` ; à composer avec `useDataTable` et les autres briques.
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
    renderSubComponent,
    showFooter,
    aggregates,
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
    style,
    ...props
  }: DataTableViewProps<TData>,
  ref: React.ForwardedRef<HTMLTableElement>,
) {
  const labels = useDataTableLabels(labelsProp);
  const baseId = React.useId();
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
  const startColumns = table.getLeftVisibleLeafColumns();
  const centerColumns = table.getCenterVisibleLeafColumns();
  const endColumns = table.getRightVisibleLeafColumns();
  // Ordre affiché : colonnes figées au début, libres, figées à la fin (comme les en-têtes de TanStack).
  const leafColumns = [...startColumns, ...centerColumns, ...endColumns];
  const headerGroups = table.getHeaderGroups();
  const resizable = table.options.enableColumnResizing === true;
  const isFiltered = state.columnFilters.length > 0 || Boolean(state.globalFilter);
  const status: ViewStatus =
    rows.length === 0 ? (loading ? "loading" : isFiltered ? "no-results" : "empty") : loading ? "reloading" : "ready";

  /* ── Colonnes figées ── */
  // Colonnes utilitaires de tête (sélection, dépliage) : le panneau de détail s'aligne après elles.
  const lead: string[] = [];
  for (const column of leafColumns) {
    if (column.accessorFn) break;
    lead.push(column.id);
  }
  const pinEnabled = startColumns.length + endColumns.length > 0 || Boolean(renderSubComponent);
  const layout = usePinnedLayout(tableRef, startColumns, endColumns, lead, pinEnabled);
  const startEdge = startColumns[startColumns.length - 1]?.id;
  const endEdge = endColumns[0]?.id;

  const pinOf = (column: Column<TData, unknown>): { side: PinSide; offset: number; edge: boolean } | undefined => {
    const pinned = column.getIsPinned();
    if (!pinned) return undefined;
    const side: PinSide = pinned === "left" ? "start" : "end";
    return { side, offset: layout.offsets[column.id] ?? 0, edge: column.id === (side === "start" ? startEdge : endEdge) };
  };
  /** Attributs d'une cellule figée : bord, dernier de son groupe (filet), décalage. */
  const pinProps = (pin: ReturnType<typeof pinOf>, extra?: CustomProperties) => {
    if (!pin) return extra ? { style: extra } : {};
    return {
      "data-pin": pin.side,
      "data-pin-edge": pin.edge || undefined,
      style: { "--_pin-offset": `${pin.offset}px`, ...extra } as CustomProperties,
    };
  };
  /** Un en-tête de groupe ne se fige que si toutes ses colonnes le sont du même côté. */
  const headerPin = (header: Header<TData, unknown>) => {
    if (header.subHeaders.length === 0) return pinOf(header.column);
    const pins = header.getLeafHeaders().filter((h) => h.subHeaders.length === 0).map((h) => pinOf(h.column));
    if (!pins.length || pins.some((p) => !p) || pins.some((p) => p!.side !== pins[0]!.side)) return undefined;
    const side = pins[0]!.side;
    return { side, offset: Math.min(...pins.map((p) => p!.offset)), edge: pins.some((p) => p!.edge) };
  };

  /* ── Lignes dépliables ── */
  // Lignes enfants : retrait dans la première colonne de données.
  const indentColumnId = leafColumns.find((column) => column.accessorFn)?.id;
  const detailIds = new Map<string, string>();
  const viewContext: DataTableViewContextValue = { getDetailId: (row) => detailIds.get(row.id) };
  const hasDetail = Boolean(renderSubComponent);
  // En virtualisé, chaque panneau ouvert compte comme une ligne (aria-rowindex, aria-rowcount).
  const detailsBefore = React.useMemo(() => {
    if (!virtualized || !hasDetail) return null;
    const before = new Array<number>(rows.length);
    let count = 0;
    rows.forEach((row, index) => {
      before[index] = count;
      if (row.getIsExpanded() && row.getCanExpand()) count += 1;
    });
    return { before, count };
    // `expanded` change l'état d'ouverture sans changer forcément le tableau de lignes.
  }, [virtualized, hasDetail, rows, state.expanded]);

  /* ── Ligne de totaux ── */
  const footerVisible =
    showFooter ??
    (aggregates != null || leafColumns.some((column) => column.columnDef.meta?.aggregate != null || column.columnDef.footer != null));
  // Pagination serveur : le client ne voit qu'une page, il ne calcule rien (voir `aggregates`).
  const partialData = table.options.rowCount != null && table.options.rowCount > table.getCoreRowModel().rows.length;
  const aggregateRows = footerVisible && !partialData ? table.getFilteredRowModel().rows : null;
  const columnSignature = leafColumns.map((column) => column.id).join(",");
  const locale = useLocale();
  const totals = React.useMemo(() => {
    const out = new Map<string, React.ReactNode>();
    if (!footerVisible) return out;
    for (const column of table.getVisibleLeafColumns()) {
      const provided = aggregates?.[column.id];
      if (provided !== undefined) {
        out.set(column.id, typeof provided === "number" ? formatAggregate(column as Column<any, unknown>, provided, undefined, locale) : provided);
        continue;
      }
      const aggregate = column.columnDef.meta?.aggregate;
      if (aggregate == null || !aggregateRows) continue;
      const values = aggregateRows.map((row) => row.getValue<unknown>(column.id));
      out.set(column.id, formatAggregate(column as Column<any, unknown>, computeAggregate(aggregate, values, aggregateRows), aggregate, locale));
    }
    return out;
    // Les colonnes sont relues par leur signature et par `options.columns`.
  }, [footerVisible, aggregates, aggregateRows, columnSignature, table.options.columns, locale]);

  /* ── Virtualisation ── */
  const bodyRef = React.useRef<HTMLTableSectionElement | null>(null);
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
    // Hauteur réelle de la ligne, panneau de détail compris ; repli sur l'estimation
    // quand le navigateur ne mesure pas (tests).
    measureElement: (element) => {
      const own = element.getBoundingClientRect().height || estimate;
      const next = element.nextElementSibling;
      return next instanceof HTMLElement && next.hasAttribute("data-detail-for") ? own + next.getBoundingClientRect().height : own;
    },
    getItemKey: (index) => rows[index]?.id ?? index,
    overscan,
    scrollMargin: headHeight,
    initialRect: { width: 0, height: typeof height === "number" ? height : 480 },
  });
  React.useEffect(() => {
    if (virtualized) virtualizer.measure();
  }, [virtualized, density, virtualizer]);
  // Un panneau de détail qui s'ouvre, se ferme ou change de hauteur re-mesure sa ligne.
  useIsomorphicLayoutEffect(() => {
    const body = bodyRef.current;
    if (!virtualized || !hasDetail || !body) return;
    body.querySelectorAll<HTMLTableRowElement>("[data-index]").forEach((element) => virtualizer.measureElement(element));
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const owner = entry.target.previousElementSibling;
        if (owner instanceof HTMLTableRowElement && owner.hasAttribute("data-index")) virtualizer.measureElement(owner);
      }
    });
    body.querySelectorAll(".ui-data-table__detail-row").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  });
  const virtualItems = virtualized ? virtualizer.getVirtualItems() : [];
  const paddingTop = virtualItems.length ? virtualItems[0].start - headHeight : 0;
  const paddingBottom = virtualItems.length
    ? virtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1].end - headHeight)
    : 0;

  /* ── Lignes cliquables : une seule ligne dans l'ordre de tabulation (tabindex mobile) ── */
  const clickable = Boolean(onRowClick);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const active = Math.min(activeIndex, Math.max(rows.length - 1, 0));

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
      case "ArrowRight":
      case "ArrowLeft": {
        // Flèche vers la fin de ligne : déplier ; vers le début : replier (inversé de droite à gauche).
        if (!row.getCanExpand()) break;
        const rtl = typeof window !== "undefined" && window.getComputedStyle(event.currentTarget).direction === "rtl";
        const open = (event.key === "ArrowRight") !== rtl;
        if (open !== row.getIsExpanded()) {
          event.preventDefault();
          row.toggleExpanded(open);
        }
        break;
      }
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

  const rowIndexOf = (index: number) => (virtualized ? headerGroups.length + index + 1 + (detailsBefore?.before[index] ?? 0) : undefined);

  const renderRow = (row: Row<TData>, index: number) => {
    // « Tout déplier » (`expanded: true`) ouvre aussi les lignes non dépliables pour TanStack : on les écarte.
    const detail = hasDetail && row.getIsExpanded() && row.getCanExpand() ? renderSubComponent!(row) : null;
    const withDetail = detail != null && detail !== false;
    const detailId = withDetail ? `${baseId}-detail-${domSafe(row.id)}` : undefined;
    if (detailId) detailIds.set(row.id, detailId);
    const ariaRowIndex = rowIndexOf(index);
    return (
      <React.Fragment key={row.id}>
        <TableRow
          ref={virtualized ? virtualizer.measureElement : undefined}
          data-index={virtualized ? index : undefined}
          data-row-index={index}
          data-depth={row.depth > 0 ? row.depth : undefined}
          data-expanded={withDetail || undefined}
          aria-rowindex={ariaRowIndex}
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
            const column = cell.column;
            const meta = column.columnDef.meta;
            const indent = row.depth > 0 && column.id === indentColumnId;
            return (
              <TableCell
                key={cell.id}
                numeric={meta?.numeric}
                className={meta?.cellClassName}
                data-column-id={column.id}
                data-wrap={meta?.wrap || undefined}
                data-indent={indent || undefined}
                {...pinProps(pinOf(column), indent ? { "--_depth": row.depth } : undefined)}
              >
                {flexRender(column.columnDef.cell, cell.getContext())}
              </TableCell>
            );
          })}
        </TableRow>
        {withDetail && (
          <TableRow
            id={detailId}
            data-detail-for={row.id}
            aria-rowindex={ariaRowIndex != null ? ariaRowIndex + 1 : undefined}
            className="ui-data-table__detail-row"
          >
            <TableCell colSpan={Math.max(leafColumns.length, 1)} className="ui-data-table__detail-cell">
              <div
                className="ui-data-table__detail"
                data-slot="data-table-detail"
                data-indented={layout.lead > 0 || undefined}
                style={
                  {
                    "--_detail-indent": `${layout.lead}px`,
                    "--_detail-width": layout.view ? `${layout.view}px` : undefined,
                  } as CustomProperties
                }
              >
                {detail}
              </div>
            </TableCell>
          </TableRow>
        )}
      </React.Fragment>
    );
  };

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
          <TableCell
            key={column.id}
            numeric={column.columnDef.meta?.numeric}
            className={column.columnDef.meta?.cellClassName}
            {...pinProps(pinOf(column))}
          >
            <Skeleton
              className="ui-data-table__skeleton"
              circle={column.id === "actions" || column.id === "expand"}
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

  /* ── Pied : totaux ── */
  const withFooter = footerVisible && (status === "ready" || status === "reloading");
  let footer: React.ReactNode = null;
  if (withFooter) {
    const leafHeaders = new Map(headerGroups[headerGroups.length - 1]?.headers.map((header) => [header.column.id, header]) ?? []);
    const customLabel = leafColumns.some((column) => column.columnDef.meta?.footerLabel);
    const labelColumn = customLabel
      ? undefined
      : (leafColumns.find((column) => column.accessorFn && !totals.has(column.id) && column.columnDef.footer == null) ??
          leafColumns.find((column) => !totals.has(column.id) && column.columnDef.footer == null))?.id;
    footer = (
      <TableFooter>
        <TableRow
          className="ui-data-table__footer-row"
          aria-rowindex={virtualized ? headerGroups.length + rows.length + (detailsBefore?.count ?? 0) + 1 : undefined}
        >
          {leafColumns.map((column) => {
            const meta = column.columnDef.meta;
            const header = leafHeaders.get(column.id);
            const custom = column.columnDef.footer != null && header ? flexRender(column.columnDef.footer, header.getContext()) : undefined;
            const text = meta?.footerLabel ?? (column.id === labelColumn ? labels.total : undefined);
            const common = {
              "data-slot": "table-cell",
              "data-column-id": column.id,
              "data-numeric": meta?.numeric || undefined,
              ...pinProps(pinOf(column)),
            };
            if (custom === undefined && !totals.has(column.id) && text != null) {
              return (
                <th key={column.id} scope="row" className={cn("ui-table__cell ui-data-table__footer-label", meta?.cellClassName)} {...common}>
                  {text}
                </th>
              );
            }
            return (
              <td key={column.id} className={cn("ui-table__cell", meta?.cellClassName)} {...common}>
                {custom !== undefined ? custom : totals.get(column.id)}
              </td>
            );
          })}
        </TableRow>
      </TableFooter>
    );
  }

  return (
    <div
      className="ui-data-table__view"
      data-state={status}
      data-virtualized={virtualized || undefined}
      data-resizable={resizable || undefined}
      data-pin-start={startColumns.length > 0 || undefined}
      data-pin-end={endColumns.length > 0 || undefined}
    >
      {status === "reloading" && <div className="ui-data-table__progress" role="progressbar" aria-label={labels.loading} />}
      <DataTableViewContext.Provider value={viewContext}>
        <Table
          ref={setTableRef}
          variant={variant}
          density={density}
          stickyHeader={stickyHeader ?? (maxHeight != null || virtualized)}
          containerClassName={cn("ui-data-table__container", containerClassName)}
          containerStyle={{ maxHeight: virtualized ? undefined : maxHeight, height: virtualized ? height : undefined, ...containerStyle }}
          className={cn("ui-data-table__table", className)}
          style={resizable ? { width: table.getTotalSize(), ...style } : style}
          aria-busy={loading || undefined}
          aria-rowcount={
            virtualized ? rows.length + headerGroups.length + (detailsBefore?.count ?? 0) + (withFooter ? 1 : 0) : undefined
          }
          {...props}
        >
          {resizable && (
            <colgroup>
              {leafColumns.map((column) => (
                <col key={column.id} style={{ width: column.getSize() }} />
              ))}
            </colgroup>
          )}
          <TableHeader>
            {headerGroups.map((group, groupIndex) => (
              <TableRow key={group.id} aria-rowindex={virtualized ? groupIndex + 1 : undefined}>
                {group.headers.map((header) => {
                  const column = header.column;
                  const meta = column.columnDef.meta;
                  const isLeaf = header.subHeaders.length === 0;
                  const sortable = isLeaf && !header.isPlaceholder && column.getCanSort();
                  const sorted = column.getIsSorted();
                  const canResize = resizable && isLeaf && !header.isPlaceholder && column.getCanResize();
                  // Largeur indicative (mise en page automatique) : variable lue par data-table.css.
                  const width =
                    !resizable && meta?.width != null
                      ? { "--_w": typeof meta.width === "number" ? `${meta.width}px` : meta.width }
                      : undefined;
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan > 1 ? header.colSpan : undefined}
                      numeric={isLeaf ? meta?.numeric : undefined}
                      aria-sort={sortable ? (sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none") : undefined}
                      className={meta?.headerClassName}
                      data-column-id={column.id}
                      data-group={!isLeaf || undefined}
                      data-resizable={canResize || undefined}
                      {...pinProps(header.isPlaceholder ? undefined : headerPin(header), width)}
                    >
                      {header.isPlaceholder ? null : renderHeader(header)}
                      {canResize && (
                        <DataTableColumnResizer
                          header={header}
                          table={table}
                          title={typeof column.columnDef.header === "string" ? column.columnDef.header : getColumnLabel(column)}
                        />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody ref={bodyRef}>{body}</TableBody>
          {footer}
          {caption != null && <TableCaption>{caption}</TableCaption>}
        </Table>
      </DataTableViewContext.Provider>
    </div>
  );
}

export const DataTableView = React.forwardRef(DataTableViewInner) as <TData>(
  props: DataTableViewProps<TData> & React.RefAttributes<HTMLTableElement>,
) => React.ReactElement | null;
