import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
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
 * Menu contextuel (clic droit, appui long au doigt, touche Menu ou Maj + F10),
 * comme sur un fichier de Drive. Même API, mêmes entrées et même matériau
 * translucide que `Menu` : seul le déclencheur change. La zone à clic droit
 * est `ContextMenuTrigger` (un `<span>`, ou l'enfant avec `asChild`).
 */
export const ContextMenu = ContextMenuPrimitive.Root;
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger;
export const ContextMenuGroup = ContextMenuPrimitive.Group;
export const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;
export const ContextMenuSub = ContextMenuPrimitive.Sub;

export const ContextMenuContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Content>
>(function ContextMenuContent({ className, ...props }, ref) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        ref={ref}
        data-slot="context-menu-content"
        className={cn("ui-popup", "ui-menu", "ui-context-menu", className)}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
});

export interface ContextMenuItemProps extends React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Item> {
  /** `danger` : action qui retire ou détruit. Rouge, sans aplat. */
  variant?: "default" | "danger";
  /** Aligne le texte sur les entrées qui ont une coche ou une icône. */
  inset?: boolean;
  /** Raccourci clavier affiché à droite. */
  shortcut?: string;
}

export const ContextMenuItem = React.forwardRef<HTMLDivElement, ContextMenuItemProps>(function ContextMenuItem(
  { className, variant = "default", inset, shortcut, children, ...props },
  ref,
) {
  return (
    <ContextMenuPrimitive.Item
      ref={ref}
      data-slot="context-menu-item"
      data-variant={variant}
      data-inset={inset || undefined}
      className={cn("ui-menu-item", className)}
      {...props}
    >
      {children}
      {shortcut && <span className="ui-menu-shortcut">{shortcut}</span>}
    </ContextMenuPrimitive.Item>
  );
});

export const ContextMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.CheckboxItem>
>(function ContextMenuCheckboxItem({ className, children, ...props }, ref) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      ref={ref}
      data-slot="context-menu-checkbox-item"
      className={cn("ui-menu-item", "ui-menu-item--check", className)}
      {...props}
    >
      {children}
      <ContextMenuPrimitive.ItemIndicator className="ui-menu-item__indicator">
        <Check />
      </ContextMenuPrimitive.ItemIndicator>
    </ContextMenuPrimitive.CheckboxItem>
  );
});

export const ContextMenuRadioItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.RadioItem>
>(function ContextMenuRadioItem({ className, children, ...props }, ref) {
  return (
    <ContextMenuPrimitive.RadioItem
      ref={ref}
      data-slot="context-menu-radio-item"
      className={cn("ui-menu-item", "ui-menu-item--check", className)}
      {...props}
    >
      {children}
      <ContextMenuPrimitive.ItemIndicator className="ui-menu-item__indicator">
        <Dot />
      </ContextMenuPrimitive.ItemIndicator>
    </ContextMenuPrimitive.RadioItem>
  );
});

export const ContextMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Label> & { inset?: boolean }
>(function ContextMenuLabel({ className, inset, ...props }, ref) {
  return (
    <ContextMenuPrimitive.Label
      ref={ref}
      data-inset={inset || undefined}
      className={cn("ui-menu-label", className)}
      {...props}
    />
  );
});

export const ContextMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.Separator>
>(function ContextMenuSeparator({ className, ...props }, ref) {
  return <ContextMenuPrimitive.Separator ref={ref} className={cn("ui-menu-separator", className)} {...props} />;
});

export const ContextMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubTrigger> & { inset?: boolean }
>(function ContextMenuSubTrigger({ className, inset, children, ...props }, ref) {
  return (
    <ContextMenuPrimitive.SubTrigger
      ref={ref}
      data-inset={inset || undefined}
      className={cn("ui-menu-item", "ui-menu-item--sub", className)}
      {...props}
    >
      {children}
      <ChevronRight />
    </ContextMenuPrimitive.SubTrigger>
  );
});

export const ContextMenuSubContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof ContextMenuPrimitive.SubContent>
>(function ContextMenuSubContent({ className, sideOffset = 6, alignOffset = -6, ...props }, ref) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.SubContent
        ref={ref}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className={cn("ui-popup", "ui-menu", "ui-context-menu", className)}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
});
