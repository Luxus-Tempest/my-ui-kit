import * as React from "react";
import { Avatar, AvatarBadge, AvatarFallback } from "@rovia/ui/avatar";
import { Badge } from "@rovia/ui/badge";
import { Button } from "@rovia/ui/button";
import { ChatComposer, Message, MessageAttachment, MessageDateSeparator, MessageGroup, MessageList, TypingIndicator, formatMessageDate, type MessageStatus } from "@rovia/ui/chat";
import { DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm } from "@rovia/ui/description-list";
import { breakpoints, useMediaQuery } from "@rovia/ui/hooks";
import { List, ListItem } from "@rovia/ui/list";
import { SearchBar } from "@rovia/ui/search-bar";
import { Tooltip } from "@rovia/ui/tooltip";
import { Heading, Text } from "@rovia/ui/typography";
import { ArrowLeft, FileSpreadsheet, FileText, Info, Paperclip, Phone, Smile, SquarePen, Video } from "lucide-react";


/** Un message d'une conversation. */
export interface MessagerieMessage {
  id: string;
  from: "me" | "them";
  text: string;
  time: Date;
  status?: MessageStatus;
  file?: { name: string; meta: string };
}

export interface MessagerieConversation {
  id: string;
  name: string;
  role: string;
  online?: boolean;
  unread: number;
  email: string;
  messages: MessagerieMessage[];
}

export interface MessagerieProps {
  conversations: MessagerieConversation[];
  /** Conversation ouverte au départ sur grand écran (sur mobile, on arrive sur la liste). */
  defaultActiveId?: string;
  /** Ville affichée avec l'heure locale du contact, dans le panneau Détails. */
  localTimeCity?: string;
  /** Appelé à chaque envoi : branche ici ton envoi réel. */
  onSend?: (conversationId: string, text: string) => void;
  /**
   * Réponses simulées (démonstration) : après un envoi, l'interlocuteur écrit puis répond par
   * l'une d'elles. Laisse vide en production.
   */
  autoReplies?: string[];
}

type Conversation = MessagerieConversation;
type Msg = MessagerieMessage;

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

function Details({ conv, city }: { conv: Conversation; city: string }) {
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
          <DescriptionDetails>{city} · {new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</DescriptionDetails>
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

/**
 * Messagerie d'équipe : liste des conversations avec recherche et non lus, fil regroupé par
 * expéditeur avec séparateurs de date et statuts, saisie et panneau de détails. Sous 768 px, une
 * seule colonne à la fois, comme sur iOS : la liste, puis la conversation avec un bouton retour.
 */
export function Messagerie({
  conversations: initial,
  defaultActiveId,
  localTimeCity = "Casablanca",
  onSend,
  autoReplies = [],
}: MessagerieProps) {
  const compact = useMediaQuery(breakpoints.md);
  const [conversations, setConversations] = React.useState(initial);
  // Sur mobile, on arrive sur la liste (comme iOS) ; sur grand écran, sur la conversation de départ.
  const [activeId, setActiveId] = React.useState<string | null>(() => (compact ? null : defaultActiveId ?? initial[0]?.id ?? null));
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
    onSend?.(convId, text);
    later(600, () => patchMsg(convId, id, { status: "sent" }));
    if (autoReplies.length === 0) return;
    later(1200, () => setTyping(true));
    later(2800, () => {
      setTyping(false);
      update(convId, (c) => ({
        ...c,
        messages: [
          ...c.messages.map((m) => (m.from === "me" && m.status === "sent" ? { ...m, status: "read" as const } : m)),
          { id: `r${Date.now()}`, from: "them", text: autoReplies[c.messages.length % autoReplies.length]!, time: new Date() },
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
        color: "var(--ui-fg)",
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
          <Details conv={active} city={localTimeCity} />
        </div>
      )}
    </div>
  );
}

