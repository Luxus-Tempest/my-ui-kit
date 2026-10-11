import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { useDirection } from "@radix-ui/react-direction";
import { cn } from "../../utils/cn";
import { useFieldControl } from "../field/Field";
import { useLocale, useMessages } from "../../i18n/LocaleProvider";

/** Étoile au trait (coins arrondis) : remplie par CSS pour la partie pleine. */
const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3.05l2.59 6.34 6.83.5-5.24 4.42 1.64 6.65L12 17.35l-5.82 3.61 1.64-6.65-5.24-4.42 6.83-.5z" />
  </svg>
);

export interface RatingLabels {
  /** Nom du groupe sans libellé. « Note ». */
  label: string;
  /**
   * Valeur lue, la note déjà mise en forme dans la locale : « 1 étoile sur 5 »,
   * « 3,5 étoiles sur 5 » (singulier en dessous de 2, comme le veut l'usage).
   */
  valueText: (value: number, formatted: string, max: number) => string;
}
export const RATING_LABELS: RatingLabels = {
  label: "Note",
  valueText: (value, formatted, max) => `${formatted} ${Math.abs(value) < 2 ? "étoile" : "étoiles"} sur ${max}`,
};

/** Ramène une valeur décimale sur la grille de la précision, sans dérive flottante. */
function snap(value: number, precision: number, mode: "floor" | "ceil") {
  const steps = value / precision;
  return (mode === "floor" ? Math.floor(steps + 1e-9) : Math.ceil(steps - 1e-9)) * precision;
}

export type RatingSize = "sm" | "default" | "lg";

type RootProps = React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>;

export interface RatingProps
  extends Omit<RootProps, "value" | "defaultValue" | "onValueChange" | "orientation" | "loop" | "children" | "asChild"> {
  /** Note (contrôlé). `null` : aucune note. */
  value?: number | null;
  /** Note initiale (non contrôlé). */
  defaultValue?: number | null;
  /** Appelé avec la nouvelle note, ou `null` quand elle est effacée. */
  onValueChange?: (value: number | null) => void;
  /** Note survolée (aperçu), `null` quand le pointeur quitte les étoiles : pour afficher « Excellent »… */
  onHoverChange?: (value: number | null) => void;
  /** Nombre d'étoiles. Défaut : 5. */
  max?: number;
  /** Pas de la note : `1` (défaut) ou `0.5` (demi-étoiles). */
  precision?: 1 | 0.5;
  /**
   * Affichage seul (note moyenne d'un produit) : une image nommée par la note,
   * hors de l'ordre de tabulation. Accepte une valeur décimale quelconque (4,3).
   */
  readOnly?: boolean;
  /** `sm` : 18 px. `default` : 24 px. `lg` : 32 px. */
  size?: RatingSize;
  /**
   * Icône d'une étoile, de préférence un SVG au trait (`lucide-react`) : la
   * partie pleine est remplie par CSS, la partie vide reste au trait.
   */
  icon?: React.ReactNode;
  /** Icône de la partie vide, si elle diffère de `icon`. */
  emptyIcon?: React.ReactNode;
  /** Nom annoncé de chaque valeur. Défaut : « 3 étoiles sur 5 », « 3,5 étoiles sur 5 ». */
  getLabelText?: (value: number, max: number) => string;
  /** Recliquer la note choisie l'efface (Suppr ou Retour arrière au clavier). Défaut : `true`. */
  allowClear?: boolean;
}

/**
 * Note en étoiles. Sémantique d'un groupe de boutons radio (comme MUI) : chaque
 * valeur est une option nommée « 3 étoiles sur 5 », une seule tabulation pour
 * tout le groupe. Au clavier : → / ↑ augmente, ← / ↓ diminue (en dessous de la
 * première valeur, la note s'efface), Origine / Fin pour la plus basse / la plus
 * haute, Suppr ou Retour arrière efface. Au pointeur : aperçu au survol, clic
 * pour noter, nouveau clic sur la note pour l'effacer (`allowClear`).
 *
 * Couleur des étoiles pleines : l'or de la palette (`--ui-c4`) mêlé à parts égales
 * à `--ui-warn`. `--ui-c4` seul est sous 3:1 sur les surfaces claires (élément
 * graphique d'un contrôle, WCAG 1.4.11) ; `--ui-warn` seul vire au bronze en
 * clair. Le mélange reste doré et tient 3:1 en clair comme en sombre. La partie
 * vide est au trait `--ui-outline` (3:1) : plein et vide se distinguent par la
 * forme, pas seulement par la couleur.
 *
 * Se branche sur un `Field` (libellé, aide, erreur, désactivé). Hors `Field`,
 * le groupe s'annonce « Note » (surchargeable par `aria-label`).
 */
export const Rating = React.forwardRef<HTMLDivElement, RatingProps>(function Rating(props, ref) {
  const {
    value: valueProp,
    defaultValue = null,
    onValueChange,
    onHoverChange,
    max: maxProp = 5,
    precision = 1,
    readOnly = false,
    size = "default",
    icon,
    emptyIcon,
    getLabelText: getLabelTextProp,
    allowClear = true,
    className,
    dir,
    onPointerLeave,
    ...rest
  } = props;
  const ratingLabels = useMessages("rating", RATING_LABELS);
  const locale = useLocale();
  const getLabelText =
    getLabelTextProp ??
    ((v: number, m: number) => ratingLabels.valueText(v, new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(v), m));
  const max = Math.max(1, Math.round(maxProp));
  const {
    name,
    form,
    required,
    disabled,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    ...domProps
  } = useFieldControl(rest, { labelledBy: true });
  const direction = useDirection(dir);
  const autoId = React.useId();

  const controlled = valueProp !== undefined;
  const [inner, setInner] = React.useState<number | null>(defaultValue);
  const value = controlled ? valueProp : inner;
  // Dernière valeur émise : évite un double appel quand le clavier et Radix
  // choisissent la même option dans le même geste.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  const [hover, setHoverState] = React.useState<number | null>(null);
  const hoverRef = React.useRef<number | null>(null);
  const itemRefs = React.useRef(new Map<number, HTMLButtonElement>());

  const setValue = (next: number | null) => {
    if (next === valueRef.current) return;
    valueRef.current = next;
    if (!controlled) setInner(next);
    onValueChange?.(next);
  };
  const setHover = (next: number | null) => {
    if (next === hoverRef.current) return;
    hoverRef.current = next;
    setHoverState(next);
    onHoverChange?.(next);
  };

  const display = hover ?? value ?? 0;
  const hoveredStar = hover !== null ? Math.ceil(hover) : null;
  const fullIcon = icon ?? <StarIcon />;
  const outlineIcon = emptyIcon ?? icon ?? <StarIcon />;

  const renderStar = (index: number, items?: React.ReactNode) => {
    const fill = Math.min(1, Math.max(0, display - (index - 1)));
    return (
      <span
        key={index}
        className="ui-rating__star"
        data-fill={fill === 1 ? "full" : fill === 0 ? "empty" : "partial"}
        data-hover={hoveredStar === index || undefined}
        style={{ "--_clip": `${Math.round((1 - fill) * 1000) / 10}%` } as React.CSSProperties}
      >
        <span className="ui-rating__icon ui-rating__icon--empty" aria-hidden="true">
          {outlineIcon}
        </span>
        <span className="ui-rating__icon ui-rating__icon--full" aria-hidden="true">
          {fullIcon}
        </span>
        {items}
      </span>
    );
  };
  const indexes = Array.from({ length: max }, (_, i) => i + 1);

  /* ── Lecture seule : une image nommée par la note ───────────────── */
  if (readOnly) {
    const textId = `${autoId}-text`;
    const ownLabelId = `${autoId}-label`;
    const labelledBy = [ariaLabelledBy, ariaLabel ? ownLabelId : null, textId].filter(Boolean).join(" ");
    return (
      <div
        ref={ref}
        role="img"
        data-slot="rating"
        data-size={size}
        data-readonly=""
        dir={direction}
        className={cn("ui-rating", className)}
        {...domProps}
        aria-labelledby={labelledBy}
      >
        {indexes.map((index) => renderStar(index))}
        {ariaLabel && (
          <span id={ownLabelId} hidden>
            {ariaLabel}
          </span>
        )}
        <span id={textId} hidden>
          {getLabelText(value ?? 0, max)}
        </span>
      </div>
    );
  }

  /* ── Interactif : groupe de boutons radio ───────────────────────── */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const current = valueRef.current;
    const forward = direction === "rtl" ? "ArrowLeft" : "ArrowRight";
    const backward = direction === "rtl" ? "ArrowRight" : "ArrowLeft";
    let next: number | null;
    switch (event.key) {
      case forward:
      case "ArrowUp":
        next = Math.min(max, snap(current ?? 0, precision, "floor") + precision);
        break;
      case backward:
      case "ArrowDown": {
        if (current === null) {
          event.preventDefault();
          return;
        }
        const previous = snap(current, precision, "ceil") - precision;
        next = previous >= precision ? previous : allowClear ? null : precision;
        break;
      }
      case "Home":
        next = precision;
        break;
      case "End":
        next = max;
        break;
      case "Delete":
      case "Backspace":
        if (!allowClear) return;
        next = null;
        break;
      default:
        return;
    }
    // Empêche le déplacement de Radix : la valeur et le focus avancent ensemble, sans boucler.
    event.preventDefault();
    setHover(null);
    setValue(next);
    itemRefs.current.get(next ?? precision)?.focus();
  };

  const renderItems = (index: number) => {
    const values = precision === 0.5 ? [index - 0.5, index] : [index];
    return values.map((itemValue) => (
      <RadioGroupPrimitive.Item
        key={itemValue}
        ref={(element) => {
          if (element) itemRefs.current.set(itemValue, element);
          else itemRefs.current.delete(itemValue);
        }}
        value={String(itemValue)}
        aria-label={getLabelText(itemValue, max)}
        data-half={precision === 0.5 ? (itemValue % 1 === 0 ? "end" : "start") : undefined}
        className="ui-rating__item"
        onPointerEnter={() => {
          if (!disabled) setHover(itemValue);
        }}
        onKeyDown={handleKeyDown}
        onClick={(event) => {
          // Un vrai clic (detail > 0) sur la note en cours l'efface ; Espace ne l'efface pas.
          if (allowClear && event.detail > 0 && valueRef.current === itemValue) {
            event.preventDefault();
            setValue(null);
            setHover(null);
          }
        }}
      />
    ));
  };

  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      data-slot="rating"
      data-size={size}
      className={cn("ui-rating", className)}
      value={value === null ? null : String(value)}
      onValueChange={(next) => setValue(next === "" ? null : Number(next))}
      dir={direction}
      loop={false}
      name={name}
      form={form}
      required={required}
      disabled={disabled}
      aria-label={ariaLabel ?? (ariaLabelledBy ? undefined : ratingLabels.label)}
      aria-labelledby={ariaLabelledBy}
      {...domProps}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        setHover(null);
      }}
    >
      {indexes.map((index) => renderStar(index, renderItems(index)))}
    </RadioGroupPrimitive.Root>
  );
});
