import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "../../utils/cn";

/**
 * Panneau flottant ancré à un déclencheur, pour un contenu interactif court
 * (filtres, réglages rapides, détails). Le focus y entre à l'ouverture et
 * revient au déclencheur à la fermeture.
 */
export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverAnchor = PopoverPrimitive.Anchor;
export const PopoverClose = PopoverPrimitive.Close;

export const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(function PopoverContent({ className, align = "center", sideOffset = 6, ...props }, ref) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn("ui-popup", "ui-popover", className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});

export function PopoverHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="popover-header" className={cn("ui-popover__header", className)} {...props} />;
}
export function PopoverTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 data-slot="popover-title" className={cn("ui-popover__title", className)} {...props} />;
}
export function PopoverDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p data-slot="popover-description" className={cn("ui-popover__description", className)} {...props} />;
}
