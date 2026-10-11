import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { cn } from "../../utils/cn";

export interface HoverCardProps extends React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Root> {
  /** Attente avant l'ouverture, en ms : assez longue pour qu'un simple passage du pointeur n'ouvre rien. */
  openDelay?: number;
  /** Attente avant la fermeture, en ms : laisse le temps de rejoindre la carte avec le pointeur. */
  closeDelay?: number;
}

/**
 * Carte d'aperçu au survol : le profil derrière un nom, le résumé derrière un lien.
 *
 * S'ouvre au survol du déclencheur (après `openDelay`) et à sa prise de focus au
 * clavier ; se ferme quand le pointeur quitte le déclencheur et la carte, au départ
 * du focus ou avec Échap.
 *
 * **Le contenu ne doit jamais être indispensable** : il est inaccessible au tactile
 * (aucun survol), et le focus n'y entre pas. Ce qu'il montre doit aussi exister
 * ailleurs, la page vers laquelle pointe le lien par exemple. Pour un contenu
 * interactif ou nécessaire, utiliser `Popover`.
 */
export function HoverCard({ openDelay = 500, closeDelay = 250, ...props }: HoverCardProps) {
  return <HoverCardPrimitive.Root openDelay={openDelay} closeDelay={closeDelay} {...props} />;
}

/** Le lien ou le nom survolé. Avec `asChild`, l'enfant (un `<a>` le plus souvent) devient le déclencheur. */
export const HoverCardTrigger = HoverCardPrimitive.Trigger;

export interface HoverCardContentProps extends React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content> {
  /** Petite flèche pointée vers le déclencheur. */
  arrow?: boolean;
  /** Conteneur du portail ; `document.body` par défaut. */
  container?: HTMLElement | null;
}

/**
 * Surface flottante en matériau translucide (`.ui-popup`), rayon 16 px, 300 px de large.
 * Elle se place du côté qui a la place et entre en ressort depuis le déclencheur.
 */
export const HoverCardContent = React.forwardRef<HTMLDivElement, HoverCardContentProps>(function HoverCardContent(
  { className, align = "center", sideOffset = 8, arrow = false, container, children, ...props },
  ref,
) {
  return (
    <HoverCardPrimitive.Portal container={container}>
      <HoverCardPrimitive.Content
        ref={ref}
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn("ui-popup", "ui-hover-card", className)}
        {...props}
      >
        {children}
        {arrow && <HoverCardPrimitive.Arrow className="ui-hover-card__arrow" width={14} height={7} />}
      </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Portal>
  );
});
