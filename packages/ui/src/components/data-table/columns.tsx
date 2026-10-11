import * as React from "react";
import type { CellContext, ColumnDef, Row, Table } from "@tanstack/react-table";
import { Button } from "../button/Button";
import { Checkbox } from "../checkbox/Checkbox";
import { Menu, MenuContent, MenuTrigger } from "../menu/Menu";
import { useDataTableLabels, useRowLabel } from "./context";
import { defaultValueText, toDate } from "./utils";

/* ── Formateurs ────────────────────────────────────────────────────── */

type Formatter = (value: unknown) => string;

function numberFormatter(options?: Intl.NumberFormatOptions, locale = "fr-FR"): Formatter {
  const format = new Intl.NumberFormat(locale, options);
  return (value) => {
    if (value == null || value === "") return "";
    const number = typeof value === "number" ? value : Number(value);
    return Number.isFinite(number) ? format.format(number) : "";
  };
}

function dateFormatter(options: Intl.DateTimeFormatOptions, locale = "fr-FR"): Formatter {
  const format = new Intl.DateTimeFormat(locale, options);
  return (value) => {
    const date = toDate(value);
    return date ? format.format(date) : "";
  };
}

/**
 * Formateurs simples à poser sur `meta.format` : la cellule par défaut, la
 * recherche globale et l'export CSV (option `formatted`) les utilisent.
 *
 *   columnHelper.accessor("montant", {
 *     header: "Montant",
 *     meta: { numeric: true, format: dataTableFormatters.currency("MAD") },
 *   })
 */
export const dataTableFormatters = {
  /** Nombre localisé : « 12 450,5 ». */
  number: (options?: Intl.NumberFormatOptions, locale?: string): Formatter => numberFormatter(options, locale),
  /** Montant : « 12 450,00 MAD ». */
  currency: (currency = "MAD", options?: Intl.NumberFormatOptions, locale?: string): Formatter =>
    numberFormatter({ style: "currency", currency, ...options }, locale),
  /** Pourcentage d'une fraction : 0.125 → « 12,5 % ». */
  percent: (options?: Intl.NumberFormatOptions, locale?: string): Formatter =>
    numberFormatter({ style: "percent", maximumFractionDigits: 1, ...options }, locale),
  /** Date : « 9 oct. 2026 » par défaut. */
  date: (options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }, locale?: string): Formatter =>
    dateFormatter(options, locale),
  /** Date et heure : « 9 oct. 2026, 14:30 ». */
  dateTime: (
    options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" },
    locale?: string,
  ): Formatter => dateFormatter(options, locale),
};

/* ── Cellule par défaut ────────────────────────────────────────────── */

/** Cellule par défaut : `meta.format` s'il existe, sinon un rendu français de la valeur ; « — » si vide. */
export function DataTableDefaultCell({ getValue, column }: CellContext<any, unknown>) {
  const labels = useDataTableLabels();
  const value = getValue();
  const format = column.columnDef.meta?.format;
  const text = format ? (value == null ? "" : format(value)) : defaultValueText(value, labels.yes, labels.no);
  if (text === "") return <span className="ui-data-table__nil">—</span>;
  return <>{text}</>;
}

/* ── Sélection ─────────────────────────────────────────────────────── */

/** Dernière ligne cochée, par table : point de départ d'une sélection par plage (Maj+clic). */
const selectionAnchors = new WeakMap<object, string>();

/** Case d'en-tête, tri-état : sélectionne ou désélectionne toutes les lignes de la page. */
export function DataTableSelectAllCheckbox({ table, label }: { table: Table<any>; label?: string }) {
  const labels = useDataTableLabels();
  const all = table.getIsAllPageRowsSelected();
  const some = table.getIsSomePageRowsSelected();
  const rows = table.getRowModel().rows;
  const disabled = rows.length === 0 || !rows.some((row) => row.getCanSelect());
  return (
    <Checkbox
      data-slot="data-table-select-all"
      aria-label={label ?? labels.selectAll}
      checked={all ? true : some ? "indeterminate" : false}
      disabled={disabled}
      onCheckedChange={() => {
        table.toggleAllPageRowsSelected(!all);
        selectionAnchors.delete(table);
      }}
    />
  );
}

/**
 * Case d'une ligne. Maj+clic coche (ou décoche) toute la plage depuis la
 * dernière case cliquée, dans l'ordre affiché.
 */
export function DataTableRowCheckbox({ row, table, label }: { row: Row<any>; table: Table<any>; label?: string }) {
  const labels = useDataTableLabels();
  const rowLabel = useRowLabel(row);
  return (
    <Checkbox
      data-slot="data-table-row-checkbox"
      aria-label={label ?? labels.selectRow(rowLabel)}
      checked={row.getIsSelected()}
      disabled={!row.getCanSelect()}
      onClick={(event) => {
        const anchorId = selectionAnchors.get(table);
        if (!event.shiftKey || !anchorId || anchorId === row.id) return;
        const rows = table.getRowModel().rows;
        const from = rows.findIndex((r) => r.id === anchorId);
        const to = rows.findIndex((r) => r.id === row.id);
        if (from < 0 || to < 0) return;
        // La plage prend l'état visé par la ligne cliquée ; Radix ne bascule pas en plus.
        event.preventDefault();
        const value = !row.getIsSelected();
        const [start, end] = from < to ? [from, to] : [to, from];
        table.setRowSelection((previous) => {
          const next = { ...previous };
          for (const r of rows.slice(start, end + 1)) {
            if (!r.getCanSelect()) continue;
            if (value) next[r.id] = true;
            else delete next[r.id];
          }
          return next;
        });
        selectionAnchors.set(table, row.id);
      }}
      onCheckedChange={(checked) => {
        row.toggleSelected(checked === true);
        selectionAnchors.set(table, row.id);
      }}
    />
  );
}

export interface SelectColumnOptions {
  /** Identifiant de la colonne. Par défaut `select`. */
  id?: string;
}

/**
 * Colonne de sélection : case d'en-tête tri-état (« Tout sélectionner » sur
 * la page) et case par ligne, avec Maj+clic pour une plage. Ajoutée d'office
 * par `DataTable` quand `enableRowSelection` est vrai.
 */
export function selectColumn<TData>(options: SelectColumnOptions = {}): ColumnDef<TData, unknown> {
  return {
    id: options.id ?? "select",
    header: ({ table }) => <DataTableSelectAllCheckbox table={table} />,
    cell: ({ row, table }) => <DataTableRowCheckbox row={row} table={table} />,
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    meta: { width: 48, exportable: false, cellClassName: "ui-data-table__select-cell", headerClassName: "ui-data-table__select-cell" },
  };
}

/* ── Actions par ligne ─────────────────────────────────────────────── */

const MoreIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="3.5" cy="8" r="1.25" fill="currentColor" />
    <circle cx="8" cy="8" r="1.25" fill="currentColor" />
    <circle cx="12.5" cy="8" r="1.25" fill="currentColor" />
  </svg>
);

/** Bouton « ⋯ » d'une ligne et son menu. */
export function DataTableRowActions<TData>({
  row,
  children,
  label,
}: {
  row: Row<TData>;
  /** Entrées du menu (`MenuItem`, `MenuSeparator`…). */
  children: React.ReactNode;
  label?: string;
}) {
  const labels = useDataTableLabels();
  const rowLabel = useRowLabel(row);
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button size="icon-sm" variant="ghost" className="ui-data-table__row-actions" aria-label={label ?? labels.rowActions(rowLabel)}>
          <MoreIcon />
        </Button>
      </MenuTrigger>
      <MenuContent align="end">{children}</MenuContent>
    </Menu>
  );
}

export interface ActionsColumnOptions {
  /** Identifiant de la colonne. Par défaut `actions`. */
  id?: string;
}

/**
 * Colonne d'actions : un bouton « ⋯ » par ligne qui ouvre un menu.
 *
 *   actionsColumn<Facture>((row) => (
 *     <>
 *       <MenuItem onSelect={() => ouvrir(row.original)}>Ouvrir</MenuItem>
 *       <MenuItem variant="danger">Supprimer</MenuItem>
 *     </>
 *   ))
 */
export function actionsColumn<TData>(
  renderMenu: (row: Row<TData>) => React.ReactNode,
  options: ActionsColumnOptions = {},
): ColumnDef<TData, unknown> {
  return {
    id: options.id ?? "actions",
    header: () => <ActionsHeader />,
    cell: ({ row }) => <DataTableRowActions row={row}>{renderMenu(row)}</DataTableRowActions>,
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    meta: { width: 56, exportable: false, cellClassName: "ui-data-table__actions-cell", headerClassName: "ui-data-table__actions-cell" },
  };
}

function ActionsHeader() {
  const labels = useDataTableLabels();
  return <span className="ui-sr-only">{labels.actions}</span>;
}
