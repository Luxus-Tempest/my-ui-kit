import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Field, NumberInput } from "@acme/ui";
import { Card, Row } from "../../_shared/demo";

const meta = {
  title: "Composants/Formulaire/NumberInput",
  component: NumberInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Saisit un nombre exact (quantité, prix, remise). Même surface qu'un Input, avec les boutons − / + d'un stepper iOS. Saisie tolérante (« 1 234,5 », « 1234.5 »), formatée en fr-FR et ramenée entre `min` et `max` en quittant le champ. Clavier : ↑ / ↓, Pg. préc. / Pg. suiv. (×10), Origine / Fin. Pour une valeur approximative dans un intervalle, préférer **Slider**.",
      },
    },
  },
  args: { defaultValue: 1, min: 0, max: 99, step: 1, density: "default", "aria-label": "Quantité" },
  argTypes: {
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    unit: { control: "text" },
    density: { control: "inline-radio", options: ["sm", "default"] },
    formatOptions: { control: "object" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    "aria-invalid": { control: "boolean" },
    decrementLabel: { control: "text" },
    incrementLabel: { control: "text" },
    value: { table: { disable: true } },
  },
} satisfies Meta<typeof NumberInput>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles. */
export const Playground: Story = {
  decorators: [(Story) => <div style={{ width: 220, maxWidth: "100%" }}><Story /></div>],
};

/**
 * Le format vient de `Intl.NumberFormat` (fr-FR) : décimales, devise, pourcentage.
 * `unit` ajoute un suffixe texte, annoncé avec la valeur (`aria-valuetext`).
 */
export const Formats: Story = {
  render: () => (
    <>
      <Row label="Entier"><div style={{ width: 200 }}><NumberInput aria-label="Quantité" defaultValue={12} min={0} /></div></Row>
      <Row label="Décimales">
        <div style={{ width: 200 }}>
          <NumberInput aria-label="Poids" defaultValue={2.5} step={0.1} formatOptions={{ minimumFractionDigits: 1, maximumFractionDigits: 2 }} unit="kg" />
        </div>
      </Row>
      <Row label="Unité">
        <div style={{ width: 200 }}>
          <NumberInput aria-label="Prix unitaire" defaultValue={1234.5} step={10} formatOptions={{ minimumFractionDigits: 2 }} unit="MAD" />
        </div>
      </Row>
      <Row label="Devise">
        <div style={{ width: 200 }}>
          <NumberInput aria-label="Montant" defaultValue={1500} step={50} formatOptions={{ style: "currency", currency: "EUR" }} />
        </div>
      </Row>
      <Row label="Pourcentage">
        <div style={{ width: 200 }}>
          <NumberInput aria-label="Remise" defaultValue={0.15} min={0} max={1} step={0.05} formatOptions={{ style: "percent" }} />
        </div>
      </Row>
    </>
  ),
};

/** 40 px par défaut ; `density="sm"` : 32 px, pour une ligne de tableau ou une barre de filtres. */
export const Tailles: Story = {
  render: () => (
    <>
      <Row label="sm · 32"><div style={{ width: 160 }}><NumberInput aria-label="Quantité" density="sm" defaultValue={3} min={0} /></div></Row>
      <Row label="default · 40"><div style={{ width: 200 }}><NumberInput aria-label="Quantité" defaultValue={3} min={0} /></div></Row>
    </>
  ),
};

/** À la borne, le bouton correspondant se désactive. Invalide, lecture seule et désactivé suivent Input. */
export const Etats: Story = {
  name: "États",
  render: () => (
    <>
      <Row label="À la borne"><div style={{ width: 200 }}><NumberInput aria-label="Places" defaultValue={10} min={0} max={10} /></div></Row>
      <Row label="Vide"><div style={{ width: 200 }}><NumberInput aria-label="Acompte" placeholder="Aucun" /></div></Row>
      <Row label="Invalide"><div style={{ width: 200 }}><NumberInput aria-label="Stock" defaultValue={-4} aria-invalid /></div></Row>
      <Row label="Lecture seule"><div style={{ width: 200 }}><NumberInput aria-label="Total" defaultValue={4200} unit="MAD" readOnly /></div></Row>
      <Row label="Désactivé"><div style={{ width: 200 }}><NumberInput aria-label="Quantité" defaultValue={1} disabled /></div></Row>
    </>
  ),
};

function InvoiceLine() {
  const [qty, setQty] = React.useState<number | null>(3);
  const [price, setPrice] = React.useState<number | null>(450);
  const total = (qty ?? 0) * (price ?? 0);
  return (
    <Card>
      <Field label="Quantité" hint="Entre 1 et 99" error={qty == null ? "La quantité est obligatoire" : undefined} required>
        <NumberInput value={qty} onValueChange={setQty} min={1} max={99} />
      </Field>
      <Field label="Prix unitaire" hint="Hors taxes">
        <NumberInput value={price} onValueChange={setPrice} min={0} step={10} formatOptions={{ minimumFractionDigits: 2 }} unit="MAD" />
      </Field>
      <p style={{ margin: 0, fontSize: 14, color: "var(--ui-fg-2)", fontVariantNumeric: "tabular-nums" }}>
        Total : {new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2 }).format(total)} MAD
      </p>
    </Card>
  );
}

/**
 * Contrôlé (`value` + `onValueChange(number | null)`) dans des `Field` : libellé,
 * aide, erreur et obligatoire sont reliés au `spinbutton`. Avec `name`, la valeur
 * brute (« 1234.5 ») est soumise par un champ caché.
 */
export const DansUnField: Story = {
  name: "Dans un Field",
  render: () => <InvoiceLine />,
};
