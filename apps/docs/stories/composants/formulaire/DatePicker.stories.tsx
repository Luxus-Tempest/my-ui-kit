import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button, DatePicker, DateRangePicker, Field, type DateRange } from "@acme/ui";
import { Card, Row } from "../../_shared/demo";

/** Empile des champs avec l'espacement d'un formulaire. */
const Stack = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "grid", gap: 18 }}>{children}</div>
);

const meta = {
  title: "Composants/Formulaire/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Champ de date : un déclencheur au remplissage tonal (gabarit du Select) qui ouvre un calendrier flottant. `DatePicker` pour un jour (le choix ferme le panneau et rend le focus ; raccourci « Aujourd'hui »), `DateRangePicker` pour une période sur deux mois avec périodes prédéfinies (7 / 30 derniers jours, ce mois-ci…) : début, puis fin qui ferme le panneau. Date affichée en français (« 10 oct. 2026 »), bornes `minDate` / `maxDate`, effacement optionnel, intégration `Field`.",
      },
    },
  },
  args: { placeholder: "Choisir une date", clearable: false, disabled: false, density: "default" },
  argTypes: {
    density: { control: "inline-radio", options: ["default", "sm"] },
    clearable: { control: "boolean" },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
    clearLabel: { control: "text" },
    minDate: { control: "date" },
    maxDate: { control: "date" },
    value: { table: { disable: true } },
    defaultValue: { table: { disable: true } },
    disabledDays: { table: { disable: true } },
  },
} satisfies Meta<typeof DatePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles. */
export const Playground: Story = {
  render: ({ minDate, maxDate, ...args }) => (
    <Card width={320}>
      <Field label="Échéance">
        <DatePicker
          {...args}
          // Le contrôle « date » de Storybook transmet un horodatage.
          minDate={minDate ? new Date(minDate) : undefined}
          maxDate={maxDate ? new Date(maxDate) : undefined}
        />
      </Field>
    </Card>
  ),
};

function RangeDemo() {
  const [range, setRange] = React.useState<DateRange | undefined>();
  return (
    <Field label="Période" hint={range?.from && range.to ? "Période complète" : "Une période prédéfinie, ou le début puis la fin"}>
      <DateRangePicker value={range} onValueChange={setRange} clearable />
    </Field>
  );
}

/**
 * Un jour ou une période. `DateRangePicker` montre deux mois (`numberOfMonths`) et
 * des périodes prédéfinies (`presets`, ou `false`) ; à chaque ouverture, le premier
 * clic démarre une nouvelle période, le second la termine et ferme le panneau.
 * La période s'affiche abrégée (« 12–15 oct. 2026 »).
 */
export const Variantes: Story = {
  render: () => (
    <Row>
      <Card width={300}>
        <Field label="Date de facture">
          <DatePicker defaultValue={new Date()} />
        </Field>
      </Card>
      <Card width={300}>
        <RangeDemo />
      </Card>
    </Row>
  ),
};

/** `default` : 40 px, comme un Select. `sm` : 32 px, pour les barres de filtres et les tableaux. */
export const Tailles: Story = {
  render: () => (
    <Card width={320}>
      <Row label="default · 40"><div style={{ flex: 1 }}><DatePicker aria-label="Date" defaultValue={new Date()} /></div></Row>
      <Row label="sm · 32"><div style={{ flex: 1 }}><DatePicker aria-label="Date" density="sm" defaultValue={new Date()} /></div></Row>
      <Row label="Plage · sm"><div style={{ flex: 1 }}><DateRangePicker aria-label="Période" density="sm" /></div></Row>
    </Card>
  ),
};

/** Vide (texte d'indication), rempli, invalide (erreur du `Field`) et désactivé. */
export const Etats: Story = {
  name: "États",
  render: () => (
    <Card width={320}>
      <Stack>
        <Field label="Vide"><DatePicker /></Field>
        <Field label="Rempli"><DatePicker defaultValue={new Date()} /></Field>
        <Field label="Invalide" error="La date de livraison est obligatoire."><DatePicker /></Field>
        <Field label="Désactivé" disabled><DatePicker defaultValue={new Date()} /></Field>
      </Stack>
    </Card>
  ),
};

/**
 * `minDate` / `maxDate` désactivent les jours hors bornes et limitent la navigation ;
 * `disabledDays` accepte tout matcher de DayPicker (ici les week-ends). `clearable`
 * ajoute « Effacer la date » au pied du panneau.
 */
export const Bornes: Story = {
  render: () => {
    const today = new Date();
    const in30 = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
    return (
      <Card width={320}>
        <Field label="Livraison" hint="Jours ouvrés, dans les 30 prochains jours">
          <DatePicker minDate={today} maxDate={in30} disabledDays={{ dayOfWeek: [0, 6] }} clearable />
        </Field>
      </Card>
    );
  },
};

function FormDemo() {
  const [issued, setIssued] = React.useState<Date | undefined>(new Date());
  const [due, setDue] = React.useState<Date | undefined>();
  const [error, setError] = React.useState<string>();
  return (
    <Card width={360}>
      <form
        style={{ display: "grid", gap: 18 }}
        onSubmit={(event) => {
          event.preventDefault();
          setError(due ? undefined : "Choisissez une échéance.");
        }}
      >
        <Field label="Émise le" required>
          <DatePicker value={issued} onValueChange={setIssued} />
        </Field>
        <Field label="Échéance" required error={error} hint="30 jours après émission au plus">
          <DatePicker
            value={due}
            onValueChange={(d) => {
              setDue(d);
              setError(undefined);
            }}
            minDate={issued}
            maxDate={issued ? new Date(issued.getFullYear(), issued.getMonth(), issued.getDate() + 30) : undefined}
            clearable
          />
        </Field>
        <div><Button type="submit">Enregistrer</Button></div>
      </form>
    </Card>
  );
}

/**
 * Dans un `Field` : libellé, aide et erreur reliés au déclencheur (`aria-invalid`,
 * `aria-describedby`). Valeurs contrôlées : l'échéance est bornée par la date d'émission.
 */
export const Composition: Story = {
  render: () => <FormDemo />,
};

/** Aperçu ouvert : date seule, raccourci « Aujourd'hui » (tests visuels). */
export const OuvertDate: Story = {
  name: "Aperçu ouvert (date)",
  tags: ["!autodocs"],
  render: () => (
    <div style={{ minHeight: 440 }}>
      <Card width={300}>
        <Field label="Échéance">
          <DatePicker defaultOpen clearable />
        </Field>
      </Card>
    </div>
  ),
};

/** Aperçu ouvert : période et périodes prédéfinies (tests visuels). */
export const OuvertPeriode: Story = {
  name: "Aperçu ouvert (période)",
  tags: ["!autodocs"],
  render: () => (
    <div style={{ minHeight: 440 }}>
      <Card width={300}>
        <Field label="Période">
          <DateRangePicker defaultOpen />
        </Field>
      </Card>
    </div>
  ),
};
