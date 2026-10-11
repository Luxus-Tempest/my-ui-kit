import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox, Field } from "@acme/ui";
import { Row } from "../../_shared/demo";

const meta = {
  title: "Composants/Formulaire/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Case à cocher : 18 px, coins doux, bord à 3:1 de contraste, coche qui apparaît en ressort. Trois états : `false`, `true`, `\"indeterminate\"` (sélection partielle d'une liste). Avec un libellé, l'envelopper dans `Field orientation=\"horizontal\"`.",
      },
    },
  },
  args: { "aria-label": "Exemple", disabled: false, defaultChecked: true },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Etats: Story = {
  name: "États",
  render: () => (
    <Row>
      <Checkbox aria-label="Non cochée" />
      <Checkbox aria-label="Cochée" defaultChecked />
      <Checkbox aria-label="Mixte" checked="indeterminate" />
      <Checkbox aria-label="Invalide" aria-invalid="true" />
      <Checkbox aria-label="Désactivée" disabled defaultChecked />
    </Row>
  ),
};

/** Le libellé se lit comme une phrase à côté de la case ; cliquer dessus coche la case. */
export const AvecLibelle: Story = {
  name: "Avec libellé (Field)",
  render: () => (
    <div style={{ display: "grid", gap: 14, maxWidth: 420 }}>
      <Field label="Assujetti à la TVA" orientation="horizontal">
        <Checkbox defaultChecked />
      </Field>
      <Field label="J'accepte les conditions générales" orientation="horizontal" required error="Requis pour continuer.">
        <Checkbox />
      </Field>
    </div>
  ),
};
