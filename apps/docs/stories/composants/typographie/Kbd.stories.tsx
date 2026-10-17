import type { Meta, StoryObj } from "@storybook/react";
import { Kbd, Text } from "@rovia/ui";

const meta = {
  title: "Composants/Typographie/Kbd",
  component: Kbd,
  tags: ["autodocs"],
  parameters: {
    registry: "typography",
    docs: {
      description: {
        component:
          "Touche ou raccourci clavier. Une touche par `Kbd` ; les combinaisons s'écrivent avec plusieurs `Kbd` ou en une chaîne courte (« ⌘K »). Les infobulles et les menus affichent leurs raccourcis avec le même style.",
      },
    },
  },
  args: { children: "⌘K" },
} satisfies Meta<typeof Kbd>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const DansUnTexte: Story = {
  name: "Dans un texte",
  render: () => (
    <Text tone="muted">
      Rechercher <Kbd>⌘</Kbd> <Kbd>K</Kbd> · Nouveau dossier <Kbd>⇧⌥F</Kbd> · Fermer <Kbd>Échap</Kbd>
    </Text>
  ),
};
