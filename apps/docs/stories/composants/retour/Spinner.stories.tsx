import type { Meta, StoryObj } from "@storybook/react";
import { Button, Spinner } from "@acme/ui";
import { Row } from "../../_shared/demo";

const meta = {
  title: "Composants/Retour/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Attente courte et indéterminée. Annoncé comme statut « Chargement » (libellé surchargeable) ; `label=\"\"` le rend décoratif quand un texte voisin dit déjà ce qui se passe. Prend la couleur du texte. Dans un bouton, préférer `Button loading`.",
      },
    },
  },
  args: { size: 20, label: "Chargement" },
  argTypes: { size: { control: "inline-radio", options: [12, 14, 16, 20, 24] } },
} satisfies Meta<typeof Spinner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Tailles: Story = {
  render: () => (
    <Row>
      <Spinner size={12} />
      <Spinner size={16} />
      <Spinner size={24} />
      <span style={{ color: "var(--ui-pri)" }}><Spinner size={20} /></span>
      <Button loading>Enregistrer</Button>
    </Row>
  ),
};
