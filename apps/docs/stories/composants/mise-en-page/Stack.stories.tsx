import type { Meta, StoryObj } from "@storybook/react";
import { Box, Button, Heading, HStack, Stack, Text } from "@acme/ui";

const Item = ({ children }: { children: string }) => (
  <Box bg="card-2" radius="sm" px={3} py={2}>
    <Text size={13}>{children}</Text>
  </Box>
);

const meta = {
  title: "Composants/Mise en page/Stack",
  component: Stack,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Empile (`direction=\"column\"`, défaut) ou aligne (`row`) ses enfants avec un écart en pas de 4 px. `HStack` est le raccourci horizontal. `align`, `justify`, `wrap` et `full` couvrent les mises en page courantes sans CSS sur mesure.",
      },
    },
  },
  args: { direction: "column", gap: 2, align: "stretch", justify: "start", wrap: false },
  argTypes: {
    direction: { control: "inline-radio", options: ["column", "row", "column-reverse", "row-reverse"] },
    align: { control: "inline-radio", options: ["start", "center", "end", "stretch", "baseline"] },
    justify: { control: "inline-radio", options: ["start", "center", "end", "between", "around", "evenly"] },
    gap: { control: { type: "range", min: 0, max: 10, step: 0.5 } },
  },
  render: (args) => (
    <Stack {...args} style={{ maxWidth: 520 }}>
      <Item>Premier</Item>
      <Item>Deuxième</Item>
      <Item>Troisième</Item>
    </Stack>
  ),
} satisfies Meta<typeof Stack>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** En-tête de page : titre et actions de part et d'autre. */
export const EnTeteDePage: Story = {
  name: "En-tête de page (HStack)",
  render: () => (
    <HStack justify="between" wrap gap={3} style={{ maxWidth: 760 }}>
      <Stack gap={1}>
        <Heading level={1} size="lg">Trésorerie</Heading>
        <Text tone="muted">Situation au 10 octobre 2026</Text>
      </Stack>
      <HStack gap={2}>
        <Button variant="outline">Exporter</Button>
        <Button>Nouvelle écriture</Button>
      </HStack>
    </HStack>
  ),
};
