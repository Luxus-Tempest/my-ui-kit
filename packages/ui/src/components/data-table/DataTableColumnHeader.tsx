import * as React from "react";
import type { Column, HeaderContext, Table } from "@tanstack/react-table";
import { cn } from "../../utils/cn";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "../menu/Menu";
import { useDataTableLabels } from "./context";
import type { DataTableLabels } from "./types";
import { getColumnLabel } from "./utils";

/* Même flèche que `TableHead` : elle pivote selon le sens du tri. */
const SortIcon = () => (
  <svg className="ui-table__sort-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 12.5v-9M4.5 7 8 3.5 11.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ChevronDown = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4.5 6.25 8 9.75l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ArrowUp = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 12.5v-9M4.5 7 8 3.5 11.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ArrowDown = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 3.5v9M4.5 9 8 12.5 11.5 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ClearSortIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3.5 5h9M5 8h6M6.5 11h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
const EyeOffIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2.5 2.5l11 11M6.6 4.2A6.4 6.4 0 0 1 8 4c3.2 0 5.3 2.6 6 4-.3.6-.8 1.4-1.5 2.1M10.3 11.5A6 6 0 0 1 8 12c-3.2 0-5.3-2.6-6-4 .4-.8 1.1-1.9 2.2-2.8M6.9 6.9a1.6 1.6 0 0 0 2.2 2.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export interface DataTableColumnHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Colonne TanStack (`header: ({ column }) => …`). */
  column: Column<any, any>;
  /** Table : permet d'afficher le rang de la colonne quand plusieurs colonnes sont triées. */
  table?: Table<any>;
  /** Intitulé ; par défaut `meta.label`, l'en-tête texte ou l'identifiant. */
  title?: React.ReactNode;
  /**
   * Menu de colonne (trier, retirer le tri, masquer), ouvert par un chevron
   * qui apparaît au survol et au focus. Par défaut : si la colonne est triable
   * ou masquable.
   */
  menu?: boolean;
  labels?: Partial<DataTableLabels>;
}

/**
 * En-tête de colonne : intitulé triable (clic : croissant → décroissant →
 * sans tri ; Maj+clic : tri sur plusieurs colonnes, rang affiché) et menu de
 * colonne. Le sens du tri est annoncé par `aria-sort`, posé sur la cellule
 * d'en-tête par `DataTableView`.
 *
 *   columnHelper.accessor("montant", {
 *     header: ({ column }) => <DataTableColumnHeader column={column} title="Montant" />,
 *   })
 */
export const DataTableColumnHeader = React.forwardRef<HTMLDivElement, DataTableColumnHeaderProps>(
  function DataTableColumnHeader({ column, table, title, menu, labels: labelsProp, className, ...props }, ref) {
    const labels = useDataTableLabels(labelsProp);
    const label = title ?? getColumnLabel(column);
    const titleText = typeof label === "string" ? label : getColumnLabel(column);
    const canSort = column.getCanSort();
    const canHide = column.getCanHide();
    const sorted = column.getIsSorted();
    const sortIndex = column.getSortIndex();
    // Le rang n'a de sens que si plusieurs colonnes sont triées.
    const sortCount = table?.getState().sorting.length ?? (sortIndex > 0 ? sortIndex + 1 : 1);
    const multiSorted = sorted !== false && sortCount > 1;
    const showMenu = menu ?? (canSort || canHide);

    return (
      <div
        ref={ref}
        data-slot="data-table-column-header"
        data-sorted={sorted || undefined}
        className={cn("ui-data-table__column-header", className)}
        {...props}
      >
        {canSort ? (
          <button
            type="button"
            className="ui-table__sort ui-data-table__sort"
            data-direction={sorted || undefined}
            onClick={column.getToggleSortingHandler()}
          >
            <span className="ui-data-table__title">{label}</span>
            <SortIcon />
            {multiSorted && (
              <span className="ui-data-table__sort-index" aria-hidden="true">
                {sortIndex + 1}
              </span>
            )}
          </button>
        ) : (
          <span className="ui-data-table__title">{label}</span>
        )}
        {showMenu && (
          <Menu>
            <MenuTrigger asChild>
              <button type="button" className="ui-data-table__column-menu" aria-label={labels.columnMenu(titleText)}>
                <ChevronDown />
              </button>
            </MenuTrigger>
            <MenuContent align="start">
              {canSort && (
                <>
                  <MenuItem disabled={sorted === "asc"} onSelect={() => column.toggleSorting(false)}>
                    <ArrowUp />
                    {labels.sortAscending}
                  </MenuItem>
                  <MenuItem disabled={sorted === "desc"} onSelect={() => column.toggleSorting(true)}>
                    <ArrowDown />
                    {labels.sortDescending}
                  </MenuItem>
                  {sorted && (
                    <MenuItem onSelect={() => column.clearSorting()}>
                      <ClearSortIcon />
                      {labels.clearSorting}
                    </MenuItem>
                  )}
                </>
              )}
              {canSort && canHide && <MenuSeparator />}
              {canHide && (
                <MenuItem onSelect={() => column.toggleVisibility(false)}>
                  <EyeOffIcon />
                  {labels.hideColumn}
                </MenuItem>
              )}
            </MenuContent>
          </Menu>
        )}
      </div>
    );
  },
);

/** Rendu d'en-tête prêt à l'emploi : `header: dataTableHeader("Montant")`. */
export function dataTableHeader(title?: string) {
  return function Header({ column, table }: HeaderContext<any, any>) {
    return <DataTableColumnHeader column={column} table={table} title={title} />;
  };
}
