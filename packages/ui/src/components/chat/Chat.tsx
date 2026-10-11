import * as React from "react";
import { cn } from "../../utils/cn";
import { Button } from "../button/Button";
import { useFieldContext, useFieldControl } from "../field/Field";
import { Spinner } from "../spinner/Spinner";
import { useLocale, useMessages } from "../../i18n/LocaleProvider";

/* ══ Types et libellés ═══════════════════════════════════════════════════ */

/** `me` : message envoyé par l'utilisateur (à droite, bulle primaire). `them` : message reçu. */
export type MessageFrom = "me" | "them";
/** Cycle de vie d'un message envoyé. */
export type MessageStatus = "sending" | "sent" | "read" | "failed";
/** Place d'un message dans son groupe : seul le dernier porte la queue et l'avatar. */
export type MessagePosition = "single" | "first" | "middle" | "last";

export interface MessageLabels {
  /** Expéditeur annoncé avant chaque message envoyé. */
  me: string;
  sending: string;
  sent: string;
  read: string;
  failed: string;
  retry: string;
}
const MESSAGE_LABELS: MessageLabels = {
  me: "Vous",
  sending: "Envoi…",
  sent: "Envoyé",
  read: "Lu",
  failed: "Non envoyé",
  retry: "Réessayer",
};

export interface MessageListLabels {
  /** Pastille quand des messages sont arrivés pendant que l'utilisateur lisait plus haut. */
  newMessages: string;
  /** Nom du bouton rond qui ramène en bas. */
  scrollToBottom: string;
}
const LIST_LABELS: MessageListLabels = {
  newMessages: "Nouveaux messages",
  scrollToBottom: "Revenir aux derniers messages",
};

/** Tous les textes de la messagerie : ceux de `Message`, de `MessageList`, et le reste. */
export interface ChatLabels extends MessageLabels, MessageListLabels {
  /** Nom du fil sans `aria-label`. « Conversation ». */
  conversation: string;
  /** Séparateur de date. « Aujourd'hui ». */
  today: string;
  /** Séparateur de date. « Hier ». */
  yesterday: string;
  /** Indicateur de saisie. « Inès est en train d'écrire », ou sans nom « En train d'écrire ». */
  typing: (name?: string) => string;
  /** Bouton d'envoi de `ChatComposer`. « Envoyer ». */
  send: string;
  /** Texte d'attente de `ChatComposer`. « Écrire un message… ». */
  placeholder: string;
  /** Nom du champ de `ChatComposer` sans libellé. « Message ». */
  composer: string;
}
export const CHAT_LABELS: ChatLabels = {
  ...MESSAGE_LABELS,
  ...LIST_LABELS,
  conversation: "Conversation",
  today: "Aujourd'hui",
  yesterday: "Hier",
  typing: (name) => (name ? `${name} est en train d'écrire` : "En train d'écrire"),
  send: "Envoyer",
  placeholder: "Écrire un message…",
  composer: "Message",
};

/* ══ Pictogrammes (SVG en ligne) ═════════════════════════════════════════ */

const ArrowDownIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 3v9.5M3.75 8.5 8 12.75l4.25-4.25" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ArrowUpIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 13V3.5M3.75 7.5 8 3.25l4.25 4.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const AlertIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <circle cx="10" cy="10" r="9" fill="currentColor" />
    <path className="ui-message__alert-mark" d="M10 5.75v5" fill="none" strokeWidth="2" strokeLinecap="round" />
    <circle className="ui-message__alert-dot" cx="10" cy="14" r="1.2" />
  </svg>
);
/** Queue de bulle à la manière d'iMessage, dessinée pour le bord gauche (miroir en CSS). */
const BubbleTail = () => (
  <svg className="ui-message__tail" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    <path d="M6 0v2c0 9-2 14.5-6 18 4.6.3 9.5-.9 14-3.5L20 0Z" />
  </svg>
);

/* ══ Utilitaires ═════════════════════════════════════════════════════════ */

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

function toDate(value: Date | string | number): Date {
  return value instanceof Date ? value : new Date(value);
}
function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime());
}
function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function capitalize(text: string, locale: string) {
  return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
}

export interface FormatMessageDateOptions {
  /** Locale des jours et des mois. `fr-FR` par défaut. */
  locale?: string;
  /** « Aujourd'hui » par défaut. */
  today?: string;
  /** « Hier » par défaut. */
  yesterday?: string;
}

/**
 * Date d'un séparateur de conversation : « Aujourd'hui », « Hier », le jour de la
 * semaine dans les six derniers jours (« Mardi »), puis « Mardi 7 octobre » dans
 * l'année et « 7 octobre 2025 » au-delà.
 */
export function formatMessageDate(
  value: Date | string | number,
  now: Date = new Date(),
  { locale = "fr-FR", today = CHAT_LABELS.today, yesterday = CHAT_LABELS.yesterday }: FormatMessageDateOptions = {},
): string {
  const date = toDate(value);
  if (!isValidDate(date)) return "";
  const days = Math.round((startOfDay(now).getTime() - startOfDay(date).getTime()) / 86_400_000);
  if (days === 0) return today;
  if (days === 1) return yesterday;
  if (days > 1 && days < 7) return capitalize(new Intl.DateTimeFormat(locale, { weekday: "long" }).format(date), locale);
  if (date.getFullYear() === now.getFullYear()) {
    return capitalize(new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(date), locale);
  }
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function renderTime(value: Date | string | number, locale: string) {
  if (typeof value === "string" && Number.isNaN(Date.parse(value))) {
    return <time className="ui-message__time">{value}</time>;
  }
  const date = toDate(value);
  if (!isValidDate(date)) return null;
  return (
    <time className="ui-message__time" dateTime={date.toISOString()}>
      {new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(date)}
    </time>
  );
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as { current: T | null }).current = value;
}

/* ══ Contextes ═══════════════════════════════════════════════════════════ */

const MessageListContext = React.createContext(false);

interface MessageGroupContextValue {
  from: MessageFrom;
  name?: string;
  avatar?: React.ReactNode;
}
const MessageGroupContext = React.createContext<MessageGroupContextValue | null>(null);
const MessagePositionContext = React.createContext<MessagePosition>("single");

/* ══ MessageList ═════════════════════════════════════════════════════════ */

const BOTTOM_THRESHOLD = 48;
const TOP_THRESHOLD = 64;

export interface MessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Appelé quand l'utilisateur remonte jusqu'en haut de la conversation : charger
   * l'historique et l'insérer au-dessus. La ligne lue reste en place.
   */
  onReachTop?: () => void;
  /** Historique en cours de chargement : indicateur en haut, `aria-busy` sur le journal. */
  loadingHistory?: boolean;
  /** Rester collé en bas quand l'utilisateur y est déjà (défaut). */
  stickToBottom?: boolean;
  /** Libellés du bouton de retour en bas. */
  labels?: Partial<MessageListLabels>;
  /** Élément qui défile (pour un défilement piloté). */
  viewportRef?: React.Ref<HTMLDivElement>;
}

/**
 * Fil de conversation : un journal (`role="log"`, `aria-live="polite"`) qui annonce
 * les messages ajoutés, sans relire tout le fil.
 *
 * - S'ouvre en bas et y reste collé tant que l'utilisateur y est.
 * - S'il lit plus haut, il n'est jamais déplacé : un bouton flottant le ramène en bas,
 *   et devient la pastille « Nouveaux messages » quand d'autres arrivent.
 * - Un message envoyé par l'utilisateur (`from="me"`) ramène toujours en bas.
 * - En haut, `onReachTop` charge l'historique ; la ligne lue reste en place.
 *
 * Le fil remplit son parent : lui donner une hauteur (`flex: 1` dans une colonne,
 * ou `height`). La zone est focalisable : les flèches la font défiler et les
 * horodatages s'affichent pendant le focus clavier.
 */
export const MessageList = React.forwardRef<HTMLDivElement, MessageListProps>(function MessageList(
  {
    className,
    children,
    onReachTop,
    loadingHistory = false,
    stickToBottom = true,
    labels: labelsProp,
    viewportRef,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...props
  },
  ref,
) {
  const chat = useMessages("chat", CHAT_LABELS);
  const labels = { ...chat, ...labelsProp };
  const viewport = React.useRef<HTMLDivElement | null>(null);
  const content = React.useRef<HTMLDivElement | null>(null);
  const jumpRef = React.useRef<HTMLButtonElement | null>(null);

  const atBottom = React.useRef(true);
  const nearTop = React.useRef(false);
  const autoScrolling = React.useRef(false);
  const initialized = React.useRef(false);
  const lastMessage = React.useRef<Element | null>(null);
  // Ancre de lecture : le premier message visible, sa distance au haut du fil et la
  // position de défilement au moment de la mesure.
  const anchor = React.useRef<{ element: Element; offset: number; scrollTop: number } | null>(null);
  const onReachTopRef = React.useRef(onReachTop);
  onReachTopRef.current = onReachTop;

  const [away, setAway] = React.useState(false);
  const [unread, setUnread] = React.useState(false);

  const setViewport = React.useCallback(
    (node: HTMLDivElement | null) => {
      viewport.current = node;
      setRef(viewportRef, node);
    },
    [viewportRef],
  );

  const captureAnchor = React.useCallback(() => {
    const el = viewport.current;
    const box = content.current;
    if (!el || !box) return;
    const messages = box.querySelectorAll('[data-slot="message"]');
    if (messages.length === 0) {
      anchor.current = null;
      return;
    }
    const top = el.getBoundingClientRect().top;
    // Recherche dichotomique du premier message dont le bas dépasse le haut du fil.
    let low = 0;
    let high = messages.length - 1;
    while (low < high) {
      const middle = (low + high) >> 1;
      if (messages[middle]!.getBoundingClientRect().bottom > top) high = middle;
      else low = middle + 1;
    }
    const element = messages[low]!;
    anchor.current = { element, offset: element.getBoundingClientRect().top - top, scrollTop: el.scrollTop };
  }, []);

  const scrollToBottom = React.useCallback((smooth: boolean) => {
    const el = viewport.current;
    if (!el) return;
    if (smooth && typeof el.scrollTo === "function" && !prefersReducedMotion()) {
      autoScrolling.current = true;
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    } else {
      el.scrollTop = el.scrollHeight;
    }
    atBottom.current = true;
    setAway(false);
    setUnread(false);
  }, []);

  /** Après chaque changement du contenu : coller en bas, ou garder la ligne lue en place. */
  const sync = React.useCallback(() => {
    const el = viewport.current;
    const box = content.current;
    if (!el || !box) return;
    const messages = box.querySelectorAll<HTMLElement>('[data-slot="message"]');
    const last = messages[messages.length - 1] ?? null;
    const isNew = last !== null && last !== lastMessage.current;

    if (!initialized.current) {
      initialized.current = true;
      el.scrollTop = el.scrollHeight;
    } else if (atBottom.current && stickToBottom) {
      el.scrollTop = el.scrollHeight;
    } else {
      const current = anchor.current;
      if (current && current.element.isConnected) {
        // Seul le déplacement dû au contenu est compensé, pas un défilement pas encore notifié.
        const scrolled = el.scrollTop - current.scrollTop;
        const position = current.element.getBoundingClientRect().top - el.getBoundingClientRect().top;
        const delta = position - (current.offset - scrolled);
        if (Math.abs(delta) >= 1) el.scrollTop += delta;
      }
      if (isNew) {
        if (last.dataset.from === "me") scrollToBottom(true);
        else setUnread(true);
      }
    }
    lastMessage.current = last;
    captureAnchor();
  }, [stickToBottom, scrollToBottom, captureAnchor]);

  // Contenu rendu par ce composant : synchronisé avant l'affichage.
  useIsomorphicLayoutEffect(() => {
    sync();
  });

  // Changements de taille qui ne passent pas par un rendu (image chargée, police…).
  React.useEffect(() => {
    const box = content.current;
    const el = viewport.current;
    if (!box || !el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => sync());
    observer.observe(box);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sync]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    props.onScroll?.(event);
    const el = event.currentTarget;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    const bottom = distance <= BOTTOM_THRESHOLD;
    if (autoScrolling.current) {
      if (!bottom) return;
      autoScrolling.current = false;
    }
    atBottom.current = bottom;
    setAway(!bottom);
    if (bottom) setUnread(false);

    const top = el.scrollTop <= TOP_THRESHOLD && el.scrollHeight > el.clientHeight;
    if (top && !nearTop.current) onReachTopRef.current?.();
    nearTop.current = top;
    captureAnchor();
  };

  // Toute reprise en main (molette, doigt, clavier) interrompt le retour en bas animé.
  const interrupt = () => {
    autoScrolling.current = false;
  };

  const jump = () => {
    const hadFocus = document.activeElement === jumpRef.current;
    scrollToBottom(true);
    // Le bouton disparaît : le focus clavier se pose sur le fil plutôt que de se perdre.
    if (hadFocus) viewport.current?.focus({ preventScroll: true });
  };

  return (
    <MessageListContext.Provider value={true}>
      <div ref={ref} data-slot="message-list" className={cn("ui-message-list", className)} {...props} onScroll={undefined}>
        <div
          ref={setViewport}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-label={ariaLabelledBy ? undefined : (ariaLabel ?? chat.conversation)}
          aria-labelledby={ariaLabelledBy}
          aria-busy={loadingHistory || undefined}
          tabIndex={0}
          className="ui-message-list__viewport"
          onScroll={handleScroll}
          onWheel={interrupt}
          onTouchStart={interrupt}
          onKeyDown={interrupt}
        >
          <div ref={content} className="ui-message-list__content">
            {loadingHistory && (
              <div className="ui-message-list__history" aria-hidden="true">
                <Spinner label="" size={16} />
              </div>
            )}
            {children}
          </div>
        </div>
        {away && (
          <button
            ref={jumpRef}
            type="button"
            className="ui-message-list__jump"
            data-unread={unread || undefined}
            aria-label={unread ? undefined : labels.scrollToBottom}
            onClick={jump}
          >
            {unread && <span>{labels.newMessages}</span>}
            <ArrowDownIcon />
          </button>
        )}
      </div>
    </MessageListContext.Provider>
  );
});

/* ══ MessageGroup ════════════════════════════════════════════════════════ */

export interface MessageGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Sens des messages du groupe. */
  from: MessageFrom;
  /** Expéditeur : annoncé avant chaque message et affiché au-dessus des messages reçus. */
  name?: string;
  /** Afficher le nom au-dessus du groupe ; par défaut pour les messages reçus (conversation de groupe). */
  showName?: boolean;
  /** Avatar posé à côté du dernier message (32 px : `Avatar` par défaut). */
  avatar?: React.ReactNode;
}

/**
 * Messages consécutifs d'un même expéditeur : 2 px entre les bulles, seule la
 * dernière porte la queue et l'avatar. Chaque enfant direct est un message.
 */
export const MessageGroup = React.forwardRef<HTMLDivElement, MessageGroupProps>(function MessageGroup(
  { className, from, name, showName, avatar, children, ...props },
  ref,
) {
  const items = React.Children.toArray(children).filter(React.isValidElement);
  const count = items.length;
  const context = React.useMemo(() => ({ from, name, avatar }), [from, name, avatar]);
  const nameVisible = (showName ?? from === "them") && Boolean(name);
  return (
    <MessageGroupContext.Provider value={context}>
      <div
        ref={ref}
        data-slot="message-group"
        data-from={from}
        data-avatar={avatar != null || undefined}
        className={cn("ui-message-group", className)}
        {...props}
      >
        {/* Masqué aux lecteurs d'écran : chaque message annonce déjà son expéditeur. */}
        {nameVisible && <div className="ui-message-group__name" aria-hidden="true">{name}</div>}
        {items.map((child, index) => {
          const position: MessagePosition =
            count === 1 ? "single" : index === 0 ? "first" : index === count - 1 ? "last" : "middle";
          return (
            <MessagePositionContext.Provider key={child.key ?? index} value={position}>
              {child}
            </MessagePositionContext.Provider>
          );
        })}
      </div>
    </MessageGroupContext.Provider>
  );
});

/* ══ Message ═════════════════════════════════════════════════════════════ */

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Hérité du `MessageGroup` ; `them` hors groupe. */
  from?: MessageFrom;
  /** Expéditeur annoncé ; hérité du groupe (« Vous » pour `me`). */
  name?: string;
  /** Avatar ; hérité du groupe, affiché sur le dernier message seulement. */
  avatar?: React.ReactNode;
  /** État d'un message envoyé : `envoi`, `envoyé`, `lu`, `échec`. Affiché sous la bulle. */
  status?: MessageStatus;
  /** Avec `status="failed"`, affiche « Réessayer ». */
  onRetry?: () => void;
  /** Heure du message (`Date`, horodatage ou texte libre). */
  time?: Date | string | number;
  /** Afficher l'heure sous la bulle ; sinon elle apparaît au survol et au focus. */
  showTime?: boolean;
  /** Pièces jointes, au-dessus de la bulle : images, `MessageAttachment`. */
  attachments?: React.ReactNode;
  labels?: Partial<MessageLabels>;
}

/**
 * Bulle de message façon iMessage. Envoyé : bulle primaire à droite. Reçu : bulle
 * tonale à gauche. Le texte garde ses retours à la ligne. L'expéditeur et l'heure
 * sont toujours lus par les lecteurs d'écran, même quand l'heure est masquée.
 */
export const Message = React.forwardRef<HTMLDivElement, MessageProps>(function Message(
  {
    className,
    from: fromProp,
    name: nameProp,
    avatar: avatarProp,
    status,
    onRetry,
    time,
    showTime = false,
    attachments,
    labels: labelsProp,
    children,
    ...props
  },
  ref,
) {
  const labels = { ...useMessages("chat", CHAT_LABELS), ...labelsProp };
  const locale = useLocale();
  const group = React.useContext(MessageGroupContext);
  const position = React.useContext(MessagePositionContext);
  const from = fromProp ?? group?.from ?? "them";
  const name = nameProp ?? (from === "me" ? labels.me : group?.name);
  const avatar = avatarProp ?? group?.avatar;
  const hasAvatar = avatar != null && avatar !== false;
  const isLast = position === "single" || position === "last";
  const failed = from === "me" && status === "failed";
  const hasBubble = children != null && children !== false && children !== "";
  const timeNode = time != null ? renderTime(time, locale) : null;

  const statusText =
    from !== "me" || !status
      ? null
      : status === "sending"
        ? labels.sending
        : status === "sent"
          ? labels.sent
          : status === "read"
            ? labels.read
            : null;
  const hasFooter = (showTime && timeNode) || statusText || failed;

  return (
    <div
      ref={ref}
      data-slot="message"
      data-from={from}
      data-position={position}
      data-status={status}
      data-avatar={hasAvatar || undefined}
      className={cn("ui-message", className)}
      {...props}
    >
      {name && <span className="ui-sr-only">{name} : </span>}
      <div className="ui-message__row">
        {/* Décoratif : l'expéditeur est déjà annoncé (et les initiales seraient lues). */}
        {hasAvatar && (
          <div className="ui-message__avatar" aria-hidden="true">
            {isLast ? avatar : null}
          </div>
        )}
        <div className="ui-message__main">
          {attachments != null && attachments !== false && <div className="ui-message__attachments">{attachments}</div>}
          {hasBubble && (
            <div className="ui-message__bubble">
              {children}
              {isLast && <BubbleTail />}
            </div>
          )}
        </div>
        {(failed || (timeNode && !showTime)) && (
          <div className="ui-message__aside">
            {failed && (
              <span className="ui-message__alert">
                <AlertIcon />
              </span>
            )}
            {timeNode && !showTime && <span className="ui-message__time-reveal">{timeNode}</span>}
          </div>
        )}
      </div>
      {hasFooter && (
        <div className="ui-message__footer">
          {showTime && timeNode}
          {showTime && timeNode && (statusText || failed) && <span aria-hidden="true">·</span>}
          {statusText && <span className="ui-message__status">{statusText}</span>}
          {/* Nœuds nouveaux à l'échec : le journal les annonce (aria-relevant="additions"). */}
          {failed && (
            <span className="ui-message__failure">
              <span className="ui-message__status">{labels.failed}</span>
              {onRetry && (
                <button type="button" className="ui-message__retry" onClick={onRetry}>
                  {labels.retry}
                </button>
              )}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

/* ══ MessageAttachment ═══════════════════════════════════════════════════ */

export interface MessageAttachmentProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Nom du fichier. */
  name: string;
  /** Taille, type ou nombre de pages (« PDF · 284 Ko »). */
  meta?: string;
  /** Pictogramme du type de fichier. */
  icon?: React.ReactNode;
}

/**
 * Fichier joint, en carte compacte. Avec `href`, c'est un lien (téléchargement,
 * aperçu) ; sans, un simple encart. Les images se passent directement en `<img>`.
 */
export const MessageAttachment = React.forwardRef<HTMLElement, MessageAttachmentProps>(function MessageAttachment(
  { className, name, meta, icon, href, ...props },
  ref,
) {
  const inner = (
    <>
      {icon != null && <span className="ui-message-attachment__icon">{icon}</span>}
      <span className="ui-message-attachment__text">
        <span className="ui-message-attachment__name">{name}</span>
        {meta && <span className="ui-message-attachment__meta">{meta}</span>}
      </span>
    </>
  );
  if (href) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        data-slot="message-attachment"
        className={cn("ui-message-attachment", className)}
        {...props}
      >
        {inner}
      </a>
    );
  }
  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      data-slot="message-attachment"
      className={cn("ui-message-attachment", className)}
      {...(props as React.HTMLAttributes<HTMLDivElement>)}
    >
      {inner}
    </div>
  );
});

/* ══ MessageDateSeparator ════════════════════════════════════════════════ */

export interface MessageDateSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Jour des messages qui suivent. */
  date: Date | string | number;
  /** Référence pour « Aujourd'hui » et « Hier » (tests, rendu serveur) ; maintenant par défaut. */
  now?: Date;
}

/**
 * Séparateur de jour : « Aujourd'hui », « Hier », « Mardi », « Mardi 7 octobre ».
 * Il reste accroché en haut du fil pendant qu'on fait défiler la journée.
 */
export const MessageDateSeparator = React.forwardRef<HTMLDivElement, MessageDateSeparatorProps>(
  function MessageDateSeparator({ className, date, now, children, ...props }, ref) {
    const locale = useLocale();
    const { today, yesterday } = useMessages("chat", CHAT_LABELS);
    const value = toDate(date);
    const valid = isValidDate(value);
    const iso = valid
      ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
      : undefined;
    return (
      <div ref={ref} data-slot="message-date-separator" className={cn("ui-message-date", className)} {...props}>
        <time dateTime={iso} className="ui-message-date__label">
          {children ?? formatMessageDate(value, now, { locale, today, yesterday })}
        </time>
      </div>
    );
  },
);

/* ══ TypingIndicator ═════════════════════════════════════════════════════ */

export interface TypingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Qui écrit : « Inès est en train d'écrire ». */
  name?: string;
  /** Texte annoncé, à la place de la phrase construite avec `name`. */
  label?: string;
  /** Avatar, aligné sur ceux des messages (32 px). */
  avatar?: React.ReactNode;
}

/**
 * Trois points dans une bulle reçue. Dans un `MessageList`, son apparition est
 * annoncée par le journal ; seul, il porte `role="status"`. Mouvement réduit : les
 * points ne rebondissent plus, ils restent allumés en dégradé.
 */
export const TypingIndicator = React.forwardRef<HTMLDivElement, TypingIndicatorProps>(function TypingIndicator(
  { className, name, label, avatar, ...props },
  ref,
) {
  const inList = React.useContext(MessageListContext);
  const { typing } = useMessages("chat", CHAT_LABELS);
  const text = label ?? typing(name);
  const hasAvatar = avatar != null && avatar !== false;
  return (
    <div
      ref={ref}
      data-slot="typing-indicator"
      data-from="them"
      data-avatar={hasAvatar || undefined}
      role={inList ? undefined : "status"}
      className={cn("ui-message", "ui-typing", className)}
      {...props}
    >
      <div className="ui-message__row">
        {hasAvatar && (
          <div className="ui-message__avatar" aria-hidden="true">
            {avatar}
          </div>
        )}
        <div className="ui-message__main">
          <div className="ui-message__bubble ui-typing__bubble">
            <span className="ui-sr-only">{text}</span>
            <span className="ui-typing__dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <BubbleTail />
          </div>
        </div>
      </div>
    </div>
  );
});

/* ══ ChatComposer ════════════════════════════════════════════════════════ */

export interface ChatComposerProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  /** Appelé à chaque frappe, et avec `""` quand le message part. */
  onValueChange?: (value: string) => void;
  /**
   * Envoi du texte (sans espaces superflus). Retour synchrone : le champ se vide aussitôt.
   * Promesse : envoi en cours jusqu'à sa résolution, puis le champ se vide ; rejetée,
   * le texte est conservé pour un nouvel essai.
   */
  onSend?: (value: string) => void | Promise<unknown>;
  /** Envoi en cours piloté de l'extérieur : bouton en attente, champ en lecture seule. */
  sending?: boolean;
  /** Boutons à gauche du champ : pièce jointe, emoji… (`Button size="icon" variant="ghost"`). */
  actions?: React.ReactNode;
  /** Entrée envoie, Maj+Entrée va à la ligne (défaut). `false` : Entrée va à la ligne. */
  sendOnEnter?: boolean;
  /** Nom du bouton d'envoi. */
  sendLabel?: string;
  /** Classe du conteneur ; `className` va au champ. */
  containerClassName?: string;
}

/**
 * Zone de saisie d'une conversation : un champ qui grandit avec le texte (jusqu'à
 * 160 px, puis il défile), un bouton d'envoi rond qui s'active dès qu'il y a du
 * texte, et des actions à gauche. Entrée envoie, Maj+Entrée va à la ligne ; la
 * composition d'un IME (accents, japonais…) n'est jamais interrompue. Après l'envoi,
 * le focus reste dans le champ. Contrôlée (`value` + `onValueChange`) ou non.
 */
export const ChatComposer = React.forwardRef<HTMLTextAreaElement, ChatComposerProps>(function ChatComposer(
  {
    className,
    containerClassName,
    value: valueProp,
    defaultValue = "",
    onValueChange,
    onSend,
    sending = false,
    actions,
    sendOnEnter = true,
    sendLabel: sendLabelProp,
    placeholder: placeholderProp,
    disabled: disabledProp,
    readOnly,
    onChange,
    onKeyDown,
    ...rest
  },
  forwardedRef,
) {
  const chat = useMessages("chat", CHAT_LABELS);
  const sendLabel = sendLabelProp ?? chat.send;
  const placeholder = placeholderProp ?? chat.placeholder;
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  React.useImperativeHandle(forwardedRef, () => textareaRef.current as HTMLTextAreaElement);
  const field = useFieldContext();
  const { disabled, ...controlProps } = useFieldControl({ ...rest, disabled: disabledProp });
  const [inner, setInner] = React.useState(defaultValue);
  const value = valueProp ?? inner;
  const [pending, setPending] = React.useState(false);
  const busy = sending || pending;
  const canSend = value.trim() !== "" && !busy && !disabled && !readOnly;

  const mounted = React.useRef(true);
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const setValue = (next: string) => {
    if (valueProp === undefined) setInner(next);
    onValueChange?.(next);
  };

  const send = () => {
    if (!canSend) return;
    const result = onSend?.(value.trim());
    if (result && typeof (result as Promise<unknown>).then === "function") {
      setPending(true);
      (result as Promise<unknown>).then(
        () => {
          if (!mounted.current) return;
          setPending(false);
          setValue("");
        },
        () => {
          if (mounted.current) setPending(false);
        },
      );
    } else {
      setValue("");
    }
    textareaRef.current?.focus();
  };

  // Navigateurs sans `field-sizing: content` : la hauteur suit le texte en JavaScript.
  useIsomorphicLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el || (typeof CSS !== "undefined" && CSS.supports?.("field-sizing", "content"))) return;
    el.style.height = "auto";
    if (el.scrollHeight > 0) el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const labelled = Boolean(field) || Boolean(rest["aria-labelledby"]);

  return (
    <form
      data-slot="chat-composer"
      data-disabled={disabled || undefined}
      data-busy={busy || undefined}
      className={cn("ui-composer", containerClassName)}
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
    >
      {actions != null && <div className="ui-composer__actions">{actions}</div>}
      <div className="ui-composer__field">
        <textarea
          ref={textareaRef}
          rows={1}
          enterKeyHint="send"
          placeholder={placeholder}
          aria-label={rest["aria-label"] ?? (labelled ? undefined : chat.composer)}
          className={cn("ui-composer__input", className)}
          value={value}
          disabled={disabled}
          readOnly={readOnly || busy}
          onChange={(event) => {
            onChange?.(event);
            setValue(event.target.value);
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || !sendOnEnter || event.key !== "Enter") return;
            // Maj+Entrée (ou Alt) : nouvelle ligne. Composition IME en cours : on ne touche à rien.
            if (event.shiftKey || event.altKey || event.nativeEvent.isComposing || event.keyCode === 229) return;
            event.preventDefault();
            send();
          }}
          {...controlProps}
        />
        <Button
          type="submit"
          size="icon-sm"
          className="ui-composer__send"
          aria-label={sendLabel}
          disabled={!busy && !canSend}
          loading={busy}
        >
          <ArrowUpIcon />
        </Button>
      </div>
    </form>
  );
});
