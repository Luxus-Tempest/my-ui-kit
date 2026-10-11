import * as React from "react";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

/**
 * Étiquette : deux formes, une seule primitive.
 *
 * - Compteur (`default`, `outline`) : 20 px, chiffres tabulaires.
 *   Il suit un titre ou une entrée de navigation : c'est un nombre, pas un état.
 * - Pastille (`neu`, `pri`, `ok`, `warn`, `err`) : pilule de 24 px,
 *   12 px / 500, fond estompé **et** filet du ton. Ce sont les seuls tons
 *   sémantiques ; un statut métier se traduit vers l'un d'eux.
 * - `tinted` : pastille de couleur libre (classification, espace…), calculée
 *   depuis `tint` avec son fond et son filet.
 */
export const badgeVariants = cva("ui-badge", {
  variants: {
    variant: {
      default: "ui-badge--count",
      outline: "ui-badge--count ui-badge--count-outline",
      neu: "ui-badge--neu",
      pri: "ui-badge--pri",
      ok: "ui-badge--ok",
      warn: "ui-badge--warn",
      err: "ui-badge--err",
      tinted: "ui-badge--tinted",
    },
  },
  defaultVariants: { variant: "default" },
});

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  /** Puce de 5 px de la couleur du ton, devant le libellé. */
  dot?: boolean;
  /** Couleur de base pour `variant="tinted"` (toute couleur CSS). */
  tint?: string;
  /** Rend l'enfant unique (un lien, un bouton) avec le style de l'étiquette. */
  asChild?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { className, variant, dot, tint, asChild, style, children, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "span";
  const tintStyle = tint ? ({ "--ui-badge-tint": tint } as React.CSSProperties) : undefined;

  return (
    <Comp
      ref={ref}
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      style={tintStyle ? { ...tintStyle, ...style } : style}
      {...props}
    >
      {dot && <i className="ui-badge__dot" aria-hidden="true" />}
      <Slottable>{children}</Slottable>
    </Comp>
  );
});
