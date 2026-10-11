import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "../../utils/cn";
import { useFieldControl } from "../field/Field";

export type CheckboxProps = React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>;

/**
 * Case à cocher : 18 px, rayon 5 px, bord 2 px « outline » (contraste 3:1).
 * La zone cliquable déborde de 8 px sans déplacer la case.
 * État mixte : `checked="indeterminate"`.
 */
export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  { className, ...rest },
  ref,
) {
  const props = useFieldControl(rest);
  return (
    <CheckboxPrimitive.Root ref={ref} data-slot="checkbox" className={cn("ui-checkbox", className)} {...props}>
      <CheckboxPrimitive.Indicator className="ui-checkbox__indicator" data-slot="checkbox-indicator">
        <svg data-icon="check" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2.5 6.2l2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg data-icon="minus" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M3 6h6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
