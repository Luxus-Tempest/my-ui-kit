import * as React from "react";
import { cn } from "../../utils/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Pastille ronde (avatar, icône) au lieu d'un bloc. */
  circle?: boolean;
}

/**
 * Squelette : un dégradé balayé, jamais un simple bloc pulsé.
 * Il reprend la géométrie exacte du contenu qu'il remplace (taille via
 * `className` ou `style`). Masqué des lecteurs d'écran : c'est le conteneur
 * qui doit porter `aria-busy`.
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(function Skeleton(
  { className, circle, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="skeleton"
      data-circle={circle || undefined}
      aria-hidden="true"
      className={cn("ui-skeleton", className)}
      {...props}
    />
  );
});
