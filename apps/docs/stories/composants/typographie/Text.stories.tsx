import type { Meta, StoryObj } from "@storybook/react";
import { Stack, Text, VisuallyHidden } from "@rovia/ui";
import { Row } from "../../_shared/demo";

const meta = {
  title: "Composants/Typographie/Text",
  component: Text,
  tags: ["autodocs"],
  parameters: {
    registry: "typography",
    docs: {
      description: {
        component:
          "Texte courant. `size` en pixels de la grille (10 à 16), `weight`, `tone` (encres du thème et tons de statut), `truncate` / `lineClamp`, `numeric` (chiffres tabulaires, pour les colonnes), `mono`, `eyebrow` (surtitre). `as` choisit l'élément (`span` par défaut, `p` pour un paragraphe). `VisuallyHidden` garde un texte pour les lecteurs d'écran seulement.",
      },
    },
  },
  args: { children: "Atlas Distribution SARL — agence de Casablanca Anfa", size: 14, weight: "regular", tone: "default" },
  argTypes: {
    size: { control: "select", options: [10, 11, 11.5, 12, 12.5, 13, 14, 15, 16] },
    weight: { control: "inline-radio", options: ["regular", "medium", "semibold", "bold", "extrabold"] },
    tone: { control: "select", options: ["default", "muted", "subtle", "pri", "ok", "warn", "err", "inherit"] },
  },
} satisfies Meta<typeof Text>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Encres du thème pour la hiérarchie ; tons de statut seulement quand la couleur signifie un état. */
export const Tons: Story = {
  render: () => (
    <Row>
      <Text>default</Text>
      <Text tone="muted">muted</Text>
      <Text tone="subtle">subtle</Text>
      <Text tone="pri" weight="semibold">pri</Text>
      <Text tone="ok" weight="semibold">ok</Text>
      <Text tone="warn" weight="semibold">warn</Text>
      <Text tone="err" weight="semibold">err</Text>
    </Row>
  ),
};

/** Surtitre, chiffres tabulaires, chasse fixe, troncature et limite de lignes. */
export const Usages: Story = {
  render: () => (
    <Stack gap={4} style={{ maxWidth: 560 }}>
      <Text as="p">
        Corps de lecture : 14 px, interligne 1,5. Une mention secondaire reste lisible :{" "}
        <Text tone="subtle">modifié il y a 3 minutes</Text>.
      </Text>
      <Row label="Surtitre"><Text eyebrow>Synthèse du trimestre</Text></Row>
      <Row label="Chiffres">
        <Text numeric weight="semibold">1 284 900,00 MAD</Text>
        <Text mono tone="muted">FAC-2026-00412</Text>
      </Row>
      <Row label="Troncature">
        <Text truncate style={{ maxWidth: 240 }}>Atlas Distribution SARL — agence de Casablanca Anfa</Text>
      </Row>
      <Row label="2 lignes">
        <Text lineClamp={2} style={{ maxWidth: 280 }}>
          Les fichiers marqués hors connexion restent disponibles sans réseau et se synchronisent dès que la connexion revient.
        </Text>
      </Row>
      <Row label="Masqué">
        <Text>
          Supprimer <VisuallyHidden>la facture FAC-2026-00412</VisuallyHidden>
        </Text>
      </Row>
    </Stack>
  ),
};
