import type { Column, Row, Table } from "@tanstack/react-table";
import { getColumnLabel, toDate } from "./utils";

export interface DataTableCsvOptions {
  /**
   * Lignes exportées :
   * - `filtered` (défaut) : la vue filtrée et triée, toutes pages confondues ;
   * - `page` : la page affichée ;
   * - `selected` : les lignes sélectionnées, dans l'ordre affiché ;
   * - `all` : toutes les données chargées, sans filtre.
   */
  rows?: "filtered" | "page" | "selected" | "all";
  /** Colonnes exportées (identifiants). Par défaut : les colonnes visibles qui portent une valeur. */
  columns?: string[];
  /** Séparateur de champs. Par défaut « ; » (Excel en français). */
  delimiter?: string;
  /** Séparateur décimal des nombres. Par défaut « , ». */
  decimalSeparator?: string;
  /** Écrit la valeur formatée par `meta.format` plutôt que la valeur brute. Par défaut `false`. */
  formatted?: boolean;
  /** Ligne d'en-têtes (libellés de colonnes). Par défaut `true`. */
  headers?: boolean;
  /** Texte des booléens. Par défaut « Oui » / « Non ». */
  booleans?: [yes: string, no: string];
}

const pad = (n: number) => String(n).padStart(2, "0");

function serializeDate(date: Date): string {
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const hasTime = date.getHours() || date.getMinutes() || date.getSeconds();
  return hasTime ? `${day} ${pad(date.getHours())}:${pad(date.getMinutes())}` : day;
}

function serialize(value: unknown, options: Required<Pick<DataTableCsvOptions, "decimalSeparator" | "booleans">>): string {
  if (value == null) return "";
  if (value instanceof Date) return toDate(value) ? serializeDate(value) : "";
  if (typeof value === "number") return Number.isFinite(value) ? String(value).replace(".", options.decimalSeparator) : "";
  if (typeof value === "boolean") return value ? options.booleans[0] : options.booleans[1];
  if (Array.isArray(value)) return value.map((item) => serialize(item, options)).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/* Texte qui commence comme une formule de tableur… */
const FORMULA_START = /^[=+\-@\t\r]/;
/* …sauf un montant formaté (« -12,50 MAD », « +3,5 % ») : chiffres, séparateurs, unité courte. */
const NUMERIC_TEXT = /^[-+]?\d[\d\s.,]*(?:\s?[^\d\s=+\-@()]{1,4})?$/;

/** Échappe un champ ; neutralise les formules (=, +, -, @) d'un texte pour éviter l'injection dans un tableur. */
function escapeField(field: string, delimiter: string, isText: boolean): string {
  let out = field;
  if (isText && FORMULA_START.test(out) && !NUMERIC_TEXT.test(out)) out = `'${out}`;
  if (out.includes(delimiter) || /["\r\n]/.test(out) || /^\s|\s$/.test(out)) out = `"${out.replace(/"/g, '""')}"`;
  return out;
}

function exportColumns<TData>(table: Table<TData>, ids?: string[]): Column<TData, unknown>[] {
  if (ids) return ids.map((id) => table.getColumn(id)).filter((c): c is Column<TData, unknown> => Boolean(c));
  return table
    .getVisibleLeafColumns()
    .filter((column) => Boolean(column.accessorFn) && column.columnDef.meta?.exportable !== false);
}

function exportRows<TData>(table: Table<TData>, rows: DataTableCsvOptions["rows"]): Row<TData>[] {
  switch (rows) {
    case "page":
      return table.getRowModel().rows;
    case "selected":
      return table.getPrePaginationRowModel().rows.filter((row) => row.getIsSelected());
    case "all":
      return table.getCoreRowModel().rows;
    default:
      return table.getPrePaginationRowModel().rows;
  }
}

/**
 * Contenu CSV de la table (RFC 4180, fins de ligne CRLF). Par défaut : la vue
 * filtrée et triée, colonnes visibles, « ; » et virgule décimale pour Excel
 * en français ; colonnes de sélection et d'actions exclues.
 */
export function toCsv<TData>(table: Table<TData>, options: DataTableCsvOptions = {}): string {
  const { delimiter = ";", decimalSeparator = ",", formatted = false, headers = true, booleans = ["Oui", "Non"] } = options;
  const columns = exportColumns(table, options.columns);
  const lines: string[] = [];
  if (headers) lines.push(columns.map((column) => escapeField(getColumnLabel(column), delimiter, true)).join(delimiter));
  for (const row of exportRows(table, options.rows)) {
    lines.push(
      columns
        .map((column) => {
          const meta = column.columnDef.meta;
          const raw = meta?.exportValue ? meta.exportValue(row.original) : row.getValue<unknown>(column.id);
          const value = formatted && meta?.format && raw != null ? meta.format(raw) : raw;
          return escapeField(serialize(value, { decimalSeparator, booleans }), delimiter, typeof value === "string");
        })
        .join(delimiter),
    );
  }
  return lines.join("\r\n");
}

/**
 * Télécharge la vue en CSV (UTF-8 avec BOM : Excel lit les accents).
 *
 *   <Button onClick={() => exportCsv(table, "factures")}>Exporter</Button>
 */
export function exportCsv<TData>(
  table: Table<TData>,
  filename = "export",
  options: DataTableCsvOptions & { bom?: boolean } = {},
): void {
  if (typeof document === "undefined") return;
  const { bom = true, ...csvOptions } = options;
  const csv = toCsv(table, csvOptions);
  const blob = new Blob([bom ? "﻿" : "", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = /\.csv$/i.test(filename) ? filename : `${filename}.csv`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
