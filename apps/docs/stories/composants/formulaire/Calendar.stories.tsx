import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Calendar, Field, type DateRange } from "@rovia/ui";
import { Card, Row } from "../../_shared/demo";

const meta = {
  title: "Composants/Formulaire/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: {
    registry: "calendar",
    docs: {
      description: {
        component:
          "Grille mensuelle pour choisir un jour, plusieurs jours ou une plage, posée à plat dans une page ou un panneau. Pour un champ de formulaire, préférer `DatePicker`. Enveloppe de DayPicker v9 : français et semaine au lundi par défaut, jours en cercles de 36 px, sélection en disque primaire, plage en bande de sélection arrondie. Toutes les props de DayPicker sont transmises.",
      },
    },
  },
  args: { mode: "single", numberOfMonths: 1, showWeekNumber: false, fixedWeeks: false, animate: false },
  argTypes: {
    mode: { control: "inline-radio", options: ["single", "multiple", "range"] },
    numberOfMonths: { control: { type: "number", min: 1, max: 3 } },
    showOutsideDays: { control: "boolean" },
    showWeekNumber: { control: "boolean" },
    fixedWeeks: { control: "boolean" },
    animate: { control: "boolean" },
    navLayout: { control: "inline-radio", options: [undefined, "around", "after"] },
    captionLayout: { control: "inline-radio", options: ["label", "dropdown", "dropdown-months", "dropdown-years"] },
    selected: { table: { disable: true } },
    onSelect: { table: { disable: true } },
    components: { table: { disable: true } },
    classNames: { table: { disable: true } },
    formatters: { table: { disable: true } },
    labels: { table: { disable: true } },
    locale: { table: { disable: true } },
  },
} satisfies Meta<typeof Calendar>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles (sélection non contrôlée). */
export const Playground: Story = {
  render: (args) => (
    <Card width={360}>
      <Calendar {...args} />
    </Card>
  ),
};

function SingleDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  return <Calendar mode="single" selected={date} onSelect={setDate} />;
}

function MultipleDemo() {
  const [dates, setDates] = React.useState<Date[] | undefined>();
  return <Calendar mode="multiple" selected={dates} onSelect={setDates} max={5} />;
}

function RangeDemo({ months = 1 }: { months?: number }) {
  const today = new Date();
  const [range, setRange] = React.useState<DateRange | undefined>({
    from: new Date(today.getFullYear(), today.getMonth(), 8),
    to: new Date(today.getFullYear(), today.getMonth(), 17),
  });
  return <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={months} />;
}

/**
 * `single` : un jour (disque primaire). `multiple` : plusieurs jours, ici 5 au plus.
 * `range` : début et fin en disque, jours intermédiaires sur la bande de sélection,
 * arrondie à chaque extrémité et à chaque retour de semaine.
 */
export const Modes: Story = {
  render: () => (
    <Row>
      <Card width={340}><SingleDemo /></Card>
      <Card width={340}><MultipleDemo /></Card>
      <Card width={340}><RangeDemo /></Card>
    </Row>
  ),
};

/** Plusieurs mois côte à côte : la navigation reste en haut à droite, les jours hors mois sont masqués. */
export const PlusieursMois: Story = {
  name: "Plusieurs mois",
  render: () => (
    <Card width={660}>
      <RangeDemo months={2} />
    </Card>
  ),
};

/**
 * Aujourd'hui : chiffre primaire en 600. Jours désactivés par `disabled` (ici les
 * week-ends et le passé) ; navigation bornée par `startMonth` / `endMonth`.
 */
export const Etats: Story = {
  name: "États",
  render: () => {
    const today = new Date();
    return (
      <Row>
        <Card width={340}>
          <Calendar mode="single" disabled={[{ dayOfWeek: [0, 6] }, { before: today }]} />
        </Card>
        <Card width={340}>
          <Calendar
            mode="single"
            startMonth={new Date(today.getFullYear(), today.getMonth() - 1)}
            endMonth={new Date(today.getFullYear(), today.getMonth() + 1)}
            footer="Navigation limitée à trois mois."
          />
        </Card>
      </Row>
    );
  },
};

/** Variantes d'en-tête : boutons autour du libellé (`navLayout="around"`) ou listes de mois et d'année. */
export const EnTete: Story = {
  name: "En-tête",
  render: () => (
    <Row>
      <Card width={340}><Calendar mode="single" navLayout="around" /></Card>
      <Card width={340}><Calendar mode="single" captionLayout="dropdown" showWeekNumber /></Card>
    </Row>
  ),
};

function FieldDemo() {
  const [dates, setDates] = React.useState<Date[] | undefined>();
  return (
    <Card width={360}>
      <Field id="fermeture" label="Jours de fermeture" hint={`${dates?.length ?? 0} jour(s) choisi(s)`}>
        <div role="group" aria-labelledby="fermeture-label" aria-describedby="fermeture-hint">
          <Calendar mode="multiple" selected={dates} onSelect={setDates} />
        </div>
      </Field>
    </Card>
  );
}

/**
 * Dans un `Field`, posé à plat dans un formulaire : un groupe nommé par le libellé
 * du champ et décrit par son aide. Pour un champ compact, utiliser `DatePicker`.
 */
export const DansUnField: Story = {
  name: "Dans un Field",
  render: () => <FieldDemo />,
};
