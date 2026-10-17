import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button, Field, NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@rovia/ui";
import { Card, Row } from "../../_shared/demo";

const Pays = () => (
  <>
    <NativeSelectOption value="ma">Maroc</NativeSelectOption>
    <NativeSelectOption value="fr">France</NativeSelectOption>
    <NativeSelectOption value="be">Belgique</NativeSelectOption>
    <NativeSelectOption value="sn">Sénégal</NativeSelectOption>
    <NativeSelectOption value="tn" disabled>
      Tunisie (bientôt)
    </NativeSelectOption>
  </>
);

const meta = {
  title: "Composants/Formulaire/NativeSelect",
  component: NativeSelect,
  tags: ["autodocs"],
  parameters: {
    registry: "native-select",
    docs: {
      description: {
        component:
          "Le vrai `<select>` du navigateur, au gabarit du déclencheur de Select : remplissage tonal, 40 px (32 px en `sm`), chevron, filet primaire et halo au focus. La liste ouverte est celle du système (roue d'iOS, feuille d'Android) : le bon choix sur mobile, dans un formulaire simple ou sans JavaScript. `placeholder` ajoute une première option vide et non sélectionnable. Pour des options riches (icônes, descriptions, recherche), préférer `Select` ou `Combobox`.",
      },
    },
  },
  args: { density: "default", disabled: false, placeholder: "Choisir un pays", "aria-label": "Pays" },
  argTypes: {
    density: { control: "inline-radio", options: ["default", "sm"] },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    placeholder: { control: "text" },
    value: { table: { disable: true } },
    defaultValue: { table: { disable: true } },
  },
  render: (args) => (
    <div style={{ width: 260 }}>
      <NativeSelect {...args}>
        <Pays />
      </NativeSelect>
    </div>
  ),
} satisfies Meta<typeof NativeSelect>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles. */
export const Playground: Story = {};

/** 40 px par défaut, comme un Input ; 32 px en `density="sm"` (barres d'outils, filtres). */
export const Tailles: Story = {
  render: () => (
    <>
      <Row label="default · 40">
        <div style={{ width: 220 }}>
          <NativeSelect aria-label="Période" defaultValue="30">
            <NativeSelectOption value="7">7 derniers jours</NativeSelectOption>
            <NativeSelectOption value="30">30 derniers jours</NativeSelectOption>
            <NativeSelectOption value="365">12 derniers mois</NativeSelectOption>
          </NativeSelect>
        </div>
      </Row>
      <Row label="sm · 32">
        <div style={{ width: 180 }}>
          <NativeSelect aria-label="Période compacte" density="sm" defaultValue="30">
            <NativeSelectOption value="7">7 derniers jours</NativeSelectOption>
            <NativeSelectOption value="30">30 derniers jours</NativeSelectOption>
          </NativeSelect>
        </div>
      </Row>
    </>
  ),
};

/** `NativeSelectOptGroup` : des intitulés de groupe, dessinés par le système. */
export const Groupes: Story = {
  name: "Groupes d'options",
  render: () => (
    <div style={{ width: 260 }}>
      <NativeSelect aria-label="Journal" defaultValue="bq">
        <NativeSelectOptGroup label="Journaux">
          <NativeSelectOption value="ach">Achats</NativeSelectOption>
          <NativeSelectOption value="ven">Ventes</NativeSelectOption>
          <NativeSelectOption value="bq">Banque</NativeSelectOption>
        </NativeSelectOptGroup>
        <NativeSelectOptGroup label="Divers">
          <NativeSelectOption value="od">Opérations diverses</NativeSelectOption>
          <NativeSelectOption value="an" disabled>
            À nouveaux (clôturé)
          </NativeSelectOption>
        </NativeSelectOptGroup>
      </NativeSelect>
    </div>
  ),
};

/** Indication (texte tertiaire), rempli, invalide (erreur du `Field`) et désactivé. */
export const Etats: Story = {
  name: "États",
  render: () => (
    <Card width={320}>
      <Field label="Indication">
        <NativeSelect placeholder="Choisir un pays">
          <Pays />
        </NativeSelect>
      </Field>
      <Field label="Rempli">
        <NativeSelect defaultValue="ma">
          <Pays />
        </NativeSelect>
      </Field>
      <Field label="Invalide" error="Choisissez un pays.">
        <NativeSelect placeholder="Choisir un pays">
          <Pays />
        </NativeSelect>
      </Field>
      <Field label="Désactivé" disabled>
        <NativeSelect defaultValue="fr">
          <Pays />
        </NativeSelect>
      </Field>
    </Card>
  ),
};

function FormDemo() {
  const [error, setError] = React.useState<string>();
  return (
    <Card width={340}>
      <form
        noValidate
        style={{ display: "grid", gap: 18 }}
        onSubmit={(event) => {
          event.preventDefault();
          const pays = new FormData(event.currentTarget).get("pays");
          setError(pays ? undefined : "Choisissez un pays de facturation.");
        }}
      >
        <Field label="Pays" required hint="Pays de facturation" error={error}>
          <NativeSelect name="pays" placeholder="Choisir un pays" onChange={() => setError(undefined)}>
            <Pays />
          </NativeSelect>
        </Field>
        <Field label="Devise">
          <NativeSelect name="devise" defaultValue="mad">
            <NativeSelectOption value="mad">Dirham (MAD)</NativeSelectOption>
            <NativeSelectOption value="eur">Euro (EUR)</NativeSelectOption>
            <NativeSelectOption value="usd">Dollar (USD)</NativeSelectOption>
          </NativeSelect>
        </Field>
        <div>
          <Button type="submit">Continuer</Button>
        </div>
      </form>
    </Card>
  );
}

/**
 * Dans un `Field` : libellé, aide et erreur reliés au `<select>` (`aria-invalid`,
 * `aria-describedby`). La valeur part avec le formulaire sous son `name`, sans état React.
 */
export const DansUnField: Story = {
  name: "Dans un Field",
  render: () => <FormDemo />,
};
