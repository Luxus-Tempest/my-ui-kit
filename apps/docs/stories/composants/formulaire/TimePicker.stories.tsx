import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button, DateTimePicker, Field, TimePicker } from "@acme/ui";
import { Card, Row } from "../../_shared/demo";

/** Empile des champs avec l'espacement d'un formulaire. */
const Stack = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "grid", gap: 18 }}>{children}</div>
);

const longFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" });

const meta = {
  title: "Composants/Formulaire/TimePicker",
  component: TimePicker,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Champ d'heure à la manière de Google Agenda : on tape l'heure librement (« 14:30 », « 1430 », « 14h30 », normalisée en « 14:30 » en quittant le champ) ou on la choisit dans une liste flottante, par pas de `step` minutes (15 par défaut), calée sur l'entrée la plus proche. ↑ / ↓ parcourent la liste, Page ↑ / Page ↓ sautent d'une heure, Entrée valide, Échap ferme. Bornes `minTime` / `maxTime` ; une saisie illisible ou hors bornes revient à la dernière heure valide. Valeur : chaîne « HH:mm ». `DateTimePicker` pose un DatePicker et un TimePicker côte à côte pour une valeur `Date`.",
      },
    },
  },
  args: { step: 15, density: "default", disabled: false, readOnly: false, placeholder: "hh:mm", minTime: "", maxTime: "" },
  argTypes: {
    step: { control: { type: "number", min: 5, max: 120, step: 5 } },
    density: { control: "inline-radio", options: ["default", "sm"] },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    placeholder: { control: "text" },
    minTime: { control: "text" },
    maxTime: { control: "text" },
    value: { table: { disable: true } },
    defaultValue: { table: { disable: true } },
    open: { table: { disable: true } },
  },
  render: ({ minTime, maxTime, ...args }) => (
    <Card width={260}>
      <Field label="Début">
        <TimePicker {...args} minTime={minTime || undefined} maxTime={maxTime || undefined} />
      </Field>
    </Card>
  ),
} satisfies Meta<typeof TimePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles. */
export const Playground: Story = {};

/**
 * `step` règle le pas de la liste (une heure tapée peut tomber entre deux pas) ;
 * `minTime` / `maxTime` bornent la liste et la saisie (ici les heures d'ouverture).
 */
export const PasEtBornes: Story = {
  name: "Pas et bornes",
  render: () => (
    <Row>
      <Card width={220}>
        <Field label="Toutes les 30 min" hint="De 08:00 à 20:00">
          <TimePicker step={30} minTime="08:00" maxTime="20:00" defaultValue="09:30" />
        </Field>
      </Card>
      <Card width={220}>
        <Field label="Toutes les 5 min" hint="Liste fine, saisie libre">
          <TimePicker step={5} defaultValue="14:35" />
        </Field>
      </Card>
    </Row>
  ),
};

/** `default` : 40 px, comme un Input. `sm` : 32 px, pour les barres de filtres et les tableaux. */
export const Tailles: Story = {
  render: () => (
    <Card width={300}>
      <Row label="default · 40">
        <div style={{ width: 140 }}>
          <TimePicker aria-label="Heure" defaultValue="09:00" />
        </div>
      </Row>
      <Row label="sm · 32">
        <div style={{ width: 120 }}>
          <TimePicker aria-label="Heure compacte" density="sm" defaultValue="09:00" />
        </div>
      </Row>
    </Card>
  ),
};

/** Vide, rempli, invalide (erreur du `Field`), lecture seule et désactivé. */
export const Etats: Story = {
  name: "États",
  render: () => (
    <Card width={260}>
      <Stack>
        <Field label="Vide">
          <TimePicker />
        </Field>
        <Field label="Rempli">
          <TimePicker defaultValue="14:30" />
        </Field>
        <Field label="Invalide" error="L'heure de fin doit suivre l'heure de début.">
          <TimePicker defaultValue="08:00" />
        </Field>
        <Field label="Lecture seule">
          <TimePicker defaultValue="12:00" readOnly />
        </Field>
        <Field label="Désactivé" disabled>
          <TimePicker defaultValue="18:15" />
        </Field>
      </Stack>
    </Card>
  ),
};

function SlotDemo() {
  const [start, setStart] = React.useState("09:00");
  const [end, setEnd] = React.useState("10:00");
  const invalid = Boolean(start && end && end <= start);
  return (
    <Card width={360}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Début">
          <TimePicker
            value={start}
            onValueChange={(next) => {
              setStart(next);
              // Comme Google Agenda : la fin suit le début en gardant la durée d'une heure.
              if (next && (!end || end <= next)) {
                const [h, m] = next.split(":").map(Number);
                setEnd(`${String(Math.min(23, h + 1)).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
              }
            }}
          />
        </Field>
        <Field label="Fin" error={invalid ? "Après le début." : undefined}>
          <TimePicker value={end} onValueChange={setEnd} minTime={start || undefined} />
        </Field>
      </div>
      <span style={{ fontSize: 13, color: "var(--ui-fg-2)" }}>
        Créneau : {start || "—"} → {end || "—"}
      </span>
    </Card>
  );
}

/**
 * Dans un `Field` : libellé, aide et erreur reliés au champ (`aria-invalid`,
 * `aria-describedby`). Valeurs contrôlées : la fin commence à l'heure de début
 * (`minTime`) et la suit quand le début la dépasse.
 */
export const DansUnField: Story = {
  name: "Dans un Field",
  render: () => <SlotDemo />,
};

function DateTimeDemo() {
  const [value, setValue] = React.useState<Date | undefined>();
  const [error, setError] = React.useState<string>();
  const today = new Date();
  return (
    <Card width={400}>
      <form
        style={{ display: "grid", gap: 18 }}
        onSubmit={(event) => {
          event.preventDefault();
          setError(value ? undefined : "Choisissez une date et une heure.");
        }}
      >
        <Field label="Rendez-vous" required hint="Du lundi au vendredi, de 08:00 à 18:00" error={error}>
          <DateTimePicker
            value={value}
            onValueChange={(next) => {
              setValue(next);
              setError(undefined);
            }}
            minDate={today}
            disabledDays={{ dayOfWeek: [0, 6] }}
            minTime="08:00"
            maxTime="18:00"
            step={30}
            defaultTime="09:00"
            clearable
          />
        </Field>
        <span style={{ fontSize: 13, color: "var(--ui-fg-2)" }}>
          {value ? longFormat.format(value) : "Aucun créneau choisi"}
        </span>
        <div>
          <Button type="submit">Réserver</Button>
        </div>
      </form>
    </Card>
  );
}

/**
 * `DateTimePicker` : DatePicker et TimePicker côte à côte, une seule valeur `Date`.
 * L'heure peut se saisir avant la date ; la valeur part dès que la date est connue
 * (à `defaultTime` si l'heure manque). Dans un `Field`, les deux contrôles s'annoncent
 * « Rendez-vous Date » et « Rendez-vous Heure » et partagent l'aide et l'erreur.
 */
export const DateEtHeure: Story = {
  name: "DateTimePicker",
  render: () => <DateTimeDemo />,
};

/** `DateTimePicker` compact (`density="sm"`) et désactivé. */
export const DateEtHeureEtats: Story = {
  name: "DateTimePicker · tailles et états",
  render: () => (
    <Card width={360}>
      <Stack>
        <Field label="Compact">
          <DateTimePicker density="sm" defaultValue={new Date(2026, 9, 12, 14, 30)} />
        </Field>
        <Field label="Invalide" error="Ce créneau est déjà pris.">
          <DateTimePicker defaultValue={new Date(2026, 9, 12, 9, 0)} />
        </Field>
        <Field label="Désactivé" disabled>
          <DateTimePicker defaultValue={new Date(2026, 9, 12, 9, 0)} />
        </Field>
      </Stack>
    </Card>
  ),
};

/** Aperçu ouvert : liste des heures calée sur la valeur (tests visuels). */
export const Ouvert: Story = {
  name: "Aperçu ouvert",
  tags: ["!autodocs"],
  render: () => (
    <div style={{ minHeight: 380 }}>
      <Card width={240}>
        <Field label="Début">
          <TimePicker defaultValue="14:30" defaultOpen />
        </Field>
      </Card>
    </div>
  ),
};
