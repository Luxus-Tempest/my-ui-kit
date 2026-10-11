import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  AppBar,
  AppBarActions,
  AppBarLeading,
  AppBarTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  DataTable,
  Heading,
  ListItemIcon,
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  Stat,
  StatGroup,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  Tooltip,
  actionsColumn,
  createColumnHelper,
  dataTableFormatters,
  toast,
  Toaster,
  type ColumnDef,
  type DataTableFilterOption,
} from "@acme/ui";
import {
  Bell,
  BookOpen,
  ChartColumn,
  ChevronsUpDown,
  CircleAlert,
  CircleHelp,
  Clock,
  Copy,
  Eye,
  House,
  Landmark,
  LogOut,
  Package,
  Plus,
  Receipt,
  Send,
  Settings,
  Trash2,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { CLIENTS, makeFactures, STATUT_KEYS, STATUTS, type Facture, type Statut } from "../_shared/factures";

const meta: Meta = {
  title: "Blocs/Application",
  parameters: {
    padding: 0,
    docs: {
      story: { inline: false, height: "820px" },
      description: {
        component:
          "La coquille d'une application de gestion : barre latérale (`Sidebar`, réductible en icônes avec ⌘B), barre d'application avec fil d'Ariane, rangée d'indicateurs (`StatGroup`), onglets de vue et `DataTable` complète (recherche, facettes, sélection et actions groupées, export). Point de départ d'un ERP, d'un back-office ou d'un CRM : remplacer les données, garder la structure.",
      },
    },
  },
};
export default meta;

/* ── Données ──────────────────────────────────────────────────────── */

const FACTURES = makeFactures(96, 1207);
const formatDate = dataTableFormatters.date();
const formatMad = dataTableFormatters.currency("MAD");
const MAD: Intl.NumberFormatOptions = { style: "currency", currency: "MAD", maximumFractionDigits: 0 };

const sumOf = (rows: Facture[]) => rows.reduce((s, f) => s + f.montant, 0);
const byStatut = (statut: Statut) => FACTURES.filter((f) => f.statut === statut);
/** Montants mensuels (janvier → septembre) d'un ensemble de factures, pour les tendances. */
const monthly = (rows: Facture[]) =>
  Array.from({ length: 9 }, (_, m) => sumOf(rows.filter((f) => f.emission.getMonth() === m)));

/* ── Navigation ───────────────────────────────────────────────────── */

type Page = { id: string; label: string; icon: LucideIcon; badge?: number };
const PRINCIPAL: Page[] = [
  { id: "accueil", label: "Accueil", icon: House },
  { id: "factures", label: "Factures", icon: Receipt, badge: byStatut("en_retard").length },
  { id: "clients", label: "Clients", icon: Users },
  { id: "produits", label: "Produits", icon: Package },
  { id: "tresorerie", label: "Trésorerie", icon: Landmark },
  { id: "rapports", label: "Rapports", icon: ChartColumn },
];
const AIDE: Page[] = [
  { id: "guide", label: "Guide de démarrage", icon: BookOpen },
  { id: "parametres", label: "Paramètres", icon: Settings },
];

function NavGroup({ label, pages, active, onNavigate }: { label?: string; pages: Page[]; active: string; onNavigate: (id: string) => void }) {
  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {pages.map((page) => (
            <SidebarMenuItem key={page.id}>
              <SidebarMenuButton tooltip={page.label} isActive={active === page.id} onClick={() => onNavigate(page.id)}>
                <page.icon />
                <span>{page.label}</span>
              </SidebarMenuButton>
              {page.badge ? <SidebarMenuBadge>{page.badge}</SidebarMenuBadge> : null}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function AppSidebar({ active, onNavigate }: { active: string; onNavigate: (id: string) => void }) {
  return (
    <Sidebar collapsible="icon" label="Navigation principale">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Acme Gestion">
              <ListItemIcon tint="var(--ui-pri)" style={{ width: 32, height: 32, borderRadius: "var(--ui-r-sm)" }}>
                <Wallet />
              </ListItemIcon>
              <span>
                <span>Acme Gestion</span>
                <span>Atlas Distribution SARL</span>
              </span>
              <ChevronsUpDown />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup pages={PRINCIPAL} active={active} onNavigate={onNavigate} />
        <NavGroup label="Aide" pages={AIDE} active={active} onNavigate={onNavigate} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Menu>
              <MenuTrigger asChild>
                <SidebarMenuButton size="lg" tooltip="Nadia Alami">
                  <Avatar><AvatarFallback>NA</AvatarFallback></Avatar>
                  <span>
                    <span>Nadia Alami</span>
                    <span>Comptable</span>
                  </span>
                  <ChevronsUpDown />
                </SidebarMenuButton>
              </MenuTrigger>
              <MenuContent side="top" align="start" style={{ minWidth: 232 }}>
                <MenuItem><Settings />Paramètres du compte</MenuItem>
                <MenuItem><CircleHelp />Aide</MenuItem>
                <MenuSeparator />
                <MenuItem><LogOut />Se déconnecter</MenuItem>
              </MenuContent>
            </Menu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

/* ── Table des factures ───────────────────────────────────────────── */

const col = createColumnHelper<Facture>();
const STATUT_OPTIONS: DataTableFilterOption[] = STATUT_KEYS.map((key) => ({
  value: key,
  label: STATUTS[key].label,
  icon: STATUTS[key].icon,
}));
const CLIENT_OPTIONS: DataTableFilterOption[] = CLIENTS.map((c) => ({ value: c.nom, label: c.nom }));

const COLUMNS: ColumnDef<Facture, any>[] = [
  col.accessor("numero", {
    header: "Facture",
    cell: ({ getValue }) => <span style={{ fontWeight: 500 }}>{getValue()}</span>,
  }),
  col.accessor("client", {
    header: "Client",
    cell: ({ row }) => (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
        <Avatar size="sm"><AvatarFallback>{row.original.initiales}</AvatarFallback></Avatar>
        {row.original.client}
      </span>
    ),
    meta: { filterOptions: CLIENT_OPTIONS },
  }),
  col.accessor("statut", {
    header: "Statut",
    cell: ({ getValue }) => {
      const statut = STATUTS[getValue<Statut>()];
      return <Badge variant={statut.tone} dot>{statut.label}</Badge>;
    },
    meta: { format: (value: Statut) => STATUTS[value].label, filterOptions: STATUT_OPTIONS },
  }),
  col.accessor("echeance", {
    header: "Échéance",
    cell: ({ row, getValue }) => (
      <span style={{ color: row.original.statut === "en_retard" ? "var(--ui-err)" : "var(--ui-fg-2)" }}>
        {formatDate(getValue())}
      </span>
    ),
    meta: { format: formatDate },
  }),
  col.accessor("montant", { header: "Montant TTC", meta: { numeric: true, format: formatMad, label: "Montant" } }),
  actionsColumn<Facture>((row) => (
    <>
      <MenuItem><Eye />Ouvrir {row.original.numero}</MenuItem>
      <MenuItem><Send />Relancer le client</MenuItem>
      <MenuItem><Copy />Dupliquer</MenuItem>
      <MenuSeparator />
      <MenuItem variant="danger"><Trash2 />Supprimer</MenuItem>
    </>
  )),
];

const VUES = {
  toutes: { label: "Toutes", filtre: () => true },
  attente: { label: "À encaisser", filtre: (f: Facture) => f.statut === "envoyee" || f.statut === "partielle" },
  retard: { label: "En retard", filtre: (f: Facture) => f.statut === "en_retard" },
  brouillons: { label: "Brouillons", filtre: (f: Facture) => f.statut === "brouillon" },
} as const;
type Vue = keyof typeof VUES;

/* ── Écran ────────────────────────────────────────────────────────── */

function Factures() {
  const [vue, setVue] = React.useState<Vue>("toutes");
  const rows = React.useMemo(() => FACTURES.filter(VUES[vue].filtre), [vue]);
  const payees = byStatut("payee");
  const attente = FACTURES.filter(VUES.attente.filtre);
  const retard = byStatut("en_retard");

  return (
    <div style={{ display: "grid", alignContent: "start", gap: 24, padding: "4px 24px 32px" }}>
      <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "grid", gap: 4 }}>
          <Heading level={1} size="lg">Factures</Heading>
          <Text tone="muted">Exercice 2026 · {FACTURES.length} factures émises</Text>
        </div>
        <Button onClick={() => toast.success("Brouillon de facture créé")}><Plus />Nouvelle facture</Button>
      </div>

      <StatGroup aria-label="Synthèse des factures">
        <Stat label="Encaissé" icon={<Wallet />} value={sumOf(payees)} format={MAD} delta={0.082} deltaLabel="vs T2" trend={monthly(payees)} />
        <Stat label="À encaisser" icon={<Clock />} value={sumOf(attente)} format={MAD} delta={0.031} deltaLabel="vs T2" positiveIsGood={false} trend={monthly(attente)} />
        <Stat label="En retard" icon={<CircleAlert />} value={sumOf(retard)} format={MAD} delta={-0.12} deltaLabel="vs T2" positiveIsGood={false} trend={monthly(retard)} />
        <Stat
          label="Délai de paiement moyen"
          icon={<Receipt />}
          value={34}
          format={{ style: "unit", unit: "day", unitDisplay: "long" }}
          delta={-3}
          deltaFormat={{ style: "unit", unit: "day", unitDisplay: "long" }}
          deltaLabel="vs T2"
          positiveIsGood={false}
          trend={[41, 39, 40, 38, 37, 37, 36, 35, 34]}
        />
      </StatGroup>

      <div style={{ display: "grid", gap: 12 }}>
        <Tabs value={vue} onValueChange={(v) => setVue(v as Vue)}>
          <TabsList aria-label="Vue des factures">
            {(Object.keys(VUES) as Vue[]).map((key) => (
              <TabsTrigger key={key} value={key}>
                {VUES[key].label}
                {key === "retard" && <Badge variant="err" style={{ marginInlineStart: 6 }}>{retard.length}</Badge>}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={vue}>
            <DataTable
              key={vue}
              aria-label={`Factures : ${VUES[vue].label.toLowerCase()}`}
              columns={COLUMNS}
              data={rows}
              getRowId={(f) => f.id}
              getRowLabel={(f) => `${f.numero}, ${f.client}`}
              enableRowSelection
              enableExport
              exportFilename="factures"
              initialState={{ sorting: [{ id: "echeance", desc: true }] }}
              onRowClick={(row) => toast(`${row.original.numero} · ${row.original.client}`, { description: formatMad(row.original.montant) })}
              bulkActions={({ selectedRows, clear }) => (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      toast.success(`${selectedRows.length} relance${selectedRows.length > 1 ? "s" : ""} envoyée${selectedRows.length > 1 ? "s" : ""}`);
                      clear();
                    }}
                  >
                    <Send />Relancer
                  </Button>
                </>
              )}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Application() {
  const [active, setActive] = React.useState("factures");
  const page = [...PRINCIPAL, ...AIDE].find((p) => p.id === active);
  return (
    <SidebarProvider style={{ height: "100svh" }}>
      <AppSidebar active={active} onNavigate={setActive} />
      <SidebarInset style={{ overflowY: "auto" }}>
        <AppBar variant="plain">
          <AppBarLeading>
            <Tooltip content="Afficher / masquer" shortcut="⌘B">
              <SidebarTrigger />
            </Tooltip>
          </AppBarLeading>
          <AppBarTitle asChild>
            <div>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem><BreadcrumbLink href="#ventes">Ventes</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbPage>{page?.label ?? "Factures"}</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </AppBarTitle>
          <AppBarActions>
            <Tooltip content="Notifications">
              <Button size="icon" variant="ghost" aria-label="Notifications, 3 non lues"><Bell /></Button>
            </Tooltip>
            <Tooltip content="Aide">
              <Button size="icon" variant="ghost" aria-label="Aide"><CircleHelp /></Button>
            </Tooltip>
          </AppBarActions>
        </AppBar>
        {active === "factures" ? (
          <Factures />
        ) : (
          <div style={{ padding: "4px 24px" }}>
            <Heading level={1} size="lg">{page?.label}</Heading>
            <Text tone="muted">Écran de démonstration : seule la page Factures est remplie.</Text>
          </div>
        )}
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}

/**
 * Barre latérale réductible (⌘B ou bouton), fil d'Ariane, indicateurs, onglets de vue,
 * table avec recherche, filtres Client / Statut, sélection (actions groupées) et export CSV.
 * Un clic sur une ligne l'ouvre.
 */
export const Ecran: StoryObj = { name: "Écran complet", render: () => <Application /> };
