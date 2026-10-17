import type { Meta, StoryObj } from "@storybook/react";
import { Field, RadioGroup, RadioGroupItem } from "@rovia/ui";

const meta = {
  title: "Composants/Formulaire/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: {
    registry: "radio",
    docs: {
      description: {
        component:
          "Choix unique parmi quelques options visibles (2 à 5). Flèches pour parcourir, le point apparaît en ressort. Au-delà de cinq options, préférer `Select` ou `Combobox`.",
      },
    },
  },
  args: { defaultValue: "mois", orientation: "vertical", disabled: false, "aria-label": "Fréquence" },
  argTypes: { orientation: { control: "inline-radio", options: ["vertical", "horizontal"] } },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroupItem value="semaine">Chaque semaine</RadioGroupItem>
      <RadioGroupItem value="mois" description="Le 1er de chaque mois, à 8 h.">Chaque mois</RadioGroupItem>
      <RadioGroupItem value="an" disabled>Chaque année</RadioGroupItem>
    </RadioGroup>
  ),
} satisfies Meta<typeof RadioGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Horizontal: Story = { args: { orientation: "horizontal" } };

/** Dans un `Field`, le libellé nomme le groupe. */
export const DansUnField: Story = {
  name: "Dans un Field",
  render: () => (
    <Field label="Conditions de paiement" hint="Appliquées aux nouvelles factures.">
      <RadioGroup defaultValue="30" orientation="horizontal">
        <RadioGroupItem value="0">Comptant</RadioGroupItem>
        <RadioGroupItem value="30">30 jours</RadioGroupItem>
        <RadioGroupItem value="60">60 jours</RadioGroupItem>
      </RadioGroup>
    </Field>
  ),
};
