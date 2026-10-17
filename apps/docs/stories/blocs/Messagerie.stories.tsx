import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  Badge,
  Button,
  ChatComposer,
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
  Heading,
  List,
  ListItem,
  Message,
  MessageAttachment,
  MessageDateSeparator,
  MessageGroup,
  MessageList,
  SearchBar,
  Text,
  Tooltip,
  TypingIndicator,
  breakpoints,
  formatMessageDate,
  useMediaQuery,
  type MessageStatus,
} from "@rovia/ui";
import { ArrowLeft, FileSpreadsheet, FileText, Info, Paperclip, Phone, Smile, SquarePen, Video } from "lucide-react";

const meta: Meta = {
  title: "Blocs/Messagerie",
  parameters: {
    padding: 0,
    docs: {
      story: { inline: false, height: "720px" },
      description: {
        component:
          "Une messagerie d'équipe : liste des conversations avec recherche et non-lus, fil (`MessageList`, regroupement par expéditeur, séparateurs de date, statuts « Envoi… », « Envoyé », « Lu »), saisie (`ChatComposer`) et panneau de détails (`DescriptionList`). Sous 768 px, une seule colonne à la fois, comme sur iOS : la liste, puis la conversation avec un bouton retour.",
      },
    },
  },
};
export default meta;

/* ── Données ──────────────────────────────────────────────────────── */

function at(daysAgo: number, hours: number, minutes: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

interface Msg {
  id: string;
  from: "me" | "them";
  text: string;
  time: Date;
  status?: MessageStatus;
  file?: { name: string; meta: string };
}

interface Conversation {
  id: string;
  name: string;
  role: string;
  online?: boolean;
  unread: number;
  email: string;
  messages: Msg[];
}

const CONVERSATIONS: Conversation[] = [
  {
    id: "ines",
    name: "Inès Benali",
    role: "Responsable financière",
    online: true,
    unread: 2,
    email: "ines.benali@acme.ma",
    messages: [
      { id: "i1", from: "me", text: "Tu as reçu les relevés de septembre ?", time: at(1, 17, 40), status: "read" },
      { id: "i2", from: "them", text: "Oui, tout est rapproché sauf deux virements.", time: at(1, 17, 52) },
      { id: "i3", from: "them", text: "Voici le budget 2027 mis à jour.", time: at(0, 9, 12), file: { name: "Budget 2027.xlsx", meta: "Feuille de calcul · 284 Ko" } },
      { id: "i4", from: "them", text: "J'ai ajouté l'onglet Marrakech. Tu me dis si ça te va ?", time: at(0, 9, 13) },
    ],
  },
  {
    id: "karim",
    name: "Karim Alaoui",
    role: "Commercial, région Nord",
    unread: 0,
    email: "karim.alaoui@acme.ma",
    messages: [
      { id: "k1", from: "them", text: "Atlas Négoce valide le devis D-2026-114.", time: at(0, 8, 30) },
      { id: "k2", from: "me", text: "Super, je prépare la facture.", time: at(0, 8, 41), status: "read" },
    ],
  },
  {
    id: "fatima",
    name: "Fatima Zahra El Idrissi",
    role: "Juriste",
    online: true,
    unread: 1,
    email: "fz.elidrissi@acme.ma",
    messages: [
      { id: "f1", from: "them", text: "Le contrat cadre est prêt à signer.", time: at(2, 15, 5), file: { name: "Contrat cadre.pdf", meta: "PDF · 1,2 Mo" } },
    ],
  },
  {
    id: "youssef",
    name: "Youssef Tazi",
    role: "Logistique",
    unread: 0,
    email: "youssef.tazi@acme.ma",
    messages: [
      { id: "y1", from: "me", text: "La livraison de Tanger part demain ?", time: at(5, 10, 2), status: "read" },
      { id: "y2", from: "them", text: "Oui, départ 7 h, arrivée prévue jeudi.", time: at(5, 10, 20) },
    ],
  },
];

const REPONSES = ["Parfait, merci !", "Je regarde et je te dis.", "Top, on en parle à 14 h."];

/* ── Morceaux ─────────────────────────────────────────────────────── */

const Initiales = ({ conv, size }: { conv: Conversation; size?: "sm" | "lg" }) => (
  <Avatar size={size}>
    <AvatarFallback name={conv.name} />
    {conv.online && <AvatarBadge label="En ligne" />}
  </Avatar>
);

const lastOf = (conv: Conversation) => conv.messages[conv.messages.length - 1];

function ConversationList({
  conversations,
  activeId,
  onOpen,
}: {
  conversations: Conversation[];
  activeId: string | null;
  onOpen: (id: string) => void;
}) {
  const [query, setQuery] = React.useState("");
  const shown = conversations.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0, height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 16px 8px" }}>
        <Heading level={1} size="sm">Messages</Heading>
        <Tooltip content="Nouvelle conversation">
          <Button variant="ghost" size="icon" aria-label="Nouvelle conversation"><SquarePen /></Button>
        </Tooltip>
      </div>
      <div style={{ padding: "0 12px 8px" }}>
        <SearchBar aria-label="Rechercher une conversation" placeholder="Rechercher" value={query} onValueChange={setQuery} />
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0 8px 8px" }}>
        <List variant="plain" aria-label="Conversations">
          {shown.map((conv) => {
            const last = lastOf(conv);
            return (
              <ListItem
                key={conv.id}
                asChild
                selected={conv.id === activeId}
                leading={<Initiales conv={conv} />}
                description={
                  <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {last.from === "me" ? "Vous : " : ""}
                    {last.file && !last.text ? last.file.name : last.text}
                  </span>
                }
                trailing={
                  <span style={{ display: "grid", justifyItems: "end", gap: 4 }}>
                    <Text size={12} tone={conv.unread ? "pri" : "subtle"}>{formatMessageDate(last.time)}</Text>
                    {conv.unread > 0 && (
                      <Badge variant="pri" aria-label={`${conv.unread} non lu${conv.unread > 1 ? "s" : ""}`}>{conv.unread}</Badge>
                    )}
                  </span>
                }
              >
                <button type="button" onClick={() => onOpen(conv.id)}>
                  <span style={{ fontWeight: conv.unread ? 600 : undefined }}>{conv.name}</span>
                </button>
              </ListItem>
            );
          })}
        </List>
        {shown.length === 0 && (
          <Text tone="muted" style={{ padding: 16, textAlign: "center" }}>Aucune conversation pour « {query} ».</Text>
        )}
      </div>
    </div>
  );
}

function Fil({ conv, typing, onRetry }: { conv: Conversation; typing: boolean; onRetry: (id: string) => void }) {
  // Un séparateur par jour, un groupe par suite de messages d'un même expéditeur.
  const blocs: React.ReactNode[] = [];
  let jour = "";
  let groupe: Msg[] = [];
  const dernierEnvoi = [...conv.messages].reverse().find((m) => m.from === "me" && m.status !== "failed")?.id;
  const flush = () => {
    if (!groupe.length) return;
    const from = groupe[0].from;
    blocs.push(
      <MessageGroup
        key={groupe[0].id}
        from={from}
        name={from === "them" ? conv.name : undefined}
        showName={false}
        avatar={from === "them" ? <Initiales conv={conv} /> : undefined}
      >
        {groupe.map((m) => (
          <Message
            key={m.id}
            time={m.time}
            status={m.status === "failed" ? "failed" : m.id === dernierEnvoi ? m.status : undefined}
            onRetry={() => onRetry(m.id)}
            attachments={m.file && <MessageAttachment name={m.file.name} meta={m.file.meta} icon={m.file.name.endsWith(".xlsx") ? <FileSpreadsheet /> : <FileText />} href="#piece" />}
          >
            {m.text}
          </Message>
        ))}
      </MessageGroup>,
    );
    groupe = [];
  };
  for (const m of conv.messages) {
    if (m.time.toDateString() !== jour) {
      flush();
      jour = m.time.toDateString();
      blocs.push(<MessageDateSeparator key={`d-${jour}`} date={m.time} />);
    }
    if (groupe.length && groupe[0].from !== m.from) flush();
    groupe.push(m);
  }
  flush();
  return (
    <MessageList aria-label={`Conversation avec ${conv.name}`} style={{ flex: 1 }}>
      {blocs}
      {typing && <TypingIndicator name={conv.name.split(" ")[0]} avatar={<Initiales conv={conv} />} />}
    </MessageList>
  );
}

function Details({ conv }: { conv: Conversation }) {
  const fichiers = conv.messages.filter((m) => m.file);
  return (
    <aside aria-label={`Détails : ${conv.name}`} style={{ display: "grid", alignContent: "start", gap: 20, padding: 20, overflowY: "auto" }}>
      <div style={{ display: "grid", justifyItems: "center", gap: 8, textAlign: "center" }}>
        <Initiales conv={conv} size="lg" />
        <Text weight="semibold">{conv.name}</Text>
        <Text size={13} tone="muted">{conv.role}</Text>
      </div>
      <DescriptionList layout="vertical">
        <DescriptionItem>
          <DescriptionTerm>Adresse e-mail</DescriptionTerm>
          <DescriptionDetails>{conv.email}</DescriptionDetails>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>Heure locale</DescriptionTerm>
          <DescriptionDetails>Casablanca · {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</DescriptionDetails>
        </DescriptionItem>
      </DescriptionList>
      {fichiers.length > 0 && (
        <div style={{ display: "grid", gap: 8 }}>
          <Text size={12} weight="medium" tone="muted">Fichiers partagés</Text>
          {fichiers.map((m) => (
            <MessageAttachment key={m.id} name={m.file!.name} meta={m.file!.meta} icon={m.file!.name.endsWith(".xlsx") ? <FileSpreadsheet /> : <FileText />} href="#piece" />
          ))}
        </div>
      )}
    </aside>
  );
}

/* ── Écran ────────────────────────────────────────────────────────── */

function Messagerie() {
  const compact = useMediaQuery(breakpoints.md);
  const [conversations, setConversations] = React.useState(CONVERSATIONS);
  // Sur mobile, on arrive sur la liste (comme iOS) ; sur grand écran, sur la dernière conversation.
  const [activeId, setActiveId] = React.useState<string | null>(() => (compact ? null : "ines"));
  const [details, setDetails] = React.useState(true);
  const [typing, setTyping] = React.useState(false);
  const timers = React.useRef<number[]>([]);
  React.useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const update = (id: string, fn: (c: Conversation) => Conversation) =>
    setConversations((list) => list.map((c) => (c.id === id ? fn(c) : c)));
  const patchMsg = (convId: string, msgId: string, change: Partial<Msg>) =>
    update(convId, (c) => ({ ...c, messages: c.messages.map((m) => (m.id === msgId ? { ...m, ...change } : m)) }));

  const open = (id: string) => {
    setActiveId(id);
    update(id, (c) => ({ ...c, unread: 0 }));
  };

  const send = (text: string) => {
    if (!active) return;
    const convId = active.id;
    const id = `m${Date.now()}`;
    update(convId, (c) => ({ ...c, messages: [...c.messages, { id, from: "me", text, time: new Date(), status: "sending" }] }));
    later(600, () => patchMsg(convId, id, { status: "sent" }));
    later(1200, () => setTyping(true));
    later(2800, () => {
      setTyping(false);
      update(convId, (c) => ({
        ...c,
        messages: [
          ...c.messages.map((m) => (m.from === "me" && m.status === "sent" ? { ...m, status: "read" as const } : m)),
          { id: `r${Date.now()}`, from: "them", text: REPONSES[c.messages.length % REPONSES.length]!, time: new Date() },
        ],
      }));
    });
  };

  const retry = (msgId: string) => {
    if (!active) return;
    patchMsg(active.id, msgId, { status: "sending" });
    later(600, () => patchMsg(active.id, msgId, { status: "sent" }));
  };

  const showList = !compact || !active;
  const showThread = !compact || active;
  const showDetails = !compact && details && active;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: compact ? "1fr" : `320px 1fr${showDetails ? " 280px" : ""}`,
        height: "100svh",
        background: "var(--ui-app)",
        fontFamily: "var(--ui-font-sans)",
      }}
    >
      {showList && (
        <div style={{ minHeight: 0, borderInlineEnd: compact ? undefined : "1px solid var(--ui-line)" }}>
          <ConversationList conversations={conversations} activeId={compact ? null : activeId} onOpen={open} />
        </div>
      )}
      {showThread && active && (
        <section aria-label={active.name} style={{ display: "flex", flexDirection: "column", minHeight: 0, background: "var(--ui-panel)" }}>
          <header style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderBottom: "1px solid var(--ui-line)" }}>
            {compact && (
              <Button variant="ghost" size="icon" aria-label="Retour aux conversations" onClick={() => setActiveId(null)}>
                <ArrowLeft />
              </Button>
            )}
            <Initiales conv={active} />
            <div style={{ display: "grid", flex: 1, minWidth: 0 }}>
              <Text weight="semibold">{active.name}</Text>
              <Text size={12} tone={typing ? "pri" : "subtle"}>
                {typing ? "En train d'écrire…" : active.online ? "En ligne" : active.role}
              </Text>
            </div>
            <Tooltip content="Appel vocal"><Button variant="ghost" size="icon" aria-label="Appel vocal"><Phone /></Button></Tooltip>
            <Tooltip content="Appel vidéo"><Button variant="ghost" size="icon" aria-label="Appel vidéo"><Video /></Button></Tooltip>
            {!compact && (
              <Tooltip content={details ? "Masquer les détails" : "Afficher les détails"}>
                <Button variant="ghost" size="icon" aria-label="Détails de la conversation" aria-pressed={details} onClick={() => setDetails((d) => !d)}>
                  <Info />
                </Button>
              </Tooltip>
            )}
          </header>
          <Fil conv={active} typing={typing} onRetry={retry} />
          <div style={{ padding: "8px 12px 12px", borderTop: "1px solid var(--ui-line)" }}>
            <ChatComposer
              key={active.id}
              onSend={send}
              placeholder={`Message à ${active.name.split(" ")[0]}`}
              actions={
                <>
                  <Button variant="ghost" size="icon" aria-label="Joindre un fichier"><Paperclip /></Button>
                  <Button variant="ghost" size="icon" aria-label="Insérer un emoji"><Smile /></Button>
                </>
              }
            />
          </div>
        </section>
      )}
      {showDetails && (
        <div style={{ minHeight: 0, display: "grid", borderInlineStart: "1px solid var(--ui-line)", background: "var(--ui-panel)" }}>
          <Details conv={active} />
        </div>
      )}
    </div>
  );
}

/**
 * Ouvrez une conversation (les non-lus s'effacent), écrivez puis Entrée : « Envoi… », « Envoyé »,
 * puis « Lu » après la réponse. Le bouton (i) affiche ou masque les détails. En vue mobile
 * (barre d'outils « Viewport »), la liste et la conversation se succèdent.
 */
export const Ecran: StoryObj = { name: "Écran complet", render: () => <Messagerie /> };
