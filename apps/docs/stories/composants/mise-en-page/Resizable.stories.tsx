import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  List,
  ListItem,
  ListItemIcon,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  Text,
  type ResizablePanelHandle,
} from "@acme/ui";
import {
  Clock,
  FileSpreadsheet,
  FileText,
  Folder,
  HardDrive,
  PanelLeft,
  Presentation,
  Star,
  Trash2,
  Users,
} from "lucide-react";

/** Cadre de démonstration : une carte de hauteur fixe, le groupe la remplit. */
const Frame = ({ children, height = 420 }: { children: React.ReactNode; height?: number }) => (
  <div
    style={{
      height,
      maxWidth: 880,
      overflow: "hidden",
      border: "1px solid var(--ui-line)",
      borderRadius: "var(--ui-r-lg)",
      background: "var(--ui-panel)",
    }}
  >
    {children}
  </div>
);

const Pane = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div style={{ display: "grid", gap: 12, alignContent: "start", height: "100%", boxSizing: "border-box", padding: 16, overflow: "auto" }}>
    <Text size={12} weight="medium" tone="subtle">{title}</Text>
    {children}
  </div>
);

const meta = {
  title: "Composants/Mise en page/Resizable",
  component: ResizablePanelGroup,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Panneaux redimensionnables : explorateur, liste et détail, éditeur et console. Tailles en pourcentage (`defaultSize`, `minSize`, `maxSize`), panneaux repliables (`collapsible`). Le séparateur est un filet de 1 px qui s'épaissit et prend la couleur primaire au survol, au glissement et au focus ; `withHandle` y ajoute une pilule de préhension.\n\nClavier : Tab atteint le séparateur, les flèches déplacent de 10 % (`keyboardResizeBy`), Début / Fin vont aux limites, F6 passe d'un séparateur à l'autre. `autoSaveId` mémorise la disposition (localStorage) d'une visite à l'autre.",
      },
    },
  },
  args: { orientation: "horizontal" },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    autoSaveId: { control: "text" },
    keyboardResizeBy: { control: { type: "number", min: 1, max: 50 } },
  },
  render: (args) => (
    <Frame height={320}>
      <ResizablePanelGroup {...args}>
        <ResizablePanel defaultSize={40} minSize={20}>
          <Pane title="Panneau A" />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={60} minSize={20}>
          <Pane title="Panneau B" />
        </ResizablePanel>
      </ResizablePanelGroup>
    </Frame>
  ),
} satisfies Meta<typeof ResizablePanelGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Deux panneaux ; changez l'orientation dans les contrôles. */
export const Playground: Story = {};

const DOSSIERS = [
  { icon: <HardDrive />, label: "Mon Drive", selected: true },
  { icon: <Users />, label: "Partagés avec moi" },
  { icon: <Clock />, label: "Récents" },
  { icon: <Star />, label: "Favoris" },
  { icon: <Trash2 />, label: "Corbeille" },
];

const FICHIERS = [
  { icon: <FileSpreadsheet />, tint: "var(--ui-c3)", nom: "Budget 2027.xlsx", info: "Modifié à 09:12 · Inès Benali" },
  { icon: <FileText />, tint: "var(--ui-c1)", nom: "Procès-verbal du 8 octobre.docx", info: "Modifié hier · Vous" },
  { icon: <Presentation />, tint: "var(--ui-c2)", nom: "Revue trimestrielle T3", info: "Modifié lundi · Karim Alaoui" },
  { icon: <Folder />, tint: "var(--ui-c4)", nom: "Contrats fournisseurs", info: "12 éléments" },
];

/**
 * Explorateur de fichiers à trois panneaux. La disposition est mémorisée avec
 * `autoSaveId="docs-explorateur"` : redimensionnez, rechargez la page, elle revient.
 * Chaque séparateur porte un nom propre (`aria-label`).
 */
export const Explorateur: Story = {
  name: "Explorateur (3 panneaux)",
  render: () => (
    <Frame>
      <ResizablePanelGroup orientation="horizontal" autoSaveId="docs-explorateur">
        <ResizablePanel defaultSize={26} minSize={18} maxSize={36}>
          <div style={{ height: "100%", boxSizing: "border-box", padding: 8, background: "var(--ui-panel-2)" }}>
            <List variant="plain">
              {DOSSIERS.map((d) => (
                <ListItem key={d.label} leading={d.icon} selected={d.selected} asChild>
                  <a href={`#${d.label}`}>{d.label}</a>
                </ListItem>
              ))}
            </List>
          </div>
        </ResizablePanel>
        <ResizableHandle aria-label="Largeur des dossiers" />
        <ResizablePanel defaultSize={44} minSize={30}>
          <Pane title="Mon Drive">
            <List>
              {FICHIERS.map((f, i) => (
                <ListItem
                  key={f.nom}
                  leading={<ListItemIcon tint={f.tint}>{f.icon}</ListItemIcon>}
                  description={f.info}
                  selected={i === 0}
                  asChild
                >
                  <button type="button">{f.nom}</button>
                </ListItem>
              ))}
            </List>
          </Pane>
        </ResizablePanel>
        <ResizableHandle withHandle aria-label="Largeur de l'aperçu" />
        <ResizablePanel defaultSize={30} minSize={20}>
          <Pane title="Aperçu">
            <div
              style={{
                display: "grid",
                placeItems: "center",
                aspectRatio: "4 / 3",
                borderRadius: "var(--ui-r-md)",
                background: "var(--ui-card-2)",
                color: "var(--ui-c3)",
              }}
            >
              <FileSpreadsheet size={40} aria-hidden />
            </div>
            <div style={{ display: "grid", gap: 2 }}>
              <Text weight="semibold">Budget 2027.xlsx</Text>
              <Text size={12.5} tone="subtle">Feuille de calcul · 284 Ko</Text>
            </div>
          </Pane>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Frame>
  ),
};

/** Orientation verticale : éditeur au-dessus, console en dessous. Flèches haut / bas au clavier. */
export const Vertical: Story = {
  render: () => (
    <Frame height={380}>
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel defaultSize={65} minSize={30}>
          <Pane title="requete.sql">
            <pre className="ui-mono" style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "var(--ui-fg-2)" }}>
              {"SELECT region, SUM(montant) AS total\nFROM factures\nWHERE exercice = 2027\nGROUP BY region\nORDER BY total DESC;"}
            </pre>
          </Pane>
        </ResizablePanel>
        <ResizableHandle withHandle aria-label="Hauteur de la console" />
        <ResizablePanel defaultSize={35} minSize={15}>
          <Pane title="Console">
            <Text size={13} tone="muted" className="ui-mono">5 lignes · 42 ms</Text>
          </Pane>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Frame>
  ),
};

/**
 * `withHandle` : la pilule signale qu'on peut saisir le séparateur. Grise au repos,
 * primaire au survol, au glissement et au focus.
 */
export const AvecPoignee: Story = {
  name: "Avec poignée",
  render: () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 880 }}>
      <Frame height={200}>
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize={50}><Pane title="Sans poignée" /></ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}><Pane title="Filet seul" /></ResizablePanel>
        </ResizablePanelGroup>
      </Frame>
      <Frame height={200}>
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize={50}><Pane title="Avec poignée" /></ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}><Pane title="Pilule de préhension" /></ResizablePanel>
        </ResizablePanelGroup>
      </Frame>
    </div>
  ),
};

function RepliableDemo() {
  const sidebar = React.useRef<ResizablePanelHandle>(null);
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <Frame height={320}>
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel
          ref={sidebar}
          defaultSize={26}
          minSize={18}
          collapsible
          collapsedSize={0}
          onCollapse={() => setCollapsed(true)}
          onExpand={() => setCollapsed(false)}
        >
          <div style={{ height: "100%", boxSizing: "border-box", padding: 8, background: "var(--ui-panel-2)" }}>
            <List variant="plain">
              {DOSSIERS.slice(0, 4).map((d) => (
                <ListItem key={d.label} leading={d.icon} selected={d.selected} asChild>
                  <a href={`#${d.label}`}>{d.label}</a>
                </ListItem>
              ))}
            </List>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle aria-label="Largeur du panneau latéral" />
        <ResizablePanel defaultSize={74} minSize={40}>
          <Pane title="Contenu">
            <Button
              variant="outline"
              size="sm"
              aria-pressed={!collapsed}
              onClick={() => (collapsed ? sidebar.current?.expand() : sidebar.current?.collapse())}
              style={{ justifySelf: "start" }}
            >
              <PanelLeft />
              {collapsed ? "Afficher le panneau" : "Masquer le panneau"}
            </Button>
            <Text size={13} tone="muted">
              Glissez le séparateur sous le minimum (18 %) : le panneau se replie. La `ref` d'un panneau
              donne `collapse()`, `expand()`, `resize()` et `getSize()`.
            </Text>
          </Pane>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Frame>
  );
}

/** Panneau repliable (`collapsible`), piloté au geste ou par sa `ref`. */
export const Repliable: Story = {
  render: () => <RepliableDemo />,
};
