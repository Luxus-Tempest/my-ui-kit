import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Badge, TreeItem, TreeView, type TreeViewItem } from "@rovia/ui";
import {
  FileSpreadsheet,
  FileText,
  Folder,
  FolderOpen,
  HardDrive,
  Image,
  Lock,
  Presentation,
  Trash2,
  Users,
} from "lucide-react";
import { Card, Row } from "../../_shared/demo";

const folder = { icon: <Folder />, iconExpanded: <FolderOpen /> };

/** L'arborescence de démonstration : un Drive d'entreprise. */
const DRIVE: TreeViewItem[] = [
  {
    id: "drive",
    label: "Mon Drive",
    icon: <HardDrive />,
    children: [
      {
        id: "finance",
        label: "Finance",
        ...folder,
        children: [
          { id: "budget", label: "Budget 2027", icon: <FileSpreadsheet /> },
          {
            id: "factures",
            label: "Factures 2026",
            ...folder,
            trailing: "12",
            children: [
              { id: "f-janv", label: "Janvier.pdf", icon: <FileText /> },
              { id: "f-fevr", label: "Février.pdf", icon: <FileText /> },
              { id: "f-mars", label: "Mars.pdf", icon: <FileText /> },
            ],
          },
          { id: "rapport", label: "Rapport annuel.pdf", icon: <FileText /> },
        ],
      },
      {
        id: "rh",
        label: "Ressources humaines",
        ...folder,
        trailing: <Lock />,
        children: [
          { id: "annuaire", label: "Annuaire.xlsx", icon: <FileSpreadsheet /> },
          { id: "onboarding", label: "Accueil des nouveaux.pptx", icon: <Presentation /> },
        ],
      },
      {
        id: "marketing",
        label: "Marketing",
        ...folder,
        children: [
          {
            id: "automne",
            label: "Campagne automne",
            ...folder,
            children: [
              { id: "visuel", label: "Visuel principal.png", icon: <Image /> },
              { id: "brief", label: "Brief créatif.docx", icon: <FileText /> },
            ],
          },
          { id: "logo", label: "Logo.svg", icon: <Image /> },
        ],
      },
      { id: "archives", label: "Archives 2019", ...folder, disabled: true, children: [{ id: "a-1", label: "Bilan 2019.pdf" }] },
    ],
  },
  { id: "partages", label: "Partagés avec moi", icon: <Users /> },
  { id: "corbeille", label: "Corbeille", icon: <Trash2 /> },
];

const meta = {
  title: "Composants/Données/TreeView",
  component: TreeView,
  subcomponents: { TreeItem },
  tags: ["autodocs"],
  parameters: {
    registry: "tree-view",
    docs: {
      description: {
        component:
          "Arborescence de dossiers, comme le volet de Drive : lignes en pilule, sélection en conteneur bleu, chevron qui pivote en ressort, guides d'indentation, chargement paresseux. Deux écritures pour un même moteur : à données (`items`) ou composable (`TreeItem`). Clavier WAI-ARIA complet : ↑ ↓, → ouvre puis descend, ← ferme puis remonte, Origine / Fin, `*` ouvre les frères, lettres pour atteindre un libellé, Entrée active, Espace sélectionne ; un seul arrêt de tabulation.",
      },
    },
  },
  args: {
    "aria-label": "Dossiers",
    items: DRIVE,
    defaultExpandedIds: ["drive", "finance"],
    defaultSelectedIds: ["budget"],
    selectionMode: "single",
    size: "default",
    guides: true,
    expansionTrigger: "chevron",
  },
  argTypes: {
    selectionMode: { control: "inline-radio", options: ["single", "multiple", "none"] },
    size: { control: "inline-radio", options: ["sm", "default"] },
    expansionTrigger: { control: "inline-radio", options: ["chevron", "row"] },
    guides: { control: "boolean" },
    items: { control: false },
    children: { control: false },
    labels: { control: false },
  },
  render: (args) => (
    <Card width={320}>
      <TreeView {...args} />
    </Card>
  ),
} satisfies Meta<typeof TreeView>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles. Essayez le clavier : Tab, puis les flèches. */
export const Playground: Story = {};

function findLabel(items: TreeViewItem[], id: string): string | undefined {
  for (const item of items) {
    if (item.id === id) return item.label;
    const nested = item.children && findLabel(item.children, id);
    if (nested) return nested;
  }
  return undefined;
}

function DriveDemo() {
  const [selected, setSelected] = React.useState<string[]>(["factures"]);
  const [opened, setOpened] = React.useState<string | null>(null);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px minmax(0, 1fr)", gap: 24, alignItems: "start", maxWidth: 760 }}>
      <TreeView
        aria-label="Dossiers"
        items={DRIVE}
        defaultExpandedIds={["drive", "finance", "factures"]}
        selectedIds={selected}
        onSelectedChange={setSelected}
        onItemActivate={(item) => setOpened(item.label)}
      />
      <Card width={420}>
        <div style={{ display: "grid", gap: 6 }}>
          <span style={{ color: "var(--ui-fg-3)", fontSize: 12.5, fontWeight: 500 }}>Dossier courant</span>
          <span style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.015em" }}>{findLabel(DRIVE, selected[0] ?? "") ?? "—"}</span>
          <span style={{ color: "var(--ui-fg-2)", fontSize: 13 }}>
            {opened ? <>Dernière ouverture (Entrée ou double-clic) : <strong>{opened}</strong></> : "Entrée ou double-clic ouvre l'élément."}
          </span>
        </div>
      </Card>
    </div>
  );
}

/**
 * Le volet de Drive : le clic choisit le dossier courant, le chevron seul
 * ouvre et ferme ; Entrée ou double-clic déclenche `onItemActivate`.
 * Icône de dossier ouvert (`iconExpanded`), compteur et pictogramme discrets (`trailing`).
 */
export const VoletDeDossiers: Story = { name: "Volet de dossiers (Drive)", render: () => <DriveDemo /> };

/** Même moteur, écriture JSX : `TreeItem` imbriqués (fragments et tableaux acceptés). */
export const Composable: Story = {
  name: "API composable (TreeItem)",
  render: () => (
    <Card width={320}>
      <TreeView aria-label="Projets" defaultExpandedIds={["site"]} defaultSelectedIds={["accueil"]}>
        <TreeItem itemId="site" label="Site public" {...folder}>
          <TreeItem itemId="accueil" label="Accueil.tsx" icon={<FileText />} />
          <TreeItem itemId="tarifs" label="Tarifs.tsx" icon={<FileText />} />
          <TreeItem itemId="images" label="images" {...folder}>
            {["hero.webp", "logo.svg"].map((name) => (
              <TreeItem key={name} itemId={name} label={name} icon={<Image />} />
            ))}
          </TreeItem>
        </TreeItem>
        <TreeItem itemId="api" label="API" {...folder}>
          <TreeItem itemId="factures-api" label="factures.ts" icon={<FileText />} />
        </TreeItem>
      </TreeView>
    </Card>
  ),
};

function MultipleDemo() {
  const [selected, setSelected] = React.useState<string[]>(["budget", "rapport"]);
  return (
    <Card width={340}>
      <Row label="Sélection">
        <Badge variant="pri">{selected.length} élément{selected.length > 1 ? "s" : ""}</Badge>
      </Row>
      <TreeView
        aria-label="Fichiers à partager"
        items={DRIVE}
        selectionMode="multiple"
        defaultExpandedIds={["drive", "finance", "marketing"]}
        selectedIds={selected}
        onSelectedChange={setSelected}
      />
    </Card>
  );
}

/**
 * `selectionMode="multiple"` : Ctrl/⌘ + clic, Maj + clic (plage), Espace,
 * Maj + ↑ ↓, Ctrl + A. Le contrôle passe par `selectedIds` / `onSelectedChange`.
 */
export const SelectionMultiple: Story = { name: "Sélection multiple", render: () => <MultipleDemo /> };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function LazyDemo() {
  const attempts = React.useRef(0);
  const loadChildren = async (item: TreeViewItem): Promise<TreeViewItem[]> => {
    await wait(900);
    if (item.id === "serveur") {
      attempts.current += 1;
      if (attempts.current === 1) throw new Error("Serveur injoignable");
    }
    if (item.id === "vide") return [];
    return Array.from({ length: 3 }, (_, i) => ({
      id: `${item.id}-${i}`,
      label: `${item.label} · sous-dossier ${i + 1}`,
      ...folder,
      hasChildren: true,
    }));
  };
  return (
    <Card width={360}>
      <TreeView
        aria-label="Dossiers distants"
        loadChildren={loadChildren}
        items={[
          { id: "equipe", label: "Drive de l'équipe", ...folder, hasChildren: true },
          { id: "serveur", label: "Serveur de fichiers", ...folder, hasChildren: true },
          { id: "vide", label: "Dossier vide", ...folder, hasChildren: true },
        ]}
      />
    </Card>
  );
}

/**
 * `hasChildren` + `loadChildren` : le contenu est demandé à la première
 * ouverture, un indicateur d'attente remplace le chevron et le chargement est
 * annoncé. « Serveur de fichiers » échoue la première fois : le dossier se
 * referme, l'échec est signalé ; rouvrir réessaie. Un dossier vide devient une feuille.
 */
export const ChargementParesseux: Story = { name: "Chargement paresseux", render: () => <LazyDemo /> };

/** 32 px (`sm`, volets denses) ou 36 px (`default`). */
export const Tailles: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "start" }}>
      {(["sm", "default"] as const).map((size) => (
        <Card key={size} width={300}>
          <span style={{ color: "var(--ui-fg-3)", fontSize: 12, fontWeight: 500 }}>{size === "sm" ? "sm · 32" : "default · 36"}</span>
          <TreeView aria-label={`Dossiers (${size})`} size={size} items={DRIVE} defaultExpandedIds={["drive", "marketing"]} defaultSelectedIds={["logo"]} />
        </Card>
      ))}
    </div>
  ),
};

/**
 * Nœud désactivé (« Archives 2019 » : ni focus, ni ouverture, descendants
 * compris), arbre de navigation sans sélection qui s'ouvre au clic de ligne
 * (`selectionMode="none"`, `expansionTrigger="row"`), guides masqués.
 */
export const Etats: Story = {
  name: "États",
  render: () => (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "start" }}>
      <Card width={300}>
        <span style={{ color: "var(--ui-fg-3)", fontSize: 12, fontWeight: 500 }}>Navigation, ouverture à la ligne</span>
        <TreeView aria-label="Explorateur" items={DRIVE} selectionMode="none" expansionTrigger="row" defaultExpandedIds={["drive"]} />
      </Card>
      <Card width={300}>
        <span style={{ color: "var(--ui-fg-3)", fontSize: 12, fontWeight: 500 }}>Sans guides</span>
        <TreeView aria-label="Dossiers sans guides" items={DRIVE} guides={false} defaultExpandedIds={["drive", "rh"]} />
      </Card>
    </div>
  ),
};
