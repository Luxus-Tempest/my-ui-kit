import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  AppBar,
  AppBarActions,
  AppBarLeading,
  AppBarTitle,
  Avatar,
  AvatarFallback,
  Button,
  Heading,
  List,
  ListItem,
  ListItemIcon,
  ListSection,
  SearchBar,
  Switch,
  Text,
  Tooltip,
} from "@rovia/ui";
import {
  Bell,
  ChevronLeft,
  CircleHelp,
  Cloud,
  Ellipsis,
  FileText,
  Info,
  Menu as MenuIcon,
  Search,
  Settings,
  SlidersHorizontal,
  Wifi,
} from "lucide-react";

/* Cadre de démonstration : une zone qui défile, positionnée (la sentinelle défile avec elle). */
function Frame({
  children,
  height = 420,
  width = 720,
  surface = "var(--ui-panel)",
  scrollRef,
}: {
  children: React.ReactNode;
  height?: number;
  width?: number;
  surface?: string;
  scrollRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={scrollRef}
      style={{
        position: "relative",
        width,
        maxWidth: "100%",
        height,
        overflowY: "auto",
        borderRadius: "var(--ui-r-xl)",
        background: surface,
        boxShadow: "0 0 0 1px var(--ui-line)",
      }}
    >
      {children}
    </div>
  );
}

function Lines({ count = 14 }: { count?: number }) {
  return (
    <div style={{ display: "grid", gap: 12, padding: "8px 24px 24px" }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <FileText style={{ width: 20, height: 20, flexShrink: 0, color: `var(--ui-c${(i % 8) + 1})` }} />
          <div style={{ display: "grid", gap: 2 }}>
            <Text size={14}>Document {i + 1}</Text>
            <Text size={12} tone="subtle">Modifié par vous · {i + 2} oct.</Text>
          </div>
        </div>
      ))}
    </div>
  );
}

const meta = {
  title: "Composants/Navigation/AppBar",
  component: AppBar,
  tags: ["autodocs"],
  parameters: {
    registry: "app-bar",
    docs: {
      description: {
        component:
          "Barre supérieure d'application, collante : `AppBarLeading` (menu, retour), `AppBarTitle`, contenu libre (recherche) et `AppBarActions`. `plain` prend la surface de son conteneur, comme la barre de Drive ; `material` est le matériau translucide flouté d'iOS. Un filet capillaire n'apparaît qu'une fois du contenu défilé dessous (IntersectionObserver sur une sentinelle, ou `scrollTarget`). 64 px, 56 en `compact` ; titre de 22 px façon Drive ou centré façon iOS.",
      },
    },
  },
  args: { variant: "plain", density: "default", titleAlign: "start", position: "sticky", elevateOnScroll: true },
  argTypes: {
    variant: { control: "inline-radio", options: ["plain", "material"] },
    density: { control: "inline-radio", options: ["default", "compact"] },
    titleAlign: { control: "inline-radio", options: ["start", "center"] },
    position: { control: "inline-radio", options: ["sticky", "static"] },
    elevateOnScroll: { control: "boolean" },
    scrollTarget: { table: { disable: true } },
  },
  render: (args) => (
    <Frame>
      <AppBar {...args}>
        <AppBarLeading>
          <Button size="icon" variant="ghost" aria-label="Menu principal"><MenuIcon /></Button>
        </AppBarLeading>
        <AppBarTitle>Mon Drive</AppBarTitle>
        <AppBarActions>
          <Tooltip content="Rechercher">
            <Button size="icon" variant="ghost" aria-label="Rechercher"><Search /></Button>
          </Tooltip>
          <Tooltip content="Plus d'actions">
            <Button size="icon" variant="ghost" aria-label="Plus d'actions"><Ellipsis /></Button>
          </Tooltip>
        </AppBarActions>
      </AppBar>
      <Lines />
    </Frame>
  ),
} satisfies Meta<typeof AppBar>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles ; faire défiler le cadre pour voir le filet. */
export const Playground: Story = {};

/**
 * `plain` : la barre de Drive, posée sur le fond d'application. Nom de l'application
 * en titre (`asChild` sur un lien), recherche en pilule au centre, actions et avatar.
 */
export const Plain: Story = {
  render: () => (
    <Frame width={960} surface="var(--ui-app)">
      <AppBar>
        <AppBarLeading>
          <Button size="icon" variant="ghost" aria-label="Menu principal"><MenuIcon /></Button>
        </AppBarLeading>
        <AppBarTitle asChild>
          <a href="#accueil" style={{ display: "flex", alignItems: "center", gap: 10, width: 200 }}>
            <Cloud style={{ width: 28, height: 28, flexShrink: 0, color: "var(--ui-pri)" }} />
            Nuage
          </a>
        </AppBarTitle>
        <div style={{ flex: 1, maxWidth: 720 }}>
          <SearchBar
            size="lg"
            aria-label="Rechercher dans Nuage"
            placeholder="Rechercher dans Nuage"
            trailing={<Button size="icon" variant="ghost" aria-label="Filtres de recherche"><SlidersHorizontal /></Button>}
          />
        </div>
        <AppBarActions>
          <Tooltip content="Aide">
            <Button size="icon" variant="ghost" aria-label="Aide"><CircleHelp /></Button>
          </Tooltip>
          <Tooltip content="Paramètres">
            <Button size="icon" variant="ghost" aria-label="Paramètres"><Settings /></Button>
          </Tooltip>
          <Avatar style={{ marginInline: 8 }}><AvatarFallback>SB</AvatarFallback></Avatar>
        </AppBarActions>
      </AppBar>
      <div style={{ margin: "0 16px 16px", padding: 24, minHeight: 600, borderRadius: "var(--ui-r-2xl)", background: "var(--ui-panel)" }}>
        <Heading level={2} size="md" style={{ fontWeight: 400 }}>Bienvenue dans Nuage</Heading>
        <Lines count={10} />
      </div>
    </Frame>
  ),
};

const TINTS = ["var(--ui-c1)", "var(--ui-c2)", "var(--ui-c3)", "var(--ui-c4)", "var(--ui-c5)", "var(--ui-c6)", "var(--ui-c7)", "var(--ui-c8)"];

/**
 * `material` : le contenu coloré défile sous le matériau translucide et flouté ;
 * le filet capillaire apparaît dès le premier pixel défilé.
 */
export const MaterialAvecDefilement: Story = {
  name: "Material, contenu défilant",
  render: () => (
    <Frame height={460}>
      <AppBar variant="material">
        <AppBarTitle>Photos</AppBarTitle>
        <AppBarActions>
          <Button variant="tonal" size="sm">Sélectionner</Button>
          <Button size="icon" variant="ghost" aria-label="Plus d'actions"><Ellipsis /></Button>
        </AppBarActions>
      </AppBar>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 4, padding: "4px 4px 24px" }}>
        {Array.from({ length: 36 }, (_, i) => (
          <div
            key={i}
            role="img"
            aria-label={`Photo ${i + 1}`}
            style={{
              aspectRatio: "1",
              borderRadius: "var(--ui-r-xs)",
              background: `linear-gradient(${(i * 47) % 360}deg, ${TINTS[i % 8]}, color-mix(in srgb, ${TINTS[(i + 3) % 8]} 70%, var(--ui-panel)))`,
            }}
          />
        ))}
      </div>
    </Frame>
  ),
};

function IosSettings() {
  const [wifi, setWifi] = React.useState(true);
  const [notifications, setNotifications] = React.useState(true);
  return (
    <Frame width={390} height={560} surface="var(--ui-app)">
      <AppBar variant="material" titleAlign="center">
        <AppBarLeading>
          <Button variant="ghost" size="sm" style={{ color: "var(--ui-pri)", paddingInline: 6 }}>
            <ChevronLeft />Réglages
          </Button>
        </AppBarLeading>
        <AppBarTitle>Général</AppBarTitle>
        <AppBarActions>
          <Button variant="link" size="sm">Modifier</Button>
        </AppBarActions>
      </AppBar>
      <div style={{ display: "grid", gap: 28, padding: "12px 16px 32px" }}>
        {["Connexions", "Préférences", "Appareil"].map((section) => (
          <ListSection key={section} title={section}>
            <List>
              <ListItem
                leading={<ListItemIcon tint="var(--ui-c1)"><Wifi /></ListItemIcon>}
                trailing={<Switch checked={wifi} onCheckedChange={setWifi} aria-label={`Wi-Fi (${section})`} />}
              >
                Wi-Fi
              </ListItem>
              <ListItem
                leading={<ListItemIcon tint="var(--ui-c8)"><Bell /></ListItemIcon>}
                trailing={<Switch checked={notifications} onCheckedChange={setNotifications} aria-label={`Notifications (${section})`} />}
              >
                Notifications
              </ListItem>
              <ListItem leading={<ListItemIcon tint="var(--ui-c7)"><Info /></ListItemIcon>} trailing="Nuage 4.2" chevron asChild>
                <button type="button">Informations</button>
              </ListItem>
            </List>
          </ListSection>
        ))}
      </div>
    </Frame>
  );
}

/**
 * `titleAlign="center"` : la barre de navigation d'iOS. Titre de 17 px semi-gras
 * toujours au centre, retour à gauche, action à droite, sur matériau translucide.
 */
export const TitreCentreIos: Story = {
  name: "Titre centré iOS",
  render: () => <IosSettings />,
};

/** `density="compact"` : 56 px, titre de 18 px, pour les vues denses ou les panneaux secondaires. */
export const Compacte: Story = {
  render: () => (
    <Frame height={360}>
      <AppBar density="compact">
        <AppBarLeading>
          <Button size="icon-sm" variant="ghost" aria-label="Retour"><ChevronLeft /></Button>
        </AppBarLeading>
        <AppBarTitle>Factures 2026</AppBarTitle>
        <AppBarActions>
          <Button size="icon-sm" variant="ghost" aria-label="Rechercher"><Search /></Button>
          <Button size="icon-sm" variant="ghost" aria-label="Plus d'actions"><Ellipsis /></Button>
        </AppBarActions>
      </AppBar>
      <Lines />
    </Frame>
  ),
};

function ScrollTargetDemo() {
  const [scroller, setScroller] = React.useState<HTMLDivElement | null>(null);
  return (
    <div style={{ display: "grid", gridTemplateRows: "auto 1fr", width: 720, maxWidth: "100%", height: 400, borderRadius: "var(--ui-r-xl)", overflow: "hidden", background: "var(--ui-panel)", boxShadow: "0 0 0 1px var(--ui-line)" }}>
      <AppBar variant="material" scrollTarget={scroller}>
        <AppBarTitle>Activité</AppBarTitle>
      </AppBar>
      <div ref={setScroller} tabIndex={0} role="region" aria-label="Contenu défilant" style={{ overflowY: "auto" }}>
        <Lines count={18} />
      </div>
    </div>
  );
}

/**
 * La barre vit hors de la zone qui défile (une grille : barre au-dessus, liste en
 * dessous) : `scrollTarget` reçoit le conteneur (élément ou ref) et son `scrollTop` décide du filet.
 */
export const ConteneurDefilant: Story = {
  name: "Conteneur défilant (scrollTarget)",
  render: () => <ScrollTargetDemo />,
};
