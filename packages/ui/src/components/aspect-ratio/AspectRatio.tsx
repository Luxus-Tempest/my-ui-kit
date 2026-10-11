import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../utils/cn";

const DEFAULT_RATIO = 16 / 9;

export type AspectRatioFit = "cover" | "contain";

export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Rapport largeur / hauteur : `16 / 9` (défaut), `1`, `4 / 3`, ou une
   * chaîne CSS (`"3 / 2"`). Une valeur invalide revient à 16 / 9.
   */
  ratio?: number | string;
  /**
   * Cadrage des médias enfants directs (`img`, `video`, `picture`…) :
   * `cover` (défaut) remplit et rogne, `contain` montre tout.
   */
  fit?: AspectRatioFit;
  /** Rend l'enfant unique (`<figure>`, `<a>`…) à la place du `<div>`. */
  asChild?: boolean;
}

function toCssRatio(ratio: number | string): string {
  if (typeof ratio === "number") return Number.isFinite(ratio) && ratio > 0 ? String(ratio) : String(DEFAULT_RATIO);
  return ratio.trim() || String(DEFAULT_RATIO);
}

/**
 * Cadre à proportions fixes, sur la propriété CSS `aspect-ratio`. Les médias
 * enfants le couvrent (`object-fit`) ; les autres enfants se superposent dans
 * la même cellule (légende, badge, dégradé), dans l'ordre du DOM.
 *
 * Le rayon se pose par `className` ou `style` (`var(--ui-r-lg)` pour une
 * carte, `var(--ui-r-sm)` pour une vignette) : le contenu est rogné au cadre.
 */
export const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(function AspectRatio(
  { ratio = DEFAULT_RATIO, fit = "cover", asChild = false, className, style, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      ref={ref}
      data-slot="aspect-ratio"
      data-fit={fit}
      className={cn("ui-aspect-ratio", className)}
      style={{ aspectRatio: toCssRatio(ratio), ...style }}
      {...props}
    />
  );
});
