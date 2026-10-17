import type * as React from "react";
import type { Column, Row } from "@tanstack/react-table";
import type { DataTableAggregate } from "./types";
import { byLocale, DEFAULT_LOCALE, defaultValueText, toDate } from "./utils";

/* Repli sans `meta.format` : deux décimales au plus, dans la langue de l'interface. */
const plainNumber = byLocale((locale) => new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }));
const integer = byLocale((locale) => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }));

const isEmpty = (value: unknown) => value == null || value === "" || (typeof value === "number" && Number.isNaN(value));

function numbers(values: unknown[]): number[] {
  const out: number[] = [];
  for (const value of values) if (typeof value === "number" && Number.isFinite(value)) out.push(value);
  return out;
}

/** Plus petite ou plus grande valeur : nombres d'abord, sinon dates. */
function extreme(values: unknown[], pick: "min" | "max"): number | Date | undefined {
  const nums = numbers(values);
  // Une boucle plutôt que Math.min(...nums) : pas de limite d'arguments sur 100 000 lignes.
  if (nums.length) return nums.reduce((best, value) => (pick === "min" ? (value < best ? value : best) : value > best ? value : best));
  let best: Date | undefined;
  for (const value of values) {
    const date = value instanceof Date || typeof value === "string" ? toDate(value) : null;
    if (!date) continue;
    if (!best || (pick === "min" ? date < best : date > best)) best = date;
  }
  return best;
}

/**
 * Valeur brute d'un agrégat : un nombre (somme, moyenne, compte), une date
 * (min / max sur des dates), ou le nœud renvoyé par une fonction. `undefined`
 * quand il n'y a rien à agréger.
 */
export function computeAggregate<TData>(
  aggregate: DataTableAggregate<TData>,
  values: unknown[],
  rows: Row<TData>[],
): React.ReactNode | Date {
  if (typeof aggregate === "function") return aggregate(values, rows);
  switch (aggregate) {
    case "count":
      return values.filter((value) => !isEmpty(value)).length;
    case "sum": {
      const nums = numbers(values);
      return nums.length ? nums.reduce((sum, value) => sum + value, 0) : undefined;
    }
    case "avg": {
      const nums = numbers(values);
      return nums.length ? nums.reduce((sum, value) => sum + value, 0) / nums.length : undefined;
    }
    case "min":
    case "max":
      return extreme(values, aggregate);
    default:
      return undefined;
  }
}

/**
 * Met en forme un agrégat dans la langue donnée : un nombre ou une date passe
 * par `meta.format` (sinon un rendu par défaut), un compte reste un nombre
 * entier, tout autre nœud est rendu tel quel.
 */
export function formatAggregate(
  column: Column<any, unknown>,
  value: React.ReactNode | Date,
  aggregate?: DataTableAggregate,
  locale = DEFAULT_LOCALE,
): React.ReactNode {
  if (value == null || value === false) return null;
  if (aggregate === "count" && typeof value === "number") return integer(locale).format(value);
  const format = column.columnDef.meta?.format as ((v: unknown, locale?: string) => string) | undefined;
  if (typeof value === "number") return format ? format(value, locale) : plainNumber(locale).format(value);
  if (value instanceof Date) return format ? format(value, locale) : defaultValueText(value, "", "", locale);
  return value as React.ReactNode;
}

/**
 * Agrégat d'une colonne sur des lignes (par défaut, celles que l'appelant
 * passe : DataTable lui donne les lignes filtrées, toutes pages confondues),
 * déjà mis en forme dans la langue donnée (français par défaut). `undefined`
 * si la colonne ne déclare pas `meta.aggregate`.
 *
 *   const total = getDataTableAggregate(table.getColumn("montant")!, table.getFilteredRowModel().rows, useLocale());
 */
export function getDataTableAggregate<TData>(
  column: Column<TData, unknown>,
  rows: Row<TData>[],
  locale = DEFAULT_LOCALE,
): React.ReactNode {
  const aggregate = column.columnDef.meta?.aggregate as DataTableAggregate<TData> | undefined;
  if (aggregate == null) return undefined;
  const values = rows.map((row) => row.getValue<unknown>(column.id));
  return formatAggregate(column as Column<any, unknown>, computeAggregate(aggregate, values, rows), aggregate as DataTableAggregate, locale);
}
