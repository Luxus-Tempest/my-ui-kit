import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox, Field, Grid, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch, Textarea } from "@acme/ui";

const meta = {
  title: "Composants/Formulaire/Field",
  component: Field,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Enveloppe un contrôle (Input, Textarea, Select, Checkbox, Switch, RadioGroup, Slider, Combobox, DatePicker…) et le relie tout seul à son libellé, son aide, son erreur, `required` et `disabled` : `id`, `aria-describedby`, `aria-invalid`. Un champ complet en une ligne.",
      },
    },
  },
  args: {
    label: "Raison sociale",
    hint: "Telle qu'inscrite au registre du commerce",
    required: false,
    disabled: false,
    children: null,
  },
  argTypes: { children: { table: { disable: true } } },
  render: ({ children: _children, ...args }) => (
    <div style={{ maxWidth: 360 }}>
      <Field {...args}>
        <Input placeholder="Atlas Distribution SARL" />
      </Field>
    </div>
  ),
} satisfies Meta<typeof Field>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Libellé, aide, erreur, obligatoire et désactivé se pilotent depuis les contrôles. */
export const Playground: Story = {};

/** `error` remplace l'aide, passe le contrôle en `aria-invalid` et l'annonce. */
export const AvecErreur: Story = {
  name: "Avec erreur",
  args: { label: "ICE", required: true, error: "L'ICE compte 15 chiffres." },
};

/** `horizontal` : contrôle puis libellé, pour une case à cocher ou une bascule. */
export const Horizontal: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 420 }}>
      <Field label="Assujetti à la TVA" orientation="horizontal">
        <Checkbox defaultChecked />
      </Field>
      <Field label="Relances automatiques" hint="Un rappel 3 jours avant l'échéance, puis chaque semaine." orientation="horizontal">
        <Switch defaultChecked />
      </Field>
    </div>
  ),
};

/** Tous les contrôles de formulaire comprennent Field. */
export const AvecChaqueControle: Story = {
  name: "Avec chaque contrôle",
  render: () => (
    <Grid columns={2} gap={4} style={{ maxWidth: 560 }}>
      <Field label="ICE" required error="L'ICE compte 15 chiffres.">
        <Input defaultValue="00215487" />
      </Field>
      <Field label="Devise" hint="Devise de facturation">
        <Select defaultValue="mad">
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mad">Dirham (MAD)</SelectItem>
            <SelectItem value="eur">Euro (EUR)</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <div style={{ gridColumn: "1 / -1" }}>
        <Field label="Notes internes" hint="Visibles uniquement par l'équipe.">
          <Textarea autoResize placeholder="Contact privilégié, horaires de livraison…" />
        </Field>
      </div>
    </Grid>
  ),
};
