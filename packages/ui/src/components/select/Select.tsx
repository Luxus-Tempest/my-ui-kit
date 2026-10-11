import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "../../utils/cn";
import { useFieldControl } from "../field/Field";

const Chevron = ({ up }: { up?: boolean }) => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d={up ? "M4.5 10l3.5-3.5 3.5 3.5" : "M4.5 6.25 8 9.75l3.5-3.5"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Check = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3.5 8.4 6.6 11.5 12.5 4.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Liste déroulante : choix unique parmi beaucoup d'options.
 *
 *   <Select defaultValue="mad">
 *     <SelectTrigger><SelectValue placeholder="Devise" /></SelectTrigger>
 *     <SelectContent>
 *       <SelectItem value="mad">Dirham (MAD)</SelectItem>
 *     </SelectContent>
 *   </Select>
 */
export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;

export const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>
>(function SelectValue({ className, ...props }, ref) {
  return <SelectPrimitive.Value ref={ref} data-slot="select-value" className={className} {...props} />;
});

export interface SelectTriggerProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  /** `default` : 32 px, comme un Input. `sm` : 28 px. */
  density?: "sm" | "default";
}

/** Déclencheur : même géométrie et même remplissage tonal qu'un Input. */
export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(function SelectTrigger(
  { className, density = "default", children, ...props },
  ref,
) {
  const fieldProps = useFieldControl(props);
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      data-slot="select-trigger"
      data-density={density}
      className={cn("ui-select-trigger", className)}
      {...fieldProps}
    >
      <span className="ui-select-trigger__value">{children}</span>
      <SelectPrimitive.Icon className="ui-select-trigger__icon">
        <Chevron />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});

export interface SelectContentProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {}

/** Liste : largeur du déclencheur au minimum, hauteur bornée à l'espace disponible. */
export const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(function SelectContent(
  { className, children, position = "popper", sideOffset = 4, ...props },
  ref,
) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        data-slot="select-content"
        position={position}
        sideOffset={position === "popper" ? sideOffset : undefined}
        className={cn("ui-popup", "ui-select-content", className)}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="ui-select-scroll">
          <Chevron up />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="ui-select-viewport">{children}</SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="ui-select-scroll">
          <Chevron />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});

export const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(function SelectItem({ className, children, ...props }, ref) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      data-slot="select-item"
      className={cn("ui-menu-item", "ui-menu-item--check", className)}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="ui-menu-item__indicator">
        <Check />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
});

export const SelectLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(function SelectLabel({ className, ...props }, ref) {
  return <SelectPrimitive.Label ref={ref} className={cn("ui-menu-label", className)} {...props} />;
});

export const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(function SelectSeparator({ className, ...props }, ref) {
  return <SelectPrimitive.Separator ref={ref} className={cn("ui-menu-separator", className)} {...props} />;
});
