import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { cn } from "../../utils/cn";
import { Pagination, type PaginationVariant } from "../pagination/Pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select/Select";
import { useDataTableLabels } from "./context";
import type { DataTableLabels } from "./types";

export interface DataTablePaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<any>;
  /** Choix du nombre de lignes par page. Par défaut 10, 20, 50, 100. `[]` masque le choix. */
  pageSizeOptions?: number[];
  /** `pages` (défaut) : pastilles de pages. `compact` : « Page 3 sur 12 », pour les espaces étroits. */
  variant?: PaginationVariant;
  /** Désactive la navigation (chargement en cours…). */
  disabled?: boolean;
  labels?: Partial<DataTableLabels>;
}

/**
 * Pied de table : lignes par page, plage affichée (« 1–10 sur 132 ») et
 * `Pagination` de la librairie. Fonctionne aussi en pagination serveur
 * (`manualPagination` + `rowCount`).
 */
export const DataTablePagination = React.forwardRef<HTMLDivElement, DataTablePaginationProps>(function DataTablePagination(
  { table, pageSizeOptions = [10, 20, 50, 100], variant, disabled, labels: labelsProp, className, ...props },
  ref,
) {
  const labels = useDataTableLabels(labelsProp);
  const pageSizeLabelId = React.useId();
  const { pageIndex, pageSize } = table.getState().pagination;
  const total = table.getRowCount();
  const pageCount = table.getPageCount();
  // Total inconnu côté serveur (-1) : on autorise la page suivante tant qu'elle existe.
  const count = pageCount >= 0 ? Math.max(1, pageCount) : pageIndex + (table.getCanNextPage() ? 2 : 1);
  const from = total === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, total);
  const sizes = pageSizeOptions.includes(pageSize) || pageSizeOptions.length === 0
    ? pageSizeOptions
    : [...pageSizeOptions, pageSize].sort((a, b) => a - b);

  return (
    <div ref={ref} data-slot="data-table-pagination" className={cn("ui-data-table__pagination", className)} {...props}>
      {sizes.length > 0 && (
        <div className="ui-data-table__page-size">
          <span id={pageSizeLabelId}>{labels.rowsPerPage}</span>
          <Select value={String(pageSize)} onValueChange={(value) => table.setPageSize(Number(value))} disabled={disabled}>
            <SelectTrigger density="sm" aria-labelledby={pageSizeLabelId} className="ui-data-table__page-size-trigger">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {sizes.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <span className="ui-data-table__range" aria-live="polite" aria-atomic="true">
        {labels.range(from, to, total)}
      </span>
      <Pagination
        page={pageIndex + 1}
        pageCount={count}
        onPageChange={(page) => table.setPageIndex(page - 1)}
        variant={variant}
        disabled={disabled}
        labels={labels.pagination}
        className="ui-data-table__pages"
      />
    </div>
  );
});
