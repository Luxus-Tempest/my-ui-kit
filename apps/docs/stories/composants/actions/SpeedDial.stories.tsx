import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Fab, SpeedDial, SpeedDialAction, type SpeedDialProps } from "@rovia/ui";
import {
  Camera,
  FileSpreadsheet,
  FileText,
  FolderPlus,
  Mic,
  Pencil,
  Plus,
  Presentation,
  Upload,
  X,
} from "lucide-react";
import { Row } from "../../_shared/demo";

/** Les actions de création de Drive. */
const CreateActions = () => (
  <>
    <SpeedDialAction icon={<FileText />} label="Document" />
    <SpeedDialAction icon={<FileSpreadsheet />} label="Feuille de calcul" />
    <SpeedDialAction icon={<Presentation />} label="Présentation" />
    <SpeedDialAction icon={<FolderPlus />} label="Dossier" />
    <SpeedDialAction icon={<Upload />} label="Importer un fichier" />
  </>
);

/** Surface de démonstration : le SpeedDial est ancré dans son coin. */
const Stage = ({
  children,
  height = 400,
  corner = "bottom-right",
}: {
  children: React.ReactNode;
  height?: number;
  corner?: "bottom-right" | "top-right" | "center";
}) => (
  <div
    style={{
      position: "relative",
      display: "flex",
      alignItems: corner === "top-right" ? "flex-start" : corner === "center" ? "center" : "flex-end",
      justifyContent: corner === "center" ? "center" : "flex-end",
      maxWidth: 560,
      height,
      padding: 24,
      boxSizing: "border-box",
      borderRadius: "var(--ui-r-lg)",
      background: "var(--ui-panel)",
    }}
  >
    {children}
  </div>
);

const meta = {
  title: "Composants/Actions/SpeedDial",
  component: SpeedDial,
  tags: ["autodocs"],
  parameters: {
    registry: "speed-dial",
    docs: {
      description: {
        component:
          "Bouton d'action flottant (**Fab**) et sa variante qui déploie 3 à 6 actions liées (**SpeedDial**) : les actions arrivent en cascade, en ressort, avec leur libellé à côté ; le « + » pivote en « × ». Sémantique de bouton de menu (`aria-haspopup`, `aria-expanded`, `aria-controls`, actions en `menuitem`). Clavier : Entrée ou Espace ouvre et place le focus sur la première action, flèches dans le sens du déploiement, Échap referme et rend le focus. Au-delà de six actions, préférer un **Menu**.",
      },
    },
  },
  args: {
    label: "Créer",
    direction: "up",
    variant: "tonal",
    size: "default",
    extended: false,
    openOnHover: false,
    position: "static",
  },
  argTypes: {
    direction: { control: "inline-radio", options: ["up", "down", "left", "right"] },
    variant: { control: "inline-radio", options: ["elevated", "primary", "tonal"] },
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    showLabels: { control: "boolean" },
    position: { table: { disable: true } },
    icon: { table: { disable: true } },
    openIcon: { table: { disable: true } },
    open: { table: { disable: true } },
    onOpenChange: { table: { disable: true } },
  },
  render: (args) => (
    <Stage corner={args.direction === "down" ? "top-right" : args.direction === "up" ? "bottom-right" : "center"}>
      <SpeedDial {...args}>
        <CreateActions />
      </SpeedDial>
    </Stage>
  ),
} satisfies Meta<typeof SpeedDial>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles. */
export const Playground: Story = {};

/* ── Fab ────────────────────────────────────────────────────────────── */

/**
 * `Fab` seul : l'action principale d'un écran. `elevated` (panneau surélevé,
 * le « Nouveau » de Drive), `primary`, `tonal`. Un FAB icône exige un `aria-label`.
 */
export const FabVariantes: Story = {
  name: "Fab : variantes",
  render: () => (
    <>
      <Row label="Surélevé">
        <Fab aria-label="Nouveau"><Plus /></Fab>
        <Fab extended><Plus />Nouveau</Fab>
      </Row>
      <Row label="Primaire">
        <Fab variant="primary" aria-label="Rédiger"><Pencil /></Fab>
        <Fab variant="primary" extended><Pencil />Rédiger</Fab>
      </Row>
      <Row label="Tonal">
        <Fab variant="tonal" aria-label="Photo"><Camera /></Fab>
        <Fab variant="tonal" extended><Camera />Numériser</Fab>
      </Row>
    </>
  ),
};

/** 40 px (écran dense), 56 px (par défaut), 96 px (écran vide, mobile). `extended` garde la hauteur. */
export const FabTailles: Story = {
  name: "Fab : tailles",
  render: () => (
    <>
      <Row label="sm · 40">
        <Fab size="sm" variant="tonal" aria-label="Dictée"><Mic /></Fab>
        <Fab size="sm" variant="tonal" extended><Mic />Dictée</Fab>
      </Row>
      <Row label="default · 56">
        <Fab variant="tonal" aria-label="Dictée"><Mic /></Fab>
        <Fab variant="tonal" extended><Mic />Dictée</Fab>
      </Row>
      <Row label="lg · 96">
        <Fab size="lg" variant="tonal" aria-label="Dictée"><Mic /></Fab>
      </Row>
    </>
  ),
};

/** `asChild` : le FAB devient un lien (`<a>`, `Link` du routeur) ; `disabled` l'estompe. */
export const FabCompositions: Story = {
  name: "Fab : lien et désactivé",
  render: () => (
    <Row>
      <Fab asChild extended variant="primary">
        <a href="#nouveau"><Plus />Nouvelle facture</a>
      </Fab>
      <Fab disabled aria-label="Nouveau"><Plus /></Fab>
    </Row>
  ),
};

/* ── SpeedDial ──────────────────────────────────────────────────────── */

const DIRECTIONS: { direction: NonNullable<SpeedDialProps["direction"]>; corner: "bottom-right" | "top-right" | "center" }[] = [
  { direction: "up", corner: "bottom-right" },
  { direction: "down", corner: "top-right" },
  { direction: "left", corner: "center" },
  { direction: "right", corner: "center" },
];

/**
 * `direction` : côté où les actions se déploient. En `up`/`down`, libellés
 * visibles à côté des actions ; en `left`/`right`, infobulles au survol et au
 * focus (`showLabels` force l'un ou l'autre).
 */
export const Directions: Story = {
  render: (args) => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16, maxWidth: 1000 }}>
      {DIRECTIONS.map(({ direction, corner }) => (
        <Stage key={direction} corner={corner} height={340}>
          <SpeedDial {...args} label={`Créer (${direction})`} direction={direction} defaultOpen>
            <SpeedDialAction icon={<FileText />} label="Document" />
            <SpeedDialAction icon={<FolderPlus />} label="Dossier" />
            <SpeedDialAction icon={<Upload />} label="Importer" />
          </SpeedDial>
        </Stage>
      ))}
    </div>
  ),
};

/**
 * Le « Nouveau » de Drive : FAB surélevé étendu, menu vers le bas,
 * icône d'ouverture dédiée (`openIcon`) en fondu pivotant.
 */
export const NouveauDeDrive: Story = {
  name: "Nouveau de Drive (étendu)",
  render: () => (
    <Stage corner="top-right" height={420}>
      <div style={{ position: "absolute", top: 24, left: 24 }}>
        <SpeedDial label="Nouveau" extended variant="elevated" direction="down" icon={<Plus />} openIcon={<X />}>
          <CreateActions />
        </SpeedDial>
      </div>
    </Stage>
  ),
};

/** `openOnHover` : s'ouvre au survol de la souris (au doigt, l'appui reste nécessaire) et se referme en sortant. */
export const AuSurvol: Story = {
  name: "Au survol",
  args: { openOnHover: true, variant: "primary" },
};

/** `showLabels={false}` : actions seules, libellés en infobulles. */
export const SansLibelles: Story = {
  name: "Libellés en infobulles",
  args: { showLabels: false },
};

/**
 * `position="fixed"` : flotte en bas à droite de la fenêtre (à gauche en
 * lecture de droite à gauche), à 24 px du bord (16 px sur mobile) et hors des
 * zones sûres (encoche, barre d'accueil).
 */
export const PositionFixe: Story = {
  name: "Position fixe",
  tags: ["!autodocs"],
  args: { position: "fixed", variant: "primary" },
  render: (args) => (
    <>
      <p style={{ maxWidth: 520, margin: 0, color: "var(--ui-fg-2)", font: "400 14px/1.6 var(--ui-font-sans)" }}>
        Le SpeedDial flotte dans le coin de la fenêtre, au-dessus du contenu qui défile.
      </p>
      <SpeedDial {...args}>
        <CreateActions />
      </SpeedDial>
    </>
  ),
};

/** Aperçu ouvert (tests visuels). */
export const Ouvert: Story = {
  name: "Aperçu ouvert",
  tags: ["!autodocs"],
  args: { defaultOpen: true },
};
