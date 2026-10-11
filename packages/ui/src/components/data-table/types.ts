import type * as React from "react";
import type {
  ColumnFiltersState,
  PaginationState,
  RowData,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import type { PaginationLabels } from "../pagination/Pagination";

/** Hauteur de ligne : 40 / 48 / 56 px, comme `Table`. */
export type DataTableDensity = "compact" | "default" | "comfortable";

/** Une valeur proposée par un filtre à facettes (`meta.filterOptions`). */
export interface DataTableFilterOption {
  /** Valeur comparée à celle de la cellule (convertie en texte). */
  value: string;
  /** Texte affiché dans la liste et dans la puce. */
  label: string;
  /** Pictogramme de tête (16 px). */
  icon?: React.ReactNode;
  /**
   * Compteur imposé. Par défaut, il est calculé sur les données chargées ;
   * en filtrage serveur (`manualFiltering`), seul ce compteur est affiché.
   */
  count?: number;
}

/*
 * Extension des métadonnées de colonne de TanStack Table : ces clés sont lues
 * par DataTable et ses briques. Elles restent toutes facultatives.
 */
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Libellé lisible : menu « Colonnes », puce de filtre, en-tête CSV. */
    label?: string;
    /** Nombres : en-tête et cellules alignés à droite, chiffres tabulaires. */
    numeric?: boolean;
    /** Options du filtre à facettes ; leur présence affiche la puce dans la barre d'outils. */
    filterOptions?: DataTableFilterOption[];
    /**
     * Formateur de la valeur (voir `dataTableFormatters`) : utilisé par la
     * cellule par défaut, la recherche globale et, sur demande, l'export CSV.
     */
    format?: (value: TValue) => string;
    /** Largeur de la colonne (px ou valeur CSS). */
    width?: number | string;
    /** `false` : colonne exclue de l'export CSV. */
    exportable?: boolean;
    /** Valeur exportée en CSV à la place de la valeur de la cellule. */
    exportValue?: (row: TData) => unknown;
    /**
     * Autorise le retour à la ligne (note, description). Par défaut une cellule
     * tient sur une ligne : hauteur de ligne régulière, défilement horizontal
     * si la table déborde. Sans effet en mode virtualisé (hauteur fixe).
     */
    wrap?: boolean;
    /** Classe ajoutée aux cellules de la colonne. */
    cellClassName?: string;
    /** Classe ajoutée à l'en-tête de la colonne. */
    headerClassName?: string;
  }
}

/** État de la table pilotable de l'extérieur (`state`, `initialState`). */
export interface DataTableState {
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter: string;
  columnVisibility: VisibilityState;
  pagination: PaginationState;
  rowSelection: RowSelectionState;
}

/** Parties de l'état mémorisées dans `localStorage` avec `persistKey`. */
export type DataTablePersistedKey = "sorting" | "columnFilters" | "globalFilter" | "columnVisibility" | "pageSize" | "density";

/** Libellés internes, tous surchargeables par la prop `labels`. */
export interface DataTableLabels {
  /** Indication du champ de recherche. */
  searchPlaceholder: string;
  /** Nom accessible du champ de recherche. */
  searchLabel: string;
  /** Efface recherche et filtres (barre d'outils, filtre à facettes). */
  reset: string;
  /** Bouton du menu de visibilité des colonnes. */
  columns: string;
  /** Intitulé du menu de visibilité des colonnes. */
  columnsMenuTitle: string;
  /** Réaffiche toutes les colonnes. */
  showAllColumns: string;
  /** Annoncé après « Colonnes » quand des colonnes sont masquées. */
  hiddenColumns: (count: number) => string;
  /** Nom du sélecteur de densité. */
  density: string;
  densityCompact: string;
  densityDefault: string;
  densityComfortable: string;
  /** Bouton d'export CSV. */
  exportCsv: string;
  /** Case d'en-tête. */
  selectAll: string;
  /** Case d'une ligne ; reçoit le libellé de la ligne. */
  selectRow: (rowLabel: string) => string;
  /** Libellé d'une ligne sans `getRowLabel` (index à partir de 0). */
  rowFallback: (index: number) => string;
  /** Compteur de la barre de sélection. */
  selectedCount: (count: number) => string;
  /** Sélectionne toutes les lignes filtrées, au-delà de la page. */
  selectAllRows: (count: number) => string;
  /** Vide la sélection. */
  clearSelection: string;
  /** Annoncé quand la sélection est vidée. */
  selectionCleared: string;
  /** Nom du groupe d'actions groupées. */
  bulkActions: string;
  /** En-tête (masqué) de la colonne d'actions. */
  actions: string;
  /** Bouton « ⋯ » d'une ligne ; reçoit le libellé de la ligne. */
  rowActions: (rowLabel: string) => string;
  /** Menu de colonne. */
  columnMenu: (title: string) => string;
  sortAscending: string;
  sortDescending: string;
  clearSorting: string;
  hideColumn: string;
  /** Début (masqué) du nom de la puce, qui la distingue de l'en-tête homonyme : « Filtre : Statut ». */
  facetPrefix: string;
  /** Champ de recherche d'un filtre à facettes. */
  facetSearch: (title: string) => string;
  /** Filtre à facettes sans option correspondante. */
  facetEmpty: string;
  /** Résumé de la puce : « Statut · Payée », « Statut · 2 ». */
  facetSummary: (title: string, selected: string[]) => string;
  /** Complément annoncé après le compteur de la puce. */
  facetSelected: (count: number) => string;
  /** Lignes par page. */
  rowsPerPage: string;
  /** « 1–10 sur 132 ». */
  range: (from: number, to: number, total: number) => string;
  /** Table vide. */
  emptyTitle: string;
  emptyDescription: string;
  /** Aucun résultat après recherche ou filtres. */
  noResultsTitle: string;
  noResultsDescription: string;
  clearFilters: string;
  /** Annoncé pendant un chargement. */
  loading: string;
  /** Annoncé après une recherche ou un filtre. */
  results: (count: number) => string;
  /** Valeurs booléennes de la cellule par défaut et de l'export. */
  yes: string;
  no: string;
  /** Libellés de la pagination. */
  pagination?: PaginationLabels;
}
