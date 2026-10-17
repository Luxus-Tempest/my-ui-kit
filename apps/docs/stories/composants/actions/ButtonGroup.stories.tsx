import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  Field,
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from "@rovia/ui";
import {
  Archive,
  Bold,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Italic,
  Mail,
  Minus,
  Pencil,
  Plus,
  Printer,
  Redo2,
  Save,
  Share2,
  Underline,
  Undo2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Row } from "../../_shared/demo";

const meta = {
  title: "Composants/Actions/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs"],
  parameters: {
    registry: "button-group",
    docs: {
      description: {
        component:
          "Des `Button` accolés en une seule pilule, pour des actions liées (« Précédente / Suivante », un bouton scindé action + menu, une barre d'outils). Seuls les bouts extérieurs sont arrondis ; les filets des `outline` se fondent en un seul trait, deux segments pleins gardent un liseré de la surface. Toutes les variantes et tailles de Button conviennent : chaque bouton porte les siennes. Rôle `group`, à nommer avec `aria-label`. Pour un choix exclusif ou des bascules, préférer `ToggleGroup`.",
      },
    },
  },
  args: { orientation: "horizontal", fullWidth: false, "aria-label": "Navigation entre factures" },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    fullWidth: { control: "boolean" },
  },
  render: (args) => (
    <div style={{ width: args.fullWidth ? 440 : undefined }}>
      <ButtonGroup {...args}>
        <Button variant="outline">
          <ChevronLeft />
          Précédente
        </Button>
        <ButtonGroupText>3 sur 12</ButtonGroupText>
        <Button variant="outline">
          Suivante
          <ChevronRight />
        </Button>
      </ButtonGroup>
    </div>
  ),
} satisfies Meta<typeof ButtonGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles. */
export const Playground: Story = {};

/**
 * Chaque segment garde sa variante. `outline` : les filets se fondent. Segments
 * pleins (`default`, `tonal`, `secondary`) : un liseré de la surface les sépare.
 * `ButtonGroupSeparator` structure des segments `ghost` ou `secondary`.
 */
export const Variantes: Story = {
  render: () => (
    <>
      <Row label="Outline">
        <ButtonGroup aria-label="Actions sur le message">
          <Button variant="outline">
            <Archive />
            Archiver
          </Button>
          <Button variant="outline">Signaler</Button>
          <Button variant="outline">
            <Clock />
            Reporter
          </Button>
        </ButtonGroup>
      </Row>
      <Row label="Secondaire">
        <ButtonGroup aria-label="Presse-papiers">
          <Button variant="secondary">
            <Copy />
            Copier
          </Button>
          <ButtonGroupSeparator />
          <Button variant="secondary">
            <Share2 />
            Partager
          </Button>
        </ButtonGroup>
      </Row>
      <Row label="Tonale">
        <ButtonGroup aria-label="Réponse">
          <Button variant="tonal">
            <Mail />
            Répondre
          </Button>
          <Button variant="tonal">Répondre à tous</Button>
          <Button variant="tonal">Transférer</Button>
        </ButtonGroup>
      </Row>
      <Row label="Primaire">
        <ButtonGroup aria-label="Validation">
          <Button>Valider</Button>
          <Button>Valider et suivant</Button>
        </ButtonGroup>
      </Row>
      <Row label="Fantôme">
        <ButtonGroup aria-label="Historique">
          <Button variant="ghost" size="icon" aria-label="Annuler">
            <Undo2 />
          </Button>
          <ButtonGroupSeparator />
          <Button variant="ghost" size="icon" aria-label="Rétablir">
            <Redo2 />
          </Button>
        </ButtonGroup>
      </Row>
    </>
  ),
};

/** La taille vient des boutons : 32 / 36 / 44 px, segments icône compris. */
export const Tailles: Story = {
  render: () => (
    <>
      {(["sm", "default", "lg"] as const).map((size) => (
        <Row key={size} label={size === "sm" ? "sm · 32" : size === "lg" ? "lg · 44" : "default · 36"}>
          <ButtonGroup aria-label={`Export, taille ${size}`}>
            <Button variant="outline" size={size}>
              <Download />
              Exporter
            </Button>
            <Button variant="outline" size={size}>
              <Printer />
              Imprimer
            </Button>
            <Button
              variant="outline"
              size={size === "sm" ? "icon-sm" : size === "lg" ? "icon-lg" : "icon"}
              aria-label="Plus d'options d'export"
            >
              <ChevronDown />
            </Button>
          </ButtonGroup>
        </Row>
      ))}
    </>
  ),
};

/**
 * `vertical` : segments empilés, à la largeur du plus large. Les coins extérieurs
 * prennent l'arrondi d'une demi-hauteur ; le séparateur devient horizontal de lui-même.
 */
export const Orientation: Story = {
  render: () => (
    <Row>
      <ButtonGroup orientation="vertical" aria-label="Zoom">
        <Button variant="outline" size="icon" aria-label="Agrandir">
          <ZoomIn />
        </Button>
        <Button variant="outline" size="icon" aria-label="Réduire">
          <ZoomOut />
        </Button>
      </ButtonGroup>
      <ButtonGroup orientation="vertical" aria-label="Actions du document">
        <Button variant="secondary">
          <Pencil />
          Renommer
        </Button>
        <ButtonGroupSeparator />
        <Button variant="secondary">
          <Copy />
          Dupliquer
        </Button>
        <ButtonGroupSeparator />
        <Button variant="secondary">
          <Archive />
          Archiver
        </Button>
      </ButtonGroup>
    </Row>
  ),
};

function SplitButton({ variant }: { variant: "default" | "tonal" | "outline" }) {
  return (
    <ButtonGroup aria-label="Enregistrer la facture">
      <Button variant={variant}>
        <Save />
        Enregistrer
      </Button>
      <Menu>
        <MenuTrigger asChild>
          <Button variant={variant} size="icon" aria-label="Autres façons d'enregistrer">
            <ChevronDown />
          </Button>
        </MenuTrigger>
        <MenuContent align="end">
          <MenuItem>Enregistrer comme brouillon</MenuItem>
          <MenuItem shortcut="⌘↵">Enregistrer et envoyer</MenuItem>
          <MenuSeparator />
          <MenuItem>Programmer l'envoi…</MenuItem>
        </MenuContent>
      </Menu>
    </ButtonGroup>
  );
}

/**
 * Bouton scindé : l'action principale à gauche, ses variantes dans un `Menu`
 * ouvert par le segment chevron (nommé par `aria-label`, `aria-expanded` posé par le menu).
 * Le chevron est un peu plus large et recentré optiquement.
 */
export const BoutonScinde: Story = {
  name: "Bouton scindé",
  render: () => (
    <Row>
      <SplitButton variant="default" />
      <SplitButton variant="tonal" />
      <SplitButton variant="outline" />
    </Row>
  ),
};

/** Des groupes dans un groupe : une barre d'outils, groupes espacés de 8 px. */
export const Imbrication: Story = {
  name: "Groupes imbriqués",
  render: () => (
    <ButtonGroup aria-label="Barre d'outils de l'éditeur">
      <ButtonGroup aria-label="Historique">
        <Button variant="outline" size="icon-sm" aria-label="Annuler">
          <Undo2 />
        </Button>
        <Button variant="outline" size="icon-sm" aria-label="Rétablir">
          <Redo2 />
        </Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Mise en forme">
        <Button variant="outline" size="icon-sm" aria-label="Gras">
          <Bold />
        </Button>
        <Button variant="outline" size="icon-sm" aria-label="Italique">
          <Italic />
        </Button>
        <Button variant="outline" size="icon-sm" aria-label="Souligné">
          <Underline />
        </Button>
      </ButtonGroup>
      <ButtonGroup aria-label="Zoom">
        <Button variant="outline" size="icon-sm" aria-label="Réduire">
          <ZoomOut />
        </Button>
        <ButtonGroupText>100 %</ButtonGroupText>
        <Button variant="outline" size="icon-sm" aria-label="Agrandir">
          <ZoomIn />
        </Button>
      </ButtonGroup>
    </ButtonGroup>
  ),
};

function QuantityDemo() {
  const [quantity, setQuantity] = React.useState(2);
  return (
    <div style={{ width: 280 }}>
      <Field id="quantite" label="Quantité" hint="Entre 1 et 20 licences">
        <ButtonGroup id="quantite" aria-labelledby="quantite-label" aria-describedby="quantite-hint">
          <Button
            variant="outline"
            size="icon"
            aria-label="Retirer une licence"
            disabled={quantity <= 1}
            onClick={() => setQuantity((q) => q - 1)}
          >
            <Minus />
          </Button>
          <ButtonGroupText aria-live="polite" style={{ minWidth: 56, justifyContent: "center" }}>
            {quantity}
          </ButtonGroupText>
          <Button
            variant="outline"
            size="icon"
            aria-label="Ajouter une licence"
            disabled={quantity >= 20}
            onClick={() => setQuantity((q) => q + 1)}
          >
            <Plus />
          </Button>
        </ButtonGroup>
      </Field>
    </div>
  );
}

/**
 * Dans un `Field` : le groupe prend l'`id` du champ et se nomme par son libellé
 * (`aria-labelledby="<id>-label"`) ; un clic sur le libellé donne le focus au premier
 * bouton. `ButtonGroupText` affiche la valeur entre les deux actions.
 */
export const DansUnField: Story = {
  name: "Dans un Field",
  render: () => <QuantityDemo />,
};
