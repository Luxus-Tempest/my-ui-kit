import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Toggle } from "@acme/ui";
import { Row } from "../../_shared/demo";
import { BoldIcon, InfoIcon, ItalicIcon, PinIcon, StarIcon, UnderlineIcon } from "../../_shared/icons";

const meta = {
  title: "Composants/Actions/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Bouton bascule à deux états (gras, épingler, afficher les détails). Géométrie d'un Button `ghost` ou `outline` ; enfoncé, il prend le conteneur de sélection (`--ui-pri-container`), comme une puce choisie de Drive. L'état est annoncé par `aria-pressed`. Pour un choix parmi plusieurs options, préférer **ToggleGroup**.",
      },
    },
  },
  args: { children: "Détails", variant: "ghost", size: "default", defaultPressed: false },
  argTypes: {
    variant: { control: "inline-radio", options: ["ghost", "outline"] },
    size: { control: "inline-radio", options: ["sm", "default", "icon", "icon-sm"] },
    defaultPressed: { control: "boolean" },
    disabled: { control: "boolean" },
    pressed: { table: { disable: true } },
    asChild: { table: { disable: true } },
  },
} satisfies Meta<typeof Toggle>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles. */
export const Playground: Story = {};

/** `ghost` dans une barre d'outils, `outline` quand la bascule est posée seule. */
export const Variantes: Story = {
  render: () => (
    <>
      <Row label="Fantôme">
        <Toggle><InfoIcon />Détails</Toggle>
        <Toggle defaultPressed><InfoIcon />Détails</Toggle>
      </Row>
      <Row label="Contour">
        <Toggle variant="outline"><PinIcon />Épingler</Toggle>
        <Toggle variant="outline" defaultPressed><PinIcon />Épinglé</Toggle>
      </Row>
    </>
  ),
};

/** 32 / 36 px ; les bascules icône sont des cercles et exigent un `aria-label`. */
export const Tailles: Story = {
  render: () => (
    <>
      <Row label="sm · 32">
        <Toggle size="sm" variant="outline"><StarIcon />Suivi</Toggle>
        <Toggle size="icon-sm" aria-label="Gras" defaultPressed><BoldIcon /></Toggle>
      </Row>
      <Row label="default · 36">
        <Toggle variant="outline"><StarIcon />Suivi</Toggle>
        <Toggle size="icon" aria-label="Gras" defaultPressed><BoldIcon /></Toggle>
      </Row>
    </>
  ),
};

/** Enfoncé : `aria-pressed="true"` et `data-state="on"`. Désactivé : `disabled` natif. */
export const Etats: Story = {
  name: "États",
  render: () => (
    <>
      <Row label="Relâché"><Toggle variant="outline">Afficher la grille</Toggle></Row>
      <Row label="Enfoncé"><Toggle variant="outline" defaultPressed>Afficher la grille</Toggle></Row>
      <Row label="Désactivé">
        <Toggle variant="outline" disabled>Afficher la grille</Toggle>
        <Toggle variant="outline" disabled defaultPressed>Afficher la grille</Toggle>
      </Row>
    </>
  ),
};

function FormatBar() {
  const [bold, setBold] = React.useState(true);
  return (
    <div style={{ display: "inline-flex", gap: 2, padding: 4, borderRadius: "var(--ui-r-pill)", background: "var(--ui-card-2)" }}>
      <Toggle size="icon-sm" aria-label="Gras" pressed={bold} onPressedChange={setBold}><BoldIcon /></Toggle>
      <Toggle size="icon-sm" aria-label="Italique"><ItalicIcon /></Toggle>
      <Toggle size="icon-sm" aria-label="Souligné"><UnderlineIcon /></Toggle>
    </div>
  );
}

/**
 * Contrôlé (`pressed` + `onPressedChange`) dans une barre de mise en forme.
 * Des bascules indépendantes restent des Toggle ; un choix exclusif est un ToggleGroup.
 */
export const Composition: Story = {
  render: () => <Row label="Barre d'outils"><FormatBar /></Row>,
};
