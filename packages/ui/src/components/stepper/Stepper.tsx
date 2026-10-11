import * as React from "react";
import { cn } from "../../utils/cn";

/* ══ Types ══════════════════════════════════════════════════════════════ */

/** Statut dérivé d'une étape : avant, sur ou après `activeStep`. */
export type StepStatus = "complete" | "current" | "upcoming";
export type StepperOrientation = "horizontal" | "vertical";

/** Textes lus par les lecteurs d'écran, surchargeables (traduction, ton). */
export interface StepperLabels {
  /** Position annoncée avant le titre : « Étape 2 sur 4 ». */
  step: (position: number, count: number) => string;
  /** Ajouté à l'annonce d'une étape terminée. */
  complete: string;
  /** Ajouté à l'annonce d'une étape en erreur. */
  error: string;
}

const DEFAULT_LABELS: StepperLabels = {
  step: (position, count) => `Étape ${position} sur ${count}`,
  complete: "terminée",
  error: "en erreur",
};

/* ══ Contextes ══════════════════════════════════════════════════════════ */

interface StepperContextValue {
  activeStep: number;
  count: number;
  orientation: StepperOrientation;
  nonLinear: boolean;
  onStepChange?: (index: number) => void;
  labels: StepperLabels;
}

const StepperContext = React.createContext<StepperContextValue | null>(null);
/** Position de chaque enfant direct de Stepper, posée par Stepper lui-même. */
const StepIndexContext = React.createContext<number | null>(null);

interface StepContextValue {
  index: number;
  status: StepStatus;
  error: boolean;
}

const StepContext = React.createContext<StepContextValue | null>(null);

function useStepperContext(part: string) {
  const context = React.useContext(StepperContext);
  if (!context) throw new Error(`${part} doit être placé dans un Stepper.`);
  return context;
}

function useStepContext(part: string) {
  const context = React.useContext(StepContext);
  if (!context) throw new Error(`${part} doit être placé dans un Step.`);
  return context;
}

/* ══ Pictogrammes internes ══════════════════════════════════════════════ */

const CheckGlyph = () => (
  <svg viewBox="0 0 16 16" fill="none" className="ui-step__check">
    <path
      d="M3.5 8.4 6.6 11.5 12.5 4.75"
      pathLength={1}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ErrorGlyph = () => (
  <svg viewBox="0 0 16 16" fill="none" className="ui-step__alert">
    <path d="M8 3.75v5.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="8" cy="12" r="1.15" fill="currentColor" />
  </svg>
);

/* ══ Stepper ════════════════════════════════════════════════════════════ */

export interface StepperProps extends React.OlHTMLAttributes<HTMLOListElement> {
  /**
   * Index (à partir de 0) de l'étape en cours. Les étapes d'avant sont
   * terminées, celles d'après à venir. `activeStep === nombre d'étapes` :
   * toutes terminées.
   */
  activeStep?: number;
  /** `vertical` : étapes empilées, contenu (`StepContent`) sous l'étape active. */
  orientation?: StepperOrientation;
  /** Chaque étape devient un bouton : l'utilisateur va où il veut (`onStepChange`). */
  nonLinear?: boolean;
  /** Appelé avec l'index de l'étape cliquée (mode `nonLinear`). */
  onStepChange?: (index: number) => void;
  /** Textes lus par les lecteurs d'écran. */
  labels?: Partial<StepperLabels>;
}

/**
 * Indicateur de progression d'un parcours en plusieurs étapes (assistant,
 * tunnel de commande, configuration). Liste ordonnée `<ol>` ; l'étape en
 * cours porte `aria-current="step"`.
 *
 *   <Stepper activeStep={1}>
 *     <Step><StepTitle>Compte</StepTitle></Step>
 *     <Step><StepTitle>Profil</StepTitle><StepDescription>Facultatif</StepDescription></Step>
 *     <Step><StepTitle>Confirmation</StepTitle></Step>
 *   </Stepper>
 *
 * Chaque `Step` est un enfant direct (un `.map()` convient) : sa position en
 * découle. Indicateur et connecteur sont ajoutés d'office ; `StepIndicator`
 * et `StepSeparator` ne s'écrivent que pour les personnaliser.
 */
export const Stepper = React.forwardRef<HTMLOListElement, StepperProps>(function Stepper(
  {
    activeStep = 0,
    orientation = "horizontal",
    nonLinear = false,
    onStepChange,
    labels,
    className,
    children,
    "aria-label": ariaLabel = "Étapes",
    ...props
  },
  ref,
) {
  const steps = React.Children.toArray(children).filter(React.isValidElement);
  const count = steps.length;
  const { step, complete, error } = { ...DEFAULT_LABELS, ...labels };

  const context = React.useMemo<StepperContextValue>(
    () => ({ activeStep, count, orientation, nonLinear, onStepChange, labels: { step, complete, error } }),
    [activeStep, count, orientation, nonLinear, onStepChange, step, complete, error],
  );

  return (
    <StepperContext.Provider value={context}>
      <ol
        ref={ref}
        aria-label={ariaLabel}
        data-slot="stepper"
        data-orientation={orientation}
        data-non-linear={nonLinear || undefined}
        className={cn("ui-stepper", className)}
        {...props}
      >
        {steps.map((child, index) => (
          <StepIndexContext.Provider key={child.key ?? index} value={index}>
            {child}
          </StepIndexContext.Provider>
        ))}
      </ol>
    </StepperContext.Provider>
  );
});

/* ══ Step ═══════════════════════════════════════════════════════════════ */

export interface StepProps extends React.LiHTMLAttributes<HTMLLIElement> {
  /** Position forcée ; sinon déduite de l'ordre des enfants de `Stepper`. */
  index?: number;
  /**
   * Force l'état terminé (parcours non linéaire, étape passée puis revue).
   * Par défaut : `index < activeStep`.
   */
  completed?: boolean;
  /** Étape en erreur : indicateur et texte en rouge, annoncée aux lecteurs d'écran. */
  error?: boolean;
  /** Non cliquable en mode `nonLinear`, estompée. */
  disabled?: boolean;
}

/**
 * Une étape. Ses enfants se rangent seuls : `StepIndicator` à gauche,
 * `StepTitle` et `StepDescription` à côté, `StepSeparator` (connecteur) après,
 * `StepContent` dessous en orientation verticale.
 */
export const Step = React.forwardRef<HTMLLIElement, StepProps>(function Step(
  { index: indexProp, completed, error = false, disabled = false, className, children, ...props },
  ref,
) {
  const stepper = useStepperContext("Step");
  const autoIndex = React.useContext(StepIndexContext);
  const index = indexProp ?? autoIndex ?? 0;
  const status: StepStatus =
    index === stepper.activeStep
      ? "current"
      : (completed ?? index < stepper.activeStep)
        ? "complete"
        : "upcoming";
  const isCurrent = status === "current";
  const isLast = index === stepper.count - 1;

  let indicator: React.ReactNode = null;
  let separator: React.ReactNode = null;
  let content: React.ReactNode = null;
  const text: React.ReactNode[] = [];
  for (const child of React.Children.toArray(children)) {
    if (React.isValidElement(child) && child.type === StepIndicator) indicator = child;
    else if (React.isValidElement(child) && child.type === StepSeparator) separator = child;
    else if (React.isValidElement(child) && child.type === StepContent) content = child;
    else text.push(child);
  }

  const stepContext = React.useMemo<StepContextValue>(() => ({ index, status, error }), [index, status, error]);

  const headerChildren = (
    <>
      {indicator ?? <StepIndicator />}
      {text.length > 0 && <span className="ui-step__text">{text}</span>}
    </>
  );

  return (
    <StepContext.Provider value={stepContext}>
      <li
        ref={ref}
        data-slot="step"
        data-status={status}
        data-error={error || undefined}
        data-disabled={disabled || undefined}
        aria-current={!stepper.nonLinear && isCurrent ? "step" : undefined}
        className={cn("ui-step", className)}
        {...props}
      >
        {stepper.nonLinear ? (
          <button
            type="button"
            className="ui-step__header"
            data-slot="step-trigger"
            aria-current={isCurrent ? "step" : undefined}
            disabled={disabled}
            onClick={() => stepper.onStepChange?.(index)}
          >
            {headerChildren}
          </button>
        ) : (
          <div className="ui-step__header">{headerChildren}</div>
        )}
        {separator ?? (isLast ? null : <StepSeparator />)}
        {content}
      </li>
    </StepContext.Provider>
  );
});

/* ══ Parties ════════════════════════════════════════════════════════════ */

export interface StepIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Remplace le numéro (une icône, par exemple) pour les étapes en cours et
   * à venir. Terminée, l'étape affiche toujours la coche ; en erreur, « ! ».
   */
  children?: React.ReactNode;
}

/**
 * Pastille ronde de 28 px : numéro sur `--ui-card-2` (à venir), anneau
 * primaire (en cours), coche qui jaillit en ressort sur `--ui-pri` (terminée).
 */
export const StepIndicator = React.forwardRef<HTMLSpanElement, StepIndicatorProps>(function StepIndicator(
  { className, children, ...props },
  ref,
) {
  const { index, status, error } = useStepContext("StepIndicator");
  const { count, labels } = useStepperContext("StepIndicator");

  const glyph = error ? (
    <ErrorGlyph />
  ) : status === "complete" ? (
    <CheckGlyph />
  ) : (
    (children ?? <span className="ui-step__number">{index + 1}</span>)
  );
  const announce = [
    labels.step(index + 1, count),
    status === "complete" ? labels.complete : null,
    error ? labels.error : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <span ref={ref} data-slot="step-indicator" className={cn("ui-step__indicator", className)} {...props}>
      <span className="ui-step__glyph" aria-hidden="true">
        {glyph}
      </span>
      <span className="ui-sr-only">{`${announce} : `}</span>
    </span>
  );
});

export const StepTitle = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(function StepTitle(
  { className, ...props },
  ref,
) {
  return <span ref={ref} data-slot="step-title" className={cn("ui-step__title", className)} {...props} />;
});

/** Précision sous le titre (« Facultatif », résumé du choix, message d'erreur). */
export const StepDescription = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  function StepDescription({ className, ...props }, ref) {
    return <span ref={ref} data-slot="step-description" className={cn("ui-step__description", className)} {...props} />;
  },
);

/**
 * Connecteur vers l'étape suivante : se remplit de primaire quand l'étape
 * est terminée. Ajouté d'office (sauf à la dernière étape) ; l'écrire
 * explicitement seulement pour lui passer une classe.
 */
export const StepSeparator = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  function StepSeparator({ className, ...props }, ref) {
    return (
      <span
        ref={ref}
        aria-hidden="true"
        data-slot="step-separator"
        className={cn("ui-step__separator", className)}
        {...props}
      />
    );
  },
);

/**
 * Contenu d'une étape (champs, explications), affiché sous l'étape active en
 * orientation verticale. En horizontal, placer le contenu sous le Stepper.
 */
export const StepContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function StepContent(
  { className, ...props },
  ref,
) {
  const { status } = useStepContext("StepContent");
  const { orientation } = useStepperContext("StepContent");
  if (orientation !== "vertical" || status !== "current") return null;
  return <div ref={ref} data-slot="step-content" className={cn("ui-step__content", className)} {...props} />;
});

/* ══ useStepper ═════════════════════════════════════════════════════════ */

export interface UseStepperOptions {
  /** Nombre d'étapes. */
  count: number;
  /** Étape de départ (0 par défaut). */
  initialStep?: number;
}

export interface UseStepperReturn {
  /** À passer à `<Stepper activeStep>`. */
  activeStep: number;
  /** Étape suivante. Depuis la dernière, passe à « tout terminé » (`isComplete`). */
  next: () => void;
  /** Étape précédente (pas en dessous de 0). */
  prev: () => void;
  /** Aller à une étape, bornée entre 0 et `count` ; à brancher sur `onStepChange`. */
  goTo: (index: number) => void;
  /** Retour à `initialStep`. */
  reset: () => void;
  isFirst: boolean;
  isLast: boolean;
  /** Toutes les étapes sont terminées (`activeStep === count`). */
  isComplete: boolean;
  count: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * État d'un parcours en étapes :
 *
 *   const stepper = useStepper({ count: 3 });
 *   <Stepper activeStep={stepper.activeStep} onStepChange={stepper.goTo}>…</Stepper>
 *   <Button onClick={stepper.prev} disabled={stepper.isFirst}>Précédent</Button>
 *   <Button onClick={stepper.next}>{stepper.isLast ? "Terminer" : "Suivant"}</Button>
 */
export function useStepper({ count, initialStep = 0 }: UseStepperOptions): UseStepperReturn {
  const [activeStep, setActiveStep] = React.useState(() => clamp(initialStep, 0, count));
  const next = React.useCallback(() => setActiveStep((step) => clamp(step + 1, 0, count)), [count]);
  const prev = React.useCallback(() => setActiveStep((step) => clamp(step - 1, 0, count)), [count]);
  const goTo = React.useCallback((index: number) => setActiveStep(clamp(index, 0, count)), [count]);
  const reset = React.useCallback(() => setActiveStep(clamp(initialStep, 0, count)), [initialStep, count]);
  return {
    activeStep,
    next,
    prev,
    goTo,
    reset,
    isFirst: activeStep === 0,
    isLast: activeStep === count - 1,
    isComplete: activeStep >= count,
    count,
  };
}
