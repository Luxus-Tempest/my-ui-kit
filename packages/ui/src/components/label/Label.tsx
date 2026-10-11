import * as React from "react";
import { cn } from "../../utils/cn";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Affiche l'astérisque. Le champ porte lui-même `required` : c'est lui qui l'annonce. */
  required?: boolean;
  /** Estompe le libellé quand son champ est désactivé. */
  disabled?: boolean;
}

/** Libellé de champ : 13 px / 500, `fg-2`. */
export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { className, required, disabled, children, ...props },
  ref,
) {
  return (
    <label
      ref={ref}
      data-slot="label"
      data-disabled={disabled || undefined}
      className={cn("ui-label", className)}
      {...props}
    >
      {children}
      {required && (
        <span className="ui-label__required" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
});
