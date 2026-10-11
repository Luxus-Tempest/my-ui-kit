import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ToggleGroup, ToggleGroupItem } from "@acme/ui";
import { Row } from "../../_shared/demo";
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  GridIcon,
  ItalicIcon,
  ListIcon,
  UnderlineIcon,
} from "../../_shared/icons";

const meta = {
  title: "Composants/Actions/ToggleGroup",
  component: ToggleGroup,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Groupe de bascules : un choix exclusif (`type=\"single\"`, annoncé comme un groupe de boutons radio) ou plusieurs (`type=\"multiple\"`, barre d'outils). `segmented` est le segmented control d'iOS ; `outline` reprend les boutons pilule accolés du sélecteur de vue de Drive. Flèches pour se déplacer, Espace ou Entrée pour choisir.",
      },
    },
  },
  args: {
    type: "single",
    variant: "segmented",
    size: "default",
    defaultValue: "semaine",
    "aria-label": "Période",
  },
  argTypes: {
    type: { control: "inline-radio", options: ["single", "multiple"] },
    variant: { control: "inline-radio", options: ["segmented", "outline"] },
    size: { control: "inline-radio", options: ["sm", "default"] },
    disabled: { control: "boolean" },
    defaultValue: { control: false },
    value: { table: { disable: true } },
    asChild: { table: { disable: true } },
  },
  render: (args) => {
    const items = (
      <>
        <ToggleGroupItem value="jour">Jour</ToggleGroupItem>
        <ToggleGroupItem value="semaine">Semaine</ToggleGroupItem>
        <ToggleGroupItem value="mois">Mois</ToggleGroupItem>
      </>
    );
    // La forme de la valeur dépend de `type` : on remonte le groupe quand il change.
    return args.type === "multiple" ? (
      <ToggleGroup {...args} type="multiple" defaultValue={["semaine"]} key="multiple">{items}</ToggleGroup>
    ) : (
      <ToggleGroup {...args} type="single" defaultValue="semaine" key="single">{items}</ToggleGroup>
    );
  },
} satisfies Meta<typeof ToggleGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles. */
export const Playground: Story = {};

/**
 * `segmented` : piste grise en pilule, pastille surélevée sous l'élément actif.
 * `outline` : boutons accolés, l'actif sur le fond de sélection (`--ui-sel`).
 */
export const Variantes: Story = {
  render: () => (
    <>
      <Row label="Segmented">
        <ToggleGroup type="single" defaultValue="mois" aria-label="Période">
          <ToggleGroupItem value="jour">Jour</ToggleGroupItem>
          <ToggleGroupItem value="semaine">Semaine</ToggleGroupItem>
          <ToggleGroupItem value="mois">Mois</ToggleGroupItem>
        </ToggleGroup>
      </Row>
      <Row label="Contour">
        <ToggleGroup type="single" variant="outline" defaultValue="liste" aria-label="Affichage">
          <ToggleGroupItem value="liste" aria-label="Liste"><ListIcon /></ToggleGroupItem>
          <ToggleGroupItem value="grille" aria-label="Grille"><GridIcon /></ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="single" variant="outline" defaultValue="tous" aria-label="Filtre">
          <ToggleGroupItem value="tous">Tous</ToggleGroupItem>
          <ToggleGroupItem value="payes">Payés</ToggleGroupItem>
          <ToggleGroupItem value="impayes">Impayés</ToggleGroupItem>
        </ToggleGroup>
      </Row>
    </>
  ),
};

/** 36 px par défaut, 32 px en `sm` (barres d'outils, filtres denses). */
export const Tailles: Story = {
  render: () => (
    <>
      {(["sm", "default"] as const).map((size) => (
        <Row key={size} label={size === "sm" ? "sm · 32" : "default · 36"}>
          <ToggleGroup type="single" size={size} defaultValue="semaine" aria-label="Période">
            <ToggleGroupItem value="jour">Jour</ToggleGroupItem>
            <ToggleGroupItem value="semaine">Semaine</ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup type="single" variant="outline" size={size} defaultValue="liste" aria-label="Affichage">
            <ToggleGroupItem value="liste" aria-label="Liste"><ListIcon /></ToggleGroupItem>
            <ToggleGroupItem value="grille" aria-label="Grille"><GridIcon /></ToggleGroupItem>
          </ToggleGroup>
        </Row>
      ))}
    </>
  ),
};

/** Un élément ou tout le groupe peut être désactivé ; il est alors sauté au clavier. */
export const Etats: Story = {
  name: "États",
  render: () => (
    <>
      <Row label="Élément désactivé">
        <ToggleGroup type="single" defaultValue="jour" aria-label="Période">
          <ToggleGroupItem value="jour">Jour</ToggleGroupItem>
          <ToggleGroupItem value="semaine">Semaine</ToggleGroupItem>
          <ToggleGroupItem value="annee" disabled>Année</ToggleGroupItem>
        </ToggleGroup>
      </Row>
      <Row label="Groupe désactivé">
        <ToggleGroup type="single" variant="outline" defaultValue="liste" disabled aria-label="Affichage">
          <ToggleGroupItem value="liste" aria-label="Liste"><ListIcon /></ToggleGroupItem>
          <ToggleGroupItem value="grille" aria-label="Grille"><GridIcon /></ToggleGroupItem>
        </ToggleGroup>
      </Row>
    </>
  ),
};

function Editor() {
  const [styles, setStyles] = React.useState<string[]>(["gras"]);
  const [align, setAlign] = React.useState("gauche");
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <ToggleGroup type="multiple" variant="outline" size="sm" value={styles} onValueChange={setStyles} aria-label="Style du texte">
          <ToggleGroupItem value="gras" aria-label="Gras"><BoldIcon /></ToggleGroupItem>
          <ToggleGroupItem value="italique" aria-label="Italique"><ItalicIcon /></ToggleGroupItem>
          <ToggleGroupItem value="souligne" aria-label="Souligné"><UnderlineIcon /></ToggleGroupItem>
        </ToggleGroup>
        {/* Contrôlé : on refuse la désélection pour garder toujours un alignement. */}
        <ToggleGroup type="single" variant="outline" size="sm" value={align} onValueChange={(v) => v && setAlign(v)} aria-label="Alignement">
          <ToggleGroupItem value="gauche" aria-label="Aligner à gauche"><AlignLeftIcon /></ToggleGroupItem>
          <ToggleGroupItem value="centre" aria-label="Centrer"><AlignCenterIcon /></ToggleGroupItem>
          <ToggleGroupItem value="droite" aria-label="Aligner à droite"><AlignRightIcon /></ToggleGroupItem>
        </ToggleGroup>
      </div>
      <p
        style={{
          margin: 0,
          fontWeight: styles.includes("gras") ? 600 : 400,
          fontStyle: styles.includes("italique") ? "italic" : "normal",
          textDecoration: styles.includes("souligne") ? "underline" : "none",
          textAlign: align === "gauche" ? "left" : align === "centre" ? "center" : "right",
          color: "var(--ui-fg-2)",
        }}
      >
        Facture n° 2026-0142, échéance au 30 novembre.
      </p>
    </div>
  );
}

/**
 * `type="multiple"` pour des styles cumulables, `type="single"` contrôlé pour un
 * choix exclusif (`onValueChange` reçoit `""` à la désélection : à filtrer si
 * une valeur est obligatoire).
 */
export const Composition: Story = {
  render: () => <Editor />,
};
