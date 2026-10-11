import * as React from "react";
import * as RadioPrimitive from "@radix-ui/react-radio-group";
import { cn } from "../../utils/cn";
import { useFieldControl } from "../field/Field";

export interface RadioGroupProps extends React.ComponentPropsWithoutRef<typeof RadioPrimitive.Root> {
  /** `vertical` (défaut) : une option par ligne. */
  orientation?: "vertical" | "horizontal";
}

/**
 * Choix unique parmi quelques options visibles d'un coup (2 à 5).
 * Au-delà, un Select. Flèches du clavier pour passer d'une option à l'autre.
 */
export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(
  { className, orientation = "vertical", ...props },
  ref,
) {
  const fieldProps = useFieldControl(props, { labelledBy: true });
  return (
    <RadioPrimitive.Root
      ref={ref}
      data-slot="radio-group"
      orientation={orientation}
      className={cn("ui-radio-group", className)}
      {...fieldProps}
    />
  );
});

export interface RadioGroupItemProps extends React.ComponentPropsWithoutRef<typeof RadioPrimitive.Item> {
  /** Libellé de l'option, cliquable. Sans lui, passe un `aria-label`. */
  children?: React.ReactNode;
  /** Précision sous le libellé. */
  description?: React.ReactNode;
}

export const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(function RadioGroupItem(
  { className, children, description, id, ...props },
  ref,
) {
  const autoId = React.useId();
  const itemId = id ?? `radio-${autoId}`;
  const descId = description ? `${itemId}-desc` : undefined;

  const radio = (
    <RadioPrimitive.Item
      ref={ref}
      id={itemId}
      data-slot="radio"
      aria-describedby={descId}
      className={cn("ui-radio", !children && className)}
      {...props}
    >
      <RadioPrimitive.Indicator className="ui-radio__dot" />
    </RadioPrimitive.Item>
  );

  if (!children) return radio;

  return (
    <div className={cn("ui-radio-option", className)} data-disabled={props.disabled || undefined}>
      {radio}
      <div className="ui-radio-option__text">
        <label htmlFor={itemId} className="ui-radio-option__label">
          {children}
        </label>
        {description && (
          <span id={descId} className="ui-radio-option__description">
            {description}
          </span>
        )}
      </div>
    </div>
  );
});
