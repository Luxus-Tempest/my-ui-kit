import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { Button, type ButtonProps } from "../button/Button";
import { Menu, MenuCheckboxItem, MenuContent, MenuItem, MenuLabel, MenuSeparator, MenuTrigger } from "../menu/Menu";
import { useDataTableLabels } from "./context";
import type { DataTableLabels } from "./types";
import { getColumnLabel } from "./utils";

const ColumnsIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="2.25" y="3" width="11.5" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6.25 3v10M9.75 3v10" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

export interface DataTableViewOptionsProps extends Omit<ButtonProps, "children"> {
  table: Table<any>;
  /** Texte du bouton ; par défaut « Colonnes ». */
  children?: React.ReactNode;
  labels?: Partial<DataTableLabels>;
}

/**
 * Menu « Colonnes » : une case par colonne masquable. Le menu reste ouvert
 * pendant qu'on coche ; la dernière colonne visible ne peut pas être masquée.
 */
export const DataTableViewOptions = React.forwardRef<HTMLButtonElement, DataTableViewOptionsProps>(
  function DataTableViewOptions({ table, children, labels: labelsProp, variant = "outline", size = "sm", ...props }, ref) {
    const labels = useDataTableLabels(labelsProp);
    const columns = table.getAllLeafColumns().filter((column) => column.getCanHide());
    const visibleCount = table.getVisibleLeafColumns().filter((column) => column.getCanHide()).length;
    const hiddenCount = columns.length - visibleCount;

    return (
      <Menu>
        <MenuTrigger asChild>
          <Button ref={ref} variant={variant} size={size} data-slot="data-table-view-options" {...props}>
            <ColumnsIcon />
            {children ?? labels.columns}
            {hiddenCount > 0 && (
              <>
                <span className="ui-data-table__hidden-count" aria-hidden="true">
                  {hiddenCount}
                </span>
                <span className="ui-sr-only">{labels.hiddenColumns(hiddenCount)}</span>
              </>
            )}
          </Button>
        </MenuTrigger>
        <MenuContent align="end" className="ui-data-table__view-menu">
          <MenuLabel>{labels.columnsMenuTitle}</MenuLabel>
          {columns.map((column) => {
            const visible = column.getIsVisible();
            return (
              <MenuCheckboxItem
                key={column.id}
                checked={visible}
                disabled={visible && visibleCount <= 1}
                onCheckedChange={(value) => column.toggleVisibility(value === true)}
                // On coche plusieurs colonnes d'affilée : le menu reste ouvert.
                onSelect={(event) => event.preventDefault()}
              >
                {getColumnLabel(column)}
              </MenuCheckboxItem>
            );
          })}
          {hiddenCount > 0 && (
            <>
              <MenuSeparator />
              <MenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  table.toggleAllColumnsVisible(true);
                }}
              >
                {labels.showAllColumns}
              </MenuItem>
            </>
          )}
        </MenuContent>
      </Menu>
    );
  },
);
