import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cn } from "../../utils/cn";
import { buttonVariants } from "../button/Button";

export type ToggleVariant = "ghost" | "outline";
export type ToggleSize = "sm" | "default" | "icon" | "icon-sm";

export interface ToggleProps extends React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> {
  /** `ghost` (défaut) : ni fond ni filet au repos, pour une barre d'outils. `outline` : filet, posé seul. */
  variant?: ToggleVariant;
  /** 32 / 36 px ; `icon` et `icon-sm` sont des cercles et exigent un `aria-label`. */
  size?: ToggleSize;
}

/**
 * Bouton bascule (gras, épingler, afficher les détails…) : il a la géométrie
 * d'un Button `ghost` ou `outline` et, enfoncé, prend le conteneur de sélection
 * (`--ui-pri-container` / `--ui-on-pri-container`), comme une puce choisie de Drive.
 * L'état est exposé par `aria-pressed` et `data-state="on" | "off"`.
 *
 * Contrôlé (`pressed` + `onPressedChange`) ou non (`defaultPressed`).
 */
export const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  { className, variant = "ghost", size = "default", ...props },
  ref,
) {
  return (
    <TogglePrimitive.Root
      ref={ref}
      data-slot="toggle"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), "ui-toggle", className)}
      {...props}
    />
  );
});
