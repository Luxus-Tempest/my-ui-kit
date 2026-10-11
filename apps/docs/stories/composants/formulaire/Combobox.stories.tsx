import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Combobox, Field, type ComboboxOption } from "@acme/ui";
import { Card, Row } from "../../_shared/demo";
import { ClockIcon, CloudIcon, FileIcon, FolderIcon, GridIcon, StarIcon } from "../../_shared/icons";

const villes: ComboboxOption[] = [
  { value: "cas", label: "Casablanca", group: "Maroc" },
  { value: "rba", label: "Rabat", group: "Maroc" },
  { value: "mrk", label: "Marrakech", group: "Maroc" },
  { value: "tng", label: "Tanger", group: "Maroc" },
  { value: "fes", label: "Fès", group: "Maroc", disabled: true },
  { value: "par", label: "Paris", group: "France" },
  { value: "lyo", label: "Lyon", group: "France" },
  { value: "mrs", label: "Marseille", group: "France" },
  { value: "bru", label: "Bruxelles", group: "Belgique" },
];

const emplacements: ComboboxOption[] = [
  { value: "drive", label: "Mon Drive", description: "Fichiers personnels", icon: <CloudIcon /> },
  { value: "partages", label: "Partagés avec moi", description: "12 dossiers", icon: <FolderIcon /> },
  { value: "recents", label: "Récents", description: "Ouverts cette semaine", icon: <ClockIcon /> },
  { value: "suivis", label: "Suivis", description: "Marqués d'une étoile", icon: <StarIcon /> },
  { value: "modeles", label: "Modèles", description: "Lecture seule", icon: <GridIcon />, disabled: true },
  { value: "archives", label: "Archives", description: "Avant 2024", icon: <FileIcon /> },
];

/** Empile des champs avec l'espacement d'un formulaire. */
const Stack = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "grid", gap: 18 }}>{children}</div>
);

const meta = {
  title: "Composants/Formulaire/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Liste déroulante avec recherche, pour choisir parmi beaucoup d'options (au-delà d'une quinzaine, quand `Select` devient long à parcourir). Déclencheur au gabarit du Select, liste filtrée à la frappe dans un panneau de sa largeur, groupes, descriptions et icônes. En `multiple`, les choix deviennent des puces retirables, puis un résumé « 3 sélectionnés ».",
      },
    },
  },
  args: {
    options: villes,
    placeholder: "Choisir une ville",
    searchPlaceholder: "Rechercher une ville…",
    emptyText: "Aucun résultat",
    density: "default",
    disabled: false,
  },
  argTypes: {
    density: { control: "inline-radio", options: ["default", "sm"] },
    disabled: { control: "boolean" },
    multiple: { control: "boolean" },
    maxChips: { control: { type: "number", min: 0, max: 6 } },
    placeholder: { control: "text" },
    searchPlaceholder: { control: "text" },
    emptyText: { control: "text" },
    options: { control: "object" },
    value: { table: { disable: true } },
    defaultValue: { table: { disable: true } },
  },
} satisfies Meta<typeof Combobox>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles. */
export const Playground: Story = {
  render: (args) => (
    <Card width={340}>
      <Field label="Ville">
        <Combobox {...args} />
      </Field>
    </Card>
  ),
};

/**
 * Options groupées (`group`), avec description et icône. Les entrées désactivées
 * restent visibles mais sont sautées au clavier. La coche marque la valeur choisie.
 */
export const Variantes: Story = {
  render: () => (
    <Row>
      <Card width={320}>
        <Field label="Ville">
          <Combobox options={villes} defaultValue="rba" placeholder="Choisir une ville" />
        </Field>
      </Card>
      <Card width={320}>
        <Field label="Emplacement">
          <Combobox options={emplacements} placeholder="Choisir un emplacement" searchPlaceholder="Rechercher un emplacement…" />
        </Field>
      </Card>
    </Row>
  ),
};

function MultipleDemo({ maxChips }: { maxChips?: number }) {
  const [value, setValue] = React.useState<string[]>(["par", "cas"]);
  return (
    <Field label="Villes desservies" hint={`${value.length} ville(s)`}>
      <Combobox multiple options={villes} value={value} onValueChange={setValue} maxChips={maxChips} placeholder="Ajouter des villes" />
    </Field>
  );
}

/**
 * `multiple` : la liste reste ouverte, chaque entrée se coche. Jusqu'à `maxChips`
 * (2 par défaut) les choix sont des puces retirables ; au-delà, un résumé.
 * Retour arrière sur le déclencheur retire le dernier choix.
 */
export const Multiple: Story = {
  render: () => (
    <Row>
      <Card width={340}><MultipleDemo /></Card>
      <Card width={340}><MultipleDemo maxChips={4} /></Card>
    </Row>
  ),
};

/** `default` : 40 px, comme un Select. `sm` : 32 px, pour les barres de filtres. */
export const Tailles: Story = {
  render: () => (
    <Card width={360}>
      <Row label="default · 40">
        <div style={{ flex: 1 }}><Combobox aria-label="Ville" options={villes} defaultValue="par" /></div>
      </Row>
      <Row label="sm · 32">
        <div style={{ flex: 1 }}><Combobox aria-label="Ville" options={villes} density="sm" defaultValue="par" /></div>
      </Row>
      <Row label="sm · multiple">
        <div style={{ flex: 1 }}><Combobox aria-label="Villes" multiple options={villes} density="sm" defaultValue={["par", "lyo"]} /></div>
      </Row>
    </Card>
  ),
};

/** Vide, rempli, invalide (erreur du `Field`) et désactivé. */
export const Etats: Story = {
  name: "États",
  render: () => (
    <Card width={340}>
      <Stack>
        <Field label="Vide"><Combobox options={villes} placeholder="Choisir une ville" /></Field>
        <Field label="Rempli"><Combobox options={villes} defaultValue="mrk" /></Field>
        <Field label="Invalide" error="Choisissez une ville de livraison.">
          <Combobox options={villes} placeholder="Choisir une ville" />
        </Field>
        <Field label="Désactivé" disabled><Combobox options={villes} defaultValue="tng" /></Field>
      </Stack>
    </Card>
  ),
};

function FormDemo() {
  const [ville, setVille] = React.useState("");
  const [dossiers, setDossiers] = React.useState<string[]>([]);
  return (
    <Card width={380}>
      <Stack>
        <Field label="Ville de livraison" required hint={ville ? `Code : ${ville}` : "Tapez pour filtrer"}>
          <Combobox options={villes} value={ville} onValueChange={setVille} placeholder="Choisir une ville" />
        </Field>
        <Field label="Partager dans" hint="Plusieurs emplacements possibles">
          <Combobox
            multiple
            options={emplacements}
            value={dossiers}
            onValueChange={setDossiers}
            placeholder="Choisir des emplacements"
            searchPlaceholder="Rechercher un emplacement…"
          />
        </Field>
      </Stack>
    </Card>
  );
}

/**
 * Dans un `Field` : libellé, aide, erreur et caractère obligatoire reliés au
 * déclencheur (`aria-describedby`, `aria-invalid`, `aria-required`). Valeurs contrôlées.
 */
export const Composition: Story = {
  render: () => <FormDemo />,
};
