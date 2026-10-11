import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { Slottable } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn";

const ChevronDown = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="ui-navigation-menu__chevron">
    <path d="m4.5 6.25 3.5 3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Vrai quand les panneaux s'affichent dans le viewport commun. */
const ViewportContext = React.createContext(true);

/**
 * Style d'un déclencheur de NavigationMenu : pilule de 36 px, couche d'état,
 * `--ui-sel` quand le lien est actif. À poser sur un lien simple de la barre :
 *
 *   <NavigationMenuLink href="/tarifs" className={navigationMenuTriggerStyle()}>Tarifs</NavigationMenuLink>
 */
export const navigationMenuTriggerStyle = cva("ui-navigation-menu__trigger");

export interface NavigationMenuProps extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root> {
  /**
   * `true` (défaut) : les panneaux s'ouvrent dans un viewport commun, sous la
   * barre, qui change de taille en ressort d'un menu à l'autre.
   * `false` : chaque panneau s'ouvre sous son propre déclencheur.
   */
  viewport?: boolean;
}

/**
 * Navigation principale d'un site ou d'un produit : déclencheurs en pilule,
 * panneaux déroulants riches (grille de liens titre + description) dans un
 * matériau translucide. Ouverture au survol ou au clic ; clavier : Tab et
 * flèches entre les entrées, Entrée ou Espace pour ouvrir, flèche bas pour
 * entrer dans le panneau, Échap pour refermer.
 *
 * Composition : `NavigationMenu` > `NavigationMenuList` > `NavigationMenuItem` >
 * `NavigationMenuTrigger` + `NavigationMenuContent` (ou un `NavigationMenuLink` seul).
 */
export const NavigationMenu = React.forwardRef<HTMLElement, NavigationMenuProps>(function NavigationMenu(
  { className, children, viewport = true, "aria-label": ariaLabel = "Navigation principale", ...props },
  ref,
) {
  return (
    <NavigationMenuPrimitive.Root
      ref={ref}
      aria-label={ariaLabel}
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn("ui-navigation-menu", className)}
      {...props}
    >
      <ViewportContext.Provider value={viewport}>
        {children}
        {viewport && <NavigationMenuViewport />}
      </ViewportContext.Provider>
    </NavigationMenuPrimitive.Root>
  );
});

export const NavigationMenuList = React.forwardRef<
  HTMLUListElement,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(function NavigationMenuList({ className, ...props }, ref) {
  return (
    <NavigationMenuPrimitive.List
      ref={ref}
      data-slot="navigation-menu-list"
      className={cn("ui-navigation-menu__list", className)}
      {...props}
    />
  );
});

export const NavigationMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Item>
>(function NavigationMenuItem({ className, ...props }, ref) {
  return (
    <NavigationMenuPrimitive.Item
      ref={ref}
      data-slot="navigation-menu-item"
      className={cn("ui-navigation-menu__item", className)}
      {...props}
    />
  );
});

/** Ouvre le panneau de son entrée ; le chevron pivote en ressort. */
export const NavigationMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(function NavigationMenuTrigger({ className, children, ...props }, ref) {
  return (
    <NavigationMenuPrimitive.Trigger
      ref={ref}
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), className)}
      {...props}
    >
      {children}
      <ChevronDown />
    </NavigationMenuPrimitive.Trigger>
  );
});

/**
 * Panneau d'une entrée. Dans le viewport, il glisse depuis le côté du menu
 * précédent ; sans viewport, il prend lui-même le matériau translucide.
 */
export const NavigationMenuContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(function NavigationMenuContent({ className, ...props }, ref) {
  const inViewport = React.useContext(ViewportContext);
  return (
    <NavigationMenuPrimitive.Content
      ref={ref}
      data-slot="navigation-menu-content"
      className={cn(!inViewport && "ui-popup", "ui-navigation-menu__content", className)}
      {...props}
    />
  );
});

export interface NavigationMenuLinkProps extends React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Link> {
  /**
   * Ligne d'explication sous le titre : le lien devient une entrée riche
   * de panneau (titre en 500, description en encre secondaire).
   */
  description?: React.ReactNode;
  /** Pictogramme dans une tuile tonale, à gauche du titre. */
  icon?: React.ReactNode;
}

/**
 * Lien de navigation. `active` le marque comme page courante (`aria-current`,
 * fond `--ui-sel`). `asChild` pour le `Link` de Next.js ou de React Router :
 * titre, `description` et `icon` sont alors posés dans l'enfant.
 */
export const NavigationMenuLink = React.forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  function NavigationMenuLink({ className, description, icon, children, ...props }, ref) {
    const rich = description != null || icon != null;
    return (
      <NavigationMenuPrimitive.Link
        ref={ref}
        data-slot="navigation-menu-link"
        data-rich={rich || undefined}
        data-icon={icon != null || undefined}
        className={cn("ui-navigation-menu__link", className)}
        {...props}
      >
        {rich
          ? // Un tableau et non un fragment : avec asChild, Slot doit voir Slottable au premier niveau.
            [
              icon != null ? (
                <span key="icon" className="ui-navigation-menu__link-icon" aria-hidden="true">
                  {icon}
                </span>
              ) : null,
              <Slottable key="title">{children}</Slottable>,
              description != null ? (
                <span key="description" className="ui-navigation-menu__link-description">
                  {description}
                </span>
              ) : null,
            ]
          : children}
      </NavigationMenuPrimitive.Link>
    );
  },
);

export interface NavigationMenuGridProps extends React.HTMLAttributes<HTMLUListElement> {
  /** Nombre de colonnes de liens (260 px chacune). */
  columns?: 1 | 2 | 3;
}

/**
 * Grille de liens d'un panneau. Chaque enfant est rangé dans un `<li>`
 * (sauf s'il en est déjà un) :
 *
 *   <NavigationMenuGrid columns={2}>
 *     <NavigationMenuLink href="/drive" icon={<HardDrive />} description="Stockez et partagez">Drive</NavigationMenuLink>
 *     …
 *   </NavigationMenuGrid>
 */
export const NavigationMenuGrid = React.forwardRef<HTMLUListElement, NavigationMenuGridProps>(
  function NavigationMenuGrid({ className, columns = 2, children, ...props }, ref) {
    return (
      <ul
        ref={ref}
        data-slot="navigation-menu-grid"
        data-columns={columns}
        className={cn("ui-navigation-menu__grid", className)}
        {...props}
      >
        {React.Children.map(children, (child) =>
          React.isValidElement(child) && child.type === "li" ? child : child == null ? null : <li>{child}</li>,
        )}
      </ul>
    );
  },
);

/** Petite pastille primaire qui glisse sous le déclencheur ouvert. */
export const NavigationMenuIndicator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(function NavigationMenuIndicator({ className, ...props }, ref) {
  return (
    <NavigationMenuPrimitive.Indicator
      ref={ref}
      data-slot="navigation-menu-indicator"
      className={cn("ui-navigation-menu__indicator", className)}
      {...props}
    >
      <span className="ui-navigation-menu__indicator-mark" />
    </NavigationMenuPrimitive.Indicator>
  );
});

/**
 * Surface commune des panneaux, en matériau translucide : sa largeur et sa
 * hauteur suivent le panneau affiché, en ressort. Rendu d'office par
 * `NavigationMenu` (sauf `viewport={false}`).
 */
export const NavigationMenuViewport = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(function NavigationMenuViewport({ className, ...props }, ref) {
  return (
    <div className="ui-navigation-menu__viewport-position">
      <NavigationMenuPrimitive.Viewport
        ref={ref}
        data-slot="navigation-menu-viewport"
        className={cn("ui-popup", "ui-navigation-menu__viewport", className)}
        {...props}
      />
    </div>
  );
});
