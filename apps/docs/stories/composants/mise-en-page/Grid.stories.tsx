import type { Meta, StoryObj } from "@storybook/react";
import { Box, Grid, Text } from "@acme/ui";

const Cell = ({ children }: { children: string }) => (
  <Box bg="card-2" radius="md" p={4}>
    <Text size={13} tone="muted">{children}</Text>
  </Box>
);

const meta = {
  title: "Composants/Mise en page/Grid",
  component: Grid,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Grille CSS : `columns` (nombre de colonnes égales ou gabarit `\"2fr 1fr\"`), ou `minChildWidth` pour une grille fluide (autant de colonnes que possible, chacune d'au moins cette largeur). Écarts en pas de 4 px.",
      },
    },
  },
  args: { columns: 3, gap: 3 },
  render: (args) => (
    <Grid {...args} style={{ maxWidth: 760 }}>
      {["Un", "Deux", "Trois", "Quatre", "Cinq", "Six"].map((t) => <Cell key={t}>{t}</Cell>)}
    </Grid>
  ),
} satisfies Meta<typeof Grid>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Grille fluide : les cartes passent à la ligne d'elles-mêmes. */
export const Fluide: Story = { args: { columns: undefined, minChildWidth: 180 } };

/** Gabarit : contenu principal et panneau latéral. */
export const Gabarit: Story = {
  render: () => (
    <Grid columns="2fr 1fr" gap={3} style={{ maxWidth: 760 }}>
      <Box bg="panel" border radius="lg" p={4} style={{ minHeight: 140 }}><Text size={13} tone="muted">Contenu (2fr)</Text></Box>
      <Box bg="card-2" radius="lg" p={4}><Text size={13} tone="muted">Panneau latéral (1fr)</Text></Box>
    </Grid>
  ),
};
