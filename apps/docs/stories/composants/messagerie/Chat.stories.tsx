import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
  Button,
  ChatComposer,
  Message,
  MessageAttachment,
  MessageDateSeparator,
  MessageGroup,
  MessageList,
  Text,
  TypingIndicator,
  type MessageStatus,
} from "@rovia/ui";
import { FileSpreadsheet, Paperclip, Phone, Smile, Video } from "lucide-react";

/* ── Données de démonstration (images : données, pas des jetons de style) ── */

const photo =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' fill='#f3d9c9'/><circle cx='32' cy='25' r='11' fill='#b9775a'/><path d='M12 60c2-12 10-18 20-18s18 6 20 18' fill='#b9775a'/></svg>`,
  );
const tableau =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 240 180'><rect width='240' height='180' fill='#e9edf2'/><rect x='18' y='18' width='204' height='132' rx='6' fill='#ffffff' stroke='#c9d1db' stroke-width='3'/><path d='M40 50h90M40 70h120M40 90h70' stroke='#2a78d6' stroke-width='5' stroke-linecap='round'/><path d='M150 120l18-26 16 14 20-32' fill='none' stroke='#eb6834' stroke-width='5' stroke-linecap='round' stroke-linejoin='round'/><rect x='96' y='154' width='48' height='8' rx='3' fill='#9aa5b1'/></svg>`,
  );

function at(daysAgo: number, hours: number, minutes: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

type Piece = "budget" | "tableau";
interface Msg {
  id: string;
  from: "me" | "them";
  text?: string;
  time: Date;
  status?: MessageStatus;
  piece?: Piece;
}

const HISTORIQUE: Msg[] = [
  { id: "h1", from: "them", text: "On fait le point sur la clôture lundi ?", time: at(4, 11, 2) },
  { id: "h2", from: "me", text: "Oui, 10 h dans ma salle.", time: at(4, 11, 6), status: "read" },
];

const DEPART: Msg[] = [
  { id: "a1", from: "them", text: "Tu as pu regarder le budget 2027 ?", time: at(1, 18, 20) },
  { id: "a2", from: "them", text: "Pas d'urgence, c'est pour jeudi.", time: at(1, 18, 21) },
  { id: "a3", from: "me", text: "Je m'y mets demain matin.", time: at(1, 18, 47), status: "read" },
  { id: "b1", from: "them", text: "Bonjour ! Voici la dernière version.", time: at(0, 9, 12), piece: "budget" },
  { id: "b2", from: "them", text: "J'ai ajouté l'onglet Marrakech et corrigé les charges de Tanger.", time: at(0, 9, 13) },
  { id: "b3", from: "me", text: "Merci Inès, je regarde ça.", time: at(0, 9, 30), status: "read" },
  { id: "b4", from: "me", text: "La photo du tableau de la réunion", time: at(0, 9, 31), status: "read", piece: "tableau" },
  { id: "b5", from: "me", text: "Je t'envoie mes remarques avant midi.", time: at(0, 9, 40), status: "failed" },
];

const REPONSES = [
  "Parfait, merci !",
  "Je regarde et je te dis.",
  "Tu peux me renvoyer le lien du dossier ?",
  "Top, on en parle à 14 h.",
];

function renderPiece(piece?: Piece) {
  if (piece === "budget") {
    return <MessageAttachment name="Budget 2027.xlsx" meta="Feuille de calcul · 284 Ko" icon={<FileSpreadsheet />} href="#budget" />;
  }
  if (piece === "tableau") {
    return <img src={tableau} alt="Tableau blanc de la réunion : objectifs du quatrième trimestre" width={240} height={180} />;
  }
  return undefined;
}

type Bloc =
  | { kind: "date"; key: string; date: Date }
  | { kind: "group"; key: string; from: "me" | "them"; messages: Msg[] };

/** Regroupe les messages consécutifs d'un même expéditeur (moins de 10 min d'écart), un séparateur par jour. */
function enBlocs(messages: Msg[]): Bloc[] {
  const blocs: Bloc[] = [];
  let jour = "";
  let groupe: Extract<Bloc, { kind: "group" }> | null = null;
  for (const m of messages) {
    if (m.time.toDateString() !== jour) {
      jour = m.time.toDateString();
      blocs.push({ kind: "date", key: `d-${jour}`, date: m.time });
      groupe = null;
    }
    const precedent = groupe?.messages[groupe.messages.length - 1];
    if (groupe && precedent && groupe.from === m.from && Math.abs(m.time.getTime() - precedent.time.getTime()) < 600_000) {
      groupe.messages.push(m);
    } else {
      groupe = { kind: "group", key: `g-${m.id}`, from: m.from, messages: [m] };
      blocs.push(groupe);
    }
  }
  return blocs;
}

const InesAvatar = () => (
  <Avatar>
    <AvatarImage src={photo} alt="" />
    <AvatarFallback name="Inès Benali" />
  </Avatar>
);

/** Fenêtre de démonstration : en-tête, fil, zone de saisie. */
const Window = ({ header, children, footer, height = 620 }: { header?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode; height?: number }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      height,
      maxWidth: 460,
      overflow: "hidden",
      border: "1px solid var(--ui-line)",
      borderRadius: "var(--ui-r-xl)",
      background: "var(--ui-panel)",
    }}
  >
    {header && (
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px 10px 16px", borderBottom: "1px solid var(--ui-line)" }}>
        {header}
      </div>
    )}
    {children}
    {footer && <div style={{ padding: "8px 12px 12px", borderTop: "1px solid var(--ui-line)" }}>{footer}</div>}
  </div>
);

const ActionsComposer = () => (
  <>
    <Button variant="ghost" size="icon" aria-label="Joindre un fichier"><Paperclip /></Button>
    <Button variant="ghost" size="icon" aria-label="Insérer un emoji"><Smile /></Button>
  </>
);

function ConversationDemo() {
  const [messages, setMessages] = React.useState<Msg[]>(DEPART);
  const [typing, setTyping] = React.useState(false);
  const [loadingHistory, setLoadingHistory] = React.useState(false);
  const [historyLeft, setHistoryLeft] = React.useState(true);
  const timers = React.useRef<number[]>([]);
  const reply = React.useRef(0);
  React.useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const later = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  const patch = (id: string, change: Partial<Msg>) =>
    setMessages((list) => list.map((m) => (m.id === id ? { ...m, ...change } : m)));

  const deliver = (id: string) => {
    patch(id, { status: "sending" });
    later(700, () => patch(id, { status: "sent" }));
  };

  const send = (text: string) => {
    const id = `m${Date.now()}`;
    setMessages((list) => [...list, { id, from: "me", text, time: new Date(), status: "sending" }]);
    later(700, () => patch(id, { status: "sent" }));
    later(1300, () => setTyping(true));
    later(3100, () => {
      setTyping(false);
      const text = REPONSES[reply.current++ % REPONSES.length]!;
      setMessages((list) => [
        ...list.map((m) => (m.from === "me" && m.status === "sent" ? { ...m, status: "read" as const } : m)),
        { id: `r${Date.now()}`, from: "them", text, time: new Date() },
      ]);
    });
  };

  const loadHistory = () => {
    if (!historyLeft || loadingHistory) return;
    setLoadingHistory(true);
    later(1000, () => {
      setMessages((list) => [...HISTORIQUE, ...list]);
      setLoadingHistory(false);
      setHistoryLeft(false);
    });
  };

  // Comme iMessage : le statut ne s'affiche que sous le dernier message envoyé (et sur les échecs).
  const dernierEnvoi = [...messages].reverse().find((m) => m.from === "me" && m.status !== "failed")?.id;

  return (
    <Window
      header={
        <>
          <Avatar>
            <AvatarImage src={photo} alt="" />
            <AvatarFallback name="Inès Benali" />
            <AvatarBadge label="En ligne" />
          </Avatar>
          <div style={{ display: "grid", flex: 1, minWidth: 0 }}>
            <Text weight="semibold">Inès Benali</Text>
            <Text size={12} tone={typing ? "pri" : "subtle"}>{typing ? "En train d'écrire…" : "En ligne"}</Text>
          </div>
          <Button variant="ghost" size="icon" aria-label="Appel vocal"><Phone /></Button>
          <Button variant="ghost" size="icon" aria-label="Appel vidéo"><Video /></Button>
        </>
      }
      footer={<ChatComposer actions={<ActionsComposer />} onSend={send} />}
    >
      <MessageList
        aria-label="Conversation avec Inès Benali"
        onReachTop={loadHistory}
        loadingHistory={loadingHistory}
        style={{ flex: 1 }}
      >
        {enBlocs(messages).map((bloc) =>
          bloc.kind === "date" ? (
            <MessageDateSeparator key={bloc.key} date={bloc.date} />
          ) : (
            <MessageGroup
              key={bloc.key}
              from={bloc.from}
              name={bloc.from === "them" ? "Inès Benali" : undefined}
              showName={false}
              avatar={bloc.from === "them" ? <InesAvatar /> : undefined}
            >
              {bloc.messages.map((m) => (
                <Message
                  key={m.id}
                  time={m.time}
                  attachments={renderPiece(m.piece)}
                  status={m.status === "failed" ? "failed" : m.id === dernierEnvoi ? m.status : undefined}
                  onRetry={() => deliver(m.id)}
                >
                  {m.text}
                </Message>
              ))}
            </MessageGroup>
          ),
        )}
        {typing && <TypingIndicator name="Inès" avatar={<InesAvatar />} />}
      </MessageList>
    </Window>
  );
}

const meta = {
  title: "Composants/Messagerie/Chat",
  component: MessageList,
  subcomponents: { MessageGroup, Message, MessageAttachment, MessageDateSeparator, TypingIndicator, ChatComposer },
  tags: ["autodocs"],
  parameters: {
    registry: "chat",
    docs: {
      description: {
        component:
          "Messagerie façon iMessage, à composer : `MessageList` (le fil), `MessageDateSeparator` (« Aujourd'hui », « Hier »…), `MessageGroup` (un expéditeur, ses messages consécutifs), `Message` (la bulle : statut, heure, pièces jointes), `TypingIndicator` et `ChatComposer` (la saisie).\n\nLe fil est un journal (`role=\"log\"`, `aria-live=\"polite\"`) : chaque nouveau message est annoncé avec son expéditeur et son heure. Il reste collé en bas quand on y est ; si l'on lit plus haut, il ne bouge jamais et propose « Nouveaux messages ». `onReachTop` charge l'historique sans perdre la ligne lue.",
      },
    },
  },
  render: () => <ConversationDemo />,
} satisfies Meta<typeof MessageList>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Conversation complète et interactive : écrivez puis Entrée (Maj+Entrée pour aller à la
 * ligne). Le message passe par « Envoi… », « Envoyé », puis « Lu » quand Inès répond après
 * l'indicateur de saisie. « Réessayer » renvoie le message en échec. Remontez tout en haut :
 * l'historique se charge et la lecture ne saute pas.
 */
export const Playground: Story = { name: "Conversation" };

const PARTICIPANTS = {
  ines: { name: "Inès Benali", initials: <Avatar><AvatarFallback name="Inès Benali" /></Avatar> },
  karim: { name: "Karim Alaoui", initials: <Avatar><AvatarFallback name="Karim Alaoui" /></Avatar> },
};

/** Conversation de groupe : le nom de l'expéditeur au-dessus de ses messages reçus (`showName`, par défaut). */
export const ConversationDeGroupe: Story = {
  name: "Conversation de groupe",
  render: () => (
    <Window height={520} header={<Text weight="semibold">Clôture T3 · 3 participants</Text>}>
      <MessageList aria-label="Conversation Clôture T3" style={{ flex: 1 }}>
        <MessageDateSeparator date={at(0, 8, 0)} />
        <MessageGroup from="them" name={PARTICIPANTS.karim.name} avatar={PARTICIPANTS.karim.initials}>
          <Message time={at(0, 8, 54)}>Les relevés de Tanger sont arrivés.</Message>
          <Message time={at(0, 8, 55)}>Il manque encore Agadir.</Message>
        </MessageGroup>
        <MessageGroup from="them" name={PARTICIPANTS.ines.name} avatar={PARTICIPANTS.ines.initials}>
          <Message time={at(0, 9, 2)}>Je relance l'agence ce matin.</Message>
        </MessageGroup>
        <MessageGroup from="me">
          <Message time={at(0, 9, 4)}>Merci à vous deux.</Message>
          <Message time={at(0, 9, 4)} status="read">On boucle jeudi comme prévu ?</Message>
        </MessageGroup>
        <MessageGroup from="them" name={PARTICIPANTS.karim.name} avatar={PARTICIPANTS.karim.initials}>
          <Message time={at(0, 9, 6)}>Oui, jeudi midi au plus tard.</Message>
        </MessageGroup>
      </MessageList>
    </Window>
  ),
};

function DefilementDemo() {
  const [messages, setMessages] = React.useState(() =>
    Array.from({ length: 24 }, (_, i) => ({ id: i, from: (i % 3 === 0 ? "me" : "them") as "me" | "them", text: `Message n° ${i + 1}` })),
  );
  const recevoir = () => setMessages((list) => [...list, { id: list.length, from: "them", text: `Nouveau message n° ${list.length + 1}` }]);
  return (
    <div style={{ display: "grid", gap: 12, maxWidth: 460 }}>
      <Button variant="tonal" onClick={recevoir} style={{ justifySelf: "start" }}>Simuler un message reçu</Button>
      <Window height={420}>
        <MessageList aria-label="Démonstration du défilement" style={{ flex: 1 }}>
          {messages.map((m) => (
            <Message key={m.id} from={m.from}>{m.text}</Message>
          ))}
        </MessageList>
      </Window>
    </div>
  );
}

/**
 * Remontez dans le fil : un bouton rond propose de revenir en bas. Simulez alors un message
 * reçu : vous n'êtes pas déplacé, le bouton devient la pastille « Nouveaux messages ».
 * En bas du fil, les messages reçus s'affichent directement.
 */
export const NouveauxMessages: Story = {
  name: "Nouveaux messages",
  render: () => <DefilementDemo />,
};

/** « Aujourd'hui », « Hier », le jour de la semaine, puis la date. Le séparateur reste accroché en haut du fil. */
export const SeparateursDeDate: Story = {
  name: "Séparateurs de date",
  render: () => (
    <Window height={460}>
      <MessageList aria-label="Séparateurs de date" style={{ flex: 1 }}>
        {[
          { date: at(400, 10, 0), text: "Bonne année !" },
          { date: at(40, 10, 0), text: "Le contrat est signé." },
          { date: at(3, 10, 0), text: "Réunion déplacée à 15 h." },
          { date: at(1, 10, 0), text: "Bien reçu." },
          { date: at(0, 10, 0), text: "À tout à l'heure." },
        ].map((item) => (
          <React.Fragment key={item.text}>
            <MessageDateSeparator date={item.date} />
            <Message from="them" time={item.date}>{item.text}</Message>
          </React.Fragment>
        ))}
      </MessageList>
    </Window>
  ),
};

/**
 * Trois points dans une bulle reçue ; le texte masqué « Inès est en train d'écrire » est
 * annoncé. Avec « Réduire les animations », les points s'arrêtent en dégradé fixe.
 */
export const IndicateurDeSaisie: Story = {
  name: "Indicateur de saisie",
  render: () => (
    <Window height={260}>
      <MessageList aria-label="Indicateur de saisie" style={{ flex: 1 }}>
        <MessageGroup from="me">
          <Message status="read">Tu as le chiffre de Rabat ?</Message>
        </MessageGroup>
        <TypingIndicator name="Inès" avatar={<InesAvatar />} />
      </MessageList>
    </Window>
  ),
};
