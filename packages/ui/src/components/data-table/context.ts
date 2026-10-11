import * as React from "react";
import type { Row } from "@tanstack/react-table";
import type { DataTableLabels } from "./types";

const plural = (count: number, one: string, many: string) => (count > 1 ? many : one);
const n = (value: number) => value.toLocaleString("fr-FR");

/** Libellés français par défaut. */
export const defaultDataTableLabels: DataTableLabels = {
  searchPlaceholder: "Rechercher…",
  searchLabel: "Rechercher dans le tableau",
  reset: "Réinitialiser",
  columns: "Colonnes",
  columnsMenuTitle: "Colonnes affichées",
  showAllColumns: "Tout afficher",
  hiddenColumns: (count) => ` (${n(count)} ${plural(count, "masquée", "masquées")})`,
  density: "Densité",
  densityCompact: "Compacte",
  densityDefault: "Standard",
  densityComfortable: "Confortable",
  exportCsv: "Exporter",
  selectAll: "Tout sélectionner",
  selectRow: (rowLabel) => `Sélectionner ${rowLabel}`,
  rowFallback: (index) => `la ligne ${index + 1}`,
  selectedCount: (count) => `${n(count)} ${plural(count, "sélectionnée", "sélectionnées")}`,
  selectAllRows: (count) => `Sélectionner les ${n(count)} lignes`,
  clearSelection: "Tout désélectionner",
  selectionCleared: "Sélection vidée",
  bulkActions: "Actions sur la sélection",
  actions: "Actions",
  rowActions: (rowLabel) => `Actions pour ${rowLabel}`,
  columnMenu: (title) => `Options de la colonne ${title}`,
  sortAscending: "Trier par ordre croissant",
  sortDescending: "Trier par ordre décroissant",
  clearSorting: "Retirer le tri",
  hideColumn: "Masquer la colonne",
  facetPrefix: "Filtre : ",
  facetSearch: (title) => `Filtrer : ${title.toLocaleLowerCase("fr-FR")}`,
  facetEmpty: "Aucune option",
  facetSummary: (title, selected) => `${title} · ${selected.length === 1 ? selected[0] : n(selected.length)}`,
  facetSelected: (count) => (count > 1 ? " sélectionnés" : " sélectionné"),
  rowsPerPage: "Lignes par page",
  range: (from, to, total) => (total === 0 ? "0 sur 0" : `${n(from)}–${n(to)} sur ${n(total)}`),
  emptyTitle: "Aucune donnée",
  emptyDescription: "Les lignes apparaîtront ici dès qu'elles seront ajoutées.",
  noResultsTitle: "Aucun résultat",
  noResultsDescription: "Aucune ligne ne correspond à la recherche ou aux filtres.",
  clearFilters: "Effacer les filtres",
  loading: "Chargement…",
  results: (count) => `${n(count)} ${plural(count, "résultat", "résultats")}`,
  yes: "Oui",
  no: "Non",
};

export interface DataTableContextValue {
  labels: DataTableLabels;
  /** Libellé d'une ligne pour les noms accessibles (« Sélectionner F-2026-0012 »). */
  getRowLabel?: (row: Row<any>) => string;
}

/**
 * Contexte posé par `DataTable` (ou `DataTableProvider`) : les briques et les
 * colonnes utilitaires y lisent libellés et libellé de ligne.
 */
export const DataTableContext = React.createContext<DataTableContextValue | null>(null);

/** Fournit libellés et libellé de ligne aux briques d'une table composée à la main. */
export function DataTableProvider({
  labels,
  getRowLabel,
  children,
}: {
  labels?: Partial<DataTableLabels>;
  getRowLabel?: (row: Row<any>) => string;
  children?: React.ReactNode;
}) {
  const parent = React.useContext(DataTableContext);
  const value = React.useMemo<DataTableContextValue>(
    () => ({
      labels: { ...(parent?.labels ?? defaultDataTableLabels), ...labels },
      getRowLabel: getRowLabel ?? parent?.getRowLabel,
    }),
    [parent, labels, getRowLabel],
  );
  return React.createElement(DataTableContext.Provider, { value }, children);
}

/** Libellés effectifs : défauts, puis contexte, puis surcharge locale. */
export function useDataTableLabels(overrides?: Partial<DataTableLabels>): DataTableLabels {
  const context = React.useContext(DataTableContext);
  return React.useMemo(
    () => (overrides ? { ...(context?.labels ?? defaultDataTableLabels), ...overrides } : (context?.labels ?? defaultDataTableLabels)),
    [context, overrides],
  );
}

/** Libellé d'une ligne pour les noms accessibles. */
export function useRowLabel(row: Row<any>): string {
  const context = React.useContext(DataTableContext);
  const labels = context?.labels ?? defaultDataTableLabels;
  return context?.getRowLabel?.(row) ?? labels.rowFallback(row.index);
}
