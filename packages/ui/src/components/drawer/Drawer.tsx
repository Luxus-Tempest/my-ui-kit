import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "../../utils/cn";

export type DrawerDirection = "bottom" | "top" | "left" | "right";

interface DrawerContextValue {
  direction: DrawerDirection;
  snapPoints: boolean;
  autoFocus: boolean;
}
const DrawerContext = React.createContext<DrawerContextValue>({ direction: "bottom", snapPoints: false, autoFocus: false });

export type DrawerProps = React.ComponentProps<typeof DrawerPrimitive.Root>;

/**
 * Tiroir glissable : la feuille du bas d'iOS, que l'on referme d'un geste.
 * Construit sur vaul (Radix Dialog) : piège à focus, Échap, voile cliquable,
 * retour du focus au déclencheur.
 *
 * - `direction` : `bottom` (défaut), `top`, `left`, `right`.
 * - `snapPoints` : crans d'arrêt, en fraction de l'écran (`[0.4, 1]`) ou en pixels
 *   (`["240px", 1]`), avec `activeSnapPoint` / `setActiveSnapPoint` pour les piloter.
 * - `shouldScaleBackground` : l'application recule légèrement derrière la feuille,
 *   comme sur iOS. Pose `data-vaul-drawer-wrapper` sur l'élément qui l'enveloppe
 *   (la racine de l'application) ; `setBackgroundColorOnScale={false}` laisse le
 *   fond de `body` intact.
 * - `dismissible={false}` : ni geste, ni voile, ni Échap ne ferment ; à piloter par `open`.
 * - `handleOnly` : seul le glissement de la poignée déplace la feuille.
 *
 * À l'ouverture, le focus va sur la feuille elle-même (le titre est annoncé, aucun
 * clavier virtuel ne surgit) ; `autoFocus` le place sur le premier élément focalisable.
 * Un élément qui ne doit pas déclencher le glissement (curseur, carte) reçoit `data-vaul-no-drag`.
 */
export function Drawer({ direction = "bottom", shouldScaleBackground = false, autoFocus = false, ...props }: DrawerProps) {
  const context = React.useMemo<DrawerContextValue>(
    () => ({ direction, snapPoints: Boolean(props.snapPoints?.length), autoFocus }),
    [direction, props.snapPoints?.length, autoFocus],
  );
  return (
    <DrawerContext.Provider value={context}>
      <DrawerPrimitive.Root
        direction={direction}
        shouldScaleBackground={shouldScaleBackground}
        autoFocus={autoFocus}
        {...props}
      />
    </DrawerContext.Provider>
  );
}

export const DrawerTrigger = DrawerPrimitive.Trigger;
export const DrawerClose = DrawerPrimitive.Close;
/** Portail et voile, pour composer un contenu sur mesure. `DrawerContent` les pose déjà. */
export const DrawerPortal = DrawerPrimitive.Portal;

export const DrawerOverlay = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(function DrawerOverlay({ className, ...props }, ref) {
  return (
    <DrawerPrimitive.Overlay
      ref={ref}
      data-slot="drawer-overlay"
      className={cn("ui-dialog__overlay", "ui-drawer__overlay", className)}
      {...props}
    />
  );
});

export interface DrawerContentProps extends React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> {
  /** Poignée de glissement ; affichée par défaut pour `bottom` et `top`. */
  showHandle?: boolean;
  /** Conteneur du portail ; `document.body` par défaut. */
  container?: HTMLElement | null;
}

export const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(function DrawerContent(
  { className, showHandle, container, onOpenAutoFocus, children, ...props },
  forwardedRef,
) {
  const { direction, snapPoints, autoFocus } = React.useContext(DrawerContext);
  const innerRef = React.useRef<HTMLDivElement | null>(null);
  const ref = React.useCallback(
    (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );
  const handle = showHandle ?? (direction === "bottom" || direction === "top");

  return (
    <DrawerPrimitive.Portal container={container}>
      <DrawerOverlay />
      <DrawerPrimitive.Content
        ref={ref}
        data-slot="drawer-content"
        data-direction={direction}
        data-snap={snapPoints || undefined}
        className={cn("ui-drawer", className)}
        onOpenAutoFocus={(event) => {
          onOpenAutoFocus?.(event);
          if (event.defaultPrevented || autoFocus) return;
          // vaul laisse sinon le focus sur le déclencheur, masqué par la modale :
          // on le pose sur la feuille, qui annonce son titre sans ouvrir de clavier.
          event.preventDefault();
          innerRef.current?.focus({ preventScroll: true });
        }}
        {...props}
      >
        {handle && <DrawerPrimitive.Handle className="ui-drawer__handle" />}
        {children}
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  );
});

export function DrawerHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="drawer-header" className={cn("ui-drawer__header", className)} {...props} />;
}

/** Zone qui défile entre l'en-tête et le pied ; le glissement ne s'y déclenche qu'en haut de la zone. */
export function DrawerBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="drawer-body" className={cn("ui-drawer__body", className)} {...props} />;
}

/** Pied : actions pleine largeur et empilées sur téléphone, alignées à droite au-delà. */
export function DrawerFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="drawer-footer" className={cn("ui-drawer__footer", className)} {...props} />;
}

export const DrawerTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(function DrawerTitle({ className, ...props }, ref) {
  return <DrawerPrimitive.Title ref={ref} data-slot="drawer-title" className={cn("ui-drawer__title", className)} {...props} />;
});

export const DrawerDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(function DrawerDescription({ className, ...props }, ref) {
  return (
    <DrawerPrimitive.Description
      ref={ref}
      data-slot="drawer-description"
      className={cn("ui-drawer__description", className)}
      {...props}
    />
  );
});
