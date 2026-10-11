import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

/**
 * État vide : « Aucun fichier », « Aucun résultat », « Corbeille vide ».
 * Une pastille d'icône, un titre, une phrase qui dit quoi faire, puis les
 * actions (une seule primaire). Centré, sans illustration imposée.
 *
 * - `variant="plain"` (défaut) : posé tel quel dans la zone vide.
 * - `variant="card"` : carte tonale (`--ui-card-2`, rayon `--ui-r-lg`).
 */
export const emptyStateVariants = cva("ui-empty-state", {
  variants: {
    variant: {
      plain: "ui-empty-state--plain",
      card: "ui-empty-state--card",
    },
    size: {
      /** Dans un panneau étroit, une liste, un menu. */
      sm: "ui-empty-state--size-sm",
      default: "ui-empty-state--size-default",
    },
  },
  defaultVariants: { variant: "plain", size: "default" },
});

type EmptyStateVariantProps = VariantProps<typeof emptyStateVariants>;
export type EmptyStateVariant = NonNullable<EmptyStateVariantProps["variant"]>;
export type EmptyStateSize = NonNullable<EmptyStateVariantProps["size"]>;
export type EmptyStateTitleElement = "h2" | "h3" | "h4" | "h5" | "h6" | "p";

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">, EmptyStateVariantProps {
  /** Pictogramme, posé dans une pastille ronde (décoratif, masqué aux lecteurs d'écran). */
  icon?: React.ReactNode;
  /** Ce qui manque, en une ligne : « Aucun fichier ». */
  title: React.ReactNode;
  /** Pourquoi, et quoi faire ensuite. */
  description?: React.ReactNode;
  /** Boutons, en rangée centrée. */
  actions?: React.ReactNode;
  /** Élément du titre : `h3` par défaut, à accorder à la structure de la page. */
  titleAs?: EmptyStateTitleElement;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { className, variant, size, icon, title, description, actions, titleAs: Title = "h3", children, ...props },
  ref,
) {
  return (
    <div ref={ref} data-slot="empty-state" className={cn(emptyStateVariants({ variant, size }), className)} {...props}>
      {icon != null && (
        <span className="ui-empty-state__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="ui-empty-state__text">
        <Title className="ui-empty-state__title">{title}</Title>
        {description != null && <p className="ui-empty-state__description">{description}</p>}
      </div>
      {actions != null && <div className="ui-empty-state__actions">{actions}</div>}
      {children}
    </div>
  );
});
