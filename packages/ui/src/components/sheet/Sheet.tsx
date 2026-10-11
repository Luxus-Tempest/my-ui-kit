import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { cn } from "../../utils/cn";
import { Button } from "../button/Button";

const CloseIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

/**
 * Feuille : une modale qui glisse depuis un bord.
 * - `right` / `left` : panneau flottant détaché du bord de 8 px, grand rayon
 *   (le panneau « Détails » de Drive, à la manière d'iPadOS).
 * - `bottom` : feuille d'iOS, coins supérieurs arrondis et poignée.
 * - `top` : bandeau déroulant (rare : recherche plein écran, annonce).
 *
 * Mêmes garanties que Dialog (piège à focus, Échap, retour du focus).
 * Le contenu long va dans `SheetBody`, seule zone qui défile.
 */
export const Sheet = RadixDialog.Root;
export const SheetTrigger = RadixDialog.Trigger;
export const SheetClose = RadixDialog.Close;

export interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof RadixDialog.Content> {
  side?: "right" | "left" | "bottom" | "top";
  /** Largeur des feuilles latérales : 360 / 440 / 560 px. */
  size?: "sm" | "md" | "lg";
  /** Croix en haut à droite. */
  showCloseButton?: boolean;
  /** Poignée de la feuille du bas ; affichée par défaut avec `side="bottom"`. */
  showHandle?: boolean;
  /** Conteneur du portail ; `document.body` par défaut. */
  container?: HTMLElement | null;
}

export const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(function SheetContent(
  { className, side = "right", size = "md", showCloseButton = true, showHandle, container, children, ...props },
  ref,
) {
  const handle = showHandle ?? side === "bottom";
  return (
    <RadixDialog.Portal container={container}>
      <RadixDialog.Overlay className="ui-dialog__overlay ui-sheet__overlay" />
      <RadixDialog.Content
        ref={ref}
        data-slot="sheet-content"
        data-side={side}
        data-size={size}
        className={cn("ui-sheet", className)}
        {...props}
      >
        {handle && <div className="ui-sheet__handle" aria-hidden="true" />}
        {/* La croix vient en premier : elle reçoit le focus à l'ouverture, plutôt qu'une action du pied. */}
        {showCloseButton && (
          <RadixDialog.Close asChild>
            <Button variant="secondary" size="icon-sm" className="ui-sheet__close" aria-label="Fermer">
              <CloseIcon />
            </Button>
          </RadixDialog.Close>
        )}
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
});

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="sheet-header" className={cn("ui-sheet__header", className)} {...props} />;
}

/** Zone qui défile entre l'en-tête et le pied. */
export function SheetBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="sheet-body" className={cn("ui-sheet__body", className)} {...props} />;
}

export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="sheet-footer" className={cn("ui-sheet__footer", className)} {...props} />;
}

export const SheetTitle = React.forwardRef<HTMLHeadingElement, React.ComponentPropsWithoutRef<typeof RadixDialog.Title>>(
  function SheetTitle({ className, ...props }, ref) {
    return <RadixDialog.Title ref={ref} className={cn("ui-sheet__title", className)} {...props} />;
  },
);

export const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Description>
>(function SheetDescription({ className, ...props }, ref) {
  return <RadixDialog.Description ref={ref} className={cn("ui-sheet__description", className)} {...props} />;
});
