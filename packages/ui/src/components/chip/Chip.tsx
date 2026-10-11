import * as React from "react";
import { cn } from "../../utils/cn";

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3.5 8.3 6.5 11.2 12.5 4.8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const CloseIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Puce de filtre : `true` / `false` en fait une bascule (`aria-pressed`),
   * cochée et en conteneur de sélection quand elle est active.
   * Laisser `undefined` pour une puce d'action simple.
   */
  selected?: boolean;
  /** Icône de tête ; remplacée par la coche quand la puce est sélectionnée. */
  icon?: React.ReactNode;
  /**
   * Puce d'entrée (étiquette, destinataire) : ajoute un bouton « Retirer »
   * à droite. Retour arrière et Suppr déclenchent aussi le retrait.
   */
  onRemove?: () => void;
  /** Nom accessible du bouton de retrait ; « Retirer {libellé} » par défaut. */
  removeLabel?: string;
}

/**
 * Puce : les filtres de Drive (« Type », « Personnes », « Modifié »), en
 * pilule de 32 px. Sélectionnée, elle prend le conteneur de sélection et
 * une coche. Pour un menu de filtre, envelopper dans `MenuTrigger asChild`.
 */
export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(function Chip(
  { className, selected, icon, onRemove, removeLabel, children, type, onKeyDown, ...props },
  ref,
) {
  const leading = selected ? <CheckIcon /> : icon;
  const button = (
    <button
      ref={ref}
      type={type ?? "button"}
      data-slot="chip"
      aria-pressed={selected}
      data-selected={selected || undefined}
      data-removable={onRemove ? true : undefined}
      className={cn("ui-chip", className)}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (onRemove && !event.defaultPrevented && (event.key === "Backspace" || event.key === "Delete")) {
          event.preventDefault();
          onRemove();
        }
      }}
      {...props}
    >
      {leading != null && <span className="ui-chip__icon">{leading}</span>}
      {children}
    </button>
  );

  if (!onRemove) return button;

  const label = removeLabel ?? (typeof children === "string" ? `Retirer ${children}` : "Retirer");
  return (
    <span className="ui-chip-group" data-selected={selected || undefined}>
      {button}
      <button type="button" className="ui-chip__remove" aria-label={label} onClick={onRemove} disabled={props.disabled}>
        <CloseIcon />
      </button>
    </span>
  );
});

/** Rangée de puces : retour à la ligne, espacement de 8 px. */
export const ChipGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function ChipGroup(
  { className, ...props },
  ref,
) {
  return <div ref={ref} role="group" data-slot="chip-group" className={cn("ui-chips", className)} {...props} />;
});
