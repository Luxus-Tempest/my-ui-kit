import type { Meta, StoryObj } from "@storybook/react";
import { Heading, Stack } from "@rovia/ui";

const meta = {
  title: "Composants/Typographie/Heading",
  component: Heading,
  tags: ["autodocs"],
  parameters: {
    registry: "typography",
    docs: {
      description: {
        component:
          "Titre. Le **niveau** (`level`, h1 à h6) suit la structure du document ; la **taille** (`size`, 2xl à xs) suit le design : les deux sont indépendants. Graisse 600, interlettrage négatif sur les grands corps, retour à la ligne équilibré.",
      },
    },
  },
  args: { children: "Factures clients", level: 2, size: "lg" },
  argTypes: {
    level: { control: "inline-radio", options: [1, 2, 3, 4, 5, 6] },
    size: { control: "inline-radio", options: ["2xl", "xl", "lg", "md", "sm", "xs"] },
  },
} satisfies Meta<typeof Heading>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Échelle complète : 34 / 28 / 24 / 20 / 18 / 15 px. */
export const Echelle: Story = {
  name: "Échelle",
  render: () => (
    <Stack gap={3}>
      <Heading level={1} size="2xl">Pilotez votre activité</Heading>
      <Heading level={1} size="xl">Factures clients</Heading>
      <Heading level={2} size="lg">Échéancier</Heading>
      <Heading level={3} size="md">Relances du mois</Heading>
      <Heading level={4} size="sm">Coordonnées bancaires</Heading>
      <Heading level={5} size="xs">Pièces jointes</Heading>
    </Stack>
  ),
};
