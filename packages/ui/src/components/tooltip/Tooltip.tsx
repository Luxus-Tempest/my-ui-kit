import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../../utils/cn";

/**
 * Partage le délai entre les infobulles d'une même zone : une fois la
 * première ouverte, passer d'un bouton à l'autre est immédiat.
 * Posé une fois près de la racine ; chaque Tooltip en apporte un sinon.
 */
export const TooltipProvider = ({
  delayDuration = 300,
  skipDelayDuration = 300,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) => (
  <TooltipPrimitive.Provider delayDuration={delayDuration} skipDelayDuration={skipDelayDuration} {...props} />
);

export const TooltipRoot = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export interface TooltipContentProps extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  /** Petite flèche vers le déclencheur. */
  arrow?: boolean;
}

/** Bulle inversée de Drive : 12 px / 500, surface `inverse`, rayon 8 px. */
export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(function TooltipContent(
  { className, sideOffset = 6, arrow = false, children, ...props },
  ref,
) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn("ui-popup", "ui-tooltip", className)}
        {...props}
      >
        {children}
        {arrow && <TooltipPrimitive.Arrow className="ui-tooltip__arrow" width={10} height={5} />}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
});

export interface TooltipProps
  extends Omit<React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>, "children">,
    Pick<TooltipContentProps, "side" | "align" | "sideOffset" | "arrow"> {
  /** Texte de la bulle. Une infobulle complète un libellé, elle ne le remplace pas. */
  content: React.ReactNode;
  /** L'élément survolé ou focalisé : un seul enfant qui accepte une ref. */
  children: React.ReactElement;
  /** Raccourci affiché à droite du texte (`"⌘D"`). */
  shortcut?: string;
  delayDuration?: number;
}

/**
 * Infobulle en une ligne :
 *
 *   <Tooltip content="Dupliquer" shortcut="⌘D">
 *     <Button size="icon" aria-label="Dupliquer">…</Button>
 *   </Tooltip>
 *
 * Pour un contrôle plus fin : TooltipRoot, TooltipTrigger, TooltipContent.
 */
export function Tooltip({
  content,
  children,
  shortcut,
  side = "top",
  align,
  sideOffset,
  arrow,
  delayDuration = 300,
  ...rootProps
}: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration} skipDelayDuration={300}>
      <TooltipPrimitive.Root {...rootProps}>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipContent side={side} align={align} sideOffset={sideOffset} arrow={arrow}>
          {content}
          {shortcut && <kbd className="ui-kbd ui-tooltip__kbd">{shortcut}</kbd>}
        </TooltipContent>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
