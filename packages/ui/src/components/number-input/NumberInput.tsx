import * as React from "react";
import { cn } from "../../utils/cn";
import { useFieldControl } from "../field/Field";
import type { InputDensity } from "../input/Input";
import { useLocale, useMessages } from "../../i18n/LocaleProvider";

export interface NumberInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "defaultValue" | "onChange" | "min" | "max" | "step" | "size" | "inputMode" | "role"
  > {
  /** Valeur contrôlée ; `null` = champ vide. */
  value?: number | null;
  /** Valeur initiale (non contrôlé). */
  defaultValue?: number | null;
  /**
   * Appelé à chaque valeur utilisable : pendant la frappe dès que la saisie est
   * lisible et dans les bornes (un total peut se recalculer en direct), puis à
   * la validation (pas, Entrée, sortie du champ) avec la valeur bornée, ou
   * `null` si le champ a été vidé. Jamais avec une valeur illisible ou hors bornes.
   */
  onValueChange?: (value: number | null) => void;
  min?: number;
  max?: number;
  /** Pas des flèches et des boutons ; Pg. préc. / Pg. suiv. avancent de 10 pas. Défaut : 1. */
  step?: number;
  /**
   * Options de `Intl.NumberFormat` (locale fr-FR) : décimales, devise, pourcentage…
   * Ex. `{ style: "currency", currency: "EUR" }` ou `{ minimumFractionDigits: 2 }`.
   */
  formatOptions?: Intl.NumberFormatOptions;
  /** Suffixe affiché dans le champ (« MAD », « kg »…), annoncé avec la valeur. */
  unit?: string;
  /** `default` : 40 px. `sm` : 32 px. */
  density?: InputDensity;
  /** Nom accessible du bouton −. Défaut : « Diminuer ». */
  decrementLabel?: string;
  /** Nom accessible du bouton +. Défaut : « Augmenter ». */
  incrementLabel?: string;
}

export interface NumberInputLabels {
  /** Bouton −. « Diminuer ». */
  decrement: string;
  /** Bouton +. « Augmenter ». */
  increment: string;
}
export const NUMBER_INPUT_LABELS: NumberInputLabels = { decrement: "Diminuer", increment: "Augmenter" };

function decimalsOf(n: number) {
  if (!Number.isFinite(n)) return 0;
  const s = String(n);
  const e = s.indexOf("e-");
  if (e !== -1) return Number(s.slice(e + 2));
  const dot = s.indexOf(".");
  return dot === -1 ? 0 : s.length - dot - 1;
}

/** Évite 0,1 + 0,2 = 0,30000000000000004. */
function roundLike(value: number, ...refs: number[]) {
  const p = Math.min(Math.max(decimalsOf(value), ...refs.map(decimalsOf)), 12);
  return Number(value.toFixed(p));
}

function clamp(value: number, min?: number, max?: number) {
  let v = value;
  if (min != null && v < min) v = min;
  if (max != null && v > max) v = max;
  return v;
}

/**
 * Lecture tolérante : « 1 234,5 », « 1234.5 », « 1.234,5 », « −12 », « 12 % », « 1 234,50 MAD ».
 * Renvoie `null` pour un champ vide, `NaN` pour une saisie illisible.
 */
export function parseNumber(text: string, formatOptions?: Intl.NumberFormatOptions): number | null {
  let s = text.trim();
  if (s === "") return null;
  s = s.replace(/[−‒–—]/g, "-"); // signes moins typographiques
  const percent = formatOptions?.style === "percent";
  s = s.replace(/[^\d.,-]/g, ""); // espaces (y compris insécables), devise, unité, %
  if (s === "" || s === "-") return Number.NaN;
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma !== -1 && lastDot !== -1) {
    // Le dernier séparateur est décimal, l'autre est le séparateur de milliers.
    const decimal = lastComma > lastDot ? "," : ".";
    const thousands = decimal === "," ? /\./g : /,/g;
    s = s.replace(thousands, "").replace(decimal, ".");
  } else if (lastComma !== -1) {
    s = s.replace(/,/g, (_m, offset: number) => (offset === lastComma ? "." : ""));
  } else if (lastDot !== -1 && s.indexOf(".") !== lastDot) {
    s = s.replace(/\./g, ""); // « 1.234.567 » : points de milliers
  }
  if (!/^-?\d*\.?\d*$/.test(s) || s === "." || s === "-.") return Number.NaN;
  const n = Number(s);
  if (!Number.isFinite(n)) return Number.NaN;
  // En style pourcentage, « 12 » saisi vaut 0,12 (Intl affiche 0,12 comme « 12 % »).
  return percent ? roundLike(n / 100, n, 0.01) : n;
}

const MinusIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3.75 8h8.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 3.75v8.5M3.75 8h8.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

/**
 * Champ numérique « stepper » d'iOS : même surface qu'un Input (remplissage
 * tonal, 40 px ou 32 px en `sm`), boutons − / + ronds à droite.
 *
 * Saisie libre et tolérante (« 1 234,5 ») ; la valeur est publiée pendant la
 * frappe dès qu'elle est lisible, puis formatée en fr-FR et ramenée entre
 * `min` et `max` quand on quitte le champ. Clavier : ↑ / ↓ (pas),
 * Pg. préc. / Pg. suiv. (pas × 10), Origine / Fin (min / max), Entrée (valide).
 * Rôle `spinbutton` avec `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.
 */
export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {
    className,
    style,
    value: valueProp,
    defaultValue = null,
    onValueChange,
    min,
    max,
    step = 1,
    formatOptions,
    unit,
    density = "default",
    decrementLabel: decrementLabelProp,
    incrementLabel: incrementLabelProp,
    name,
    onKeyDown,
    onBlur,
    onFocus,
    ...rest
  },
  ref,
) {
  const locale = useLocale();
  const numberLabels = useMessages("numberInput", NUMBER_INPUT_LABELS);
  const decrementLabel = decrementLabelProp ?? numberLabels.decrement;
  const incrementLabel = incrementLabelProp ?? numberLabels.increment;
  const props = useFieldControl(rest);
  const { id: idProp, disabled, readOnly } = props;
  const autoId = React.useId();
  const id = idProp ?? `number-input-${autoId}`;

  const isControlled = valueProp !== undefined;
  const [inner, setInner] = React.useState<number | null>(defaultValue);
  const value = isControlled ? valueProp : inner;
  // Texte en cours de saisie ; `null` = afficher la valeur formatée.
  const [draft, setDraft] = React.useState<string | null>(null);

  const formatter = React.useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 20, ...formatOptions }),
    [formatOptions],
  );
  const format = React.useCallback((n: number | null) => (n == null ? "" : formatter.format(n)), [formatter]);

  /**
   * Pendant la frappe : publie la valeur sans toucher au texte saisi. Un champ
   * vidé n'est publié qu'à la validation (on efface souvent pour retaper).
   */
  const emitLive = (text: string) => {
    const parsed = parseNumber(text, formatOptions);
    if (parsed == null || Number.isNaN(parsed) || clamp(parsed, min, max) !== parsed) return;
    if (parsed === value) return;
    if (!isControlled) setInner(parsed);
    onValueChange?.(parsed);
  };

  const commit = (next: number | null) => {
    setDraft(null);
    if (next === value) return;
    if (!isControlled) setInner(next);
    onValueChange?.(next);
  };

  /** Valeur de départ d'un pas : la saisie en cours si elle est lisible, sinon la valeur. */
  const currentValue = () => {
    if (draft == null) return value;
    const parsed = parseNumber(draft, formatOptions);
    return parsed == null || Number.isNaN(parsed) ? value : parsed;
  };

  const stepBy = (multiplier: number) => {
    const base = currentValue();
    const next = base == null ? clamp(min ?? 0, min, max) : clamp(roundLike(base + step * multiplier, base, step), min, max);
    commit(next);
  };

  const commitDraft = () => {
    if (draft == null) return;
    const parsed = parseNumber(draft, formatOptions);
    if (parsed != null && Number.isNaN(parsed)) {
      setDraft(null); // illisible : on revient à la dernière valeur valide
      return;
    }
    commit(parsed == null ? null : clamp(parsed, min, max));
  };

  const interactive = !disabled && !readOnly;
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !interactive) return;
    const actions: Record<string, (() => void) | undefined> = {
      ArrowUp: () => stepBy(1),
      ArrowDown: () => stepBy(-1),
      PageUp: () => stepBy(10),
      PageDown: () => stepBy(-10),
      Home: min != null ? () => commit(min) : undefined,
      End: max != null ? () => commit(max) : undefined,
      Enter: draft != null ? commitDraft : undefined,
    };
    const action = actions[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  };

  const shown = draft ?? format(value);
  const valueText = value == null ? undefined : `${format(value)}${unit ? ` ${unit}` : ""}`;
  const invalid = props["aria-invalid"] === true || props["aria-invalid"] === "true";
  const atMin = value != null && min != null && value <= min;
  const atMax = value != null && max != null && value >= max;

  // Garde le focus dans le champ quand on clique sur − / + (pas de saut de focus).
  const keepFocus = (event: React.MouseEvent) => event.preventDefault();

  return (
    <div
      data-slot="number-input"
      data-density={density}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      className={cn("ui-number-input", className)}
      style={style}
    >
      <input
        ref={ref}
        type="text"
        inputMode="decimal"
        role="spinbutton"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        data-slot="number-input-field"
        className="ui-number-input__field"
        aria-valuenow={value ?? undefined}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuetext={valueText}
        {...props}
        id={id}
        value={shown}
        onChange={(event) => {
          setDraft(event.target.value);
          emitLive(event.target.value);
        }}
        onFocus={onFocus}
        onBlur={(event) => {
          commitDraft();
          onBlur?.(event);
        }}
        onKeyDown={handleKeyDown}
      />
      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
      {unit ? (
        <span className="ui-number-input__unit" aria-hidden="true">
          {unit}
        </span>
      ) : null}
      <span className="ui-number-input__steppers">
        <button
          type="button"
          tabIndex={-1}
          className="ui-number-input__stepper"
          data-slot="number-input-decrement"
          aria-label={decrementLabel}
          aria-controls={id}
          disabled={!interactive || atMin}
          onMouseDown={keepFocus}
          onClick={() => stepBy(-1)}
        >
          <MinusIcon />
        </button>
        <button
          type="button"
          tabIndex={-1}
          className="ui-number-input__stepper"
          data-slot="number-input-increment"
          aria-label={incrementLabel}
          aria-controls={id}
          disabled={!interactive || atMax}
          onMouseDown={keepFocus}
          onClick={() => stepBy(1)}
        >
          <PlusIcon />
        </button>
      </span>
    </div>
  );
});
