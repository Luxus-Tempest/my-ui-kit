import * as React from "react";
import { cn } from "../../utils/cn";
import { Label } from "../label/Label";

interface FieldContextValue {
  controlId: string;
  labelId: string;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean | undefined;
  disabled: boolean | undefined;
}

const FieldContext = React.createContext<FieldContextValue | null>(null);

export function useFieldContext() {
  return React.useContext(FieldContext);
}

interface ControlProps {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  "aria-labelledby"?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Branche un contrôle sur le Field qui l'entoure : id, description, erreur,
 * obligatoire, désactivé. Les props passées explicitement l'emportent.
 * Utilisé par Input, Textarea, Select, Checkbox, Switch et RadioGroup.
 */
export function useFieldControl<P extends ControlProps>(props: P, options?: { labelledBy?: boolean }): P {
  const field = React.useContext(FieldContext);
  if (!field) return props;
  const describedBy = [props["aria-describedby"], field.describedBy].filter(Boolean).join(" ") || undefined;
  return {
    ...props,
    id: props.id ?? field.controlId,
    "aria-describedby": describedBy,
    "aria-invalid": props["aria-invalid"] ?? (field.invalid ? true : undefined),
    // Un id posé à la main sur le contrôle casse le `for` du libellé :
    // on le relie alors par aria-labelledby pour qu'il garde son nom.
    "aria-labelledby":
      props["aria-labelledby"] ??
      (options?.labelledBy || (props.id && props.id !== field.controlId) ? field.labelId : undefined),
    required: props.required ?? field.required,
    disabled: props.disabled ?? field.disabled,
  };
}

const LABELABLE = new Set(["INPUT", "SELECT", "TEXTAREA", "BUTTON", "METER", "OUTPUT", "PROGRESS"]);
// Par priorité : la radio cochée avant la première radio, la pastille d'un curseur…
const FOCUS_ORDER = [
  '[role="radio"][aria-checked="true"]',
  '[role="slider"]',
  '[role="radio"]',
  'input:not([type="hidden"]), button, select, textarea, [tabindex]:not([tabindex="-1"])',
];

/**
 * `<label for>` ne fait rien quand le contrôle n'est pas un élément HTML
 * « étiquetable » (groupe de radios, curseur, calendrier). Le clic sur le
 * libellé donne alors le focus au premier élément interactif du contrôle,
 * comme le ferait le navigateur pour un champ natif.
 */
function focusNonLabelableControl(event: React.MouseEvent<HTMLLabelElement>, controlId: string) {
  const control = typeof document !== "undefined" ? document.getElementById(controlId) : null;
  if (!control || LABELABLE.has(control.tagName)) return;
  let target: HTMLElement | null = null;
  for (const selector of FOCUS_ORDER) {
    target = control.matches(selector) ? control : control.querySelector<HTMLElement>(selector);
    if (target) break;
  }
  if (!target || target.hasAttribute("disabled") || target.getAttribute("aria-disabled") === "true") return;
  event.preventDefault();
  target.focus();
}

export interface FieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  label?: React.ReactNode;
  /** Aide sous le champ (format attendu, exemple). */
  hint?: React.ReactNode;
  /** Message d'erreur : passe le champ en invalide et remplace l'aide. */
  error?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  /**
   * `vertical` (défaut) : libellé au-dessus. `horizontal` : contrôle puis
   * libellé, pour une case à cocher ou une bascule.
   */
  orientation?: "vertical" | "horizontal";
  /** id du contrôle ; généré sinon. */
  id?: string;
  children: React.ReactNode;
}

/** Champ de formulaire : libellé, contrôle, aide et erreur reliés entre eux. */
export const Field = React.forwardRef<HTMLDivElement, FieldProps>(function Field(
  { label, hint, error, required, disabled, orientation = "vertical", id, className, children, ...props },
  ref,
) {
  const autoId = React.useId();
  const controlId = id ?? `field-${autoId}`;
  const labelId = `${controlId}-label`;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const invalid = Boolean(error);

  const value = React.useMemo<FieldContextValue>(
    () => ({
      controlId,
      labelId,
      describedBy: [errorId, hintId].filter(Boolean).join(" ") || undefined,
      invalid,
      required,
      disabled,
    }),
    [controlId, labelId, errorId, hintId, invalid, required, disabled],
  );

  const labelEl = label ? (
    <Label
      id={labelId}
      htmlFor={controlId}
      required={required}
      disabled={disabled}
      className="ui-field__label"
      onClick={(event) => focusNonLabelableControl(event, controlId)}
    >
      {label}
    </Label>
  ) : null;

  const messages = (
    <>
      {error ? (
        <p id={errorId} className="ui-field__error">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 4.75v3.75M8 11h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          {error}
        </p>
      ) : null}
      {hint && !error ? (
        <p id={hintId} className="ui-field__hint">
          {hint}
        </p>
      ) : null}
    </>
  );

  return (
    <FieldContext.Provider value={value}>
      <div
        ref={ref}
        data-slot="field"
        data-orientation={orientation}
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        className={cn("ui-field", className)}
        {...props}
      >
        {orientation === "horizontal" ? (
          <>
            <div className="ui-field__control">{children}</div>
            <div className="ui-field__text">
              {labelEl}
              {messages}
            </div>
          </>
        ) : (
          <>
            {labelEl}
            {children}
            {messages}
          </>
        )}
      </div>
    </FieldContext.Provider>
  );
});
