import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { cn } from "../../utils/cn";

export type CollapsibleProps = React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root>;

/**
 * Zone repliable unique : « Afficher plus », détails d'une ligne, réglages
 * avancés. Pour une suite de sections, préférer `Accordion`.
 *
 * Le déclencheur n'impose aucun style : avec `asChild`, il prête son
 * comportement (`aria-expanded`, `aria-controls`, Entrée / Espace) à un
 * `Button`, une ligne de liste… Le contenu s'ouvre en hauteur, en ressort.
 */
export const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(function Collapsible(
  { className, ...props },
  ref,
) {
  return (
    <CollapsiblePrimitive.Root ref={ref} data-slot="collapsible" className={cn("ui-collapsible", className)} {...props} />
  );
});

export type CollapsibleTriggerProps = React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>;

/** Déclencheur sans style imposé ; `asChild` pour le rendre sur votre propre bouton. */
export const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  function CollapsibleTrigger({ className, ...props }, ref) {
    return (
      <CollapsiblePrimitive.Trigger
        ref={ref}
        data-slot="collapsible-trigger"
        className={cn("ui-collapsible__trigger", className)}
        {...props}
      />
    );
  },
);

export type CollapsibleContentProps = React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>;

/** Contenu : animé en hauteur à l'ouverture et à la fermeture. */
export const CollapsibleContent = React.forwardRef<HTMLDivElement, CollapsibleContentProps>(
  function CollapsibleContent({ className, ...props }, ref) {
    return (
      <CollapsiblePrimitive.Content
        ref={ref}
        data-slot="collapsible-content"
        className={cn("ui-collapsible__content", className)}
        {...props}
      />
    );
  },
);
