import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button, ChatComposer, Field, Text, type ChatComposerProps } from "@acme/ui";
import { Camera, Paperclip, Smile } from "lucide-react";
import { Card } from "../../_shared/demo";

/** Démonstration : la zone de saisie et la liste de ce qui est parti. */
function ComposerDemo(props: ChatComposerProps) {
  const [envois, setEnvois] = React.useState<string[]>([]);
  return (
    <Card width={460}>
      <ChatComposer
        {...props}
        onSend={(text) => {
          setEnvois((list) => [text, ...list].slice(0, 3));
          return props.onSend?.(text);
        }}
      />
      <Text size={12.5} tone="subtle" style={{ whiteSpace: "pre-wrap" }}>
        {envois.length ? `Envoyé : ${envois[0]}` : "Entrée envoie, Maj+Entrée va à la ligne."}
      </Text>
    </Card>
  );
}

const Actions = () => (
  <>
    <Button variant="ghost" size="icon" aria-label="Joindre un fichier"><Paperclip /></Button>
    <Button variant="ghost" size="icon" aria-label="Prendre une photo"><Camera /></Button>
  </>
);

const meta = {
  title: "Composants/Messagerie/ChatComposer",
  component: ChatComposer,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Zone de saisie d'une conversation : le champ grandit avec le texte (160 px au plus, puis il défile), le bouton d'envoi rond s'active dès qu'il y a du texte. Entrée envoie, Maj+Entrée va à la ligne, la composition IME n'est jamais interrompue. Après l'envoi, le champ se vide et garde le focus. `onSend` peut renvoyer une promesse : envoi en attente, puis champ vidé (ou texte conservé si elle est rejetée).",
      },
    },
  },
  args: {
    placeholder: "Écrire un message…",
    sendLabel: "Envoyer",
    sendOnEnter: true,
    sending: false,
    disabled: false,
  },
  argTypes: {
    actions: { control: false },
    value: { control: false },
    defaultValue: { control: "text" },
  },
  render: (args) => <ComposerDemo {...args} />,
} satisfies Meta<typeof ChatComposer>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles. */
export const Playground: Story = {};

/** `actions` : boutons fantômes à gauche du champ (pièce jointe, photo, emoji). */
export const AvecActions: Story = {
  name: "Avec actions",
  render: (args) => (
    <ComposerDemo
      {...args}
      actions={
        <>
          <Actions />
          <Button variant="ghost" size="icon" aria-label="Insérer un emoji"><Smile /></Button>
        </>
      }
    />
  ),
};

/**
 * `onSend` renvoie une promesse (ici 1,2 s) : le bouton passe en attente et le champ en
 * lecture seule, sans perdre le focus ; le texte part à la résolution.
 */
export const EnvoiAsynchrone: Story = {
  name: "Envoi asynchrone",
  render: (args) => (
    <ComposerDemo {...args} actions={<Actions />} onSend={() => new Promise((resolve) => setTimeout(resolve, 1200))} />
  ),
};

/** Texte long : le champ grandit jusqu'à 160 px, puis défile. */
export const TexteLong: Story = {
  name: "Texte long",
  args: {
    defaultValue:
      "Bonjour Inès,\nJ'ai relu le budget 2027 : deux remarques sur les charges de Tanger et une question sur l'onglet Marrakech.\nOn en parle jeudi ?\nBonne journée,\nYoussef",
  },
};

/** États : envoi piloté de l'extérieur (`sending`) et désactivé. */
export const Etats: Story = {
  name: "États",
  render: (args) => (
    <div style={{ display: "grid", gap: 16 }}>
      <ComposerDemo {...args} defaultValue="Message en cours d'envoi" sending />
      <ComposerDemo {...args} disabled placeholder="Conversation archivée" />
    </div>
  ),
};

/** Dans un `Field` : le libellé et l'aide sont reliés au champ, qui perd son nom par défaut. */
export const DansUnField: Story = {
  name: "Dans un Field",
  render: (args) => (
    <Card width={460}>
      <Field label="Réponse au client" hint="Visible par le client dans son espace.">
        <ChatComposer {...args} />
      </Field>
    </Card>
  ),
};
