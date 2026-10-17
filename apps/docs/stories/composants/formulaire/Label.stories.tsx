import type { Meta, StoryObj } from "@storybook/react";
import { Input, Label } from "@rovia/ui";

const meta = {
  title: "Composants/Formulaire/Label",
  component: Label,
  tags: ["autodocs"],
  parameters: {
    registry: "label",
    docs: {
      description: {
        component:
          "Libellé de champ, 13 px / 500. Dans un formulaire, préférer `Field`, qui pose le libellé et le relie au contrôle ; `Label` sert aux mises en page sur mesure.",
      },
    },
  },
  args: { children: "Adresse e-mail", required: false, disabled: false, htmlFor: "label-demo" },
  render: (args) => (
    <div style={{ display: "grid", gap: 8, maxWidth: 320 }}>
      <Label {...args} />
      <Input id="label-demo" type="email" placeholder="nom@exemple.ma" disabled={args.disabled} required={args.required} />
    </div>
  ),
} satisfies Meta<typeof Label>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** L'astérisque est décoratif : c'est le champ, `required`, qui annonce l'obligation. */
export const Obligatoire: Story = { args: { required: true } };

/** Estompé quand son champ est désactivé. */
export const Desactive: Story = { name: "Désactivé", args: { disabled: true } };
