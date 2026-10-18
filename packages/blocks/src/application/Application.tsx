import * as React from "react";
import { AppBar, AppBarActions, AppBarLeading, AppBarTitle } from "@rovia/ui/app-bar";
import { Avatar, AvatarFallback } from "@rovia/ui/avatar";
import { Badge, type BadgeVariant } from "@rovia/ui/badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@rovia/ui/breadcrumb";
import { Button } from "@rovia/ui/button";
import { DataTable, actionsColumn, createColumnHelper, dataTableFormatters, type ColumnDef, type DataTableFilterOption } from "@rovia/ui/data-table";
import { ListItemIcon } from "@rovia/ui/list";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@rovia/ui/menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarRail, SidebarTrigger } from "@rovia/ui/sidebar";
import { Stat, StatGroup } from "@rovia/ui/stat";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@rovia/ui/tabs";
import { toast } from "@rovia/ui/toast";
import { Tooltip } from "@rovia/ui/tooltip";
import { Heading, Text } from "@rovia/ui/typography";
import {
  Bell,
  BookOpen,
  ChartColumn,
  ChevronsUpDown,
  CircleAlert,
  CircleCheck,
  CircleDashed,
  CircleHelp,
  Clock,
  Copy,
  Eye,
  FilePen,
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

/* ── Types ────────────────────────────────────────────────────────── */

export type FactureStatut = "payee" | "envoyee" | "partielle" | "en_retard" | "brouillon";

export interface ApplicationFacture {
  id: string;
  numero: string;
  client: string;
  /** Initiales du client, pour son avatar. */
  initiales: string;
  statut: FactureStatut;
  emission: Date;
  echeance: Date;
  montant: number;
}

export interface ApplicationProps {
  /** Nom de l'application, en tête de la barre latérale. */
  appName: string;
  /** Société active, sous le nom de l'application. */
  orgName: string;
  user: { name: string; role: string; initials: string };
  invoices: ApplicationFacture[];
  /** Libellé de l'exercice, sous le titre (« Exercice 2026 »). */
  periodLabel: string;
  /** Code ISO de la devise (MAD, EUR…). */
  currency?: string;
  /** Variations à afficher sur les indicateurs, et le libellé de comparaison (« vs T2 »). */
  kpis: {
    comparisonLabel: string;
    encaisse: number;
    aEncaisser: number;
    retard: number;
    /** Délai de paiement moyen, en jours, sa variation et sa tendance. */
    paymentDelay: { value: number; delta: number; trend: number[] };
  };
  /** Nombre de mois des tendances, depuis janvier. */
  trendMonths?: number;
  onCreateInvoice?: () => void;
  onOpenInvoice?: (invoice: ApplicationFacture) => void;
  onRemind?: (invoices: ApplicationFacture[]) => void;
}

/* ── Statuts ──────────────────────────────────────────────────────── */

export const FACTURE_STATUTS: Record<FactureStatut, { label: string; tone: BadgeVariant; icon: React.ReactNode }> = {
  payee: { label: "Payée", tone: "ok", icon: <CircleCheck /> },
  envoyee: { label: "Envoyée", tone: "pri", icon: <Send /> },
  partielle: { label: "Partielle", tone: "warn", icon: <CircleDashed /> },
  en_retard: { label: "En retard", tone: "err", icon: <CircleAlert /> },
  brouillon: { label: "Brouillon", tone: "neu", icon: <FilePen /> },
};
const STATUT_KEYS = Object.keys(FACTURE_STATUTS) as FactureStatut[];

const VUES = {
  toutes: { label: "Toutes", filtre: () => true },
  attente: { label: "À encaisser", filtre: (f: ApplicationFacture) => f.statut === "envoyee" || f.statut === "partielle" },
  retard: { label: "En retard", filtre: (f: ApplicationFacture) => f.statut === "en_retard" },
  brouillons: { label: "Brouillons", filtre: (f: ApplicationFacture) => f.statut === "brouillon" },
} as const;
type Vue = keyof typeof VUES;

const sumOf = (rows: ApplicationFacture[]) => rows.reduce((s, f) => s + f.montant, 0);

/* ── Navigation ───────────────────────────────────────────────────── */

type Page = { id: string; label: string; icon: LucideIcon; badge?: number };
const AIDE: Page[] = [
  { id: "guide", label: "Guide de démarrage", icon: BookOpen },
  { id: "parametres", label: "Paramètres", icon: Settings },
];
const principal = (retard: number): Page[] => [
  { id: "accueil", label: "Accueil", icon: House },
  { id: "factures", label: "Factures", icon: Receipt, badge: retard },
  { id: "clients", label: "Clients", icon: Users },
  { id: "produits", label: "Produits", icon: Package },
  { id: "tresorerie", label: "Trésorerie", icon: Landmark },
  { id: "rapports", label: "Rapports", icon: ChartColumn },
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

function AppSidebar({
  appName,
  orgName,
  user,
  pages,
  active,
  onNavigate,
}: Pick<ApplicationProps, "appName" | "orgName" | "user"> & { pages: Page[]; active: string; onNavigate: (id: string) => void }) {
  return (
    <Sidebar collapsible="icon" label="Navigation principale">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip={appName}>
              <ListItemIcon tint="var(--ui-pri)" style={{ width: 32, height: 32, borderRadius: "var(--ui-r-sm)" }}>
                <Wallet />
              </ListItemIcon>
              <span>
                <span>{appName}</span>
                <span>{orgName}</span>
              </span>
              <ChevronsUpDown />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup pages={pages} active={active} onNavigate={onNavigate} />
        <NavGroup label="Aide" pages={AIDE} active={active} onNavigate={onNavigate} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Menu>
              <MenuTrigger asChild>
                <SidebarMenuButton size="lg" tooltip={user.name}>
                  <Avatar><AvatarFallback>{user.initials}</AvatarFallback></Avatar>
                  <span>
                    <span>{user.name}</span>
                    <span>{user.role}</span>
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

/* ── Page Factures ────────────────────────────────────────────────── */

function Factures({
  invoices,
  periodLabel,
  currency,
  kpis,
  trendMonths,
  onCreateInvoice,
  onOpenInvoice,
  onRemind,
}: Required<Pick<ApplicationProps, "invoices" | "periodLabel" | "currency" | "kpis" | "trendMonths">> &
  Pick<ApplicationProps, "onCreateInvoice" | "onOpenInvoice" | "onRemind">) {
  const [vue, setVue] = React.useState<Vue>("toutes");
  const formatDate = React.useMemo(() => dataTableFormatters.date(), []);
  const formatMoney = React.useMemo(() => dataTableFormatters.currency(currency), [currency]);
  const money: Intl.NumberFormatOptions = { style: "currency", currency, maximumFractionDigits: 0 };
  // Actions par défaut, tant que l'application ne branche pas les siennes.
  const defaultOpen = (f: ApplicationFacture) => toast(`${f.numero} · ${f.client}`, { description: formatMoney(f.montant) });
  const defaultRemind = (rows: ApplicationFacture[]) =>
    toast.success(`${rows.length} relance${rows.length > 1 ? "s" : ""} envoyée${rows.length > 1 ? "s" : ""}`);

  const columns = React.useMemo<ColumnDef<ApplicationFacture, any>[]>(() => {
    const col = createColumnHelper<ApplicationFacture>();
    const statutOptions: DataTableFilterOption[] = STATUT_KEYS.map((key) => ({
      value: key,
      label: FACTURE_STATUTS[key].label,
      icon: FACTURE_STATUTS[key].icon,
    }));
    const clientOptions: DataTableFilterOption[] = [...new Set(invoices.map((f) => f.client))]
      .sort((a, b) => a.localeCompare(b, "fr"))
      .map((nom) => ({ value: nom, label: nom }));
    return [
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
        meta: { filterOptions: clientOptions },
      }),
      col.accessor("statut", {
        header: "Statut",
        cell: ({ getValue }) => {
          const statut = FACTURE_STATUTS[getValue<FactureStatut>()];
          return <Badge variant={statut.tone} dot>{statut.label}</Badge>;
        },
        meta: { format: (value: FactureStatut) => FACTURE_STATUTS[value].label, filterOptions: statutOptions },
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
      col.accessor("montant", { header: "Montant TTC", meta: { numeric: true, format: formatMoney, label: "Montant" } }),
      actionsColumn<ApplicationFacture>((row) => (
        <>
          <MenuItem onSelect={() => (onOpenInvoice ?? defaultOpen)(row.original)}><Eye />Ouvrir {row.original.numero}</MenuItem>
          <MenuItem onSelect={() => (onRemind ?? defaultRemind)([row.original])}><Send />Relancer le client</MenuItem>
          <MenuItem><Copy />Dupliquer</MenuItem>
          <MenuSeparator />
          <MenuItem variant="danger"><Trash2 />Supprimer</MenuItem>
        </>
      )),
    ];
  }, [invoices, formatDate, formatMoney, onOpenInvoice, onRemind]);

  /** Montants mensuels (janvier → mois `trendMonths`) d'un ensemble de factures, pour les tendances. */
  const monthly = (rows: ApplicationFacture[]) =>
    Array.from({ length: trendMonths }, (_, m) => sumOf(rows.filter((f) => f.emission.getMonth() === m)));


  const rows = React.useMemo(() => invoices.filter(VUES[vue].filtre), [invoices, vue]);
  const payees = invoices.filter((f) => f.statut === "payee");
  const attente = invoices.filter(VUES.attente.filtre);
  const retard = invoices.filter((f) => f.statut === "en_retard");
  const days: Intl.NumberFormatOptions = { style: "unit", unit: "day", unitDisplay: "long" };

  return (
    <div style={{ display: "grid", alignContent: "start", gap: 24, padding: "4px 24px 32px" }}>
      <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "grid", gap: 4 }}>
          <Heading level={1} size="lg">Factures</Heading>
          <Text tone="muted">{periodLabel} · {invoices.length} factures émises</Text>
        </div>
        <Button onClick={onCreateInvoice ?? (() => toast.success("Brouillon de facture créé"))}><Plus />Nouvelle facture</Button>
      </div>

      <StatGroup aria-label="Synthèse des factures">
        <Stat label="Encaissé" icon={<Wallet />} value={sumOf(payees)} format={money} delta={kpis.encaisse} deltaLabel={kpis.comparisonLabel} trend={monthly(payees)} />
        <Stat label="À encaisser" icon={<Clock />} value={sumOf(attente)} format={money} delta={kpis.aEncaisser} deltaLabel={kpis.comparisonLabel} positiveIsGood={false} trend={monthly(attente)} />
        <Stat label="En retard" icon={<CircleAlert />} value={sumOf(retard)} format={money} delta={kpis.retard} deltaLabel={kpis.comparisonLabel} positiveIsGood={false} trend={monthly(retard)} />
        <Stat
          label="Délai de paiement moyen"
          icon={<Receipt />}
          value={kpis.paymentDelay.value}
          format={days}
          delta={kpis.paymentDelay.delta}
          deltaFormat={days}
          deltaLabel={kpis.comparisonLabel}
          positiveIsGood={false}
          trend={kpis.paymentDelay.trend}
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
              columns={columns}
              data={rows}
              getRowId={(f) => f.id}
              getRowLabel={(f) => `${f.numero}, ${f.client}`}
              enableRowSelection
              enableExport
              exportFilename="factures"
              initialState={{ sorting: [{ id: "echeance", desc: true }] }}
              onRowClick={(row) => (onOpenInvoice ?? defaultOpen)(row.original)}
              bulkActions={({ selectedRows, clear }) => (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      (onRemind ?? defaultRemind)(selectedRows.map((r) => r.original));
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

/* ── Écran ────────────────────────────────────────────────────────── */

/**
 * Coquille d'une application de gestion : barre latérale réductible (⌘B), barre d'application avec
 * fil d'Ariane, indicateurs, onglets de vue et `DataTable` complète (recherche, facettes, sélection
 * et actions groupées, export). Point de départ d'un ERP, d'un back office ou d'un CRM.
 */
export function Application({
  appName,
  orgName,
  user,
  invoices,
  periodLabel,
  currency = "MAD",
  kpis,
  trendMonths = 9,
  onCreateInvoice,
  onOpenInvoice,
  onRemind,
}: ApplicationProps) {
  const [active, setActive] = React.useState("factures");
  const pages = React.useMemo(() => principal(invoices.filter((f) => f.statut === "en_retard").length), [invoices]);
  const page = [...pages, ...AIDE].find((p) => p.id === active);
  return (
    <SidebarProvider style={{ height: "100svh" }}>
      <AppSidebar appName={appName} orgName={orgName} user={user} pages={pages} active={active} onNavigate={setActive} />
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
          <Factures
            invoices={invoices}
            periodLabel={periodLabel}
            currency={currency}
            kpis={kpis}
            trendMonths={trendMonths}
            onCreateInvoice={onCreateInvoice}
            onOpenInvoice={onOpenInvoice}
            onRemind={onRemind}
          />
        ) : (
          <div style={{ padding: "4px 24px" }}>
            <Heading level={1} size="lg">{page?.label}</Heading>
            <Text tone="muted">Écran de démonstration : seule la page Factures est remplie.</Text>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
