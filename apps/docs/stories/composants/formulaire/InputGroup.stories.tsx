import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Field,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
  Kbd,
} from "@acme/ui";
import { CopyIcon, FilterIcon, SearchIcon } from "../../_shared/icons";

const meta = {
  title: "Composants/Formulaire/InputGroup",
  component: InputGroup,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Un champ et ses compléments (icône, préfixe, unité, raccourci, bouton) dans une seule surface, avec le remplissage, le focus et l'erreur d'un `Input`. `InputGroupAddon align` place un complément avant/après (`inline-start`, `inline-end`) ou au-dessus/au-dessous (`block-start`, `block-end`). Cliquer un complément place le curseur dans le champ.",
      },
    },
  },
} satisfies Meta<typeof InputGroup>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Icône de tête et raccourci clavier en fin de champ. */
export const Playground: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <InputGroup>
        <InputGroupAddon><SearchIcon /></InputGroupAddon>
        <InputGroupInput aria-label="Rechercher une facture" placeholder="Rechercher une facture" />
        <InputGroupAddon align="inline-end"><Kbd>⌘K</Kbd></InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

/** Préfixe et unité en texte d'appoint ; le groupe porte l'erreur de son champ. */
export const PrefixeEtUnite: Story = {
  name: "Préfixe et unité",
  render: () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 420 }}>
      <Field label="Site web" hint="Adresse publique de l'entreprise">
        <InputGroup>
          <InputGroupAddon><InputGroupText>https://</InputGroupText></InputGroupAddon>
          <InputGroupInput placeholder="exemple.ma" />
        </InputGroup>
      </Field>
      <Field label="Montant HT" error="Le montant doit être positif">
        <InputGroup>
          <InputGroupInput type="number" defaultValue={-120} />
          <InputGroupAddon align="inline-end"><InputGroupText>MAD</InputGroupText></InputGroupAddon>
        </InputGroup>
      </Field>
    </div>
  ),
};

/** Bouton intégré : fantôme et compact par défaut, ou tonal pour une action. */
export const AvecBouton: Story = {
  name: "Avec bouton",
  render: () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 420 }}>
      <Field label="Lien de partage">
        <InputGroup>
          <InputGroupInput readOnly value="https://nuage.exemple.ma/f/8Kq2" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-sm" aria-label="Copier le lien"><CopyIcon /></InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </Field>
      <InputGroup>
        <InputGroupAddon><FilterIcon /></InputGroupAddon>
        <InputGroupInput aria-label="Filtrer" placeholder="Filtrer par client" />
        <InputGroupAddon align="inline-end"><InputGroupButton variant="tonal">Appliquer</InputGroupButton></InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

function Composer() {
  const [message, setMessage] = React.useState("");
  return (
    <Field label="Commentaire">
      <InputGroup>
        <InputGroupTextarea
          autoResize
          placeholder="Ajouter un commentaire…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={280}
        />
        <InputGroupAddon align="block-end">
          <InputGroupText>{message.length} / 280</InputGroupText>
          <InputGroupButton variant="default" disabled={!message}>Publier</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}

/** Zone de texte avec barre d'outils dessous (compteur, envoi). */
export const ZoneDeTexteEtBarreDOutils: Story = {
  name: "Zone de texte et barre d'outils",
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <Composer />
    </div>
  ),
};
