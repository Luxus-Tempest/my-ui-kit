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
  EmptyState,
  MenuItem,
  MenuSeparator,
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
  type SortingState,
} from "@acme/ui";
import {
  Copy,
  Download,
  Eye,
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
    docs: {
      description: {
        component:
          "Table de données de haut niveau, au-dessus de TanStack Table : `<DataTable columns={columns} data={data} />` suffit. Tri multi-colonnes (Maj+clic, `aria-sort`), recherche sans accents, filtres à facettes (`meta.filterOptions`), pagination, sélection avec actions groupées, colonnes masquables, densité, export CSV, états de chargement et vides, virtualisation (`virtualized`), mode serveur (`manual*` + `rowCount`), persistance (`persistKey`). Chaque fonction se coupe par une prop `enable*`. Pour une mise en page sur mesure, composer `useDataTable` avec `DataTableToolbar`, `DataTableView`, `DataTablePagination` et les autres briques.",
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
