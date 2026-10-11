import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Field, Slider } from "@acme/ui";
import { Card, Row } from "../../_shared/demo";

const fmt = new Intl.NumberFormat("fr-FR");

const meta = {
  title: "Composants/Formulaire/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Choisit une valeur ou une plage dans un intervalle continu (volume, remise, fourchette de prix). Proportions d'iOS : piste de 4 px, pastille de 24 px qui grossit à la saisie. Chaque pastille est un `slider` nommé (« Minimum » / « Maximum » pour une plage) ; dans un `Field`, elle reprend le libellé, l'aide et l'erreur du champ. Pour une valeur exacte, préférer **NumberInput**.",
      },
    },
  },
  args: { defaultValue: [40], min: 0, max: 100, step: 1, "aria-label": "Volume" },
  argTypes: {
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    disabled: { control: "boolean" },
    "aria-invalid": { control: "boolean" },
    marks: { control: "object" },
    thumbLabels: { control: "object" },
    defaultValue: { control: "object" },
    value: { table: { disable: true } },
    asChild: { table: { disable: true } },
  },
} satisfies Meta<typeof Slider>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles. */
export const Playground: Story = {
  decorators: [(Story) => <div style={{ width: 320, maxWidth: "100%" }}><Story /></div>],
};

function RangeDemo() {
  const [range, setRange] = React.useState([1500, 6000]);
  return (
    <div style={{ display: "grid", gap: 8, width: 320 }}>
      <Slider value={range} onValueChange={setRange} min={0} max={10000} step={100} aria-label="Prix" />
      <span style={{ fontSize: 13, color: "var(--ui-fg-2)", fontVariantNumeric: "tabular-nums" }}>
        {fmt.format(range[0] ?? 0)} – {fmt.format(range[1] ?? 0)} MAD
      </span>
    </div>
  );
}

/**
 * Une valeur ou une plage : autant de pastilles que de valeurs. Les pastilles
 * d'une plage s'appellent « Prix Minimum » et « Prix Maximum » (`thumbLabels` pour changer).
 */
export const Variantes: Story = {
  render: () => (
    <>
      <Row label="Valeur"><div style={{ width: 320 }}><Slider defaultValue={[60]} aria-label="Luminosité" /></div></Row>
      <Row label="Plage"><RangeDemo /></Row>
    </>
  ),
};

/** `marks` pose des graduations sous la piste, formatées en fr-FR. */
export const Graduations: Story = {
  render: () => (
    <>
      <Row label="Remise (%)">
        <div style={{ width: 320 }}>
          <Slider defaultValue={[20]} max={50} step={5} marks={[0, 10, 20, 30, 40, 50]} aria-label="Remise" />
        </div>
      </Row>
      <Row label="Budget">
        <div style={{ width: 320 }}>
          <Slider defaultValue={[2000, 8000]} max={10000} step={500} marks={[0, 2500, 5000, 7500, 10000]} aria-label="Budget" />
        </div>
      </Row>
    </>
  ),
};

/** Invalide (plage et halo rouges, `aria-invalid` sur chaque pastille) et désactivé (pastilles hors tabulation). */
export const Etats: Story = {
  name: "États",
  render: () => (
    <>
      <Row label="Invalide"><div style={{ width: 320 }}><Slider defaultValue={[90]} aria-label="Seuil" aria-invalid /></div></Row>
      <Row label="Désactivé"><div style={{ width: 320 }}><Slider defaultValue={[30, 70]} aria-label="Plage" disabled /></div></Row>
    </>
  ),
};

/** Dans un `Field` : libellé (`aria-labelledby` sur chaque pastille), aide et erreur reliées. */
export const DansUnField: Story = {
  name: "Dans un Field",
  render: () => (
    <Card>
      <Field label="Fourchette de prix" hint="En dirhams, hors taxes">
        <Slider defaultValue={[1000, 4000]} max={5000} step={100} marks={[0, 2500, 5000]} />
      </Field>
      <Field label="Taux de TVA" error="Le taux doit être inférieur à 20 %">
        <Slider defaultValue={[25]} max={30} />
      </Field>
    </Card>
  ),
};

/** Vertical (volume, niveau) : minimum en bas, graduations à droite ; flèches haut / bas. */
export const Vertical: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 48, height: 200 }}>
      <Slider orientation="vertical" defaultValue={[60]} aria-label="Volume" />
      <Slider orientation="vertical" defaultValue={[20, 70]} marks={[0, 50, 100]} aria-label="Plage" />
    </div>
  ),
};
