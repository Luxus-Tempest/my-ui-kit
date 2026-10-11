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
 * Modale : feuille centrée, rayon 20 px, ombre sh4, entrée en ressort, voile
 * flouté. Radix gère le piège à focus, Échap, aria-modal et le blocage du
 * défilement ; le focus revient au déclencheur à la fermeture.
 */
export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;

export interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof RadixDialog.Content> {
  /** 380 / 520 / 800 px. */
  size?: "sm" | "md" | "lg";
  /** Croix en haut à droite. */
  showCloseButton?: boolean;
  /** Conteneur du portail ; `document.body` par défaut. */
  container?: HTMLElement | null;
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(function DialogContent(
  { className, size = "md", showCloseButton = true, container, children, ...props },
  ref,
) {
  return (
    <RadixDialog.Portal container={container}>
      <RadixDialog.Overlay className="ui-dialog__overlay" />
      <RadixDialog.Content
        ref={ref}
        data-slot="dialog-content"
        data-size={size}
        className={cn("ui-dialog__content", className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <RadixDialog.Close asChild>
            <Button variant="ghost" size="icon-sm" className="ui-dialog__close" aria-label="Fermer">
              <CloseIcon />
            </Button>
          </RadixDialog.Close>
        )}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
});

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="dialog-header" className={cn("ui-dialog__header", className)} {...props} />;
}

/** Pied : actions à droite, sans filet ; empilées pleine largeur sur téléphone. */
export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="dialog-footer" className={cn("ui-dialog__footer", className)} {...props} />;
}

export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Title>
>(function DialogTitle({ className, ...props }, ref) {
  return <RadixDialog.Title ref={ref} className={cn("ui-dialog__title", className)} {...props} />;
});

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof RadixDialog.Description>
>(function DialogDescription({ className, ...props }, ref) {
  return <RadixDialog.Description ref={ref} className={cn("ui-dialog__description", className)} {...props} />;
});
