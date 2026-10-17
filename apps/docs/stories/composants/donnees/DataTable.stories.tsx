import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  DataTable,
  DataTableColumnHeader,
  DataTableFacetedFilter,
  DataTablePagination,
  DataTableProvider,
  DataTableSearch,
  DataTableView,
  DataTableViewOptions,
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
  EmptyState,
  MenuItem,
  MenuSeparator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  actionsColumn,
  createColumnHelper,
  dataTableFormatters,
  exportCsv,
  useDataTable,
  type ColumnDef,
  type ColumnFiltersState,
  type DataTableDensity,
  type DataTableFilterOption,
  type PaginationState,
  type Row as TableRowModel,
  type SortingState,
} from "@rovia/ui";
import {
  Copy,
  Download,
  Eye,
  FileText,
  Plus,
  Receipt,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";
import { Row } from "../../_shared/demo";
import {
  seeded,
  STATUTS,
  STATUT_KEYS,
  CLIENTS,
  makeFactures,
  type Statut,
  type Facture,
} from "../../_shared/factures";

/* ── Données de démonstration ─────────────────────────────────────── */

const FACTURES = makeFactures(132, 2026);

const STATUT_OPTIONS: DataTableFilterOption[] = STATUT_KEYS.map((key) => ({
  value: key,
  label: STATUTS[key].label,
  icon: STATUTS[key].icon,
}));
const CLIENT_OPTIONS: DataTableFilterOption[] = CLIENTS.map((c) => ({ value: c.nom, label: c.nom }));

const formatDate = dataTableFormatters.date();
const formatMad = dataTableFormatters.currency("MAD");

/* ── Colonnes ──────────────────────────────────────────────────────── */

const col = createColumnHelper<Facture>();

const ClientCell = ({ facture }: { facture: Facture }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
    <Avatar size="sm">
      <AvatarFallback>{facture.initiales}</AvatarFallback>
    </Avatar>
    {facture.client}
  </span>
);

const baseColumns = ({
  statutOptions = STATUT_OPTIONS,
  clientOptions = CLIENT_OPTIONS,
}: { statutOptions?: DataTableFilterOption[]; clientOptions?: DataTableFilterOption[] } = {}): ColumnDef<Facture, any>[] => [
  col.accessor("numero", {
    header: "Facture",
    cell: ({ getValue }) => <span style={{ fontWeight: 500 }}>{getValue()}</span>,
  }),
  col.accessor("client", {
    header: "Client",
    cell: ({ row }) => <ClientCell facture={row.original} />,
    meta: { filterOptions: clientOptions },
  }),
  col.accessor("statut", {
    header: "Statut",
    cell: ({ getValue }) => {
      const statut = STATUTS[getValue<Statut>()];
      return (
        <Badge variant={statut.tone} dot>
          {statut.label}
        </Badge>
      );
    },
    meta: { format: (value: Statut) => STATUTS[value].label, filterOptions: statutOptions },
  }),
  col.accessor("emission", { header: "Émission", meta: { format: formatDate } }),
  col.accessor("echeance", {
    header: "Échéance",
    cell: ({ row, getValue }) => (
      <span style={{ color: row.original.statut === "en_retard" ? "var(--ui-err)" : "var(--ui-fg-2)" }}>
        {formatDate(getValue())}
      </span>
    ),
    meta: { format: formatDate },
  }),
  col.accessor("montant", {
    header: "Montant TTC",
    meta: { numeric: true, format: formatMad, label: "Montant" },
  }),
];

const rowMenu = actionsColumn<Facture>((row) => (
  <>
    <MenuItem>
      <Eye />
      Ouvrir {row.original.numero}
    </MenuItem>
    <MenuItem>
      <Copy />
      Dupliquer
    </MenuItem>
    <MenuItem>
      <Download />
      Télécharger le PDF
    </MenuItem>
    <MenuSeparator />
    <MenuItem variant="danger">
      <Trash2 />
      Supprimer
    </MenuItem>
  </>
));

const COLUMNS: ColumnDef<Facture, any>[] = [...baseColumns(), rowMenu];
const getRowId = (f: Facture) => f.id;
const getRowLabel = (f: Facture) => f.numero;

/* ── Méta ──────────────────────────────────────────────────────────── */

const meta = {
  title: "Composants/Données/DataTable",
  component: DataTable<Facture>,
  tags: ["autodocs"],
  parameters: {
    registry: "data-table",
    docs: {
      description: {
        component:
          "Table de données de haut niveau, au-dessus de TanStack Table : `<DataTable columns={columns} data={data} />` suffit. Tri multi-colonnes (Maj+clic, `aria-sort`), recherche sans accents, filtres à facettes (`meta.filterOptions`), pagination, sélection avec actions groupées, colonnes masquables, figées (`meta.pin`, menu de colonne) et redimensionnables (`enableColumnResizing`), lignes dépliables (`renderSubComponent`, `getSubRows`), ligne de totaux (`meta.aggregate`), densité, export CSV, états de chargement et vides, virtualisation (`virtualized`), mode serveur (`manual*` + `rowCount` + `aggregates`), persistance (`persistKey`). Chaque fonction se coupe par une prop `enable*`. Pour une mise en page sur mesure, composer `useDataTable` avec `DataTableToolbar`, `DataTableView`, `DataTablePagination` et les autres briques.",
      },
    },
  },
  args: {
    columns: COLUMNS,
    data: FACTURES,
    getRowId,
    getRowLabel,
    "aria-label": "Factures",
    variant: "card",
    defaultDensity: "default",
    enableRowSelection: true,
    enableSorting: true,
    enableSearch: true,
    enableFacets: true,
    enableColumnVisibility: true,
    enableDensity: true,
    enableExport: false,
    enablePagination: true,
    toolbar: true,
    loading: false,
    paginationVariant: "pages",
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["card", "plain"] },
    defaultDensity: { control: "inline-radio", options: ["compact", "default", "comfortable"] },
    paginationVariant: { control: "inline-radio", options: ["pages", "compact"] },
    maxHeight: { control: "number" },
    enableRowSelection: { control: "boolean" },
    data: { control: false },
    columns: { control: false },
    state: { control: false },
    initialState: { control: false },
    labels: { control: false },
    tableOptions: { control: false },
    bulkActions: { control: false },
    toolbarActions: { control: false },
    emptyState: { control: false },
    noResultsState: { control: false },
    tableRef: { table: { disable: true } },
  },
  render: (args) => (
    <div style={{ maxWidth: 1120 }}>
      {/* La clé remonte la table quand la densité initiale change dans les contrôles. */}
      <DataTable key={args.defaultDensity} {...args} />
    </div>
  ),
} satisfies Meta<typeof DataTable<Facture>>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les fonctions se coupent depuis le panneau Contrôles. */
export const Playground: Story = {};

/* ── Complète ──────────────────────────────────────────────────────── */

function FacturesCompletes() {
  const [data, setData] = React.useState(FACTURES);
  const [ouverte, setOuverte] = React.useState<Facture | null>(null);
  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 1120 }}>
      <DataTable
        aria-label="Factures"
        columns={COLUMNS}
        data={data}
        getRowId={getRowId}
        getRowLabel={getRowLabel}
        enableRowSelection
        enableExport
        exportFilename="factures"
        initialState={{ sorting: [{ id: "emission", desc: true }] }}
        onRowClick={(row) => setOuverte(row.original)}
        toolbarActions={
          <Button size="sm">
            <Plus />
            Nouvelle facture
          </Button>
        }
        bulkActions={({ selectedRows, table, clear }) => (
          <>
            <Button size="sm" variant="ghost" onClick={() => exportCsv(table, "factures-selection", { rows: "selected" })}>
              <Download />
              Exporter
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                const ids = new Set(selectedRows.map((r) => r.id));
                setData((rows) => rows.filter((f) => !ids.has(f.id)));
                clear();
              }}
            >
              <Trash2 />
              Supprimer
            </Button>
          </>
        )}
      />
      <p style={{ margin: 0, color: "var(--ui-fg-3)", fontSize: 13 }}>
        {ouverte
          ? `Ouverte : ${ouverte.numero} · ${ouverte.client} · ${formatMad(ouverte.montant)}`
          : "Cliquez une ligne, ou donnez-lui le focus et appuyez sur Entrée."}
      </p>
    </div>
  );
}

/**
 * Factures : statut en `Badge`, client avec `Avatar`, montants en MAD, dates
 * françaises. Facettes Statut et Client, sélection (Maj+clic pour une plage)
 * avec actions groupées « Exporter » / « Supprimer », menu « ⋯ » par ligne,
 * clic de ligne, export CSV de la vue filtrée.
 */
export const Complete: Story = {
  name: "Complète",
  render: () => <FacturesCompletes />,
};

/* ── Simple ────────────────────────────────────────────────────────── */

const PRODUITS = [
  { produit: "Thé vert gunpowder", stock: 124, prix: 89.5 },
  { produit: "Huile d'argan 250 ml", stock: 38, prix: 160 },
  { produit: "Savon noir", stock: 412, prix: 25 },
];
const PRODUIT_COLUMNS: ColumnDef<(typeof PRODUITS)[number], any>[] = [
  { accessorKey: "produit", header: "Produit" },
  { accessorKey: "stock", header: "Stock" },
  { accessorKey: "prix", header: "Prix" },
];

/** Trois lignes, zéro configuration : les colonnes et les données suffisent. */
export const Simple: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <DataTable aria-label="Produits" columns={PRODUIT_COLUMNS} data={PRODUITS} />
    </div>
  ),
};

/* ── Densités ──────────────────────────────────────────────────────── */

const DENSITES: { density: DataTableDensity; label: string }[] = [
  { density: "compact", label: "Compacte · 40" },
  { density: "default", label: "Standard · 48" },
  { density: "comfortable", label: "Confortable · 56" },
];

/** 40 / 48 / 56 px par ligne. Le sélecteur de la barre d'outils change la densité à la volée. */
export const Densites: Story = {
  name: "Densités",
  render: () => (
    <div style={{ display: "grid", gap: 8, maxWidth: 1000 }}>
      {DENSITES.map(({ density, label }) => (
        <Row key={density} label={label}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <DataTable
              aria-label={`Factures, densité ${label}`}
              columns={baseColumns()}
              data={FACTURES.slice(0, 3)}
              defaultDensity={density}
              toolbar={false}
              enablePagination={false}
            />
          </div>
        </Row>
      ))}
    </div>
  ),
};

/* ── Chargement et vide ────────────────────────────────────────────── */

function Rechargement() {
  const [loading, setLoading] = React.useState(false);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div>
        <Button
          size="sm"
          variant="outline"
          loading={loading}
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 1600);
          }}
        >
          <RefreshCw />
          Recharger
        </Button>
      </div>
      <DataTable
        aria-label="Rechargement"
        columns={baseColumns()}
        data={FACTURES.slice(0, 4)}
        loading={loading}
        toolbar={false}
        enablePagination={false}
      />
    </div>
  );
}

/**
 * Premier chargement : lignes squelettes à la géométrie des colonnes.
 * Rechargement : l'ancien contenu reste en place, estompé, sous un filet de
 * progression, sans saut. Vide : `EmptyState` (remplaçable par `emptyState`).
 * Aucun résultat : « Effacer les filtres ».
 */
export const ChargementEtVide: Story = {
  name: "Chargement et vide",
  render: () => (
    <div style={{ display: "grid", gap: 24, maxWidth: 1000 }}>
      <Row label="Premier chargement">
        <div style={{ flex: 1, minWidth: 0 }}>
          <DataTable aria-label="Chargement" columns={baseColumns()} data={[]} loading skeletonRows={4} toolbar={false} />
        </div>
      </Row>
      <Row label="Rechargement">
        <div style={{ flex: 1, minWidth: 0 }}>
          <Rechargement />
        </div>
      </Row>
      <Row label="Vide">
        <div style={{ flex: 1, minWidth: 0 }}>
          <DataTable
            aria-label="Aucune facture"
            columns={baseColumns()}
            data={[]}
            toolbar={false}
            emptyState={
              <EmptyState
                icon={<Receipt />}
                title="Aucune facture"
                description="Vos factures apparaîtront ici dès la première émission."
                titleAs="p"
                actions={
                  <Button size="sm">
                    <Plus />
                    Nouvelle facture
                  </Button>
                }
              />
            }
          />
        </div>
      </Row>
      <Row label="Aucun résultat">
        <div style={{ flex: 1, minWidth: 0 }}>
          <DataTable
            aria-label="Recherche sans résultat"
            columns={baseColumns()}
            data={FACTURES.slice(0, 12)}
            initialState={{ globalFilter: "Zanzibar" }}
          />
        </div>
      </Row>
    </div>
  ),
};

/* ── Serveur ───────────────────────────────────────────────────────── */

const BASE_SERVEUR = makeFactures(487, 7);
const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

interface Requete {
  pagination: PaginationState;
  sorting: SortingState;
  globalFilter: string;
  columnFilters: ColumnFiltersState;
}

/** « Serveur » simulé : filtre, compte les facettes, trie et découpe la page. */
function interroger({ pagination, sorting, globalFilter, columnFilters }: Requete) {
  const q = normalize(globalFilter.trim());
  const matchesSearch = (f: Facture) => !q || normalize(`${f.numero} ${f.client} ${STATUTS[f.statut].label}`).includes(q);
  const matchesFilter = (f: Facture, except?: string) =>
    columnFilters.every((filter) => filter.id === except || (filter.value as string[]).includes(String(f[filter.id as keyof Facture])));

  // Compteurs de chaque facette : recherche et autres filtres appliqués, pas le sien.
  const facettes = { statut: new Map<string, number>(), client: new Map<string, number>() };
  for (const f of BASE_SERVEUR) {
    if (!matchesSearch(f)) continue;
    if (matchesFilter(f, "statut")) facettes.statut.set(f.statut, (facettes.statut.get(f.statut) ?? 0) + 1);
    if (matchesFilter(f, "client")) facettes.client.set(f.client, (facettes.client.get(f.client) ?? 0) + 1);
  }

  let rows = BASE_SERVEUR.filter((f) => matchesSearch(f) && matchesFilter(f));
  const [tri] = sorting;
  if (tri) {
    const key = tri.id as keyof Facture;
    rows = [...rows].sort((a, b) => {
      const d = a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
      return tri.desc ? -d : d;
    });
  }
  const start = pagination.pageIndex * pagination.pageSize;
  return { rows: rows.slice(start, start + pagination.pageSize), total: rows.length, facettes };
}

function FacturesServeur() {
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [reponse, setReponse] = React.useState<ReturnType<typeof interroger> | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    // Latence réseau simulée.
    const timer = setTimeout(() => {
      setReponse(interroger({ pagination, sorting, globalFilter, columnFilters }));
      setLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, [pagination, sorting, globalFilter, columnFilters]);

  // Les compteurs de facettes viennent du serveur (`option.count`).
  const facettes = reponse?.facettes;
  const columns = React.useMemo(
    () =>
      baseColumns({
        statutOptions: STATUT_OPTIONS.map((o) => ({ ...o, count: facettes?.statut.get(o.value) ?? 0 })),
        clientOptions: CLIENT_OPTIONS.map((o) => ({ ...o, count: facettes?.client.get(o.value) ?? 0 })),
      }),
    [facettes],
  );

  const params = new URLSearchParams({ page: String(pagination.pageIndex + 1), taille: String(pagination.pageSize) });
  if (sorting[0]) params.set("tri", `${sorting[0].id}:${sorting[0].desc ? "desc" : "asc"}`);
  if (globalFilter) params.set("q", globalFilter);
  for (const f of columnFilters) params.set(f.id, (f.value as string[]).join(","));

  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 1120 }}>
      <DataTable
        aria-label="Factures (serveur)"
        columns={columns}
        data={reponse?.rows ?? []}
        rowCount={reponse?.total ?? 0}
        getRowId={getRowId}
        loading={loading}
        manualPagination
        manualSorting
        manualFiltering
        enableMultiSort={false}
        state={{ pagination, sorting, globalFilter, columnFilters }}
        onPaginationChange={setPagination}
        onSortingChange={setSorting}
        onGlobalFilterChange={setGlobalFilter}
        onColumnFiltersChange={setColumnFilters}
      />
      <code
        style={{
          padding: "8px 12px",
          borderRadius: "var(--ui-r-sm)",
          background: "var(--ui-card-2)",
          color: "var(--ui-fg-2)",
          fontFamily: "var(--ui-font-mono)",
          fontSize: 12.5,
          overflowWrap: "anywhere",
        }}
      >
        GET /api/factures?{decodeURIComponent(params.toString())}
      </code>
    </div>
  );
}

/**
 * Pagination, tri, recherche et facettes faits par le serveur (latence simulée
 * de 700 ms) : `manualPagination`, `manualSorting`, `manualFiltering`,
 * `rowCount`, état contrôlé par `state` et callbacks `on…Change` qui reçoivent
 * la nouvelle valeur. Un nouveau tri ou filtre ramène en page 1 ; la recherche
 * attend 300 ms ; les compteurs de facettes viennent de la réponse (`option.count`).
 */
export const Serveur: Story = {
  render: () => <FacturesServeur />,
};

/* ── Virtualisée ───────────────────────────────────────────────────── */

const ARTICLES = [
  "Huile d'argan 250 ml",
  "Savon noir 500 g",
  "Tajine en terre cuite",
  "Babouches en cuir",
  "Thé vert gunpowder 1 kg",
  "Coussin brodé",
  "Lanterne en cuivre",
  "Tapis berbère 2 × 3 m",
  "Eau de rose 100 ml",
  "Plateau en thuya",
];
const ENTREPOTS = ["Casablanca", "Tanger Med", "Agadir", "Marrakech", "Fès"];

interface Mouvement {
  id: string;
  sku: string;
  article: string;
  entrepot: string;
  quantite: number;
  prix: number;
  date: Date;
}

function makeMouvements(count: number): Mouvement[] {
  const random = seeded(42);
  const start = new Date(2026, 0, 1).getTime();
  return Array.from({ length: count }, (_, i) => ({
    id: String(i),
    sku: `SKU-${String(i + 1).padStart(5, "0")}`,
    article: ARTICLES[Math.floor(random() * ARTICLES.length)],
    entrepot: ENTREPOTS[Math.floor(random() * ENTREPOTS.length)],
    quantite: Math.round((random() - 0.35) * 400),
    prix: Math.round((20 + random() * 1800) * 100) / 100,
    date: new Date(start + Math.floor(random() * 280 * 86_400_000)),
  }));
}

const mvt = createColumnHelper<Mouvement>();
const MOUVEMENT_COLUMNS: ColumnDef<Mouvement, any>[] = [
  mvt.accessor("sku", { header: "Référence", meta: { width: 120 } }),
  mvt.accessor("article", { header: "Article" }),
  mvt.accessor("entrepot", {
    header: "Entrepôt",
    meta: { filterOptions: ENTREPOTS.map((e) => ({ value: e, label: e })) },
  }),
  mvt.accessor("date", { header: "Date", meta: { format: dataTableFormatters.date() } }),
  mvt.accessor("quantite", { header: "Quantité", meta: { numeric: true, format: dataTableFormatters.number({ signDisplay: "exceptZero" }) } }),
  mvt.accessor("prix", { header: "Prix unitaire", meta: { numeric: true, format: formatMad } }),
];

function MouvementsVirtualises() {
  const data = React.useMemo(() => makeMouvements(10_000), []);
  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 1120 }}>
      <DataTable
        aria-label="Mouvements de stock"
        columns={MOUVEMENT_COLUMNS}
        data={data}
        getRowId={(m) => m.id}
        getRowLabel={(m) => m.sku}
        enableRowSelection
        virtualized
        height={520}
        defaultDensity="compact"
      />
      <p style={{ margin: 0, color: "var(--ui-fg-3)", fontSize: 13 }}>
        10 000 mouvements de stock générés : seules les lignes visibles sont rendues.
      </p>
    </div>
  );
}

/**
 * 10 000 lignes fluides : `virtualized` + `height` ne rendent que les lignes
 * visibles (TanStack Virtual). Tri, recherche, facettes et sélection portent
 * sur toutes les lignes ; l'en-tête reste figé ; la pagination est coupée.
 */
export const Virtualisee: Story = {
  name: "Virtualisée",
  render: () => <MouvementsVirtualises />,
};

/* ── Personnalisée ─────────────────────────────────────────────────── */

const PERSO_COLUMNS: ColumnDef<Facture, any>[] = [
  col.accessor("numero", {
    header: ({ column, table }) => <DataTableColumnHeader column={column} table={table} title="N°" />,
  }),
  col.accessor("client", {
    header: "Client",
    cell: ({ row }) => <ClientCell facture={row.original} />,
  }),
  col.accessor("statut", {
    header: "Statut",
    cell: ({ getValue }) => {
      const statut = STATUTS[getValue<Statut>()];
      return <Badge variant={statut.tone}>{statut.label}</Badge>;
    },
    meta: { format: (value: Statut) => STATUTS[value].label, filterOptions: STATUT_OPTIONS },
  }),
  col.accessor("echeance", { header: "Échéance", meta: { format: formatDate } }),
  col.accessor("montant", { header: "Reste dû", meta: { numeric: true, format: formatMad } }),
];

function Relances() {
  const data = React.useMemo(() => FACTURES.filter((f) => f.statut === "en_retard" || f.statut === "partielle"), []);
  const table = useDataTable<Facture>({
    data,
    columns: PERSO_COLUMNS,
    getRowId,
    enableRowSelection: true,
    initialState: { pagination: { pageIndex: 0, pageSize: 6 }, sorting: [{ id: "echeance", desc: false }] },
  });
  const total = table.getFilteredRowModel().rows.reduce((sum, row) => sum + row.original.montant, 0);
  const selection = table.getSelectedRowModel().rows.length;

  return (
    <DataTableProvider labels={{ searchPlaceholder: "Client, numéro…" }} getRowLabel={(row) => (row.original as Facture).numero}>
      <div
        style={{
          display: "grid",
          gap: 16,
          maxWidth: 960,
          padding: 20,
          borderRadius: "var(--ui-r-2xl)",
          background: "var(--ui-panel)",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>Relances</div>
            <div style={{ color: "var(--ui-fg-3)", fontSize: 13 }}>
              {table.getFilteredRowModel().rows.length} factures · {formatMad(total)} à recouvrer
            </div>
          </div>
          <Button size="sm" variant="tonal" disabled={selection === 0}>
            <Send />
            Relancer{selection > 0 ? ` (${selection})` : ""}
          </Button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <DataTableSearch table={table} />
          <DataTableFacetedFilter column={table.getColumn("statut")!} />
          <span style={{ flex: 1 }} />
          <DataTableViewOptions table={table} />
        </div>
        <DataTableView table={table} aria-label="Relances" density="compact" variant="plain" />
        <DataTablePagination table={table} variant="compact" pageSizeOptions={[6, 12]} />
      </div>
    </DataTableProvider>
  );
}

/**
 * Composition avec les briques, comme shadcn/ui : `useDataTable` crée
 * l'instance, puis `DataTableSearch`, `DataTableFacetedFilter`,
 * `DataTableViewOptions`, `DataTableView` et `DataTablePagination` se placent
 * librement. `DataTableColumnHeader` sert d'en-tête personnalisé ;
 * `DataTableProvider` fournit libellés et libellé de ligne.
 */
export const Personnalisee: Story = {
  name: "Personnalisée",
  render: () => <Relances />,
};

/* ══ ERP : colonnes figées et redimensionnables, lignes dépliables, totaux ══ */

const VILLES: Record<string, string> = {
  "Atlas Négoce": "Casablanca",
  "Bennani & Fils": "Fès",
  "Café Zellige": "Marrakech",
  "Électro Sud": "Agadir",
  "Groupe Tazi": "Rabat",
  "Imprimerie Ouarzazate": "Ouarzazate",
  "Majorelle Design": "Marrakech",
  "Sahara Logistique": "Laâyoune",
};
const COMMERCIAUX = ["Salma Idrissi", "Youssef Amrani", "Nadia Berrada", "Karim El Fassi"];
const MODES = ["Virement", "Chèque", "Effet de commerce", "Espèces"];
const PRESTATIONS = [
  { designation: "Licence logicielle annuelle", prix: 4800 },
  { designation: "Maintenance trimestrielle", prix: 1850 },
  { designation: "Formation sur site (jour)", prix: 3200 },
  { designation: "Développement spécifique (jour)", prix: 2900 },
  { designation: "Hébergement cloud (mois)", prix: 640 },
  { designation: "Assistance téléphonique (heure)", prix: 380 },
  { designation: "Audit de sécurité", prix: 7500 },
];

interface LigneFacture {
  designation: string;
  quantite: number;
  prix: number;
}

interface FactureErp extends Facture {
  ville: string;
  commercial: string;
  mode: string;
  ht: number;
  tva: number;
  ttc: number;
  regle: number;
  reste: number;
  lignes: LigneFacture[];
}

const arrondi = (value: number) => Math.round(value * 100) / 100;

/** Factures détaillées : lignes de prestation, HT, TVA à 20 %, TTC, part réglée selon le statut. */
function makeFacturesErp(count: number, seed: number): FactureErp[] {
  const random = seeded(seed * 31 + 7);
  return makeFactures(count, seed).map((facture) => {
    const lignes = Array.from({ length: 1 + Math.floor(random() * 3) }, () => {
      const prestation = PRESTATIONS[Math.floor(random() * PRESTATIONS.length)];
      return { designation: prestation.designation, quantite: 1 + Math.floor(random() * 6), prix: prestation.prix };
    });
    const ht = arrondi(lignes.reduce((sum, ligne) => sum + ligne.quantite * ligne.prix, 0));
    const tva = arrondi(ht * 0.2);
    const ttc = arrondi(ht + tva);
    const regle =
      facture.statut === "payee" ? ttc : facture.statut === "partielle" ? arrondi(ttc * (0.3 + random() * 0.4)) : 0;
    return {
      ...facture,
      montant: ttc,
      ville: VILLES[facture.client] ?? "Casablanca",
      commercial: COMMERCIAUX[Math.floor(random() * COMMERCIAUX.length)],
      mode: MODES[Math.floor(random() * MODES.length)],
      ht,
      tva,
      ttc,
      regle,
      reste: arrondi(ttc - regle),
      lignes,
    };
  });
}

const FACTURES_ERP = makeFacturesErp(132, 2026);
const COMMERCIAL_OPTIONS: DataTableFilterOption[] = COMMERCIAUX.map((c) => ({ value: c, label: c }));
const getErpId = (f: FactureErp) => f.id;
const getErpLabel = (f: FactureErp) => f.numero;

const erp = createColumnHelper<FactureErp>();

const StatutBadge = ({ statut }: { statut: Statut }) => (
  <Badge variant={STATUTS[statut].tone} dot>
    {STATUTS[statut].label}
  </Badge>
);

interface ErpColumnsOptions {
  /** Numéro figé au début. */
  pin?: boolean;
  /** Totaux sur les montants. */
  totals?: boolean;
}

/** Une douzaine de colonnes de facturation, largeurs de départ comprises. */
function erpColumns({ pin = false, totals = false }: ErpColumnsOptions = {}): ColumnDef<FactureErp, any>[] {
  const sum = totals ? ("sum" as const) : undefined;
  return [
    erp.accessor("numero", {
      header: "Facture",
      cell: ({ getValue }) => <span style={{ fontWeight: 500 }}>{getValue()}</span>,
      meta: { width: 132, pin: pin ? "start" : undefined },
    }),
    erp.accessor("client", {
      header: "Client",
      cell: ({ row }) => <ClientCell facture={row.original} />,
      meta: { width: 224, filterOptions: CLIENT_OPTIONS },
    }),
    erp.accessor("statut", {
      header: "Statut",
      cell: ({ getValue }) => <StatutBadge statut={getValue()} />,
      meta: { width: 132, format: (value: Statut) => STATUTS[value].label, filterOptions: STATUT_OPTIONS },
    }),
    erp.accessor("emission", { header: "Émission", meta: { width: 128, format: formatDate } }),
    erp.accessor("echeance", {
      header: "Échéance",
      cell: ({ row, getValue }) => (
        <span style={{ color: row.original.statut === "en_retard" ? "var(--ui-err)" : "var(--ui-fg-2)" }}>
          {formatDate(getValue())}
        </span>
      ),
      meta: { width: 128, format: formatDate },
    }),
    erp.accessor("ville", { header: "Ville", meta: { width: 128 } }),
    erp.accessor("commercial", { header: "Commercial", meta: { width: 160, filterOptions: COMMERCIAL_OPTIONS } }),
    erp.accessor("mode", { header: "Règlement", meta: { width: 160 } }),
    erp.accessor("ht", { header: "Montant HT", meta: { width: 148, numeric: true, format: formatMad, aggregate: sum } }),
    erp.accessor("tva", { header: "TVA", meta: { width: 132, numeric: true, format: formatMad, aggregate: sum } }),
    erp.accessor("ttc", { header: "Montant TTC", meta: { width: 152, numeric: true, format: formatMad, aggregate: sum } }),
    erp.accessor("reste", { header: "Reste dû", meta: { width: 144, numeric: true, format: formatMad, aggregate: sum } }),
  ];
}

const erpMenu = actionsColumn<FactureErp>((row) => (
  <>
    <MenuItem>
      <Eye />
      Ouvrir {row.original.numero}
    </MenuItem>
    <MenuItem>
      <Download />
      Télécharger le PDF
    </MenuItem>
    <MenuSeparator />
    <MenuItem variant="danger">
      <Trash2 />
      Supprimer
    </MenuItem>
  </>
));

/** Titre et chapeau d'une partie de story. */
const Section = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
  <section style={{ display: "grid", gap: 12, minWidth: 0 }}>
    <div style={{ display: "grid", gap: 2 }}>
      <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>{title}</div>
      {description && <div style={{ color: "var(--ui-fg-3)", fontSize: 13 }}>{description}</div>}
    </div>
    {children}
  </section>
);

/** Fait défiler la table d'emblée : colonnes figées et filets visibles dès l'ouverture de la story. */
function useInitialScroll(offset: number) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const container = ref.current?.querySelector<HTMLElement>(".ui-table-container");
    if (!container) return;
    const rtl = getComputedStyle(container).direction === "rtl";
    container.scrollLeft = rtl ? -offset : offset;
  }, [offset]);
  return ref;
}

/* ── Colonnes figées ───────────────────────────────────────────────── */

function DemoColonnesFigees() {
  const ref = useInitialScroll(360);
  const columns = React.useMemo(() => [...erpColumns({ pin: true }), erpMenu], []);
  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 880 }}>
      <DataTable
        ref={ref}
        aria-label="Factures, colonnes figées"
        columns={columns}
        data={FACTURES_ERP}
        getRowId={getErpId}
        getRowLabel={getErpLabel}
        enableRowSelection
        initialState={{ pagination: { pageIndex: 0, pageSize: 8 } }}
      />
      <p style={{ margin: 0, color: "var(--ui-fg-3)", fontSize: 13 }}>
        La case de sélection et le numéro restent au début, le menu « ⋯ » à la fin. Menu d'une colonne : « Figer au
        début », « Figer à la fin », « Libérer ».
      </p>
    </div>
  );
}

/**
 * Douze colonnes dans 880 px : la table défile horizontalement. `meta.pin:
 * "start"` fige le numéro ; la case de sélection (au début) et le menu « ⋯ »
 * (à la fin) se figent d'office. Les colonnes figées ont un fond opaque ; un
 * filet et une ombre douce n'apparaissent que quand du contenu passe dessous.
 * Le menu de chaque colonne fige au début, à la fin, ou libère ; l'état
 * `columnPinning` est contrôlable et mémorisé avec `persistKey`. Décalages en
 * propriétés logiques : tout s'inverse de droite à gauche.
 */
export const ColonnesFigees: Story = {
  name: "Colonnes figées",
  render: () => <DemoColonnesFigees />,
};

/* ── Colonnes redimensionnables ────────────────────────────────────── */

function DemoColonnesRedimensionnables() {
  const columns = React.useMemo(() => erpColumns().filter((c) => ["numero", "client", "statut", "echeance", "commercial", "ttc"].includes(c.id ?? (c as { accessorKey?: string }).accessorKey ?? "")), []);
  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 1000 }}>
      <DataTable
        aria-label="Factures, colonnes redimensionnables"
        columns={columns}
        data={FACTURES_ERP}
        getRowId={getErpId}
        getRowLabel={getErpLabel}
        enableColumnResizing
        toolbar={false}
        initialState={{ pagination: { pageIndex: 0, pageSize: 6 }, columnSizing: { client: 260 } }}
      />
      <p style={{ margin: 0, color: "var(--ui-fg-3)", fontSize: 13 }}>
        Glissez le bord d'un en-tête, ou donnez le focus à la poignée (Tab) : flèches ± 16 px, Maj+flèche ± 64 px,
        Origine et Fin pour les bornes. Double-clic : largeur par défaut.
      </p>
    </div>
  );
}

/**
 * `enableColumnResizing` : une poignée au bord de fin de chaque en-tête. À la
 * souris ou au doigt, on glisse (le sens s'inverse de droite à gauche) ; au
 * clavier, c'est un séparateur focalisable (`role="separator"`,
 * `aria-valuenow`) : flèches ± 16 px, Maj+flèche ± 64 px, Origine / Fin pour
 * les bornes `meta.minWidth` / `meta.maxWidth`. Double-clic : largeur par
 * défaut (`meta.width`). Mise en page fixe, texte coupé d'une ellipse ; les
 * largeurs (`columnSizing`) se mémorisent avec `persistKey`.
 */
export const ColonnesRedimensionnables: Story = {
  name: "Colonnes redimensionnables",
  render: () => <DemoColonnesRedimensionnables />,
};

/* ── Lignes dépliables ─────────────────────────────────────────────── */

function DetailFacture({ facture }: { facture: FactureErp }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-start" }}>
      <div
        style={{
          flex: "1 1 420px",
          minWidth: 0,
          maxWidth: 640,
          overflow: "hidden",
          border: "1px solid var(--ui-line)",
          borderRadius: "var(--ui-r-md)",
          background: "var(--ui-panel)",
        }}
      >
        <Table density="compact" aria-label={`Lignes de la facture ${facture.numero}`}>
          <TableHeader>
            <TableRow>
              <TableHead>Prestation</TableHead>
              <TableHead numeric>Qté</TableHead>
              <TableHead numeric>Prix unitaire</TableHead>
              <TableHead numeric>Total HT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {facture.lignes.map((ligne, index) => (
              <TableRow key={index}>
                <TableCell>{ligne.designation}</TableCell>
                <TableCell numeric>{ligne.quantite}</TableCell>
                <TableCell numeric>{formatMad(ligne.prix)}</TableCell>
                <TableCell numeric>{formatMad(ligne.quantite * ligne.prix)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <DescriptionList layout="horizontal" style={{ flex: "0 1 300px", minWidth: 240 }}>
        <DescriptionItem>
          <DescriptionTerm>Commercial</DescriptionTerm>
          <DescriptionDetails>{facture.commercial}</DescriptionDetails>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>Règlement</DescriptionTerm>
          <DescriptionDetails>{facture.mode}</DescriptionDetails>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>Déjà réglé</DescriptionTerm>
          <DescriptionDetails>{formatMad(facture.regle)}</DescriptionDetails>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>Reste dû</DescriptionTerm>
          <DescriptionDetails>{formatMad(facture.reste)}</DescriptionDetails>
        </DescriptionItem>
      </DescriptionList>
    </div>
  );
}

const renderDetailFacture = (row: TableRowModel<FactureErp>) => <DetailFacture facture={row.original} />;

interface Compte {
  code: string;
  intitule: string;
  debit: number;
  credit: number;
  sousComptes?: Compte[];
}

const compte = (code: string, intitule: string, debit: number, credit: number): Compte => ({ code, intitule, debit, credit });
const groupe = (code: string, intitule: string, sousComptes: Compte[]): Compte => ({
  code,
  intitule,
  debit: sousComptes.reduce((sum, c) => sum + c.debit, 0),
  credit: sousComptes.reduce((sum, c) => sum + c.credit, 0),
  sousComptes,
});

/** Balance des comptes de gestion (plan comptable marocain, classes 6 et 7). */
const BALANCE: Compte[] = [
  groupe("6", "Charges", [
    groupe("61", "Charges d'exploitation", [
      compte("611", "Achats revendus de marchandises", 1_284_500, 18_200),
      compte("612", "Achats consommés de matières et fournitures", 642_300, 9_850),
      compte("613", "Autres charges externes", 318_740, 0),
      compte("616", "Impôts et taxes", 48_900, 0),
      compte("617", "Charges de personnel", 915_600, 0),
    ]),
    groupe("63", "Charges financières", [
      compte("631", "Charges d'intérêts", 74_200, 0),
      compte("633", "Pertes de change", 12_480, 3_100),
    ]),
    groupe("67", "Impôts sur les résultats", [compte("670", "Impôts sur les résultats", 186_000, 0)]),
  ]),
  groupe("7", "Produits", [
    groupe("71", "Produits d'exploitation", [
      compte("711", "Ventes de marchandises", 21_400, 2_486_900),
      compte("712", "Ventes de biens et services produits", 8_750, 1_142_300),
      compte("718", "Autres produits d'exploitation", 0, 36_400),
    ]),
    groupe("73", "Produits financiers", [
      compte("733", "Gains de change", 0, 9_870),
      compte("738", "Intérêts et autres produits financiers", 0, 22_150),
    ]),
  ]),
];

const formatSolde = dataTableFormatters.currency("MAD", { signDisplay: "exceptZero" });
const cpt = createColumnHelper<Compte>();
const COMPTE_COLUMNS: ColumnDef<Compte, any>[] = [
  cpt.accessor("code", {
    header: "Compte",
    cell: ({ row, getValue }) => (
      <span style={{ fontWeight: row.depth === 0 ? 600 : row.subRows.length ? 500 : 400, fontVariantNumeric: "tabular-nums" }}>
        {getValue()}
      </span>
    ),
    meta: { width: 120 },
  }),
  cpt.accessor("intitule", {
    header: "Intitulé",
    cell: ({ row, getValue }) => <span style={{ fontWeight: row.depth === 0 ? 600 : row.subRows.length ? 500 : 400 }}>{getValue()}</span>,
    meta: { footerLabel: "Total de la balance" },
  }),
  cpt.accessor("debit", { header: "Débit", meta: { numeric: true, format: formatMad, aggregate: "sum" } }),
  cpt.accessor("credit", { header: "Crédit", meta: { numeric: true, format: formatMad, aggregate: "sum" } }),
  cpt.accessor((c) => c.debit - c.credit, {
    id: "solde",
    header: "Solde",
    meta: { numeric: true, format: formatSolde, aggregate: "sum" },
  }),
];

function DemoLignesDepliables() {
  const columns = React.useMemo(
    () => erpColumns().filter((c) => ["numero", "client", "statut", "echeance", "ttc"].includes((c as { accessorKey?: string }).accessorKey ?? "")),
    [],
  );
  return (
    <div style={{ display: "grid", gap: 32, maxWidth: 1040 }}>
      <Section
        title="Panneau de détail"
        description="renderSubComponent : lignes de la facture et règlement, sous la ligne dépliée."
      >
        <DataTable
          aria-label="Factures avec détail"
          columns={columns}
          data={FACTURES_ERP}
          getRowId={getErpId}
          getRowLabel={getErpLabel}
          enableRowSelection
          renderSubComponent={renderDetailFacture}
          toolbar={false}
          initialState={{ pagination: { pageIndex: 0, pageSize: 5 }, expanded: { [FACTURES_ERP[0].id]: true } }}
        />
      </Section>
      <Section
        title="Données hiérarchiques"
        description="getSubRows : balance des comptes de gestion, sous-comptes en retrait, totaux des classes."
      >
        <DataTable
          aria-label="Balance des comptes"
          columns={COMPTE_COLUMNS}
          data={BALANCE}
          getRowId={(c) => c.code}
          getRowLabel={(c) => `${c.code} ${c.intitule}`}
          getSubRows={(c) => c.sousComptes}
          enablePagination={false}
          toolbar={false}
          defaultDensity="compact"
          initialState={{ expanded: { "6": true, "61": true, "7": true } }}
        />
      </Section>
    </div>
  );
}

/**
 * Deux façons de déplier une ligne, par le chevron d'une colonne dédiée
 * (`expandColumn()`, ajoutée d'office et figée au début) : `aria-expanded`,
 * « Afficher le détail de F-2026-0001 », Flèche droite / gauche sur une ligne
 * cliquable. **Panneau de détail** (`renderSubComponent`, `getRowCanExpand`) :
 * une ligne pleine largeur, reliée au chevron par `aria-controls`, qui reste
 * dans la partie visible quand la table défile. **Données hiérarchiques**
 * (`getSubRows`) : les lignes enfants suivent leur parent, en retrait dans la
 * première colonne de données. L'état `expanded` est contrôlable ; tri,
 * sélection, pagination (les enfants restent sur la page du parent) et
 * virtualisation suivent.
 */
export const LignesDepliables: Story = {
  name: "Lignes dépliables",
  render: () => <DemoLignesDepliables />,
};

/* ── Totaux ────────────────────────────────────────────────────────── */

const BASE_TOTAUX = makeFacturesErp(487, 7);
const TOTAUX_SERVEUR = {
  // Un nœud quelconque, ou un nombre (formaté par `meta.format` de la colonne).
  client: `${BASE_TOTAUX.length} factures`,
  ht: BASE_TOTAUX.reduce((sum, f) => sum + f.ht, 0),
  tva: BASE_TOTAUX.reduce((sum, f) => sum + f.tva, 0),
  ttc: BASE_TOTAUX.reduce((sum, f) => sum + f.ttc, 0),
  reste: BASE_TOTAUX.reduce((sum, f) => sum + f.reste, 0),
};

function totauxColumns(): ColumnDef<FactureErp, any>[] {
  const keep = ["numero", "client", "statut", "ht", "tva", "ttc", "reste"];
  return erpColumns({ totals: true })
    .filter((c) => keep.includes((c as { accessorKey?: string }).accessorKey ?? ""))
    .map((c) => ({
      ...c,
      meta: {
        ...c.meta,
        // Mise en page automatique : les colonnes prennent la largeur de leur contenu.
        width: undefined,
        ...((c as { accessorKey?: string }).accessorKey === "client" && {
          // Agrégat libre : nombre de clients distincts parmi les lignes filtrées.
          aggregate: (values: unknown[]) => {
            const count = new Set(values).size;
            return `${count} client${count > 1 ? "s" : ""}`;
          },
        }),
      },
    }));
}

function TotauxServeur() {
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 5 });
  const start = pagination.pageIndex * pagination.pageSize;
  // Les `meta.aggregate` restent déclarés : en pagination serveur, ils cèdent la place à `aggregates`.
  const columns = React.useMemo(() => totauxColumns(), []);
  return (
    <DataTable
      aria-label="Factures, totaux calculés par le serveur"
      columns={columns}
      data={BASE_TOTAUX.slice(start, start + pagination.pageSize)}
      rowCount={BASE_TOTAUX.length}
      getRowId={getErpId}
      manualPagination
      state={{ pagination }}
      onPaginationChange={setPagination}
      aggregates={TOTAUX_SERVEUR}
      toolbar={false}
      pageSizeOptions={[5, 10, 20]}
    />
  );
}

function DemoTotaux() {
  const columns = React.useMemo(() => totauxColumns(), []);
  return (
    <div style={{ display: "grid", gap: 32, maxWidth: 1120 }}>
      <Section
        title="Calculés sur les lignes filtrées"
        description="Factures en retard ou partielles : la ligne de totaux porte sur toutes les pages, pas seulement la page affichée."
      >
        <DataTable
          aria-label="Factures à recouvrer, totaux"
          columns={columns}
          data={FACTURES_ERP}
          getRowId={getErpId}
          getRowLabel={getErpLabel}
          enableColumnVisibility={false}
          enableDensity={false}
          initialState={{
            pagination: { pageIndex: 0, pageSize: 5 },
            columnFilters: [{ id: "statut", value: ["en_retard", "partielle"] }],
          }}
        />
      </Section>
      <Section
        title="Fournis par le serveur"
        description="Pagination serveur : le client ne voit qu'une page, les totaux arrivent avec la réponse (aggregates)."
      >
        <TotauxServeur />
      </Section>
    </div>
  );
}

/**
 * `meta.aggregate` sur une colonne : `sum`, `avg`, `min`, `max`, `count` ou
 * une fonction `(valeurs, lignes) => nœud`. Le calcul porte sur **toutes les
 * lignes filtrées** (pas seulement la page) et passe par `meta.format`. La
 * ligne « Total » (`<tfoot>`, libellé `meta.footerLabel` possible) apparaît
 * d'office ; `showFooter` la force ou la retire. Avec un en-tête figé
 * (`maxHeight`, `virtualized`), elle colle au bas de la zone défilante. En
 * pagination serveur, le client ne voit qu'une page : les totaux arrivent par
 * la prop `aggregates`.
 */
export const Totaux: Story = {
  name: "Totaux",
  render: () => <DemoTotaux />,
};

/* ── ERP complète ──────────────────────────────────────────────────── */

/* La plus récente : en tête du tri par émission décroissante, son détail est ouvert. */
const PLUS_RECENTE = FACTURES_ERP.reduce((a, b) => (b.emission > a.emission ? b : a));

function FacturationErp() {
  const [data, setData] = React.useState(FACTURES_ERP);
  const columns = React.useMemo(() => [...erpColumns({ totals: true }), erpMenu], []);
  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 1120 }}>
      <DataTable
        aria-label="Facturation"
        columns={columns}
        data={data}
        getRowId={getErpId}
        getRowLabel={getErpLabel}
        enableRowSelection
        enableColumnResizing
        enableExport
        exportFilename="facturation"
        renderSubComponent={renderDetailFacture}
        maxHeight={560}
        defaultDensity="compact"
        initialState={{
          sorting: [{ id: "emission", desc: true }],
          pagination: { pageIndex: 0, pageSize: 20 },
          // Numéro figé au début, montant TTC à la fin : l'état `columnPinning` plutôt que `meta.pin`.
          columnPinning: { left: ["numero"], right: ["ttc"] },
          expanded: { [PLUS_RECENTE.id]: true },
        }}
        toolbarActions={
          <Button size="sm">
            <Plus />
            Nouvelle facture
          </Button>
        }
        bulkActions={({ selectedRows, table, clear }) => (
          <>
            <Button size="sm" variant="ghost" onClick={() => exportCsv(table, "facturation-selection", { rows: "selected" })}>
              <FileText />
              Exporter
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                const ids = new Set(selectedRows.map((r) => r.id));
                setData((rows) => rows.filter((f) => !ids.has(f.id)));
                clear();
              }}
            >
              <Trash2 />
              Supprimer
            </Button>
          </>
        )}
      />
    </div>
  );
}

/**
 * Tout ensemble, comme dans un ERP : douze colonnes de facturation, numéro,
 * sélection et chevron figés au début, montant TTC et menu « ⋯ » figés à la
 * fin (état `columnPinning`) ; colonnes
 * redimensionnables ; panneau de détail (lignes de prestation, règlement) ;
 * totaux HT, TVA, TTC et reste dû sur toutes les lignes filtrées ; en-tête et
 * totaux collés en haut et en bas d'une zone de 560 px ; facettes, actions
 * groupées, export CSV, densité compacte.
 */
export const ErpComplete: Story = {
  name: "ERP complète",
  render: () => <FacturationErp />,
};
