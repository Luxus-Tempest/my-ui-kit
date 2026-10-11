import * as React from "react";
import { cn } from "../../utils/cn";
import { Button, type ButtonProps } from "../button/Button";
import { Input, Textarea, type InputProps, type TextareaProps } from "../input/Input";

/**
 * Groupe de saisie : un champ et ses compléments (icône, préfixe, unité,
 * raccourci, bouton) dans une seule surface. Même remplissage tonal,
 * focus et erreur qu'un `Input` ; la surface réagit à son champ.
 *
 * Les compléments se placent avec `InputGroupAddon align` :
 * `inline-start` / `inline-end` sur la ligne, `block-start` / `block-end`
 * au-dessus ou au-dessous (barre d'outils d'une zone de texte).
 * Dans un `Field`, le champ reçoit libellé, aide et erreur comme un `Input`.
 */
export const InputGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(function InputGroup(
  { className, ...props },
  ref,
) {
  return <div ref={ref} role="group" data-slot="input-group" className={cn("ui-input-group", className)} {...props} />;
});

export interface InputGroupAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: "inline-start" | "inline-end" | "block-start" | "block-end";
}

export const InputGroupAddon = React.forwardRef<HTMLDivElement, InputGroupAddonProps>(function InputGroupAddon(
  { className, align = "inline-start", onClick, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="input-group-addon"
      data-align={align}
      className={cn("ui-input-group__addon", className)}
      onClick={(event) => {
        onClick?.(event);
        // Un clic sur le complément (hors bouton) place le curseur dans le champ.
        if (event.defaultPrevented || (event.target as HTMLElement).closest("button, a, input, textarea")) return;
        event.currentTarget.parentElement?.querySelector<HTMLElement>("[data-slot=input-group-control]")?.focus();
      }}
      {...props}
    />
  );
});

/** Texte d'appoint : préfixe (« https:// »), unité (« MAD »), compteur. */
export function InputGroupText({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span data-slot="input-group-text" className={cn("ui-input-group__text", className)} {...props} />;
}

/** Bouton intégré : fantôme et compact par défaut. */
export const InputGroupButton = React.forwardRef<HTMLButtonElement, ButtonProps>(function InputGroupButton(
  { className, variant = "ghost", size = "sm", ...props },
  ref,
) {
  return <Button ref={ref} variant={variant} size={size} className={cn("ui-input-group__button", className)} {...props} />;
});

export const InputGroupInput = React.forwardRef<HTMLInputElement, InputProps>(function InputGroupInput(
  { className, ...props },
  ref,
) {
  return <Input ref={ref} data-slot="input-group-control" className={cn("ui-input-group__control", className)} {...props} />;
});

export const InputGroupTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function InputGroupTextarea(
  { className, ...props },
  ref,
) {
  return (
    <Textarea ref={ref} data-slot="input-group-control" className={cn("ui-input-group__control", className)} {...props} />
  );
});
