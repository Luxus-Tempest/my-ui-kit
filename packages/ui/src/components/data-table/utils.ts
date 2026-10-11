import type * as React from "react";
import type { Column, FilterFn, Row, SortingFn, Table, Updater } from "@tanstack/react-table";
import type { DataTableDensity, DataTablePersistedKey, DataTableState } from "./types";

/* ── Texte ─────────────────────────────────────────────────────────── */

/** Minuscules, sans accents, espaces insécables ramenées à l'espace simple. */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[  ]/g, " ")
    .toLocaleLowerCase("fr-FR");
}

const shortDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" });

/** Date valide tirée d'une valeur (Date, horodatage, chaîne ISO), ou `null`. */
export function toDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "number" || typeof value === "string") {
    if (typeof value === "string" && value.trim() === "") return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

/** Rendu texte par défaut d'une valeur de cellule (sans formateur). */
export function defaultValueText(value: unknown, yes = "Oui", no = "Non"): string {
  if (value == null) return "";
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? "" : shortDate.format(value);
  if (typeof value === "number") return Number.isFinite(value) ? value.toLocaleString("fr-FR") : "";
  if (typeof value === "boolean") return value ? yes : no;
  if (Array.isArray(value)) return value.map((v) => defaultValueText(v, yes, no)).filter(Boolean).join(", ");
  if (typeof value === "object") return "";
  return String(value);
}

/** Libellé lisible d'une colonne : `meta.label`, puis l'en-tête texte, puis l'identifiant. */
export function getColumnLabel(column: Column<any, any>): string {
  const meta = column.columnDef.meta;
  if (meta?.label) return meta.label;
  if (typeof column.columnDef.header === "string") return column.columnDef.header;
  return column.id;
}

/* ── Filtres ───────────────────────────────────────────────────────── */

/**
 * Filtre à facettes : la valeur du filtre est une liste ; la ligne passe si la
 * valeur de sa cellule (ou l'un de ses éléments, pour un tableau) y figure.
 */
export const facetFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  if (!Array.isArray(filterValue) || filterValue.length === 0) return true;
  const cell = row.getValue<unknown>(columnId);
  if (Array.isArray(cell)) return cell.some((item) => filterValue.includes(String(item)));
  return filterValue.includes(String(cell));
};
facetFilterFn.autoRemove = (value) => !Array.isArray(value) || value.length === 0;

/**
 * Recherche globale : chaque mot de la requête doit apparaître quelque part
 * dans la ligne (valeur brute ou formatée), sans tenir compte de la casse ni
 * des accents. « dupont payée » trouve la facture de M. Dupont au statut Payée.
 */
export function createGlobalFilterFn(getTable: () => Table<any> | undefined): FilterFn<any> {
  const cache = new WeakMap<Row<any>, { columns: unknown; text: string }>();
  const rowText = (row: Row<any>) => {
    const table = getTable();
    const columns = table?.getAllLeafColumns() ?? [];
    const cached = cache.get(row);
    if (cached && cached.columns === table?.options.columns) return cached.text;
    const parts: string[] = [];
    for (const column of columns) {
      if (!column.getCanGlobalFilter()) continue;
      const value = row.getValue<unknown>(column.id);
      const format = column.columnDef.meta?.format;
      if (format && value != null) parts.push(format(value as never));
      if (typeof value === "string" || typeof value === "number") parts.push(String(value));
      else if (!format) parts.push(defaultValueText(value, "", ""));
    }
    const text = normalizeText(parts.join(" \u0000 "));
    cache.set(row, { columns: table?.options.columns, text });
    return text;
  };

  const fn: FilterFn<any> = (row, _columnId, filterValue) => {
    const tokens = normalizeText(String(filterValue ?? "")).split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return true;
    const text = rowText(row);
    return tokens.every((token) => text.includes(token));
  };
  fn.autoRemove = (value) => value == null || String(value).trim() === "";
  return fn;
}

/* ── Tri ───────────────────────────────────────────────────────────── */

const collator = new Intl.Collator("fr", { numeric: true, sensitivity: "base" });

/** Compare deux valeurs : dates, nombres, booléens, puis texte en ordre français (« Émilie » avant « Zoé »). */
export function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (a instanceof Date || b instanceof Date) return (toDate(a)?.getTime() ?? 0) - (toDate(b)?.getTime() ?? 0);
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  return collator.compare(defaultValueText(a), defaultValueText(b));
}

/** Tri par défaut des colonnes de DataTable. */
export const localeSortingFn: SortingFn<any> = (rowA, rowB, columnId) =>
  compareValues(rowA.getValue(columnId), rowB.getValue(columnId));

/* ── État ──────────────────────────────────────────────────────────── */

export function resolveUpdater<T>(updater: Updater<T>, previous: T): T {
  return typeof updater === "function" ? (updater as (old: T) => T)(previous) : updater;
}

/* ── Persistance (localStorage, toujours sous try/catch) ───────────── */

export interface PersistedDataTableState extends Partial<Omit<DataTableState, "pagination" | "rowSelection" | "expanded">> {
  pageSize?: number;
  density?: DataTableDensity;
}

const STORAGE_PREFIX = "acme-ui:data-table:";

export const DEFAULT_PERSISTED_KEYS: DataTablePersistedKey[] = [
  "sorting",
  "columnFilters",
  "columnVisibility",
  "pageSize",
  "density",
  "columnPinning",
  "columnSizing",
];

export function readPersisted(key: string | undefined): PersistedDataTableState {
  if (!key) return {};
  try {
    if (typeof window === "undefined" || !window.localStorage) return {};
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? (parsed as PersistedDataTableState) : {};
  } catch {
    return {};
  }
}

/** Fusionne `partial` dans l'état mémorisé (DataTable et useDataTable écrivent chacun leur part). */
export function writePersisted(key: string | undefined, partial: PersistedDataTableState): void {
  if (!key) return;
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    const next = { ...readPersisted(key), ...partial };
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(next));
  } catch {
    /* Stockage plein, interdit ou indisponible (navigation privée) : on ignore. */
  }
}

/* ── Largeurs ──────────────────────────────────────────────────────── */

/** Bornes de largeur par défaut d'une colonne redimensionnable (px). */
export const DEFAULT_MIN_COLUMN_WIDTH = 48;
export const DEFAULT_MAX_COLUMN_WIDTH = 960;

/* ── Événements ────────────────────────────────────────────────────── */

const INTERACTIVE =
  'a[href], button, input, select, textarea, label, summary, [contenteditable="true"], [role="button"], [role="checkbox"], [role="menuitem"], [role="link"], [role="switch"], [role="combobox"]';

/**
 * Vrai si l'événement vient d'un élément interactif posé dans la ligne (case,
 * bouton, lien) ou d'un portail (menu ouvert depuis la ligne) : le clic de
 * ligne ne doit pas se déclencher en plus.
 */
export function isFromNestedControl(event: React.SyntheticEvent<HTMLElement>): boolean {
  const target = event.target as Element | null;
  const row = event.currentTarget;
  if (!target || !row.contains(target)) return true;
  const control = target.closest(INTERACTIVE);
  return control != null && control !== row && row.contains(control);
}
