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
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardMedia,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Heading,
  Kbd,
  List,
  ListItem,
  ListItemIcon,
  Menu,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuSeparator,
  MenuTrigger,
  Progress,
  SearchBar,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  Text,
  Tooltip,
  useSidebar,
} from "@rovia/ui";
import type { SidebarProps, SidebarProviderProps } from "@rovia/ui";
import {
  Check,
  ChevronRight,
  ChevronsUpDown,
  CircleHelp,
  Clock,
  Cloud,
  Ellipsis,
  FileText,
  FolderKanban,
  HardDrive,
  House,
  LogOut,
  PanelRight,
  Pencil,
  Plus,
  Search,
  Settings,
  Share2,
  Star,
  Trash,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

/* ── Données de démonstration ─────────────────────────────────────────── */

type Workspace = { id: string; name: string; plan: string; tint: string };
const WORKSPACES: Workspace[] = [
  { id: "nuage", name: "Nuage", plan: "Espace personnel", tint: "var(--ui-pri)" },
  { id: "acme", name: "Acme", plan: "Entreprise · 48 membres", tint: "var(--ui-c3)" },
  { id: "studio", name: "Studio Nord", plan: "Équipe · 6 membres", tint: "var(--ui-c7)" },
];

type Page = { id: string; label: string; icon: LucideIcon; badge?: number; children?: string[] };
const PAGES: Page[] = [
  { id: "accueil", label: "Accueil", icon: House },
  { id: "drive", label: "Mon Drive", icon: HardDrive, children: ["Clients", "Factures 2026", "Photos de l'équipe"] },
  { id: "partages", label: "Partagés avec moi", icon: Users, badge: 4 },
  { id: "recents", label: "Récents", icon: Clock },
  { id: "favoris", label: "Favoris", icon: Star },
  { id: "corbeille", label: "Corbeille", icon: Trash },
];

const PROJECTS = [
  { id: "refonte", label: "Refonte du site", tint: "var(--ui-c1)", badge: 12 },
  { id: "lancement", label: "Lancement T4", tint: "var(--ui-c2)" },
  { id: "recrutement", label: "Recrutement", tint: "var(--ui-c5)" },
];

const FILES = [
  { name: "Budget 2027.xlsx", meta: "Modifié par vous · 9 oct.", tint: "var(--ui-c3)" },
  { name: "Contrat cadre.pdf", meta: "Partagé par Inès · hier", tint: "var(--ui-c2)" },
  { name: "Présentation Q4", meta: "Ouvert par vous · 2 oct.", tint: "var(--ui-c4)" },
  { name: "Notes de réunion", meta: "Modifié par Karim · 28 sept.", tint: "var(--ui-c1)" },
];

/* ── Morceaux de la barre ─────────────────────────────────────────────── */

/** Sélecteur d'espace de travail : entrée `lg` sur deux lignes qui ouvre un menu. */
function WorkspaceSwitcher() {
  const { state, isMobile } = useSidebar();
  const [current, setCurrent] = React.useState(WORKSPACES[0]);
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Menu>
          <MenuTrigger asChild>
            <SidebarMenuButton size="lg" tooltip={current.name}>
              <ListItemIcon tint={current.tint} style={{ width: 32, height: 32, borderRadius: "var(--ui-r-sm)" }}>
                <Cloud />
              </ListItemIcon>
              <span>
                <span>{current.name}</span>
                <span>{current.plan}</span>
              </span>
              <ChevronsUpDown />
            </SidebarMenuButton>
          </MenuTrigger>
          <MenuContent side={state === "collapsed" && !isMobile ? "right" : "bottom"} style={{ minWidth: 248 }}>
            <MenuLabel>Espaces de travail</MenuLabel>
            {WORKSPACES.map((w) => (
              <MenuItem key={w.id} onSelect={() => setCurrent(w)}>
                <ListItemIcon tint={w.tint} style={{ width: 22, height: 22, borderRadius: "var(--ui-r-xs)" }}>
                  <Cloud style={{ width: 13, height: 13, color: "inherit" }} />
                </ListItemIcon>
                {w.name}
                {w.id === current.id && <Check style={{ marginLeft: "auto" }} />}
              </MenuItem>
            ))}
            <MenuSeparator />
            <MenuItem><Plus />Créer un espace</MenuItem>
          </MenuContent>
        </Menu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

/** Recherche : la barre en pilule, ou une entrée loupe quand la barre est réduite. */
function SidebarSearch() {
  const { state, isMobile, setOpen } = useSidebar();
  if (state === "collapsed" && !isMobile) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Rechercher" onClick={() => setOpen(true)}>
            <Search />
            <span>Rechercher</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }
  return (
    <SearchBar
      aria-label="Rechercher dans Nuage"
      placeholder="Rechercher"
      trailing={<Kbd style={{ marginRight: 8 }}>⌘K</Kbd>}
    />
  );
}

/** Espace de stockage (masqué en mode icône) et compte. */
function UserFooter() {
  const { state, isMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  return (
    <SidebarFooter>
      {!collapsed && (
        <div style={{ display: "grid", gap: 8, padding: "4px 12px 8px" }}>
          <Progress value={21} size="sm" aria-label="Espace utilisé" />
          <Text size={12} tone="muted">3,2 Go utilisés sur 15 Go</Text>
        </div>
      )}
      <SidebarMenu>
        <SidebarMenuItem>
          <Menu>
            <MenuTrigger asChild>
              <SidebarMenuButton size="lg" tooltip="Sarah Benali">
                <Avatar><AvatarFallback>SB</AvatarFallback></Avatar>
                <span>
                  <span>Sarah Benali</span>
                  <span>sarah@nuage.fr</span>
                </span>
                <ChevronsUpDown />
              </SidebarMenuButton>
            </MenuTrigger>
            <MenuContent side={collapsed ? "right" : "top"} align="start" style={{ minWidth: 232 }}>
              <MenuItem><User />Profil</MenuItem>
              <MenuItem><Settings />Paramètres</MenuItem>
              <MenuItem><CircleHelp />Aide</MenuItem>
              <MenuSeparator />
              <MenuItem><LogOut />Se déconnecter</MenuItem>
            </MenuContent>
          </Menu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
}

function NavigationGroup({ active, onNavigate }: { active: string; onNavigate: (id: string) => void }) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {PAGES.map((page) =>
          page.children ? (
            <Collapsible key={page.id} asChild defaultOpen>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={page.label} isActive={active === page.id}>
                    <page.icon />
                    <span>{page.label}</span>
                    <ChevronRight />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {page.children.map((child) => {
                      const id = `${page.id}/${child}`;
                      return (
                        <SidebarMenuSubItem key={child}>
                          <SidebarMenuSubButton
                            href={`#${encodeURIComponent(child)}`}
                            isActive={active === id}
                            onClick={(event) => {
                              event.preventDefault();
                              onNavigate(id);
                            }}
                          >
                            <span>{child}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={page.id}>
              <SidebarMenuButton tooltip={page.label} isActive={active === page.id} onClick={() => onNavigate(page.id)}>
                <page.icon />
                <span>{page.label}</span>
              </SidebarMenuButton>
              {page.badge != null && <SidebarMenuBadge>{page.badge}</SidebarMenuBadge>}
            </SidebarMenuItem>
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function ProjectsGroup({ active, onNavigate }: { active: string; onNavigate: (id: string) => void }) {
  return (
    <Collapsible defaultOpen asChild>
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger>
            Projets
            <ChevronRight />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <SidebarGroupAction aria-label="Nouveau projet">
          <Plus />
        </SidebarGroupAction>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {PROJECTS.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    tooltip={project.label}
                    isActive={active === project.id}
                    onClick={() => onNavigate(project.id)}
                  >
                    <FolderKanban style={{ color: project.tint }} />
                    <span>{project.label}</span>
                  </SidebarMenuButton>
                  {project.badge != null && <SidebarMenuBadge>{project.badge}</SidebarMenuBadge>}
                  <Menu>
                    <MenuTrigger asChild>
                      <SidebarMenuAction showOnHover aria-label={`Actions pour ${project.label}`}>
                        <Ellipsis />
                      </SidebarMenuAction>
                    </MenuTrigger>
                    <MenuContent side="right" align="start">
                      <MenuItem><Share2 />Partager</MenuItem>
                      <MenuItem><Pencil />Renommer</MenuItem>
                      <MenuSeparator />
                      <MenuItem variant="danger"><Trash />Supprimer</MenuItem>
                    </MenuContent>
                  </Menu>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

/* ── Contenu principal ────────────────────────────────────────────────── */

function titleOf(id: string) {
  const [pageId, child] = id.split("/");
  if (child) return child;
  return PAGES.find((p) => p.id === pageId)?.label ?? PROJECTS.find((p) => p.id === pageId)?.label ?? "Accueil";
}

function MainContent({ title, trigger = "leading", material = false }: { title: string; trigger?: "leading" | "trailing"; material?: boolean }) {
  const triggerButton =
    trigger === "trailing" ? (
      <SidebarTrigger showLabel="Afficher les détails" hideLabel="Masquer les détails">
        <PanelRight />
      </SidebarTrigger>
    ) : (
      <Tooltip content="Afficher / masquer" shortcut="⌘B">
        <SidebarTrigger />
      </Tooltip>
    );
  return (
    <>
      <AppBar variant={material ? "material" : "plain"}>
        {trigger === "leading" && <AppBarLeading>{triggerButton}</AppBarLeading>}
        <AppBarTitle>{title}</AppBarTitle>
        <AppBarActions>
          <Tooltip content="Aide">
            <Button size="icon" variant="ghost" aria-label="Aide"><CircleHelp /></Button>
          </Tooltip>
          <Tooltip content="Paramètres">
            <Button size="icon" variant="ghost" aria-label="Paramètres"><Settings /></Button>
          </Tooltip>
          {trigger === "trailing" && triggerButton}
        </AppBarActions>
      </AppBar>
      <div style={{ display: "grid", alignContent: "start", gap: 28, padding: "8px 24px 32px" }}>
        <section style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Heading level={2} size="xs">Suggestions</Heading>
            <Badge variant="pri">4 nouveautés</Badge>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14 }}>
            {FILES.map((file) => (
              <Card key={file.name} size="sm" variant={material ? "elevated" : "filled"}>
                <CardHeader>
                  <CardTitle style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 500 }}>
                    <FileText style={{ width: 18, height: 18, flexShrink: 0, color: file.tint }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardMedia
                  aspectRatio="16 / 9"
                  style={{ background: `linear-gradient(160deg, color-mix(in srgb, ${file.tint} 18%, var(--ui-panel)), var(--ui-panel))` }}
                />
                <CardDescription>{file.meta}</CardDescription>
              </Card>
            ))}
          </div>
        </section>
        <section style={{ display: "grid", gap: 12 }}>
          <Heading level={2} size="xs">Fichiers récents</Heading>
          <List variant="plain">
            {[...FILES, ...FILES, ...FILES].map((file, i) => (
              <ListItem
                key={i}
                leading={<FileText style={{ color: file.tint }} />}
                description={file.meta}
                trailing={<Text size={12} tone="subtle">{["284 Ko", "1,2 Mo", "8,4 Mo", "36 Ko"][i % 4]}</Text>}
              >
                {file.name}
              </ListItem>
            ))}
          </List>
        </section>
      </div>
    </>
  );
}

/* ── Coquille complète ────────────────────────────────────────────────── */

interface ShellProps {
  sidebar?: Partial<SidebarProps>;
  provider?: Omit<SidebarProviderProps, "children">;
}

function AppShell({ sidebar, provider }: ShellProps) {
  const [active, setActive] = React.useState("accueil");
  const side = sidebar?.side ?? "left";
  const variant = sidebar?.variant ?? "inset";
  return (
    <SidebarProvider {...provider} style={{ height: "100svh", ...provider?.style }}>
      <Sidebar collapsible="icon" label="Navigation de Nuage" {...sidebar}>
        <SidebarHeader>
          <WorkspaceSwitcher />
          <SidebarSearch />
        </SidebarHeader>
        <SidebarContent>
          <NavigationGroup active={active} onNavigate={setActive} />
          <SidebarSeparator />
          <ProjectsGroup active={active} onNavigate={setActive} />
        </SidebarContent>
        <UserFooter />
        <SidebarRail />
      </Sidebar>
      <SidebarInset style={{ overflowY: "auto" }}>
        <MainContent
          title={titleOf(active)}
          trigger={side === "right" ? "trailing" : "leading"}
          material={variant === "floating"}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}

const meta = {
  title: "Composants/Navigation/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    registry: "sidebar",
    padding: 0,
    docs: {
      // Chaque aperçu dans son propre cadre : la coquille occupe tout l'écran.
      story: { inline: false, height: "720px" },
      description: {
        component:
          "La coquille d'application : une barre de navigation à gauche (ou à droite) et la zone principale. `SidebarProvider` porte l'état (contrôlé ou non, ⌘B / Ctrl+B) et `useSidebar` l'expose ; sous 768 px la barre devient une feuille modale. Variante `inset` (défaut) : la barre est posée sur le fond d'application et le contenu (`SidebarInset`) dans un panneau au grand rayon, comme Drive. Entrée active en pilule de sélection, réduction en colonne d'icônes avec infobulles, sous-menus, compteurs et actions au survol. `asChild` sur les entrées pour les liens du routeur.",
      },
    },
  },
  args: { variant: "inset", side: "left", collapsible: "icon" },
  argTypes: {
    variant: { control: "inline-radio", options: ["inset", "floating", "sidebar"] },
    side: { control: "inline-radio", options: ["left", "right"] },
    collapsible: { control: "inline-radio", options: ["icon", "offcanvas", "none"] },
    label: { control: "text" },
  },
  render: (args) => <AppShell sidebar={args} />,
} satisfies Meta<typeof Sidebar>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Variante, côté et mode de réduction pilotables depuis le panneau Contrôles. ⌘B / Ctrl+B bascule la barre. */
export const Playground: Story = {};

/**
 * L'application « Nuage » : sélecteur d'espace de travail, recherche, navigation avec
 * sous-menu repliable et compteurs, groupe de projets (action de groupe, actions au
 * survol), stockage et compte dans le pied. Le contenu défile sous la barre supérieure,
 * dont le filet apparaît au défilement.
 */
export const Complete: Story = {
  name: "Complète",
  render: () => <AppShell />,
};

/**
 * `collapsible="icon"` et `defaultOpen={false}` : une colonne de pastilles de 36 px.
 * Libellés en infobulles, compteurs en pastilles sur l'icône, sous-menus masqués.
 */
export const ReduiteEnIcones: Story = {
  name: "Réduite en icônes",
  render: () => <AppShell provider={{ defaultOpen: false }} />,
};

/** `variant="floating"` : une carte détachée des bords ; le contenu est posé sur le fond d'application. */
export const Flottante: Story = {
  render: () => <AppShell sidebar={{ variant: "floating", collapsible: "offcanvas" }} />,
};

/**
 * `side="right"` : un panneau de détails, ici en variante `sidebar` (colonne pleine
 * hauteur et filet). Placée après `SidebarInset` dans le DOM pour un ordre de tabulation naturel.
 */
export const ADroite: Story = {
  name: "À droite",
  render: () => <RightPanelDemo />,
};

function RightPanelDemo() {
  return (
    <SidebarProvider style={{ height: "100svh" }}>
      <SidebarInset style={{ overflowY: "auto" }}>
        <MainContent title="Budget 2027.xlsx" trigger="trailing" />
      </SidebarInset>
      <Sidebar side="right" variant="sidebar" collapsible="offcanvas" label="Détails">
        <SidebarHeader>
          <Text size={16} weight="semibold" style={{ padding: "6px 12px 0" }}>Détails</Text>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Accès</SidebarGroupLabel>
            <SidebarMenu>
              {[
                { name: "Vous", role: "Propriétaire", initials: "SB" },
                { name: "Inès Benali", role: "Éditrice", initials: "IB" },
                { name: "Karim Haddad", role: "Lecteur", initials: "KH" },
              ].map((person) => (
                <SidebarMenuItem key={person.name}>
                  <SidebarMenuButton size="lg">
                    <Avatar><AvatarFallback>{person.initials}</AvatarFallback></Avatar>
                    <span>
                      <span>{person.name}</span>
                      <span>{person.role}</span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>Informations</SidebarGroupLabel>
            <SidebarGroupContent>
              <List variant="plain">
                <ListItem trailing="Mon Drive">Emplacement</ListItem>
                <ListItem trailing="284 Ko">Taille</ListItem>
                <ListItem trailing="9 oct.">Modifié</ListItem>
              </List>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Button variant="tonal" fullWidth><Share2 />Partager</Button>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}

/**
 * Sous 768 px, la barre devient une feuille modale à gauche (piège à focus, Échap,
 * voile) : le bouton de la barre supérieure l'ouvre, suivre un lien la referme.
 */
export const SurMobile: Story = {
  name: "Sur mobile",
  parameters: { viewport: { defaultViewport: "mobile2" } },
  render: () => <AppShell />,
};
