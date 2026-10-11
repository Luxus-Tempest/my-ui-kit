import * as React from "react";
import { cn } from "../../utils/cn";
import { useFieldControl } from "../field/Field";

export type InputDensity = "sm" | "default";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * `default` : 40 px (formulaires). `sm` : 32 px (barre d'outils, filtres).
   * La prop ne s'appelle pas `size` : sur un `<input>`, `size` est un attribut
   * HTML natif (nombre de caractères visibles).
   */
  density?: InputDensity;
}

/**
 * Champ de saisie : remplissage tonal au repos, surface claire, filet
 * primaire et halo au focus. Hauteur 40 px, rayon 12 px, 14 px. L'état
 * d'erreur se pose avec `aria-invalid`, jamais avec une classe : il est ainsi annoncé.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, density = "default", type = "text", ...rest },
  ref,
) {
  const props = useFieldControl(rest);
  return (
    <input
      ref={ref}
      type={type}
      data-slot="input"
      data-density={density}
      className={cn("ui-input", className)}
      {...props}
    />
  );
});

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** La hauteur suit le contenu (CSS `field-sizing`), entre `rows` et `max-height`. */
  autoResize?: boolean;
}

/**
 * Zone de texte : même surface qu'un Input. 14 px / 1.5, hauteur minimale
 * 88 px, redimensionnable en hauteur seulement.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, autoResize = false, ...rest },
  ref,
) {
  const props = useFieldControl(rest);
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      data-autoresize={autoResize || undefined}
      className={cn("ui-input", "ui-textarea", className)}
      {...props}
    />
  );
});
