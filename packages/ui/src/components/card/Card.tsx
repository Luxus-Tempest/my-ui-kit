import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

/**
 * Carte. La variante est le **rôle de la surface** :
 * - `filled` (défaut) : conteneur tonal sur un panneau blanc, comme les
 *   fichiers de Drive ; aucune ombre, aucun filet.
 * - `elevated` : panneau posé sur le fond d'application, ombre diffuse.
 * - `outlined` : panneau à filet, pour les contenus denses côte à côte.
 *
 * `interactive` ajoute la couche d'état au survol et la pression ; `selected`
 * pose le conteneur de sélection. Pour une carte cliquable, préférer
 * `asChild` avec un `<a>` ou un `<button>` : la carte entière devient la cible.
 */
export const cardVariants = cva("ui-card", {
  variants: {
    variant: {
      filled: "ui-card--filled",
      elevated: "ui-card--elevated",
      outlined: "ui-card--outlined",
    },
    size: {
      sm: "ui-card--size-sm",
      default: "ui-card--size-default",
    },
  },
  defaultVariants: { variant: "filled", size: "default" },
});

export type CardVariant = NonNullable<VariantProps<typeof cardVariants>["variant"]>;

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
  /** Rend l'enfant unique (`<a>`, `<button>`…) à la place du `<div>`. */
  asChild?: boolean;
  /** Couche d'état au survol, pression et anneau de focus. Implicite avec `asChild`. */
  interactive?: boolean;
  /** Conteneur de sélection (fichier choisi, option retenue). */
  selected?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, variant, size, asChild = false, interactive, selected, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      ref={ref}
      data-slot="card"
      data-interactive={(interactive ?? asChild) || undefined}
      data-selected={selected || undefined}
      className={cn(cardVariants({ variant, size }), className)}
      {...props}
    />
  );
});

/** En-tête : titre et description à gauche, `CardAction` en haut à droite. */
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card-header" className={cn("ui-card__header", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card-title" className={cn("ui-card__title", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card-description" className={cn("ui-card__description", className)} {...props} />;
}

/** Action d'en-tête (menu « ⋯ », bouton icône), alignée en haut à droite. */
export function CardAction({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card-action" className={cn("ui-card__action", className)} {...props} />;
}

/**
 * Média : vignette arrondie en retrait du bord, comme l'aperçu d'un fichier
 * dans Drive. Accepte une image ou tout contenu ; `aspectRatio` fixe la forme.
 */
export function CardMedia({
  className,
  aspectRatio,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { aspectRatio?: number | string }) {
  return (
    <div
      data-slot="card-media"
      className={cn("ui-card__media", className)}
      style={aspectRatio != null ? { aspectRatio: String(aspectRatio), ...style } : style}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card-content" className={cn("ui-card__content", className)} {...props} />;
}

/** Pied : actions alignées à droite, sans filet. */
export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card-footer" className={cn("ui-card__footer", className)} {...props} />;
}
