import type { Meta, StoryObj } from "@storybook/react";
import { Box, Text } from "@acme/ui";

const meta = {
  title: "Composants/Mise en page/Box",
  component: Box,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Boîte de base : marges internes en pas de 4 px (`p`, `px`, `py`), fond pris dans les surfaces du thème (`bg`), filet (`border`), rayon (`radius`) et élévation (`shadow`) — toujours des jetons, jamais des valeurs libres. `as` change l'élément rendu.",
      },
    },
  },
  args: { p: 4, bg: "panel", border: true, radius: "lg", children: "Contenu" },
  argTypes: {
    bg: { control: "select", options: ["app", "panel", "panel-2", "card", "card-2", "sel"] },
    radius: { control: "select", options: ["xs", "sm", "ctl", "md", "lg", "full"] },
    shadow: { control: "inline-radio", options: [1, 2, 3, 4] },
    border: { control: "inline-radio", options: [false, true, "strong"] },
  },
} satisfies Meta<typeof Box>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Surfaces : de l'application au conteneur le plus marqué. */
export const Surfaces: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, maxWidth: 760 }}>
      {(["app", "panel", "panel-2", "card", "card-2", "sel"] as const).map((bg) => (
        <Box key={bg} bg={bg} border radius="md" p={4}>
          <Text size={13} weight="medium">{bg}</Text>
        </Box>
      ))}
    </div>
  ),
};
