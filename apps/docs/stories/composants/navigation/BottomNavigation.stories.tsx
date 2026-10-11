import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  AppBar,
  AppBarActions,
  AppBarTitle,
  Avatar,
  AvatarFallback,
  Badge,
  BottomNavigation,
  BottomNavigationItem,
  List,
  ListItem,
  ListItemIcon,
  ListSection,
  Text,
} from "@acme/ui";
import {
  BatteryFull,
  Bell,
  Clock,
  FileText,
  Folder,
  House,
  Image,
  Plus,
  Search,
  SignalHigh,
  User,
  Users,
  Wifi,
} from "lucide-react";

/* ── Cadre de téléphone (390 × 760), dessiné avec les jetons ─────────────── */

/**
 * `contain: paint` fait du cadre le bloc conteneur des éléments `position: fixed` :
 * la barre d'onglets se colle au bas de l'écran du téléphone, pas de la fenêtre.
 */
function Phone({ children, title = "Nuage" }: { children: React.ReactNode; title?: string }) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        width: 390,
        // Le téléphone tient dans le canevas : la barre d'onglets reste visible sans défiler.
        height: "clamp(560px, calc(100vh - 64px), 760px)",
        margin: "8px auto",
        overflow: "hidden",
        contain: "paint",
        borderRadius: "calc(var(--ui-r-2xl) * 1.6)",
        background: "var(--ui-app)",
        boxShadow: "0 0 0 10px var(--ui-card-hover), 0 0 0 11px var(--ui-line-2), var(--ui-sh4)",
        fontFamily: "var(--ui-font-sans)",
      }}
    >
      {/* Barre d'état */}
      <div
        aria-hidden="true"
        style={{ display: "flex", alignItems: "center", flexShrink: 0, height: 50, padding: "6px 30px 0 36px", color: "var(--ui-fg)" }}
      >
        <Text size={15} weight="semibold" numeric>9:41</Text>
        <span style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
          <SignalHigh style={{ width: 17, height: 17 }} />
          <Wifi style={{ width: 17, height: 17 }} />
          <BatteryFull style={{ width: 22, height: 17 }} />
        </span>
      </div>
      {/* Écran qui défile ; marge basse : hauteur de la barre d'onglets + zone de sécurité simulée. */}
      <div style={{ position: "relative", flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 100, backgroundColor: "var(--ui-app)" }}>
        <AppBar variant="material" titleAlign="center" density="compact">
          <AppBarTitle>{title}</AppBarTitle>
          <AppBarActions>
            <Avatar size="sm" style={{ marginInlineEnd: 12 }}><AvatarFallback>SB</AvatarFallback></Avatar>
          </AppBarActions>
        </AppBar>
        <FilesScreen />
      </div>
      {children}
      {/* Indicateur d'accueil, posé sur la zone de sécurité de la barre. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 8,
          left: "calc(50% - 67px)",
          zIndex: 40,
          width: 134,
          height: 5,
          borderRadius: "var(--ui-r-pill)",
          background: "var(--ui-fg)",
        }}
      />
    </div>
  );
}

function FilesScreen() {
  return (
    <div style={{ display: "grid", gap: 24, padding: "8px 16px 16px" }}>
      <ListSection title="Récents">
        <List>
          {[
            { name: "Budget 2027.xlsx", meta: "Modifié par vous · 9 oct.", tint: "var(--ui-c3)" },
            { name: "Contrat cadre.pdf", meta: "Partagé par Inès · hier", tint: "var(--ui-c2)" },
            { name: "Présentation Q4", meta: "Ouvert par vous · 2 oct.", tint: "var(--ui-c4)" },
            { name: "Notes de réunion", meta: "Modifié par Karim · 28 sept.", tint: "var(--ui-c1)" },
          ].map((file) => (
            <ListItem key={file.name} leading={<ListItemIcon tint={file.tint}><FileText /></ListItemIcon>} description={file.meta} chevron>
              {file.name}
            </ListItem>
          ))}
        </List>
      </ListSection>
      <ListSection title="Dossiers">
        <List>
          {["Clients", "Factures 2026", "Photos de l'équipe", "Projets", "Archives"].map((name, i) => (
            <ListItem key={name} leading={<ListItemIcon tint={`var(--ui-c${(i % 8) + 1})`}><Folder /></ListItemIcon>} trailing={`${(i + 2) * 3} éléments`} chevron>
              {name}
            </ListItem>
          ))}
        </List>
      </ListSection>
    </div>
  );
}

/* Zone de sécurité simulée : `env(safe-area-inset-bottom)` vaut 0 hors d'un vrai téléphone. */
const SAFE_AREA = { paddingBottom: 22 } as const;

const meta = {
  title: "Composants/Navigation/BottomNavigation",
  component: BottomNavigation,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "La barre d'onglets d'iOS, pour la navigation de premier niveau sur mobile : 3 à 5 destinations, icône et libellé, sur un matériau translucide qui respecte la zone de sécurité du bas. L'entrée active passe en primaire, avec la pastille de sélection de Material qui s'ouvre en ressort derrière l'icône. Badge compteur, point ou `Badge` de la librairie. `value` / `onValueChange` pour un état local, `isActive` et `asChild` pour les liens du routeur.",
      },
    },
  },
  args: { defaultValue: "accueil", position: "fixed", label: "Navigation principale" },
  argTypes: {
    position: { control: "inline-radio", options: ["fixed", "sticky", "static"] },
    value: { control: "text" },
    defaultValue: { control: "text" },
    label: { control: "text" },
  },
  render: (args) => (
    <Phone>
      <BottomNavigation {...args} style={{ ...SAFE_AREA, ...args.style }}>
        <BottomNavigationItem value="accueil" icon={<House />} label="Accueil" />
        <BottomNavigationItem value="fichiers" icon={<Folder />} label="Fichiers" />
        <BottomNavigationItem value="partages" icon={<Users />} label="Partagés" />
        <BottomNavigationItem value="recherche" icon={<Search />} label="Recherche" />
      </BottomNavigation>
    </Phone>
  ),
} satisfies Meta<typeof BottomNavigation>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toucher une entrée l'active : la pastille de sélection s'ouvre en ressort. Le contenu défile sous le matériau. */
export const Playground: Story = {};

/**
 * Compteur (rouge d'iOS, « 99+ » au-delà), point de nouveauté, ou `Badge` de la
 * librairie. Les lecteurs d'écran entendent « Activité, 3 nouveaux » (texte surchargeable par `badgeLabel`).
 */
export const AvecBadges: Story = {
  name: "Avec badges",
  render: () => (
    <Phone>
      <BottomNavigation defaultValue="accueil" style={SAFE_AREA}>
        <BottomNavigationItem value="accueil" icon={<House />} label="Accueil" />
        <BottomNavigationItem value="fichiers" icon={<Folder />} label="Fichiers" badge />
        <BottomNavigationItem value="photos" icon={<Image />} label="Photos" badge={<Badge variant="pri" style={{ height: 18, padding: "0 6px", fontSize: 10.5 }}>Nouv.</Badge>} badgeLabel="nouvelle fonction" />
        <BottomNavigationItem value="activite" icon={<Bell />} label="Activité" badge={3} />
        <BottomNavigationItem value="partages" icon={<Users />} label="Partagés" badge={128} badgeLabel="128 invitations" />
      </BottomNavigation>
    </Phone>
  ),
};

function RouterDemo() {
  // Simule un routeur : l'URL courante décide de l'entrée active.
  const [path, setPath] = React.useState("/recents");
  const links = [
    { href: "/", label: "Accueil", icon: <House /> },
    { href: "/recents", label: "Récents", icon: <Clock /> },
    { href: "/nouveau", label: "Nouveau", icon: <Plus /> },
    { href: "/profil", label: "Profil", icon: <User /> },
  ];
  return (
    <Phone title="Récents">
      <BottomNavigation style={SAFE_AREA}>
        {links.map((link) => (
          <BottomNavigationItem key={link.href} asChild icon={link.icon} isActive={path === link.href}>
            <a
              href={`#${link.href}`}
              onClick={(event) => {
                event.preventDefault();
                setPath(link.href);
              }}
            >
              {link.label}
            </a>
          </BottomNavigationItem>
        ))}
      </BottomNavigation>
    </Phone>
  );
}

/**
 * `asChild` : chaque entrée est un lien (le `Link` de Next.js ou de React Router),
 * `isActive` vient du routeur, `aria-current="page"` est posé sur le lien actif.
 */
export const LiensDeRouteur: Story = {
  name: "Liens de routeur (asChild)",
  render: () => <RouterDemo />,
};

/** Trois destinations : la barre reste centrée et ses entrées ne s'étirent pas au-delà de 640 px. */
export const TroisEntrees: Story = {
  name: "Trois entrées",
  render: () => (
    <Phone>
      <BottomNavigation defaultValue="fichiers" style={SAFE_AREA}>
        <BottomNavigationItem value="accueil" icon={<House />} label="Accueil" />
        <BottomNavigationItem value="fichiers" icon={<Folder />} label="Fichiers" />
        <BottomNavigationItem value="partages" icon={<Users />} label="Partagés" />
      </BottomNavigation>
    </Phone>
  ),
};

/** `position="static"` : dans le flux, pour une maquette ou un aperçu (ici hors du téléphone). */
export const Statique: Story = {
  render: () => (
    <div style={{ maxWidth: 420, borderRadius: "var(--ui-r-lg)", overflow: "hidden", boxShadow: "0 0 0 1px var(--ui-line)" }}>
      <BottomNavigation position="static" defaultValue="accueil">
        <BottomNavigationItem value="accueil" icon={<House />} label="Accueil" />
        <BottomNavigationItem value="fichiers" icon={<Folder />} label="Fichiers" />
        <BottomNavigationItem value="activite" icon={<Bell />} label="Activité" badge={2} />
        <BottomNavigationItem value="profil" icon={<User />} label="Profil" disabled />
      </BottomNavigation>
    </div>
  ),
};
