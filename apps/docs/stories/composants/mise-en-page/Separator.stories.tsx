import type { Meta, StoryObj } from "@storybook/react";
import { HStack, Separator, Stack, Text } from "@acme/ui";

const meta = {
  title: "Composants/Mise en page/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Filet de 1 px entre deux groupes. Décoratif par défaut (ignoré des lecteurs d'écran) ; `decorative={false}` l'annonce comme séparateur sémantique. Dans un menu, utiliser `MenuSeparator`.",
      },
    },
  },
  args: { orientation: "horizontal" },
  argTypes: { orientation: { control: "inline-radio", options: ["horizontal", "vertical"] } },
} satisfies Meta<typeof Separator>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) =>
    args.orientation === "vertical" ? (
      <HStack gap={3} style={{ height: 24 }}>
        <Text size={13}>Mon Drive</Text>
        <Separator {...args} />
        <Text size={13}>Partagés</Text>
      </HStack>
    ) : (
      <Stack gap={3} style={{ maxWidth: 360 }}>
        <Text size={13}>Informations</Text>
        <Separator {...args} />
        <Text size={13}>Activité</Text>
      </Stack>
    ),
};
