import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback, Message, MessageAttachment, MessageGroup, Text } from "@acme/ui";
import { FileText, FileSpreadsheet } from "lucide-react";

// Image de démonstration (données, pas un jeton de style).
const tableau =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 180'><rect width='240' height='180' fill='#e9edf2'/><rect x='18' y='18' width='204' height='132' rx='6' fill='#ffffff' stroke='#c9d1db' stroke-width='3'/><path d='M40 50h90M40 70h120M40 90h70' stroke='#2a78d6' stroke-width='5' stroke-linecap='round'/><path d='M150 120l18-26 16 14 20-32' fill='none' stroke='#eb6834' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/></svg>`,
  );

const heure = (h: number, m: number) => {
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date;
};

/** Colonne de conversation : largeur d'un téléphone, fond du panneau. */
const Column = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: 12,
      maxWidth: 440,
      padding: 16,
      borderRadius: "var(--ui-r-xl)",
      background: "var(--ui-panel)",
    }}
  >
    {children}
  </div>
);

const Ines = <Avatar><AvatarFallback name="Inès Benali" /></Avatar>;

const meta = {
  title: "Composants/Messagerie/Message",
  component: Message,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Une bulle de conversation. Envoyée (`from=\"me\"`) : primaire pleine à droite. Reçue : surface tonale à gauche. Dans un `MessageGroup`, seule la dernière bulle porte la queue et l'avatar. L'expéditeur et l'heure sont toujours lus par les lecteurs d'écran ; à l'écran, l'heure apparaît au survol et au focus, ou en permanence avec `showTime`.",
      },
    },
  },
  args: {
    from: "me",
    children: "Je t'envoie le devis dans la journée.",
    time: heure(9, 41),
    showTime: false,
    status: "sent",
  },
  argTypes: {
    from: { control: "inline-radio", options: ["me", "them"] },
    status: { control: "select", options: [undefined, "sending", "sent", "read", "failed"] },
    children: { control: "text" },
    time: { control: false },
    attachments: { control: false },
    avatar: { control: false },
    labels: { control: false },
  },
  render: (args) => (
    <Column>
      <Message {...args} onRetry={() => {}} />
    </Column>
  ),
} satisfies Meta<typeof Message>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Sens, statut et heure se pilotent depuis les contrôles. Survolez la bulle pour voir l'heure. */
export const Playground: Story = {};

/**
 * Messages consécutifs d'un même expéditeur : 2 px entre les bulles, la queue et l'avatar
 * sur la dernière seulement. Les groupes sont espacés de 12 px.
 */
export const Groupes: Story = {
  render: () => (
    <Column>
      <MessageGroup from="them" name="Inès Benali" avatar={Ines} showName={false}>
        <Message time={heure(9, 12)}>Bonjour !</Message>
        <Message time={heure(9, 12)}>Tu as pu regarder le budget 2027 ?</Message>
        <Message time={heure(9, 13)}>Pas d'urgence, c'est pour jeudi.</Message>
      </MessageGroup>
      <MessageGroup from="me">
        <Message time={heure(9, 30)}>Oui, ce matin.</Message>
        <Message time={heure(9, 30)} status="read">Deux remarques sur les charges de Tanger, je t'appelle.</Message>
      </MessageGroup>
    </Column>
  ),
};

/**
 * `envoi` : bulle estompée. `envoyé`, `lu` : sous la bulle (à n'afficher que sous le
 * dernier message, comme iMessage). `échec` : pastille d'alerte et « Réessayer » (`onRetry`).
 */
export const Statuts: Story = {
  render: () => (
    <Column>
      <Message from="me" status="sending">En cours d'envoi</Message>
      <Message from="me" status="sent">Envoyé</Message>
      <Message from="me" status="read">Lu par le destinataire</Message>
      <Message from="me" status="failed" onRetry={() => {}}>Pas de réseau au moment de l'envoi</Message>
    </Column>
  ),
};

/** Heure au survol et au focus (par défaut), ou affichée sous la bulle avec `showTime`. */
export const Horodatage: Story = {
  render: () => (
    <Column>
      <Text size={12} tone="subtle">Au survol</Text>
      <Message from="them" time={heure(14, 2)}>Survolez-moi : l'heure apparaît à côté.</Message>
      <Message from="me" time={heure(14, 3)}>Moi aussi.</Message>
      <Text size={12} tone="subtle">Affichée</Text>
      <Message from="them" time={heure(14, 5)} showTime>Heure toujours visible.</Message>
      <Message from="me" time={heure(14, 6)} showTime status="read">Avec le statut.</Message>
    </Column>
  ),
};

/** `attachments` : images et fichiers (`MessageAttachment`), au-dessus de la bulle ou seuls. */
export const PiecesJointes: Story = {
  name: "Pièces jointes",
  render: () => (
    <Column>
      <MessageGroup from="them" name="Inès Benali" avatar={Ines} showName={false}>
        <Message
          attachments={<MessageAttachment name="Budget 2027.xlsx" meta="Feuille de calcul · 284 Ko" icon={<FileSpreadsheet />} href="#budget" />}
        >
          Voici la dernière version.
        </Message>
      </MessageGroup>
      <MessageGroup from="me">
        <Message attachments={<img src={tableau} alt="Tableau blanc de la réunion" width={240} height={180} />} />
        <Message
          status="sent"
          attachments={<MessageAttachment name="Remarques budget.docx" meta="Document · 3 pages" icon={<FileText />} href="#remarques" />}
        >
          Et mes remarques.
        </Message>
      </MessageGroup>
    </Column>
  ),
};

/** Le texte garde ses retours à la ligne ; les liens soulignés héritent de la couleur de la bulle. */
export const TexteLong: Story = {
  name: "Texte long et liens",
  render: () => (
    <Column>
      <Message from="them">
        {"Ordre du jour de jeudi :\n1. Clôture du T3\n2. Budget 2027 par région\n3. Questions diverses"}
      </Message>
      <Message from="me">
        Le dossier est ici : <a href="#dossier">drive.acme.ma/cloture-t3</a> — les annexes sont dans le sous-dossier « Pièces ».
      </Message>
    </Column>
  ),
};
