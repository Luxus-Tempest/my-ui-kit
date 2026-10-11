import * as React from "react";
import type { ColumnSizingState, Header, Table } from "@tanstack/react-table";
import { cn } from "../../utils/cn";
import { useDataTableLabels } from "./context";
import type { DataTableLabels } from "./types";
import { DEFAULT_MAX_COLUMN_WIDTH, DEFAULT_MIN_COLUMN_WIDTH, getColumnLabel } from "./utils";

/** Pas du clavier (px) : flèche, et Maj+flèche. */
const STEP = 16;
const BIG_STEP = 64;

const isRtl = (element: Element) => typeof window !== "undefined" && window.getComputedStyle(element).direction === "rtl";

/**
 * La table remplit son conteneur (`min-width: 100%`) : quand elle est plus
 * large que la somme des largeurs mémorisées, le navigateur répartit l'écart
 * entre les colonnes. Avant d'en redimensionner une, on fige les largeurs
 * affichées : la poignée suit alors le pointeur au pixel près. Renvoie la
 * largeur affichée de la colonne, ou `undefined` si rien n'a changé.
 */
function settleRenderedSizes(table: Table<any>, handle: HTMLElement): number | undefined {
  const element = handle.closest("table");
  const cell = handle.closest("th");
  if (!element || !cell) return undefined;
  const rendered = element.getBoundingClientRect().width;
  if (!rendered || rendered <= table.getTotalSize() + 1) return undefined;
  const head = element.tHead;
  const row = head?.rows[head.rows.length - 1];
  const next: ColumnSizingState = {};
  for (const th of Array.from(row?.cells ?? [])) {
    const id = th.getAttribute("data-column-id");
    const width = th.getBoundingClientRect().width;
    if (id && width) next[id] = Math.round(width);
  }
  table.setColumnSizing((old) => ({ ...old, ...next }));
  return Math.round(cell.getBoundingClientRect().width);
}

export interface DataTableColumnResizerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "title"> {
  /** En-tête TanStack de la colonne. */
  header: Header<any, unknown>;
  table: Table<any>;
  /** Intitulé lu dans « Redimensionner la colonne … ». Par défaut `meta.label`, l'en-tête texte ou l'identifiant. */
  title?: string;
  labels?: Partial<DataTableLabels>;
}

interface DragState {
  pointerId: number;
  startX: number;
  startSize: number;
  sign: 1 | -1;
  x: number;
  frame: number;
}

/**
 * Poignée de redimensionnement, posée au bord de fin de l'en-tête par
 * `DataTableView` quand `enableColumnResizing` est actif.
 *
 * - Souris, stylet, doigt : glisser (le sens s'inverse de droite à gauche).
 * - Clavier : séparateur focalisable ; flèches ± 16 px, Maj+flèche ± 64 px,
 *   Origine / Fin : largeur minimale / maximale.
 * - Double-clic : retour à la largeur par défaut.
 */
export const DataTableColumnResizer = React.forwardRef<HTMLDivElement, DataTableColumnResizerProps>(function DataTableColumnResizer(
  { header, table, title, labels: labelsProp, className, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onKeyDown, onDoubleClick, ...props },
  ref,
) {
  const labels = useDataTableLabels(labelsProp);
  const column = header.column;
  const size = column.getSize();
  const min = column.columnDef.minSize ?? DEFAULT_MIN_COLUMN_WIDTH;
  const max = column.columnDef.maxSize ?? DEFAULT_MAX_COLUMN_WIDTH;
  const drag = React.useRef<DragState | null>(null);

  const clamp = (value: number) => Math.round(Math.min(max, Math.max(min, value)));
  const resize = (value: number) => {
    const next = clamp(value);
    table.setColumnSizing((old) => (old[column.id] === next ? old : { ...old, [column.id]: next }));
    return next;
  };

  const apply = (state: DragState) => {
    const delta = (state.x - state.startX) * state.sign;
    resize(state.startSize + delta);
    table.setColumnSizingInfo((old) => ({ ...old, deltaOffset: delta, deltaPercentage: state.startSize ? delta / state.startSize : 0 }));
  };

  const finish = (event: React.PointerEvent<HTMLDivElement>, commit: boolean) => {
    const state = drag.current;
    if (!state || event.pointerId !== state.pointerId) return;
    if (state.frame) cancelAnimationFrame(state.frame);
    if (commit) {
      state.x = event.clientX;
      apply(state);
    }
    drag.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* Capture déjà relâchée. */
    }
    table.setColumnSizingInfo((old) => ({
      ...old,
      isResizingColumn: false,
      startOffset: null,
      startSize: null,
      deltaOffset: null,
      deltaPercentage: null,
      columnSizingStart: [],
    }));
  };

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation="vertical"
      aria-label={labels.resizeColumn(title ?? getColumnLabel(column))}
      aria-valuenow={Math.round(size)}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={labels.columnWidth(size)}
      tabIndex={0}
      data-slot="data-table-column-resizer"
      data-resizing={column.getIsResizing() || undefined}
      className={cn("ui-data-table__resizer", className)}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (event.defaultPrevented || event.button !== 0 || !event.isPrimary) return;
        // Pas de sélection de texte ni de tri : la poignée prend la main.
        event.preventDefault();
        event.stopPropagation();
        const handle = event.currentTarget;
        handle.focus({ preventScroll: true });
        try {
          handle.setPointerCapture(event.pointerId);
        } catch {
          /* Pointeur déjà relâché. */
        }
        const startSize = settleRenderedSizes(table, handle) ?? column.getSize();
        drag.current = { pointerId: event.pointerId, startX: event.clientX, startSize, sign: isRtl(handle) ? -1 : 1, x: event.clientX, frame: 0 };
        table.setColumnSizingInfo((old) => ({
          ...old,
          isResizingColumn: column.id,
          startOffset: event.clientX,
          startSize,
          deltaOffset: 0,
          deltaPercentage: 0,
          columnSizingStart: [[column.id, startSize]],
        }));
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        const state = drag.current;
        if (!state || event.pointerId !== state.pointerId) return;
        state.x = event.clientX;
        // Une mise à jour par image : la table ne se recalcule pas à chaque événement du pointeur.
        if (state.frame || typeof requestAnimationFrame === "undefined") {
          if (!state.frame) apply(state);
          return;
        }
        state.frame = requestAnimationFrame(() => {
          state.frame = 0;
          apply(state);
        });
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        finish(event, true);
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        finish(event, false);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        const sign = isRtl(event.currentTarget) ? -1 : 1;
        const step = event.shiftKey ? BIG_STEP : STEP;
        let next: (current: number) => number;
        switch (event.key) {
          case "ArrowRight":
            next = (current) => current + step * sign;
            break;
          case "ArrowLeft":
            next = (current) => current - step * sign;
            break;
          case "Home":
            next = () => min;
            break;
          case "End":
            next = () => max;
            break;
          default:
            return;
        }
        event.preventDefault();
        const current = settleRenderedSizes(table, event.currentTarget) ?? size;
        resize(next(current));
      }}
      onDoubleClick={(event) => {
        onDoubleClick?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        column.resetSize();
      }}
      // Un clic sur la poignée ne trie pas la colonne.
      onClick={(event) => event.stopPropagation()}
      {...props}
    />
  );
});
