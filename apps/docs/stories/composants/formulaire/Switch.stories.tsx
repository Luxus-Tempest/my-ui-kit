import type { Meta, StoryObj } from "@storybook/react";
import { Field, Switch } from "@rovia/ui";
import { Row } from "../../_shared/demo";

const meta = {
  title: "Composants/Formulaire/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    registry: "switch",
    docs: {
      description: {
        component:
          "Bascule à effet immédiat (un réglage, pas un choix à valider). Proportions d'iOS : 44 × 26 px, pastille qui s'étire à l'appui. Pour un choix soumis avec un formulaire, préférer `Checkbox`.",
      },
    },
  },
  args: { "aria-label": "Exemple", size: "default", disabled: false, defaultChecked: true },
  argTypes: { size: { control: "inline-radio", options: ["default", "sm"] } },
} satisfies Meta<typeof Switch>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Etats: Story = {
  name: "États et tailles",
  render: () => (
    <>
      <Row label="Défaut">
        <Switch aria-label="Désactivée" />
        <Switch aria-label="Activée" defaultChecked />
        <Switch aria-label="Inactive" disabled />
        <Switch aria-label="Inactive cochée" disabled defaultChecked />
      </Row>
      <Row label="sm">
        <Switch aria-label="Compacte" size="sm" />
        <Switch aria-label="Compacte active" size="sm" defaultChecked />
      </Row>
    </>
  ),
};

/** Dans un `Field` horizontal : libellé en phrase, aide en dessous. */
export const AvecLibelle: Story = {
  name: "Avec libellé (Field)",
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <Field label="Relances automatiques" hint="Un rappel 3 jours avant l'échéance, puis chaque semaine." orientation="horizontal">
        <Switch defaultChecked />
      </Field>
    </div>
  ),
};
