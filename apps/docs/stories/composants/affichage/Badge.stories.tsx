import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "@acme/ui";
import { Row } from "../../_shared/demo";

const meta = {
  title: "Composants/Affichage/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Étiquette en pilule. Deux formes : **pastille d'état** (`neu`, `pri`, `ok`, `warn`, `err` : fond estompé et filet du ton, avec puce optionnelle) et **compteur** (`default`, `outline` : un nombre qui suit un titre). `tinted` dérive fond et filet d'une teinte libre.",
      },
    },
  },
  args: { children: "Payée", variant: "ok", dot: true },
  argTypes: { variant: { control: "select", options: ["default", "outline", "neu", "pri", "ok", "warn", "err", "tinted"] } },
} satisfies Meta<typeof Badge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Les tons de statut sont réservés à l'état ; la puce double la couleur d'un repère de forme. */
export const Etats: Story = {
  name: "États",
  render: () => (
    <>
      <Row label="Avec puce">
        <Badge variant="neu" dot>Brouillon</Badge>
        <Badge variant="pri" dot>Envoyée</Badge>
        <Badge variant="ok" dot>Payée</Badge>
        <Badge variant="warn" dot>Partielle</Badge>
        <Badge variant="err" dot>En retard</Badge>
      </Row>
      <Row label="Sans puce">
        <Badge variant="pri">Nouveau</Badge>
        <Badge variant="ok">Actif</Badge>
        <Badge variant="err">Bloqué</Badge>
      </Row>
    </>
  ),
};

/** Un compteur suit un titre ou une entrée de navigation : c'est un nombre, pas un état. */
export const Compteurs: Story = {
  render: () => (
    <Row>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 500 }}>Factures <Badge>128</Badge></span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 500 }}>Relances <Badge variant="outline">7</Badge></span>
    </Row>
  ),
};

/** `tinted` + `tint` : étiquettes de catégorie (dossiers, équipes) dans une teinte libre. */
export const TeinteLibre: Story = {
  name: "Teinte libre",
  render: () => (
    <Row>
      <Badge variant="tinted" tint="var(--ui-c7)" dot>Confidentiel</Badge>
      <Badge variant="tinted" tint="var(--ui-c3)" dot>Juridique</Badge>
      <Badge variant="tinted" tint="var(--ui-c2)" dot>Achats</Badge>
    </Row>
  ),
};
