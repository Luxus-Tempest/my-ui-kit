import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../../utils/cn";

export type AppBarVariant = "plain" | "material";
export type AppBarDensity = "default" | "compact";
export type AppBarTitleAlign = "start" | "center";
export type AppBarPosition = "sticky" | "static";

export interface AppBarProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * `plain` (défaut) : prend la surface de son conteneur (fond hérité), comme la
   * barre de Drive sur le fond d'application ou en tête d'un panneau.
   * `material` : matériau translucide flouté d'iOS, le contenu défile dessous.
   */
  variant?: AppBarVariant;
  /** `sticky` (défaut) : reste en haut de la zone qui défile. `static` : défile avec la page. */
  position?: AppBarPosition;
  /** `default` : 64 px · `compact` : 56 px. */
  density?: AppBarDensity;
  /** `start` : titre de 22 px façon Drive · `center` : titre centré d'iOS, 17 px semi-gras. */
  titleAlign?: AppBarTitleAlign;
  /**
   * Filet capillaire sous la barre, qui n'apparaît qu'une fois le contenu défilé
   * dessous. Activé par défaut.
   */
  elevateOnScroll?: boolean;
  /**
   * Conteneur qui défile, si ce n'est ni la page ni un ancêtre positionné de la
   * barre : son `scrollTop` décide du filet. Élément ou ref.
   */
  scrollTarget?: HTMLElement | null | React.RefObject<HTMLElement | null>;
}

function resolveTarget(target: AppBarProps["scrollTarget"]): HTMLElement | null {
  if (!target) return null;
  return "current" in target ? target.current : target;
}

/**
 * Barre supérieure d'application : `AppBarLeading` (menu, retour), `AppBarTitle`,
 * contenu libre (recherche), `AppBarActions`. Collante par défaut.
 *
 * Le filet d'élévation est piloté par un IntersectionObserver posé sur une
 * sentinelle (au point de départ de la barre) ou par l'écoute de `scrollTarget` :
 * aucun calcul au défilement, rien au rendu serveur.
 */
export const AppBar = React.forwardRef<HTMLElement, AppBarProps>(function AppBar(
  {
    className,
    variant = "plain",
    position = "sticky",
    density = "default",
    titleAlign = "start",
    elevateOnScroll = true,
    scrollTarget,
    children,
    ...props
  },
  ref,
) {
  const [scrolled, setScrolled] = React.useState(false);
  const sentinelRef = React.useRef<HTMLSpanElement>(null);
  const useSentinel = elevateOnScroll && scrollTarget === undefined;

  // Conteneur explicite : on lit son défilement.
  React.useEffect(() => {
    if (!elevateOnScroll || scrollTarget === undefined) return;
    const element = resolveTarget(scrollTarget);
    if (!element) return;
    const update = () => setScrolled(element.scrollTop > 0);
    update();
    element.addEventListener("scroll", update, { passive: true });
    return () => element.removeEventListener("scroll", update);
  }, [elevateOnScroll, scrollTarget]);

  // Sentinelle : quand elle quitte la zone visible par le haut, du contenu passe sous la barre.
  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!useSentinel || !sentinel || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      const below = entry.rootBounds ? entry.boundingClientRect.top >= entry.rootBounds.bottom : false;
      setScrolled(!entry.isIntersecting && !below);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [useSentinel]);

  React.useEffect(() => {
    if (!elevateOnScroll) setScrolled(false);
  }, [elevateOnScroll]);

  return (
    <>
      {useSentinel && <span ref={sentinelRef} aria-hidden="true" data-slot="app-bar-sentinel" className="ui-app-bar__sentinel" />}
      <header
        ref={ref}
        data-slot="app-bar"
        data-variant={variant}
        data-position={position}
        data-density={density}
        data-title-align={titleAlign}
        data-scrolled={scrolled || undefined}
        className={cn("ui-app-bar", className)}
        {...props}
      >
        {children}
      </header>
    </>
  );
});

/** Début de barre : bouton de menu, retour, logo. */
export const AppBarLeading = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function AppBarLeading({ className, ...props }, ref) {
    return <div ref={ref} data-slot="app-bar-leading" className={cn("ui-app-bar__leading", className)} {...props} />;
  },
);

export interface AppBarTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Rend l'enfant (un lien vers l'accueil, un `<span>` pour un nom d'application…) avec le style du titre. */
  asChild?: boolean;
}

/** Titre de la vue (`<h1>` par défaut), tronqué s'il manque de place. */
export const AppBarTitle = React.forwardRef<HTMLHeadingElement, AppBarTitleProps>(function AppBarTitle(
  { className, asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "h1";
  return <Comp ref={ref} data-slot="app-bar-title" className={cn("ui-app-bar__title", className)} {...props} />;
});

/** Fin de barre : actions en boutons icône, avatar. */
export const AppBarActions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function AppBarActions({ className, ...props }, ref) {
    return <div ref={ref} data-slot="app-bar-actions" className={cn("ui-app-bar__actions", className)} {...props} />;
  },
);
