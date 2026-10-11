import * as React from "react";
import { cn } from "../../utils/cn";
import { useMessages } from "../../i18n/LocaleProvider";

/**
 * Liste de paires libellé / valeur, comme le panneau « Détails » de Drive ou
 * la fiche « Infos » d'iOS. Sémantique native `<dl>` / `<dt>` / `<dd>`, chaque
 * paire enveloppée d'un `<div>` (`DescriptionItem`).
 *
 * - `layout="horizontal"` (défaut) : libellé à gauche, valeur à droite.
 * - `layout="vertical"` : libellé au-dessus de la valeur (panneau de Drive).
 * - `layout="grid"` : paires verticales en colonnes (`columns` au plus),
 *   qui passent à la ligne quand la place manque.
 * - `variant="inset"` : carte tonale groupée d'iOS, filets décalés.
 *
 * Une valeur se copie avec `<DescriptionDetails copyable>` : bouton « Copier »,
 * retour « Copié » visible et annoncé.
 */
export type DescriptionListLayout = "horizontal" | "vertical" | "grid";
export type DescriptionListVariant = "plain" | "inset";

export interface DescriptionListProps extends React.HTMLAttributes<HTMLDListElement> {
  layout?: DescriptionListLayout;
  /** `plain` (défaut) : posé sur le panneau. `inset` : carte groupée d'iOS. */
  variant?: DescriptionListVariant;
  /** Nombre de colonnes au plus en `layout="grid"` (2 par défaut). */
  columns?: 2 | 3 | 4;
}

export const DescriptionList = React.forwardRef<HTMLDListElement, DescriptionListProps>(function DescriptionList(
  { className, layout = "horizontal", variant = "plain", columns = 2, style, ...props },
  ref,
) {
  return (
    <dl
      ref={ref}
      data-slot="description-list"
      data-layout={layout}
      data-variant={variant}
      className={cn("ui-dl", className)}
      style={layout === "grid" ? ({ "--_cols": columns, ...style } as React.CSSProperties) : style}
      {...props}
    />
  );
});

/** Identifiant du libellé de la paire : le bouton « Copier » s'en sert pour se nommer. */
const ItemContext = React.createContext<{ termId: string } | null>(null);

export interface DescriptionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** En `layout="grid"` : nombre de colonnes occupées, ou toute la ligne (`"full"`). */
  span?: number | "full";
}

/** Une paire : un `DescriptionTerm` et un ou plusieurs `DescriptionDetails`. */
export const DescriptionItem = React.forwardRef<HTMLDivElement, DescriptionItemProps>(function DescriptionItem(
  { className, span, style, ...props },
  ref,
) {
  const termId = React.useId();
  const spanStyle =
    span == null ? undefined : ({ gridColumn: span === "full" ? "1 / -1" : `span ${span}` } as React.CSSProperties);
  return (
    <ItemContext.Provider value={{ termId }}>
      <div
        ref={ref}
        data-slot="description-item"
        className={cn("ui-dl__item", className)}
        style={spanStyle ? { ...spanStyle, ...style } : style}
        {...props}
      />
    </ItemContext.Provider>
  );
});

/** Libellé, en casse de phrase et sans deux-points. */
export const DescriptionTerm = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(function DescriptionTerm(
  { className, id, ...props },
  ref,
) {
  const item = React.useContext(ItemContext);
  return (
    <dt
      ref={ref}
      id={id ?? item?.termId}
      data-slot="description-term"
      className={cn("ui-dl__term", className)}
      {...props}
    />
  );
});

export interface DescriptionDetailsProps extends React.HTMLAttributes<HTMLElement> {
  /** Ajoute un bouton « Copier » après la valeur. */
  copyable?: boolean;
  /** Texte copié, s'il diffère du texte affiché (identifiant complet, lien brut…). */
  copyValue?: string;
  /** Libellé du bouton (annoncé avec le libellé de la paire : « Copier Identifiant »). */
  copyLabel?: string;
  /** Retour affiché et annoncé après la copie. */
  copiedLabel?: string;
  /** Appelé après une copie réussie, avec le texte copié. */
  onCopied?: (value: string) => void;
}

async function writeClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Permission refusée (iframe, navigateur restrictif) : repli ci-dessous.
    }
  }
  // Repli pour les contextes non sécurisés (http) ou sans permission : sélection d'un champ temporaire.
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  const ok = document.execCommand?.("copy");
  field.remove();
  if (!ok) throw new Error("Copie impossible");
}

const CopyIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
    <rect x="5.25" y="5.25" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M10.75 3.5v-.25a1.5 1.5 0 0 0-1.5-1.5h-5a1.5 1.5 0 0 0-1.5 1.5v5a1.5 1.5 0 0 0 1.5 1.5h.25"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
    <path d="m3.5 8.5 3 3 6-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export interface DescriptionListLabels {
  /** Bouton de copie d'une valeur. « Copier ». */
  copy: string;
  /** Confirmation de copie. « Copié ». */
  copied: string;
}
export const DESCRIPTION_LIST_LABELS: DescriptionListLabels = { copy: "Copier", copied: "Copié" };

/** Valeur. Copiable avec `copyable`. */
export const DescriptionDetails = React.forwardRef<HTMLElement, DescriptionDetailsProps>(function DescriptionDetails(
  {
    className,
    children,
    copyable,
    copyValue,
    copyLabel: copyLabelProp,
    copiedLabel: copiedLabelProp,
    onCopied,
    ...props
  },
  ref,
) {
  const item = React.useContext(ItemContext);
  const labels = useMessages("descriptionList", DESCRIPTION_LIST_LABELS);
  const copyLabel = copyLabelProp ?? labels.copy;
  const copiedLabel = copiedLabelProp ?? labels.copied;
  const valueRef = React.useRef<HTMLSpanElement>(null);
  const textId = React.useId();
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    const text = copyValue ?? valueRef.current?.textContent?.trim() ?? "";
    try {
      await writeClipboard(text);
    } catch {
      return;
    }
    setCopied(true);
    onCopied?.(text);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  if (!copyable) {
    return (
      <dd ref={ref} data-slot="description-details" className={cn("ui-dl__details", className)} {...props}>
        {children}
      </dd>
    );
  }

  return (
    <dd
      ref={ref}
      data-slot="description-details"
      data-copyable=""
      className={cn("ui-dl__details", className)}
      {...props}
    >
      <span ref={valueRef} className="ui-dl__value">
        {children}
      </span>
      <button
        type="button"
        className="ui-dl__copy"
        data-state={copied ? "copied" : "idle"}
        aria-labelledby={item ? `${textId} ${item.termId}` : textId}
        onClick={copy}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
        <span id={textId} className="ui-dl__copy-text">
          {copied ? copiedLabel : copyLabel}
        </span>
      </button>
      <span role="status" className="ui-sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </dd>
  );
});
