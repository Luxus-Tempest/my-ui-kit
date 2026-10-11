import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "../../utils/cn";

export type SeparatorProps = React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>;

/**
 * Filet de séparation, couleur `line`. Décoratif par défaut (ignoré des
 * lecteurs d'écran) ; `decorative={false}` quand il sépare vraiment deux groupes.
 */
export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  { className, orientation = "horizontal", decorative = true, ...props },
  ref,
) {
  return (
    <SeparatorPrimitive.Root
      ref={ref}
      data-slot="separator"
      orientation={orientation}
      decorative={decorative}
      className={cn("ui-separator", className)}
      {...props}
    />
  );
});
