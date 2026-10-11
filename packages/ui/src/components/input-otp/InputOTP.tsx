import * as React from "react";
import {
  OTPInput,
  OTPInputContext,
  REGEXP_ONLY_CHARS,
  REGEXP_ONLY_DIGITS,
  REGEXP_ONLY_DIGITS_AND_CHARS,
  type RenderProps,
} from "input-otp";
import { cn } from "../../utils/cn";
import { useFieldContext, useFieldControl } from "../field/Field";

/** Motifs prêts à l'emploi pour `pattern` (chiffres, lettres, les deux). */
export { REGEXP_ONLY_DIGITS, REGEXP_ONLY_CHARS, REGEXP_ONLY_DIGITS_AND_CHARS };

/** État partagé avec les cases : invalide, désactivé. */
const InputOTPStateContext = React.createContext<{ invalid: boolean; disabled: boolean }>({
  invalid: false,
  disabled: false,
});

export type InputOTPProps = React.ComponentPropsWithoutRef<typeof OTPInput> & {
  /** Appelé à chaque saisie, collage ou effacement, avec le code entier. */
  onValueChange?: (value: string) => void;
};

/**
 * Saisie d'un code à usage unique (vérification par SMS ou e-mail, double
 * authentification), sur la librairie `input-otp` : un seul `<input>` invisible
 * porte la valeur, le clavier, le collage et l'auto-remplissage du système
 * (`autocomplete="one-time-code"`) ; les cases n'en sont que l'affichage.
 *
 * Chiffres seulement par défaut (`pattern={REGEXP_ONLY_DIGITS}`, pavé numérique
 * sur mobile). Contrôlé (`value` + `onValueChange`) ou non ; `onComplete` quand
 * toutes les cases sont remplies. Se branche sur un `Field` (libellé, aide, erreur) ;
 * hors `Field`, s'annonce « Code de vérification » (surchargeable par `aria-label`).
 *
 *   <InputOTP maxLength={6}>
 *     <InputOTPGroup>
 *       <InputOTPSlot index={0} /> <InputOTPSlot index={1} /> <InputOTPSlot index={2} />
 *     </InputOTPGroup>
 *     <InputOTPSeparator />
 *     <InputOTPGroup>
 *       <InputOTPSlot index={3} /> <InputOTPSlot index={4} /> <InputOTPSlot index={5} />
 *     </InputOTPGroup>
 *   </InputOTP>
 */
export const InputOTP = React.forwardRef<HTMLInputElement, InputOTPProps>(function InputOTP(props, ref) {
  const {
    className,
    containerClassName,
    pattern = REGEXP_ONLY_DIGITS,
    inputMode,
    onChange,
    onValueChange,
    children,
    render,
    ...rest
  } = props;
  const field = useFieldContext();
  const controlProps = useFieldControl(rest);
  const named = Boolean(controlProps["aria-label"] || controlProps["aria-labelledby"] || field);
  const invalid = controlProps["aria-invalid"] === true || controlProps["aria-invalid"] === "true";
  const disabled = Boolean(controlProps.disabled);
  const state = React.useMemo(() => ({ invalid, disabled }), [invalid, disabled]);

  const wrap = (node: React.ReactNode) => (
    <InputOTPStateContext.Provider value={state}>{node}</InputOTPStateContext.Provider>
  );
  // input-otp attend soit `render`, soit `children` : on enveloppe celui qui est fourni.
  const content = render
    ? { render: (renderProps: RenderProps) => wrap(render(renderProps)) }
    : { children: wrap(children) };

  return (
    <OTPInput
      ref={ref}
      data-slot="input-otp"
      aria-label={named ? undefined : "Code de vérification"}
      pattern={pattern}
      // Pavé numérique quand seuls les chiffres sont admis, clavier complet sinon.
      inputMode={inputMode ?? (pattern === REGEXP_ONLY_DIGITS ? "numeric" : "text")}
      containerClassName={cn("ui-input-otp", containerClassName)}
      className={cn("ui-input-otp__input", className)}
      onChange={(value: string) => {
        onChange?.(value);
        onValueChange?.(value);
      }}
      {...controlProps}
      {...(content as { children: React.ReactNode })}
    />
  );
});

/** Rangée de cases accolées (3 + 3 pour un code à 6 chiffres, par exemple). */
export const InputOTPGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function InputOTPGroup({ className, ...props }, ref) {
    return <div ref={ref} data-slot="input-otp-group" className={cn("ui-input-otp__group", className)} {...props} />;
  },
);

export interface InputOTPSlotProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Position de la case dans le code, à partir de 0. */
  index: number;
}

/**
 * Case d'un caractère : remplissage tonal, filet primaire et halo quand le
 * curseur y est, curseur clignotant tant qu'elle est vide. Purement visuelle
 * (masquée aux lecteurs d'écran : c'est le champ qui annonce la valeur).
 */
export const InputOTPSlot = React.forwardRef<HTMLDivElement, InputOTPSlotProps>(function InputOTPSlot(
  { index, className, ...props },
  ref,
) {
  const otp = React.useContext(OTPInputContext);
  const { invalid, disabled } = React.useContext(InputOTPStateContext);
  const slot = otp.slots?.[index];
  const char = slot?.char ?? null;
  const placeholder = slot?.placeholderChar ?? null;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-slot="input-otp-slot"
      data-active={slot?.isActive || undefined}
      data-filled={char !== null || undefined}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      className={cn("ui-input-otp__slot", className)}
      {...props}
    >
      {char !== null ? (
        // La clé relance l'apparition à chaque nouveau caractère.
        <span key={char} className="ui-input-otp__char">
          {char}
        </span>
      ) : placeholder !== null ? (
        <span className="ui-input-otp__placeholder">{placeholder}</span>
      ) : null}
      {slot?.hasFakeCaret && <span className="ui-input-otp__caret" />}
    </div>
  );
});

/** Tiret discret entre deux groupes de cases. */
export const InputOTPSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function InputOTPSeparator({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        data-slot="input-otp-separator"
        className={cn("ui-input-otp__separator", className)}
        {...props}
      />
    );
  },
);
