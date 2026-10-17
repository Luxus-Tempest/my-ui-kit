import type * as React from "react";
import type {
  ColumnFiltersState,
  ColumnPinningState,
  ColumnSizingState,
  ExpandedState,
  PaginationState,
  Row,
  RowData,
  RowSelectionState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import type { PaginationLabels } from "../pagination/Pagination";

/** Hauteur de ligne : 40 / 48 / 56 px, comme `Table`. */
export type DataTableDensity = "compact" | "default" | "comfortable";

/** Bord auquel une colonne est figée : début ou fin de ligne (droite et gauche s'inversent en RTL). */
export type DataTablePinPosition = "start" | "end";

/**
 * Calcul personnalisé de la ligne de totaux : reçoit les valeurs de la colonne
 * et les lignes filtrées (toutes pages confondues). Un nombre renvoyé passe par
 * `meta.format` ; tout autre nœud est affiché tel quel.
 */
export type DataTableAggregateFn<TData = any> = (values: unknown[], rows: Row<TData>[]) => React.ReactNode;

/**
 * Agrégat d'une colonne pour la ligne de totaux :
 * - `sum`, `avg` : somme et moyenne des valeurs numériques ;
 * - `min`, `max` : plus petite et plus grande valeur (nombres ou dates) ;
 * - `count` : nombre de valeurs renseignées (affiché en nombre, sans `meta.format`) ;
 * - une fonction pour tout autre calcul.
 */
export type DataTableAggregate<TData = any> = "sum" | "avg" | "min" | "max" | "count" | DataTableAggregateFn<TData>;

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
     * cellule par défaut, la recherche globale, les totaux et, sur demande,
     * l'export CSV. Reçoit la locale de l'interface (`LocaleProvider`).
     */
    format?: (value: TValue, locale?: string) => string;
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
    /**
     * Colonne figée au début ou à la fin de la ligne : elle reste visible quand
     * la table défile horizontalement. C'est l'état de départ : le menu de
     * colonne permet de la libérer (sauf avec `enablePinning: false`, qui la fige
     * pour de bon, comme les colonnes de sélection, de dépliage et d'actions).
     */
    pin?: DataTablePinPosition;
    /** Largeur minimale au redimensionnement (px). Par défaut 48. */
    minWidth?: number;
    /** Largeur maximale au redimensionnement (px). Par défaut 960. */
    maxWidth?: number;
    /**
     * Agrégat affiché dans la ligne de totaux, calculé sur toutes les lignes
     * filtrées (pas seulement la page) et formaté par `meta.format`. En
     * pagination serveur, passer la valeur par la prop `aggregates`.
     */
    aggregate?: DataTableAggregate<TData>;
    /** Libellé de la ligne de totaux dans cette colonne (à la place de « Total »). */
    footerLabel?: string;
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
  /**
   * Colonnes figées par l'utilisateur, en identifiants TanStack (`left` : début,
   * `right` : fin, quel que soit le sens de lecture). Les colonnes figées pour de
   * bon (sélection, dépliage, actions) n'y figurent pas : elles s'ajoutent d'office.
   */
  columnPinning: ColumnPinningState;
  /** Largeurs choisies au redimensionnement (px), par identifiant de colonne. */
  columnSizing: ColumnSizingState;
  /** Lignes dépliées (`true` : toutes), par identifiant de ligne. */
  expanded: ExpandedState;
}

/** Parties de l'état mémorisées dans `localStorage` avec `persistKey`. */
export type DataTablePersistedKey =
  | "sorting"
  | "columnFilters"
  | "globalFilter"
  | "columnVisibility"
  | "pageSize"
  | "density"
  | "columnPinning"
  | "columnSizing";

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
  /** Menu de colonne : figer la colonne au début de la ligne. */
  pinStart: string;
  /** Menu de colonne : figer la colonne à la fin de la ligne. */
  pinEnd: string;
  /** Menu de colonne : libérer une colonne figée. */
  unpin: string;
  /** Poignée de redimensionnement ; reçoit l'intitulé de la colonne. */
  resizeColumn: (title: string) => string;
  /** Largeur annoncée par la poignée de redimensionnement (px). */
  columnWidth: (width: number) => string;
  /** Bouton de dépliage d'une ligne fermée ; reçoit le libellé de la ligne. */
  expandRow: (rowLabel: string) => string;
  /** Bouton de dépliage d'une ligne ouverte ; reçoit le libellé de la ligne. */
  collapseRow: (rowLabel: string) => string;
  /** Bouton d'en-tête : déplier toutes les lignes. */
  expandAll: string;
  /** Bouton d'en-tête : replier toutes les lignes. */
  collapseAll: string;
  /** Libellé de la ligne de totaux. */
  total: string;
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
