import * as React from "react";
import * as MenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "../../utils/cn";

const Check = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3.5 8.4 6.6 11.5 12.5 4.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Dot = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="3.25" fill="currentColor" />
  </svg>
);
const ChevronRight = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="ui-menu-item__chevron">
    <path d="M6.25 4.5 9.75 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Menu d'actions ouvert par un bouton, en matériau translucide. Navigation au
 * clavier (flèches, saisie de la première lettre, Échap), sous-menus.
 */
export const Menu = MenuPrimitive.Root;
export const MenuTrigger = MenuPrimitive.Trigger;
export const MenuGroup = MenuPrimitive.Group;
export const MenuRadioGroup = MenuPrimitive.RadioGroup;
export const MenuSub = MenuPrimitive.Sub;

export const MenuContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof MenuPrimitive.Content>
>(function MenuContent({ className, align = "start", sideOffset = 4, ...props }, ref) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        ref={ref}
        data-slot="menu-content"
        align={align}
        sideOffset={sideOffset}
        className={cn("ui-popup", "ui-menu", className)}
        {...props}
      />
    </MenuPrimitive.Portal>
  );
});

export interface MenuItemProps extends React.ComponentPropsWithoutRef<typeof MenuPrimitive.Item> {
  /** `danger` : action qui retire ou détruit. Rouge, sans aplat. */
  variant?: "default" | "danger";
  /** Aligne le texte sur les entrées qui ont une coche ou une icône. */
  inset?: boolean;
  /** Raccourci clavier affiché à droite. */
  shortcut?: string;
}

export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(function MenuItem(
  { className, variant = "default", inset, shortcut, children, ...props },
  ref,
) {
  return (
    <MenuPrimitive.Item
      ref={ref}
      data-slot="menu-item"
      data-variant={variant}
      data-inset={inset || undefined}
      className={cn("ui-menu-item", className)}
      {...props}
    >
      {children}
      {shortcut && <span className="ui-menu-shortcut">{shortcut}</span>}
    </MenuPrimitive.Item>
  );
});

export const MenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof MenuPrimitive.CheckboxItem>
>(function MenuCheckboxItem({ className, children, ...props }, ref) {
  return (
    <MenuPrimitive.CheckboxItem
      ref={ref}
      data-slot="menu-checkbox-item"
      className={cn("ui-menu-item", "ui-menu-item--check", className)}
      {...props}
    >
      {children}
      <MenuPrimitive.ItemIndicator className="ui-menu-item__indicator">
        <Check />
      </MenuPrimitive.ItemIndicator>
    </MenuPrimitive.CheckboxItem>
  );
});

export const MenuRadioItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof MenuPrimitive.RadioItem>
>(function MenuRadioItem({ className, children, ...props }, ref) {
  return (
    <MenuPrimitive.RadioItem
      ref={ref}
      data-slot="menu-radio-item"
      className={cn("ui-menu-item", "ui-menu-item--check", className)}
      {...props}
    >
      {children}
      <MenuPrimitive.ItemIndicator className="ui-menu-item__indicator">
        <Dot />
      </MenuPrimitive.ItemIndicator>
    </MenuPrimitive.RadioItem>
  );
});

export const MenuLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof MenuPrimitive.Label> & { inset?: boolean }
>(function MenuLabel({ className, inset, ...props }, ref) {
  return (
    <MenuPrimitive.Label
      ref={ref}
      data-inset={inset || undefined}
      className={cn("ui-menu-label", className)}
      {...props}
    />
  );
});

export const MenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof MenuPrimitive.Separator>
>(function MenuSeparator({ className, ...props }, ref) {
  return <MenuPrimitive.Separator ref={ref} className={cn("ui-menu-separator", className)} {...props} />;
});

export const MenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof MenuPrimitive.SubTrigger> & { inset?: boolean }
>(function MenuSubTrigger({ className, inset, children, ...props }, ref) {
  return (
    <MenuPrimitive.SubTrigger
      ref={ref}
      data-inset={inset || undefined}
      className={cn("ui-menu-item", "ui-menu-item--sub", className)}
      {...props}
    >
      {children}
      <ChevronRight />
    </MenuPrimitive.SubTrigger>
  );
});

export const MenuSubContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof MenuPrimitive.SubContent>
>(function MenuSubContent({ className, sideOffset = 6, alignOffset = -6, ...props }, ref) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.SubContent
        ref={ref}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className={cn("ui-popup", "ui-menu", className)}
        {...props}
      />
    </MenuPrimitive.Portal>
  );
});
