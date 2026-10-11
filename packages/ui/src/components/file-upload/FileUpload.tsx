import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";
import { useFieldContext, useFieldControl } from "../field/Field";
import { Button, buttonVariants } from "../button/Button";
import { Progress } from "../progress/Progress";

/* ══ Utilitaires ═════════════════════════════════════════════════════════ */

const SIZE_UNITS = ["o", "Ko", "Mo", "Go", "To"] as const;

export interface FormatFileSizeOptions {
  /**
   * `1024` (défaut) : multiples binaires, comme Windows et la plupart des
   * navigateurs ; `10 * 1024 * 1024` s'affiche « 10 Mo ». `1000` : comme macOS.
   */
  base?: 1000 | 1024;
  /** Décimales au plus (1 par défaut). Les octets restent entiers. */
  maximumFractionDigits?: number;
}

/**
 * Taille de fichier lisible, à la française : « 512 o », « 1,2 Mo », « 3 Go ».
 * L'unité est séparée par une espace insécable, la virgule est décimale.
 * Une valeur négative ou non finie vaut 0.
 *
 * @example formatFileSize(1_258_291) // "1,2 Mo"
 */
export function formatFileSize(bytes: number, options: FormatFileSizeOptions = {}): string {
  const { base = 1024, maximumFractionDigits = 1 } = options;
  let value = Number.isFinite(bytes) && bytes > 0 ? bytes : 0;
  let unit = 0;
  while (value >= base && unit < SIZE_UNITS.length - 1) {
    value /= base;
    unit += 1;
  }
  // 1 023,97 Ko s'arrondirait en « 1 024 Ko » : on passe alors à l'unité suivante.
  const digits = unit === 0 ? 0 : maximumFractionDigits;
  const factor = 10 ** digits;
  if (unit < SIZE_UNITS.length - 1 && Math.round(value * factor) / factor >= base) {
    value /= base;
    unit += 1;
  }
  const number = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: unit === 0 ? 0 : maximumFractionDigits }).format(value);
  return `${number} ${SIZE_UNITS[unit]}`;
}

/** Famille d'un fichier : choisit son pictogramme et sa teinte. */
export type FileKind =
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "document"
  | "spreadsheet"
  | "presentation"
  | "archive"
  | "code"
  | "file";

const EXTENSION_KINDS: Record<string, FileKind> = {};
const register = (kind: FileKind, extensions: string) => {
  for (const ext of extensions.split(" ")) EXTENSION_KINDS[ext] = kind;
};
register("image", "png jpg jpeg gif webp avif svg heic heif bmp tif tiff ico");
register("video", "mp4 mov webm mkv avi m4v mpeg mpg");
register("audio", "mp3 wav ogg oga flac m4a aac opus");
register("pdf", "pdf");
register("document", "doc docx odt rtf txt md pages");
register("spreadsheet", "xls xlsx xlsm ods csv tsv numbers");
register("presentation", "ppt pptx odp key");
register("archive", "zip rar 7z tar gz tgz bz2 xz");
register("code", "js jsx ts tsx json html css scss py java go rs rb php c h cpp cs sh xml yml yaml sql swift kt");

function getExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : "";
}

/** Famille d'un fichier, d'après son type MIME puis son extension. */
export function getFileKind(file: { name?: string; type?: string }): FileKind {
  const type = (file.type ?? "").toLowerCase();
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  if (type === "application/pdf") return "pdf";
  if (/spreadsheet|excel|text\/csv/.test(type)) return "spreadsheet";
  if (/presentation|powerpoint/.test(type)) return "presentation";
  if (/zip|compressed|x-tar|gzip|x-7z|x-rar/.test(type)) return "archive";
  if (/wordprocessing|msword|opendocument\.text|rtf/.test(type)) return "document";
  return EXTENSION_KINDS[getExtension(file.name ?? "")] ?? (type.startsWith("text/") ? "document" : "file");
}

function normalizeAccept(accept: string | readonly string[] | undefined): string[] {
  const list = typeof accept === "string" ? accept.split(",") : accept ?? [];
  return list.map((token) => token.trim().toLowerCase()).filter(Boolean);
}

/**
 * Le fichier respecte-t-il `accept` (même syntaxe que `<input type="file">`) ?
 * Extensions (`.pdf`), familles (`image/*`) et types exacts (`application/pdf`).
 */
export function isFileAccepted(file: { name?: string; type?: string }, accept?: string | readonly string[]): boolean {
  const tokens = normalizeAccept(accept);
  if (tokens.length === 0) return true;
  const name = (file.name ?? "").toLowerCase();
  const type = (file.type ?? "").toLowerCase();
  return tokens.some((token) => {
    if (token === "*" || token === "*/*") return true;
    if (token.startsWith(".")) return name.endsWith(token);
    if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1));
    return type === token;
  });
}

const ACCEPT_LABELS: Record<string, string> = {
  "image/*": "Images",
  "video/*": "Vidéos",
  "audio/*": "Audio",
  "text/*": "Texte",
  "application/pdf": "PDF",
  "image/jpeg": "JPG",
  "image/svg+xml": "SVG",
  "text/plain": "TXT",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/vnd.ms-excel": "XLS",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
};

/** « PNG, JPG ou PDF » d'après `accept` ; vide si tout est accepté. */
function describeAccept(tokens: string[]): string {
  const labels: string[] = [];
  for (const token of tokens) {
    let label = ACCEPT_LABELS[token];
    if (!label && token.startsWith(".")) label = token.slice(1).toUpperCase();
    if (!label && token.includes("/")) {
      const subtype = token.split("/")[1] ?? "";
      if (/^[a-z0-9]{2,5}$/.test(subtype)) label = subtype.toUpperCase();
    }
    if (label === "JPEG") label = "JPG";
    if (label && !labels.includes(label)) labels.push(label);
  }
  if (labels.length <= 1) return labels[0] ?? "";
  return `${labels.slice(0, -1).join(", ")} ou ${labels[labels.length - 1]}`;
}

/* ══ Pictogrammes (SVG en ligne) ═════════════════════════════════════════ */

const svgProps = {
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const PAGE = "M11.5 2.75H6.25a1.5 1.5 0 0 0-1.5 1.5v11.5a1.5 1.5 0 0 0 1.5 1.5h7.5a1.5 1.5 0 0 0 1.5-1.5V6.5z";
const PAGE_FOLD = "M11.5 2.75V6.5h3.75";

function KindIcon({ kind }: { kind: FileKind }) {
  switch (kind) {
    case "image":
      return (
        <svg {...svgProps}>
          <rect x="3" y="3.5" width="14" height="13" rx="2.25" />
          <circle cx="7.5" cy="8" r="1.4" />
          <path d="m3.5 14.5 3.75-3.75 2.75 2.75 2-2 4.5 4.5" />
        </svg>
      );
    case "video":
      return (
        <svg {...svgProps}>
          <rect x="2.75" y="4.5" width="14.5" height="11" rx="2.25" />
          <path d="M8.5 7.75v4.5l3.75-2.25z" fill="currentColor" />
        </svg>
      );
    case "audio":
      return (
        <svg {...svgProps}>
          <path d="M7.75 14.25V5.25l8-1.75v9" />
          <circle cx="5.75" cy="14.25" r="2" />
          <circle cx="13.75" cy="12.5" r="2" />
        </svg>
      );
    case "spreadsheet":
      return (
        <svg {...svgProps}>
          <path d={PAGE} />
          <path d={PAGE_FOLD} />
          <path d="M7.25 10h5.5v4.25h-5.5zM10 10v4.25M7.25 12.1h5.5" />
        </svg>
      );
    case "presentation":
      return (
        <svg {...svgProps}>
          <rect x="2.75" y="3.75" width="14.5" height="9.5" rx="1.75" />
          <path d="M10 13.25v3M7 16.5h6M7.25 9.5V8.25M10 9.5V6.75M12.75 9.5V7.75" />
        </svg>
      );
    case "archive":
      return (
        <svg {...svgProps}>
          <path d={PAGE} />
          <path d={PAGE_FOLD} />
          <path d="M9 4.5h1.25M9 7h1.25M9 9.5h1.25" />
          <rect x="8.4" y="11.5" width="2.45" height="3" rx="0.8" />
        </svg>
      );
    case "code":
      return (
        <svg {...svgProps}>
          <path d="M7.25 6.25 3.5 10l3.75 3.75M12.75 6.25 16.5 10l-3.75 3.75" />
        </svg>
      );
    case "pdf":
    case "document":
      return (
        <svg {...svgProps}>
          <path d={PAGE} />
          <path d={PAGE_FOLD} />
          <path d="M7.5 10.25h5M7.5 13.25h3.5" />
        </svg>
      );
    default:
      return (
        <svg {...svgProps}>
          <path d={PAGE} />
          <path d={PAGE_FOLD} />
        </svg>
      );
  }
}

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 15.5V4.5M7.75 8.75 12 4.5l4.25 4.25" />
    <path d="M4.5 14.5v2.75A2.25 2.25 0 0 0 6.75 19.5h10.5a2.25 2.25 0 0 0 2.25-2.25V14.5" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

const RetryIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12.75 8A4.75 4.75 0 1 1 11.36 4.64" />
    <path d="M12.25 2.5v2.75H9.5" />
  </svg>
);

const DoneIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="7.25" fill="currentColor" />
    <path className="ui-file-upload-item__done-check" d="m6.9 10.2 2.1 2.05 4.1-4.4" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ══ Dropzone ════════════════════════════════════════════════════════════ */

/** Raison d'un refus : codes stables, message en français prêt à afficher. */
export type FileRejectionCode = "file-invalid-type" | "file-too-large" | "too-many-files" | (string & {});

export interface FileUploadError {
  code: FileRejectionCode;
  message: string;
}

export interface FileRejection {
  file: File;
  errors: FileUploadError[];
}

export interface DropzoneLabels {
  /** Titre au repos. « Déposez vos fichiers ici » ; compacte : « Glissez vos fichiers ici ». */
  title?: React.ReactNode;
  /** Invitation à parcourir : « ou parcourez vos fichiers » ; compacte : le bouton « Parcourir ». */
  browse?: React.ReactNode;
  /** Titre pendant le survol par des fichiers acceptables. « Relâchez pour importer ». */
  dragActive?: React.ReactNode;
  /** Titre pendant le survol par des fichiers refusés. « Format non accepté ». */
  dragReject?: React.ReactNode;
  /** Refus de type. « Format non accepté ». */
  invalidType?: string;
  /** Refus de taille. « Fichier trop volumineux (max. 10 Mo) ». */
  tooLarge?: (maxSize: number) => string;
  /** Refus de nombre. « Trop de fichiers (max. 5) », « Un seul fichier à la fois ». */
  tooMany?: (maxFiles: number) => string;
  /** Annonce aux lecteurs d'écran après un ajout. « 3 fichiers ajoutés ». */
  accepted?: (count: number) => string;
  /** Annonce après un refus. « 1 fichier refusé ». */
  rejected?: (count: number) => string;
}

const plural = (count: number, one: string, many: string) => (count > 1 ? many : one);

const DROPZONE_LABELS = {
  title: "Déposez vos fichiers ici",
  browse: (
    <>
      ou <span className="ui-dropzone__link">parcourez vos fichiers</span>
    </>
  ),
  dragActive: "Relâchez pour importer",
  dragReject: "Format non accepté",
  invalidType: "Format non accepté",
  tooLarge: (maxSize: number) => `Fichier trop volumineux (max. ${formatFileSize(maxSize)})`,
  tooMany: (maxFiles: number) =>
    maxFiles <= 0
      ? "Nombre maximal de fichiers atteint"
      : maxFiles === 1
        ? "Un seul fichier à la fois"
        : `Trop de fichiers (max. ${maxFiles})`,
  accepted: (count: number) => `${count} ${plural(count, "fichier ajouté", "fichiers ajoutés")}`,
  rejected: (count: number) => `${count} ${plural(count, "fichier refusé", "fichiers refusés")}`,
} satisfies Required<DropzoneLabels>;

const COMPACT_LABELS: Partial<Record<keyof DropzoneLabels, React.ReactNode>> = {
  title: "Glissez vos fichiers ici",
  browse: "Parcourir",
};

export const dropzoneVariants = cva("ui-dropzone", {
  variants: {
    variant: {
      /** Grande zone centrée : pastille d'icône, titre, invitation et contraintes. */
      default: "ui-dropzone--default",
      /** Une ligne : icône, texte et bouton « Parcourir », pour un formulaire dense. */
      compact: "ui-dropzone--compact",
    },
  },
  defaultVariants: { variant: "default" },
});

type DropzoneVariantProps = VariantProps<typeof dropzoneVariants>;
export type DropzoneVariant = NonNullable<DropzoneVariantProps["variant"]>;

export interface DropzoneProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    DropzoneVariantProps {
  /** Types acceptés, syntaxe de `<input accept>` : `"image/*,.pdf"` ou `["image/*", ".pdf"]`. */
  accept?: string | readonly string[];
  /** Plusieurs fichiers à la fois (défaut). `false` : le premier fichier valide seulement. */
  multiple?: boolean;
  /** Taille maximale d'un fichier, en octets (`10 * 1024 * 1024` → « 10 Mo »). */
  maxSize?: number;
  /**
   * Nombre maximal de fichiers par dépôt. Pour une limite globale, passer ce
   * qu'il reste : `maxFiles={5 - fichiers.length}`.
   */
  maxFiles?: number;
  disabled?: boolean;
  required?: boolean;
  /** Nom du champ `<input type="file">` (formulaire natif). */
  name?: string;
  /** Contrôle supplémentaire (doublon, quota…) : renvoie la ou les erreurs, ou `null`. */
  validator?: (file: File) => FileUploadError | FileUploadError[] | null | undefined;
  /** Fichiers retenus, dans l'ordre du dépôt. */
  onFilesAccepted?: (files: File[]) => void;
  /** Fichiers refusés, chacun avec ses erreurs (code et message en français). */
  onFilesRejected?: (rejections: FileRejection[]) => void;
  /** Pictogramme de la pastille (flèche d'import par défaut). */
  icon?: React.ReactNode;
  /**
   * Ligne de contraintes sous le titre. Par défaut, déduite de `accept`,
   * `maxSize` et `maxFiles` (« PNG, JPG ou PDF · 10 Mo max. ») ; `null` la masque.
   */
  description?: React.ReactNode;
  /** Libellés et messages internes, à traduire ou préciser. */
  labels?: DropzoneLabels;
  /** Référence vers le `<input type="file">` (pour l'ouvrir par programme : `.click()`). */
  inputRef?: React.Ref<HTMLInputElement>;
  /**
   * Empêche le navigateur d'ouvrir un fichier lâché à côté de la zone
   * (curseur « interdit » hors des zones de dépôt). Activé par défaut.
   */
  preventDocumentDrop?: boolean;
  /** Remplace le contenu par défaut (pastille, titre, contraintes) ; le champ fichier reste. */
  children?: React.ReactNode;
}

function hasFiles(event: { dataTransfer: DataTransfer | null }) {
  return Array.from(event.dataTransfer?.types ?? []).includes("Files");
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value;
}

const INTERACTIVE = "a[href], button, input, select, textarea, label, [role='button'], [contenteditable='true']";

/**
 * Zone de dépôt de fichiers, l'import de Drive : glisser-déposer ou clic pour
 * parcourir. Le vrai contrôle est un `<input type="file">` masqué mais
 * focalisable : Tab l'atteint, Entrée ou Espace ouvre le sélecteur, et un
 * `Field` lui donne libellé, aide et erreur.
 *
 * Survolée par des fichiers, la zone prend le conteneur de sélection
 * (`data-drag="accept"`), ou le ton d'erreur si aucun n'est accepté
 * (`data-drag="reject"`). Les fichiers sont triés à la réception :
 * `onFilesAccepted(files)` et `onFilesRejected(rejections)`, messages compris.
 */
export const Dropzone = React.forwardRef<HTMLDivElement, DropzoneProps>(function Dropzone(
  {
    className,
    variant,
    accept,
    multiple = true,
    maxSize,
    maxFiles,
    disabled,
    required,
    name,
    validator,
    onFilesAccepted,
    onFilesRejected,
    icon,
    description,
    labels: labelsProp,
    inputRef: inputRefProp,
    preventDocumentDrop = true,
    children,
    id,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
    onClick,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDrop,
    ...props
  },
  ref,
) {
  const field = useFieldContext();
  const control = useFieldControl({
    id,
    disabled,
    required,
    "aria-describedby": ariaDescribedBy,
    "aria-invalid": ariaInvalid,
  });
  const isDisabled = Boolean(control.disabled);
  const isInvalid = control["aria-invalid"] === true || control["aria-invalid"] === "true";
  const isCompact = variant === "compact";

  const labels = {
    ...DROPZONE_LABELS,
    ...(isCompact ? COMPACT_LABELS : null),
    ...labelsProp,
  } as typeof DROPZONE_LABELS;

  const tokens = React.useMemo(() => normalizeAccept(accept), [accept]);
  const titleId = React.useId();
  const hintId = React.useId();
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const dragDepth = React.useRef(0);
  const [drag, setDrag] = React.useState<"accept" | "reject" | null>(null);
  const [announcement, setAnnouncement] = React.useState("");

  const limit = multiple ? maxFiles : 1;

  const autoHint = [
    describeAccept(tokens),
    maxSize != null ? `${formatFileSize(maxSize)} max.` : "",
    multiple && maxFiles != null && maxFiles > 0 ? `${maxFiles} ${plural(maxFiles, "fichier", "fichiers")} max.` : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const hint = description === undefined ? autoHint || null : description;
  const hasDefaultContent = children == null;
  const showHint = hasDefaultContent && hint != null && hint !== "";

  const setInputRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      assignRef(inputRefProp, node);
    },
    [inputRefProp],
  );

  // Hors de la zone, un fichier lâché ouvrirait le fichier à la place de la page.
  React.useEffect(() => {
    if (!preventDocumentDrop || typeof document === "undefined") return;
    const guard = (event: DragEvent) => {
      if (event.defaultPrevented || !hasFiles(event)) return;
      event.preventDefault();
      if (event.type === "dragover" && event.dataTransfer) event.dataTransfer.dropEffect = "none";
    };
    document.addEventListener("dragover", guard);
    document.addEventListener("drop", guard);
    return () => {
      document.removeEventListener("dragover", guard);
      document.removeEventListener("drop", guard);
    };
  }, [preventDocumentDrop]);

  const processFiles = (list: File[]) => {
    if (list.length === 0) return;
    const accepted: File[] = [];
    const rejected: FileRejection[] = [];
    for (const file of list) {
      const errors: FileUploadError[] = [];
      if (!isFileAccepted(file, tokens)) errors.push({ code: "file-invalid-type", message: labels.invalidType });
      if (maxSize != null && file.size > maxSize) errors.push({ code: "file-too-large", message: labels.tooLarge(maxSize) });
      const custom = validator?.(file);
      if (custom) errors.push(...(Array.isArray(custom) ? custom : [custom]));
      if (errors.length === 0 && limit != null && accepted.length >= limit) {
        errors.push({ code: "too-many-files", message: labels.tooMany(limit) });
      }
      if (errors.length > 0) rejected.push({ file, errors });
      else accepted.push(file);
    }
    if (accepted.length > 0) onFilesAccepted?.(accepted);
    if (rejected.length > 0) onFilesRejected?.(rejected);

    const parts: string[] = [];
    if (accepted.length > 0) parts.push(labels.accepted(accepted.length));
    if (rejected.length > 0) {
      const details = rejected.map((r) => `${r.file.name} : ${r.errors[0]?.message ?? ""}`).join(" ; ");
      parts.push(`${labels.rejected(rejected.length)} : ${details}`);
    }
    setAnnouncement(parts.join(". "));
  };

  /** Pendant le glisser, seul le type MIME est connu : refus si aucun fichier ne passerait. */
  const dragVerdict = (dataTransfer: DataTransfer | null): "accept" | "reject" => {
    const items = Array.from(dataTransfer?.items ?? []).filter((item) => item.kind === "file");
    const mimeOnly = tokens.length > 0 && tokens.every((token) => !token.startsWith("."));
    if (!mimeOnly || items.length === 0) return "accept";
    const known = items.filter((item) => item.type);
    if (known.length < items.length) return "accept";
    return known.some((item) => isFileAccepted({ type: item.type }, tokens)) ? "accept" : "reject";
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || isDisabled) return;
    const target = event.target as HTMLElement;
    if (target === inputRef.current) return;
    // Un bouton ou un lien placé dans `children` garde son propre comportement.
    const interactive = target.closest(INTERACTIVE);
    if (interactive && interactive !== event.currentTarget && event.currentTarget.contains(interactive)) return;
    inputRef.current?.click();
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    onDragEnter?.(event);
    if (event.defaultPrevented || isDisabled || !hasFiles(event)) return;
    event.preventDefault();
    dragDepth.current += 1;
    setDrag(dragVerdict(event.dataTransfer));
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    onDragOver?.(event);
    if (event.defaultPrevented || isDisabled || !hasFiles(event)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = drag === "reject" ? "none" : "copy";
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    onDragLeave?.(event);
    if (isDisabled || !hasFiles(event)) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDrag(null);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    onDrop?.(event);
    dragDepth.current = 0;
    setDrag(null);
    if (event.defaultPrevented || isDisabled) return;
    event.preventDefault();
    processFiles(Array.from(event.dataTransfer?.files ?? []));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(Array.from(event.currentTarget.files ?? []));
    // Permet de choisir à nouveau le même fichier (après un retrait, par exemple).
    event.currentTarget.value = "";
  };

  const title = drag === "accept" ? labels.dragActive : drag === "reject" ? labels.dragReject : labels.title;
  // Nom accessible : libellé du Field, puis le titre visible de la zone.
  const labelledBy =
    ariaLabelledBy ??
    (ariaLabel ? undefined : [field?.labelId, hasDefaultContent ? titleId : null].filter(Boolean).join(" ") || undefined);
  const describedBy = [showHint ? hintId : null, control["aria-describedby"]].filter(Boolean).join(" ") || undefined;

  return (
    <div
      ref={ref}
      data-slot="dropzone"
      data-variant={variant ?? "default"}
      data-drag={drag ?? undefined}
      data-disabled={isDisabled || undefined}
      data-invalid={isInvalid || undefined}
      className={cn(dropzoneVariants({ variant }), className)}
      onClick={handleClick}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      {...props}
    >
      <input
        ref={setInputRef}
        type="file"
        className="ui-dropzone__input"
        id={control.id}
        name={name}
        accept={tokens.length > 0 ? tokens.join(",") : undefined}
        multiple={multiple}
        disabled={isDisabled}
        required={control.required}
        aria-label={ariaLabel}
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        aria-invalid={isInvalid || undefined}
        onChange={handleChange}
      />
      {hasDefaultContent ? (
        <>
          <span className="ui-dropzone__icon" aria-hidden="true">
            {icon ?? <UploadIcon />}
          </span>
          <span className="ui-dropzone__text">
            <span id={titleId} className="ui-dropzone__title">
              {title}
            </span>
            {!isCompact && <span className="ui-dropzone__browse">{labels.browse}</span>}
            {showHint && (
              <span id={hintId} className="ui-dropzone__hint">
                {hint}
              </span>
            )}
          </span>
          {isCompact && (
            <span className={cn(buttonVariants({ variant: "outline", size: "sm" }), "ui-dropzone__button")} aria-hidden="true">
              {labels.browse}
            </span>
          )}
        </>
      ) : (
        children
      )}
      <span className="ui-dropzone__status" role="status">
        {announcement}
      </span>
    </div>
  );
});

/* ══ Liste de fichiers ═══════════════════════════════════════════════════ */

export type FileUploadItemVariant = "row" | "chip";
export type FileUploadStatus = "uploading" | "done" | "error";

const FileUploadListContext = React.createContext<{ variant: FileUploadItemVariant } | null>(null);

export interface FileUploadListProps extends React.HTMLAttributes<HTMLUListElement> {
  /**
   * `row` (défaut) : une ligne par fichier, comme le panneau d'import de Drive.
   * `chip` : pièces jointes compactes en rangée, comme dans une messagerie.
   */
  variant?: FileUploadItemVariant;
}

/** Liste des fichiers importés ou en cours d'envoi. Donner un `aria-label` (« Fichiers joints »). */
export const FileUploadList = React.forwardRef<HTMLUListElement, FileUploadListProps>(function FileUploadList(
  { className, variant = "row", ...props },
  ref,
) {
  const context = React.useMemo(() => ({ variant }), [variant]);
  return (
    <FileUploadListContext.Provider value={context}>
      <ul
        ref={ref}
        role="list"
        data-slot="file-upload-list"
        data-variant={variant}
        className={cn("ui-file-upload-list", className)}
        {...props}
      />
    </FileUploadListContext.Provider>
  );
});

export interface FileUploadItemLabels {
  /** Bouton de retrait. « Retirer {nom} ». */
  remove?: (name: string) => string;
  /** Bouton de retrait pendant l'envoi. « Annuler l'envoi de {nom} ». */
  cancel?: (name: string) => string;
  /** Texte du bouton de relance. « Réessayer ». */
  retry?: string;
  /** Nom complet du bouton de relance. « Réessayer l'envoi de {nom} ». */
  retryLabel?: (name: string) => string;
  /** Nom de la barre de progression. « Envoi de {nom} ». */
  progress?: (name: string) => string;
  /** État terminé, pour les lecteurs d'écran. « Importé ». */
  done?: string;
  /** Message d'erreur par défaut. « Échec de l'envoi ». */
  error?: string;
}

const ITEM_LABELS: Required<FileUploadItemLabels> = {
  remove: (name) => `Retirer ${name}`,
  cancel: (name) => `Annuler l'envoi de ${name}`,
  retry: "Réessayer",
  retryLabel: (name) => `Réessayer l'envoi de ${name}`,
  progress: (name) => `Envoi de ${name}`,
  done: "Importé",
  error: "Échec de l'envoi",
};

export interface FileUploadItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "children"> {
  /** Le fichier local : fournit nom, taille, type et la miniature des images. */
  file?: File | Blob;
  /** Nom affiché (sinon `file.name`), tronqué au milieu pour garder l'extension. */
  name?: string;
  /** Taille en octets (sinon `file.size`). */
  size?: number;
  /** Type MIME (sinon `file.type`). */
  type?: string;
  /** Miniature distante, pour un fichier déjà enregistré sur le serveur. */
  previewUrl?: string;
  /** Miniature des images (défaut `true`). */
  preview?: boolean;
  /** `done` par défaut. */
  status?: FileUploadStatus;
  /** Avancement de l'envoi, de 0 à 100 ; absent pendant `uploading` : barre indéterminée. */
  progress?: number;
  /** Message affiché en état `error`. */
  error?: React.ReactNode;
  /** Remplace la ligne « PDF · 1,2 Mo ». */
  description?: React.ReactNode;
  /** Remplace le pictogramme du type de fichier. */
  icon?: React.ReactNode;
  /** Affiche le bouton « Retirer » (« Annuler l'envoi » pendant l'envoi). */
  onRemove?: () => void;
  /** Affiche « Réessayer » en état `error`. */
  onRetry?: () => void;
  /** Actions supplémentaires (menu « ⋯ »…), avant le bouton de retrait. */
  actions?: React.ReactNode;
  /** Hérite de `FileUploadList`. */
  variant?: FileUploadItemVariant;
  labels?: FileUploadItemLabels;
}

/** URL locale d'aperçu, révoquée au démontage ou au changement de fichier. */
function useObjectUrl(blob: Blob | undefined) {
  const [url, setUrl] = React.useState<string>();
  React.useEffect(() => {
    if (!blob || typeof URL === "undefined" || typeof URL.createObjectURL !== "function") {
      setUrl(undefined);
      return;
    }
    const next = URL.createObjectURL(blob);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [blob]);
  return url;
}

/** Coupe le nom en deux : le début s'ellipse, la fin (extension comprise) reste lisible. */
function splitName(name: string): [string, string] {
  const ext = getExtension(name);
  const tail = Math.min(name.length, (ext ? ext.length + 1 : 0) + 6);
  if (name.length <= tail + 4) return [name, ""];
  return [name.slice(0, name.length - tail), name.slice(name.length - tail)];
}

function FileName({ name }: { name: string }) {
  const [start, end] = splitName(name);
  return (
    <span className="ui-file-upload-item__name" title={name}>
      <span className="ui-file-upload-item__name-start">{start}</span>
      {end && <span className="ui-file-upload-item__name-end">{end}</span>}
    </span>
  );
}

/**
 * Un fichier de la liste : pictogramme coloré selon le type (ou miniature
 * d'une image), nom tronqué au milieu, taille, barre de progression pendant
 * l'envoi, message et « Réessayer » en cas d'échec, bouton « Retirer » nommé.
 */
export const FileUploadItem = React.forwardRef<HTMLLIElement, FileUploadItemProps>(function FileUploadItem(
  {
    className,
    file,
    name: nameProp,
    size: sizeProp,
    type: typeProp,
    previewUrl,
    preview = true,
    status = "done",
    progress,
    error,
    description,
    icon,
    onRemove,
    onRetry,
    actions,
    variant: variantProp,
    labels: labelsProp,
    ...props
  },
  ref,
) {
  const list = React.useContext(FileUploadListContext);
  const variant = variantProp ?? list?.variant ?? "row";
  const isChip = variant === "chip";
  const labels = { ...ITEM_LABELS, ...labelsProp };

  const name = nameProp ?? (file && "name" in file ? file.name : "");
  const size = sizeProp ?? file?.size;
  const type = typeProp ?? file?.type ?? "";
  const kind = getFileKind({ name, type });

  const wantsPreview = preview && kind === "image";
  const objectUrl = useObjectUrl(wantsPreview && !previewUrl ? file : undefined);
  const thumbnail = wantsPreview ? previewUrl ?? objectUrl : undefined;
  const [failedThumbnail, setFailedThumbnail] = React.useState<string>();
  const showThumbnail = thumbnail != null && failedThumbnail !== thumbnail;

  const percent = progress == null ? null : Math.min(Math.max(progress, 0), 100);
  const meta = [getExtension(name).toUpperCase(), size != null ? formatFileSize(size) : ""].filter(Boolean).join(" · ");

  let secondLine: React.ReactNode;
  if (status === "uploading") {
    secondLine = (
      <span className="ui-file-upload-item__progress">
        <Progress size="sm" value={percent} aria-label={labels.progress(name)} />
        {percent != null && !isChip && (
          <span className="ui-file-upload-item__percent" aria-hidden="true">
            {Math.round(percent)}&nbsp;%
          </span>
        )}
      </span>
    );
  } else if (status === "error") {
    secondLine = <span className="ui-file-upload-item__error">{error ?? labels.error}</span>;
  } else {
    secondLine = (description ?? meta) ? <span className="ui-file-upload-item__meta">{description ?? meta}</span> : null;
  }

  return (
    <li
      ref={ref}
      data-slot="file-upload-item"
      data-variant={variant}
      data-status={status}
      data-kind={kind}
      className={cn("ui-file-upload-item", className)}
      {...props}
    >
      <span className="ui-file-upload-item__media" aria-hidden="true">
        {showThumbnail ? (
          <img src={thumbnail} alt="" draggable={false} onError={() => setFailedThumbnail(thumbnail)} />
        ) : (
          icon ?? <KindIcon kind={kind} />
        )}
      </span>
      <span className="ui-file-upload-item__body">
        <FileName name={name} />
        {secondLine}
      </span>
      <span className="ui-file-upload-item__actions">
        {status === "done" && !isChip && (
          <span className="ui-file-upload-item__done">
            <DoneIcon />
            <span className="ui-file-upload-item__sr">{labels.done}</span>
          </span>
        )}
        {actions}
        {status === "error" && onRetry && (
          isChip ? (
            <Button
              variant="ghost"
              size="icon-sm"
              className="ui-file-upload-item__action ui-file-upload-item__retry"
              aria-label={labels.retryLabel(name)}
              onClick={onRetry}
            >
              <RetryIcon />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="ui-file-upload-item__retry"
              aria-label={labels.retryLabel(name)}
              onClick={onRetry}
            >
              <RetryIcon />
              {labels.retry}
            </Button>
          )
        )}
        {onRemove && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="ui-file-upload-item__action ui-file-upload-item__remove"
            aria-label={status === "uploading" ? labels.cancel(name) : labels.remove(name)}
            onClick={onRemove}
          >
            <CloseIcon />
          </Button>
        )}
      </span>
    </li>
  );
});
