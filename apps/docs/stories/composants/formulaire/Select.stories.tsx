import type { Meta, StoryObj } from "@storybook/react";
import {
  Field,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@acme/ui";
import { Row } from "../../_shared/demo";

const meta = {
  title: "Composants/Formulaire/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Choix dans une liste courte et connue. Déclencheur au remplissage tonal d'un Input, liste en matériau translucide. Pour une longue liste ou une recherche, préférer `Combobox`.",
      },
    },
  },
  args: { disabled: false },
  render: (args) => (
    <div style={{ width: 260 }}>
      <Select {...args}>
        <SelectTrigger aria-label="Journal"><SelectValue placeholder="Choisir un journal" /></SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Journaux</SelectLabel>
            <SelectItem value="ach">Achats</SelectItem>
            <SelectItem value="ven">Ventes</SelectItem>
            <SelectItem value="bq">Banque</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Divers</SelectLabel>
            <SelectItem value="od">Opérations diverses</SelectItem>
            <SelectItem value="an" disabled>À nouveaux (clôturé)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  ),
} satisfies Meta<typeof Select>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Groupes, séparateur et entrée désactivée. */
export const Playground: Story = {};

/** 40 px par défaut, 32 px en `density="sm"` (barres d'outils, filtres). */
export const Tailles: Story = {
  render: () => (
    <>
      <Row label="Défaut · 40">
        <div style={{ width: 220 }}>
          <Select defaultValue="30">
            <SelectTrigger aria-label="Période"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="365">12 derniers mois</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Row>
      <Row label="sm · 32">
        <div style={{ width: 180 }}>
          <Select defaultValue="30">
            <SelectTrigger density="sm" aria-label="Période compacte"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Row>
    </>
  ),
};

/** Dans un `Field` : libellé, aide et erreur reliés au déclencheur. */
export const DansUnField: Story = {
  name: "Dans un Field",
  render: () => (
    <div style={{ display: "grid", gap: 16, width: 280 }}>
      <Field label="Devise" hint="Devise de facturation">
        <Select defaultValue="mad">
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mad">Dirham (MAD)</SelectItem>
            <SelectItem value="eur">Euro (EUR)</SelectItem>
            <SelectItem value="usd">Dollar (USD)</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Pays" required error="Choisissez un pays.">
        <Select>
          <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ma">Maroc</SelectItem>
            <SelectItem value="fr">France</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </div>
  ),
};
