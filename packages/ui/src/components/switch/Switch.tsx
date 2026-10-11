import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "../../utils/cn";
import { useFieldControl } from "../field/Field";

export interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  /** `default` : piste 34 × 20 px. `sm` : 28 × 16 px. */
  size?: "sm" | "default";
}

/** Bascule aux proportions d'iOS : piste 44 × 26 px (34 × 20 en `sm`), pastille qui s'étire à l'appui. */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { className, size = "default", ...rest },
  ref,
) {
  const props = useFieldControl(rest);
  return (
    <SwitchPrimitive.Root
      ref={ref}
      data-slot="switch"
      data-size={size}
      className={cn("ui-switch", className)}
      {...props}
    >
      <SwitchPrimitive.Thumb className="ui-switch__thumb" data-slot="switch-thumb" />
    </SwitchPrimitive.Root>
  );
});
