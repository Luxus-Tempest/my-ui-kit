import * as React from "react";
import { cn } from "../../utils/cn";

export interface SpinnerProps extends React.SVGAttributes<SVGSVGElement> {
  /** 12 / 14 / 16 / 20 / 24 px. Hérite de la couleur du texte. */
  size?: 12 | 14 | 16 | 20 | 24;
  /** Annoncé aux lecteurs d'écran. Vide : décoratif (le parent porte déjà `aria-busy`). */
  label?: string;
}

/** Indicateur d'attente circulaire, pour une attente dont on ignore la durée. */
export const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(function Spinner(
  { size = 16, label = "Chargement", className, ...props },
  ref,
) {
  return (
    <svg
      ref={ref}
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      data-slot="spinner"
      role={label ? "status" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      className={cn("ui-spinner", className)}
      {...props}
    >
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.75" />
      <path d="M14.25 8A6.25 6.25 0 0 0 8 1.75" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
});
