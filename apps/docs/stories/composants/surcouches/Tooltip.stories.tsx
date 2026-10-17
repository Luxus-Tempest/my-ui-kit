import type { Meta, StoryObj } from "@storybook/react";
import { Button, HStack, Tooltip } from "@rovia/ui";
import { ArchiveIcon, CopyIcon, EditIcon } from "../../_shared/icons";

const meta = {
  title: "Composants/Surcouches/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    registry: "tooltip",
    docs: {
      description: {
        component:
          "Infobulle inversée de Drive : nomme une commande (bouton icône) et rappelle son raccourci. Elle complète un nom accessible, ne le remplace pas : le bouton garde son `aria-label`. Jamais d'information indispensable ni de contenu interactif dedans — pour cela, `Popover`. Version composée disponible (`TooltipRoot`, `TooltipTrigger`, `TooltipContent`).",
      },
    },
  },
  // `children` est requis par le type ; le rendu fournit le vrai déclencheur.
  args: { content: "Dupliquer", shortcut: "⌘D", side: "top", arrow: false, children: <span /> },
  argTypes: {
    side: { control: "inline-radio", options: ["top", "right", "bottom", "left"] },
    children: { table: { disable: true } },
  },
  render: ({ children: _children, ...args }) => (
    <div style={{ paddingTop: 48 }}>
      <Tooltip {...args}>
        <Button size="icon" variant="outline" aria-label="Dupliquer"><CopyIcon /></Button>
      </Tooltip>
    </div>
  ),
} satisfies Meta<typeof Tooltip>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Survolez ou tabulez sur le bouton. */
export const Playground: Story = {};

/** Une barre d'outils : chaque bouton icône a son infobulle. */
export const BarreDOutils: Story = {
  name: "Barre d'outils",
  render: () => (
    <HStack gap={2} style={{ paddingTop: 48 }}>
      <Tooltip content="Dupliquer" shortcut="⌘D">
        <Button size="icon" variant="outline" aria-label="Dupliquer"><CopyIcon /></Button>
      </Tooltip>
      <Tooltip content="Modifier">
        <Button size="icon" variant="outline" aria-label="Modifier"><EditIcon /></Button>
      </Tooltip>
      <Tooltip content="Archiver la facture" side="bottom" arrow>
        <Button size="icon" variant="outline" aria-label="Archiver"><ArchiveIcon /></Button>
      </Tooltip>
    </HStack>
  ),
};

/** Aperçu ouvert (tests visuels). */
export const Ouverte: Story = {
  name: "Aperçu ouvert",
  args: { content: "Dupliquer la facture", open: true },
};
