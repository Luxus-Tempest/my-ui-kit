import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button, Field, Rating } from "@rovia/ui";
import { Flame, Heart, ThumbsUp } from "lucide-react";
import { Card, Row } from "../../_shared/demo";

const meta = {
  title: "Composants/Formulaire/Rating",
  component: Rating,
  tags: ["autodocs"],
  parameters: {
    registry: "rating",
    docs: {
      description: {
        component:
          "Note en étoiles, sémantique d'un groupe de boutons radio (comme MUI) : chaque valeur est une option nommée « 3 étoiles sur 5 », une seule tabulation pour tout le groupe. Aperçu au survol, clic pour noter, nouveau clic pour effacer (`allowClear`). Au clavier : → / ↑ et ← / ↓, Origine / Fin, Suppr pour effacer. Demi-étoiles (`precision={0.5}`), lecture seule pour une moyenne (fraction exacte, nommée « 4,3 étoiles sur 5 »), icône au choix. Étoiles pleines en or ambré (`--ui-c4` mêlé à `--ui-warn` pour tenir 3:1), vides au trait : plein et vide se distinguent aussi par la forme.",
      },
    },
  },
  args: {
    defaultValue: 3,
    max: 5,
    precision: 1,
    size: "default",
    readOnly: false,
    disabled: false,
    allowClear: true,
    "aria-label": "Note",
  },
  argTypes: {
    max: { control: { type: "number", min: 3, max: 10 } },
    precision: { control: "inline-radio", options: [1, 0.5] },
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    readOnly: { control: "boolean" },
    disabled: { control: "boolean" },
    allowClear: { control: "boolean" },
    defaultValue: { control: { type: "number", min: 0, max: 10, step: 0.5 } },
    value: { table: { disable: true } },
    icon: { table: { disable: true } },
    emptyIcon: { table: { disable: true } },
    getLabelText: { table: { disable: true } },
  },
  // La note initiale ne se relit qu'au montage : on remonte quand elle change.
  render: (args) => <Rating key={`${args.defaultValue}-${args.precision}-${args.max}`} {...args} />,
} satisfies Meta<typeof Rating>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles. */
export const Playground: Story = {};

/** 18 / 24 / 32 px. En `sm`, la cible tactile est élargie à 24 px. */
export const Tailles: Story = {
  render: () => (
    <>
      <Row label="sm · 18">
        <Rating size="sm" defaultValue={4} aria-label="Note, petite taille" />
      </Row>
      <Row label="default · 24">
        <Rating defaultValue={4} aria-label="Note, taille par défaut" />
      </Row>
      <Row label="lg · 32">
        <Rating size="lg" defaultValue={4} aria-label="Note, grande taille" />
      </Row>
    </>
  ),
};

/**
 * `precision={0.5}` : chaque étoile se coupe en deux moitiés cliquables, les flèches
 * avancent d'une demi-étoile. En lecture seule, une moyenne s'affiche à la fraction
 * près (4,3 remplit 30 % de la cinquième étoile) et se lit comme une image nommée.
 */
export const Precision: Story = {
  name: "Précision et lecture seule",
  render: () => (
    <>
      <Row label="Demi-étoiles">
        <Rating precision={0.5} defaultValue={3.5} aria-label="Note par demi-étoile" />
      </Row>
      <Row label="Moyenne 4,3">
        <Rating readOnly value={4.3} aria-label="Note moyenne" />
        <span style={{ fontSize: 13, color: "var(--ui-fg-2)" }}>4,3 · 128 avis</span>
      </Row>
      <Row label="Moyenne 2,7 · sm">
        <Rating readOnly value={2.7} size="sm" aria-label="Note moyenne" />
      </Row>
    </>
  ),
};

const appreciations = ["Médiocre", "Passable", "Bien", "Très bien", "Excellent"];

function HoverDemo() {
  const [value, setValue] = React.useState<number | null>(4);
  const [hover, setHover] = React.useState<number | null>(null);
  const shown = hover ?? value;
  return (
    <Row>
      <Rating value={value} onValueChange={setValue} onHoverChange={setHover} aria-label="Qualité" />
      <span style={{ minWidth: 80, fontSize: 13.5, fontWeight: 500, color: "var(--ui-fg-2)" }}>
        {shown ? appreciations[shown - 1] : "Pas encore noté"}
      </span>
    </Row>
  );
}

/**
 * Au survol, les étoiles prévisualisent la note et l'étoile visée grossit en ressort ;
 * `onHoverChange` permet d'afficher une appréciation. Recliquer la note l'efface.
 */
export const ApercuAuSurvol: Story = {
  name: "Aperçu au survol",
  render: () => <HoverDemo />,
};

/**
 * `icon` accepte un SVG au trait (`lucide-react`) : la partie pleine est remplie par
 * CSS, la vide reste au trait. `max` change le nombre d'icônes ; `getLabelText` le nom annoncé.
 */
export const IconePersonnalisee: Story = {
  name: "Icône personnalisée",
  render: () => (
    <>
      <Row label="Cœurs">
        <Rating icon={<Heart />} defaultValue={3} getLabelText={(v, max) => `${v} cœur${v >= 2 ? "s" : ""} sur ${max}`} aria-label="Coup de cœur" />
      </Row>
      <Row label="Pouces · 10">
        <Rating
          icon={<ThumbsUp />}
          max={10}
          size="sm"
          defaultValue={7}
          getLabelText={(v, max) => `${v} sur ${max}`}
          aria-label="Recommandation"
        />
      </Row>
      <Row label="Piment">
        <Rating icon={<Flame />} max={3} defaultValue={2} getLabelText={(v) => ["Doux", "Relevé", "Très épicé"][v - 1]} aria-label="Force" />
      </Row>
    </>
  ),
};

/** Désactivé, invalide (erreur du `Field` : les étoiles vides passent au rouge) et lecture seule. */
export const Etats: Story = {
  name: "États",
  render: () => (
    <Card width={360}>
      <Field label="Désactivé" disabled>
        <Rating defaultValue={2} />
      </Field>
      <Field label="Invalide" error="Donnez une note avant d'envoyer.">
        <Rating />
      </Field>
      <Field label="Lecture seule">
        <Rating readOnly value={4.5} />
      </Field>
    </Card>
  ),
};

function ReviewDemo() {
  const [note, setNote] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string>();
  const [sent, setSent] = React.useState(false);
  return (
    <Card width={380}>
      <form
        style={{ display: "grid", gap: 18 }}
        onSubmit={(event) => {
          event.preventDefault();
          if (note === null) setError("Donnez une note avant d'envoyer.");
          else setSent(true);
        }}
      >
        <Field label="Qualité du service" required hint="De 1 à 5 étoiles, par demi-étoile" error={error}>
          <Rating
            name="note"
            precision={0.5}
            size="lg"
            value={note}
            onValueChange={(value) => {
              setNote(value);
              setError(undefined);
              setSent(false);
            }}
          />
        </Field>
        <Field label="Note moyenne des clients">
          <Rating readOnly value={4.3} size="sm" />
        </Field>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button type="submit">Envoyer l'avis</Button>
          {sent && <span role="status" style={{ fontSize: 13, color: "var(--ui-ok)" }}>Merci pour votre avis !</span>}
        </div>
      </form>
    </Card>
  );
}

/**
 * Dans un `Field` : le groupe prend le libellé, l'aide et l'erreur ; un clic sur le
 * libellé donne le focus à la note choisie. `name` l'envoie avec le formulaire.
 */
export const DansUnField: Story = {
  name: "Dans un Field",
  render: () => <ReviewDemo />,
};
