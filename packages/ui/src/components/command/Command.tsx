import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { cn } from "../../utils/cn";

const SearchIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.6" />
    <path d="m10.25 10.25 3.25 3.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/**
 * Palette de commandes (cmdk) : filtrage à la frappe, flèches, Entrée.
 * Les entrées reprennent celles des menus (36 px, couche d'état) ; dans
 * `CommandDialog`, la palette flotte en haut d'écran comme Spotlight,
 * en matériau translucide.
 */
export const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(function Command({ className, ...props }, ref) {
  return <CommandPrimitive ref={ref} data-slot="command" className={cn("ui-command", className)} {...props} />;
});

export interface CommandDialogProps extends React.ComponentPropsWithoutRef<typeof RadixDialog.Root> {
  /** Titre annoncé aux lecteurs d'écran (masqué). */
  title?: string;
  /** Description annoncée aux lecteurs d'écran (masquée). */
  description?: string;
  /** Props de la palette (`filter`, `shouldFilter`, `loop`…). */
  commandProps?: React.ComponentPropsWithoutRef<typeof CommandPrimitive>;
  className?: string;
  children?: React.ReactNode;
}

export function CommandDialog({
  title = "Palette de commandes",
  description = "Recherchez une commande ou une page.",
  commandProps,
  className,
  children,
  ...props
}: CommandDialogProps) {
  return (
    <RadixDialog.Root {...props}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="ui-dialog__overlay ui-command-dialog__overlay" />
        <RadixDialog.Content data-slot="command-dialog" className={cn("ui-command-dialog", className)}>
          <RadixDialog.Title className="ui-sr-only">{title}</RadixDialog.Title>
          <RadixDialog.Description className="ui-sr-only">{description}</RadixDialog.Description>
          <Command loop {...commandProps}>{children}</Command>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

export const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(function CommandInput({ className, ...props }, ref) {
  return (
    <div className="ui-command__search" data-slot="command-input-wrapper">
      <SearchIcon />
      <CommandPrimitive.Input ref={ref} className={cn("ui-command__input", className)} {...props} />
    </div>
  );
});

export const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(function CommandList({ className, ...props }, ref) {
  return <CommandPrimitive.List ref={ref} className={cn("ui-command__list", className)} {...props} />;
});

export const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(function CommandEmpty({ className, ...props }, ref) {
  return <CommandPrimitive.Empty ref={ref} className={cn("ui-command__empty", className)} {...props} />;
});

export const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(function CommandGroup({ className, ...props }, ref) {
  return <CommandPrimitive.Group ref={ref} className={cn("ui-command__group", className)} {...props} />;
});

export interface CommandSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Garder le filet pendant une recherche (masqué par défaut, comme dans cmdk). */
  alwaysRender?: boolean;
}

/**
 * Filet décoratif. Pas celui de cmdk : son `role="separator"` est interdit
 * dans une liste d'options (`listbox`), les lecteurs d'écran s'y perdent.
 */
export const CommandSeparator = React.forwardRef<HTMLDivElement, CommandSeparatorProps>(function CommandSeparator(
  { className, alwaysRender, ...props },
  ref,
) {
  const searching = useCommandState((state) => state.search !== "");
  if (searching && !alwaysRender) return null;
  return <div ref={ref} role="none" data-slot="command-separator" className={cn("ui-menu-separator", className)} {...props} />;
});

export interface CommandItemProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> {
  /** Raccourci affiché à droite (« ⌘N »). */
  shortcut?: string;
}

export const CommandItem = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Item>, CommandItemProps>(
  function CommandItem({ className, shortcut, children, ...props }, ref) {
    return (
      <CommandPrimitive.Item ref={ref} className={cn("ui-menu-item", "ui-command__item", className)} {...props}>
        {children}
        {shortcut && <CommandShortcut>{shortcut}</CommandShortcut>}
      </CommandPrimitive.Item>
    );
  },
);

export function CommandShortcut({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span data-slot="command-shortcut" className={cn("ui-menu-shortcut", className)} {...props} />;
}
