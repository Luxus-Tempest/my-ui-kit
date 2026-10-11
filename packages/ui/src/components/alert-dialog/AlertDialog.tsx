import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "../../utils/cn";
import { Button, type ButtonProps } from "../button/Button";

/**
 * Confirmation bloquante : pas de croix, pas de fermeture au clic sur le voile.
 * On en sort par un choix explicite. Le focus arrive sur « Annuler » :
 * la réponse sûre est celle qu'Entrée déclenche.
 */
export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

export interface AlertDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> {
  /** `default` : 440 px. `sm` : 380 px. */
  size?: "default" | "sm";
}

export const AlertDialogContent = React.forwardRef<HTMLDivElement, AlertDialogContentProps>(
  function AlertDialogContent({ className, size = "default", ...props }, ref) {
    return (
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="ui-dialog__overlay" />
        <AlertDialogPrimitive.Content
          ref={ref}
          data-slot="alert-dialog-content"
          data-size={size}
          className={cn("ui-dialog__content", "ui-alert-dialog", className)}
          {...props}
        />
      </AlertDialogPrimitive.Portal>
    );
  },
);

export function AlertDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("ui-dialog__header", "ui-alert-dialog__header", className)} {...props} />;
}

/** Pastille d'icône de 34 px à gauche du titre. `tone="err"` pour une destruction. */
export function AlertDialogMedia({
  className,
  tone = "neu",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { tone?: "neu" | "pri" | "warn" | "err" }) {
  return <div data-tone={tone} className={cn("ui-alert-dialog__media", className)} aria-hidden="true" {...props} />;
}

export function AlertDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("ui-dialog__footer", className)} {...props} />;
}

export const AlertDialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(function AlertDialogTitle({ className, ...props }, ref) {
  return <AlertDialogPrimitive.Title ref={ref} className={cn("ui-dialog__title", "ui-alert-dialog__title", className)} {...props} />;
});

export const AlertDialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(function AlertDialogDescription({ className, ...props }, ref) {
  return (
    <AlertDialogPrimitive.Description
      ref={ref}
      className={cn("ui-alert-dialog__description", className)}
      {...props}
    />
  );
});

/** Action de confirmation. `variant="destructive"` quand elle détruit. */
export const AlertDialogAction = React.forwardRef<HTMLButtonElement, ButtonProps>(function AlertDialogAction(
  props,
  ref,
) {
  return (
    <AlertDialogPrimitive.Action asChild>
      <Button ref={ref} {...props} />
    </AlertDialogPrimitive.Action>
  );
});

export const AlertDialogCancel = React.forwardRef<HTMLButtonElement, ButtonProps>(function AlertDialogCancel(
  { variant = "outline", children = "Annuler", ...props },
  ref,
) {
  return (
    <AlertDialogPrimitive.Cancel asChild>
      <Button ref={ref} variant={variant} {...props}>
        {children}
      </Button>
    </AlertDialogPrimitive.Cancel>
  );
});
