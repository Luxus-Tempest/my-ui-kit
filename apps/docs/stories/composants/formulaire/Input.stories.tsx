import type { Meta, StoryObj } from "@storybook/react";
import { Field, Input, Textarea } from "@rovia/ui";
import { Row } from "../../_shared/demo";

const meta = {
  title: "Composants/Formulaire/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: {
    registry: "input",
    docs: {
      description: {
        component:
          "Champ de saisie : remplissage tonal au repos (barre de recherche de Drive, champs d'iOS), surface claire, filet primaire et halo au focus. 40 px (`density=\"sm\"` : 32 px). L'erreur se pose avec `aria-invalid` — ou mieux, avec `Field error`. `Textarea` partage la même surface.",
      },
    },
  },
  args: { placeholder: "Rechercher un document", density: "default", disabled: false, readOnly: false, "aria-label": "Exemple" },
  argTypes: {
    density: { control: "inline-radio", options: ["default", "sm"] },
    type: { control: "select", options: ["text", "email", "password", "number", "search", "tel", "url", "file"] },
  },
  render: (args) => (
    <div style={{ maxWidth: 320 }}>
      <Input {...args} />
    </div>
  ),
} satisfies Meta<typeof Input>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Chaque état a sa lecture : invalide, lecture seule (sélectionnable), désactivé. */
export const Etats: Story = {
  name: "États",
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <Row label="Défaut · 40"><Input aria-label="Défaut" placeholder="Rechercher un document" style={{ width: 260 }} /></Row>
      <Row label="sm · 32"><Input aria-label="Compact" density="sm" placeholder="Filtrer" style={{ width: 200 }} /></Row>
      <Row label="Invalide"><Input aria-label="Invalide" aria-invalid="true" defaultValue="contact@" style={{ width: 260 }} /></Row>
      <Row label="Lecture seule"><Input aria-label="Lecture seule" readOnly defaultValue="FAC-2026-00412" style={{ width: 260 }} /></Row>
      <Row label="Désactivé"><Input aria-label="Désactivé" disabled defaultValue="Verrouillé" style={{ width: 260 }} /></Row>
      <Row label="Fichier"><Input aria-label="Fichier" type="file" style={{ width: 300 }} /></Row>
    </div>
  ),
};

/** Zone de texte : même surface ; `autoResize` fait suivre la hauteur au contenu. */
export const ZoneDeTexte: Story = {
  name: "Zone de texte (Textarea)",
  render: () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 420 }}>
      <Field label="Notes internes" hint="Visibles uniquement par l'équipe.">
        <Textarea placeholder="Contact privilégié, horaires de livraison…" />
      </Field>
      <Field label="Message" hint="La hauteur suit le contenu (autoResize).">
        <Textarea autoResize rows={2} placeholder="Écrivez…" />
      </Field>
    </div>
  ),
};

/** Dans un `Field`, libellé, aide et erreur sont reliés automatiquement. */
export const DansUnField: Story = {
  name: "Dans un Field",
  render: () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 320 }}>
      <Field label="Adresse e-mail" required hint="Pour l'envoi des factures">
        <Input type="email" placeholder="compta@exemple.ma" />
      </Field>
      <Field label="Téléphone" error="Le numéro doit commencer par +212.">
        <Input type="tel" defaultValue="0612" />
      </Field>
    </div>
  ),
};
