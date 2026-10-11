import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../utils/cn";

/**
 * Liste, à la manière des réglages d'iOS et des listes de Drive.
 *
 * - `variant="inset"` (défaut) : carte tonale aux coins arrondis, filets
 *   décalés qui commencent après l'élément de tête (liste groupée d'iOS).
 * - `variant="plain"` : lignes nues sur le panneau, survol en couche d'état
 *   (liste de fichiers de Drive).
 *
 * `ListSection` pose l'intitulé et la note de bas de groupe ; `ListItem`
 * prend `leading`, `description`, `trailing` et `chevron`. Une ligne
 * cliquable s'écrit avec `asChild` : `<ListItem asChild><a href="…">…</a></ListItem>`.
 */
export interface ListProps extends React.HTMLAttributes<HTMLUListElement> {
  variant?: "inset" | "plain";
}

export const List = React.forwardRef<HTMLUListElement, ListProps>(function List(
  { className, variant = "inset", ...props },
  ref,
) {
  return <ul ref={ref} role="list" data-slot="list" data-variant={variant} className={cn("ui-list", className)} {...props} />;
});

export interface ListSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Intitulé du groupe, en casse de phrase. */
  title?: React.ReactNode;
  /** Note sous le groupe (explication d'un réglage). */
  footer?: React.ReactNode;
}

export const ListSection = React.forwardRef<HTMLElement, ListSectionProps>(function ListSection(
  { className, title, footer, children, ...props },
  ref,
) {
  const titleId = React.useId();
  return (
    <section
      ref={ref}
      data-slot="list-section"
      aria-labelledby={title ? titleId : undefined}
      className={cn("ui-list-section", className)}
      {...props}
    >
      {title && <h3 id={titleId} className="ui-list-section__title">{title}</h3>}
      {children}
      {footer && <p className="ui-list-section__footer">{footer}</p>}
    </section>
  );
});

export interface ListItemProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Icône, tuile (`ListItemIcon`), avatar ou case à cocher. */
  leading?: React.ReactNode;
  /** Seconde ligne, plus discrète. */
  description?: React.ReactNode;
  /** Valeur, badge, interrupteur ou bouton, aligné à droite. */
  trailing?: React.ReactNode;
  /** Chevron de navigation à droite (ligne qui ouvre un écran). */
  chevron?: boolean;
  /** Ligne sélectionnée : conteneur de sélection. */
  selected?: boolean;
  /**
   * Rend l'enfant unique (`<a>`, `<button>`) comme ligne, à l'intérieur du
   * `<li>` : toute la ligne devient la cible, avec couche d'état et focus.
   */
  asChild?: boolean;
}

const Chevron = () => (
  <svg className="ui-list-item__chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="m6 3.5 4.5 4.5L6 12.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ListItem = React.forwardRef<HTMLElement, ListItemProps>(function ListItem(
  { className, leading, description, trailing, chevron, selected, asChild = false, children, ...props },
  ref,
) {
  // Mise en page de la ligne autour du libellé ; avec asChild, le libellé est
  // celui de l'enfant (`<a>Compte</a>`) et l'enfant devient la ligne.
  const layout = (label: React.ReactNode) => (
    <>
      {leading != null && <span className="ui-list-item__leading">{leading}</span>}
      <span className="ui-list-item__body">
        <span className="ui-list-item__text">
          <span className="ui-list-item__title">{label}</span>
          {description != null && <span className="ui-list-item__description">{description}</span>}
        </span>
        {(trailing != null || chevron) && (
          <span className="ui-list-item__trailing">
            {trailing}
            {chevron && <Chevron />}
          </span>
        )}
      </span>
    </>
  );

  const rowProps = {
    className: cn("ui-list-item__row", className),
    "data-interactive": asChild || undefined,
    "data-selected": selected || undefined,
    "aria-current": selected && asChild ? ("true" as const) : undefined,
    ...props,
  };

  let row: React.ReactNode;
  if (asChild && React.isValidElement<{ children?: React.ReactNode }>(children)) {
    row = (
      <Slot ref={ref} {...rowProps}>
        {React.cloneElement(children, undefined, layout(children.props.children))}
      </Slot>
    );
  } else {
    row = (
      <div ref={ref as React.Ref<HTMLDivElement>} {...rowProps}>
        {layout(children)}
      </div>
    );
  }

  return (
    <li data-slot="list-item" className="ui-list-item">
      {row}
    </li>
  );
});

export interface ListItemIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Couleur de la tuile (toute couleur CSS) ; primaire par défaut. */
  tint?: string;
}

/** Tuile d'icône des réglages d'iOS : carré aux coins doux, pictogramme clair. */
export function ListItemIcon({ className, tint, style, ...props }: ListItemIconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("ui-list-item-icon", className)}
      style={tint ? ({ "--ui-list-icon-tint": tint, ...style } as React.CSSProperties) : style}
      {...props}
    />
  );
}
