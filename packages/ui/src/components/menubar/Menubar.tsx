import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
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
 * Barre de menus d'application (« Fichier Édition Affichage »), comme dans
 * Docs ou une application de bureau. Déclencheurs en pilule ; les menus
 * reprennent l'API, les entrées et le matériau translucide de `Menu`.
 * Clavier : flèches gauche/droite d'un menu à l'autre (ouvert ou non),
 * Entrée, Espace ou flèche bas pour ouvrir, Échap pour refermer.
 */
export const Menubar = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(function Menubar({ className, ...props }, ref) {
  return <MenubarPrimitive.Root ref={ref} data-slot="menubar" className={cn("ui-menubar", className)} {...props} />;
});

// Type explicite : le type inféré cite @radix-ui/react-context, introuvable
// depuis les déclarations publiées (TS2742 au build des .d.ts).
export const MenubarMenu: React.FC<MenubarPrimitive.MenubarMenuProps> = MenubarPrimitive.Menu;
export const MenubarGroup = MenubarPrimitive.Group;
export const MenubarRadioGroup = MenubarPrimitive.RadioGroup;
export const MenubarSub = MenubarPrimitive.Sub;

/** Titre d'un menu de la barre : pilule, couche d'état au survol et tant que le menu est ouvert. */
export const MenubarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(function MenubarTrigger({ className, ...props }, ref) {
  return (
    <MenubarPrimitive.Trigger
      ref={ref}
      data-slot="menubar-trigger"
      className={cn("ui-menubar__trigger", className)}
      {...props}
    />
  );
});

export const MenubarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(function MenubarContent({ className, align = "start", sideOffset = 6, alignOffset = -4, ...props }, ref) {
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        data-slot="menubar-content"
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className={cn("ui-popup", "ui-menu", "ui-menubar-content", className)}
        {...props}
      />
    </MenubarPrimitive.Portal>
  );
});

export interface MenubarItemProps extends React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> {
  /** `danger` : action qui retire ou détruit. Rouge, sans aplat. */
  variant?: "default" | "danger";
  /** Aligne le texte sur les entrées qui ont une coche ou une icône. */
  inset?: boolean;
  /** Raccourci clavier affiché à droite. */
  shortcut?: string;
}

export const MenubarItem = React.forwardRef<HTMLDivElement, MenubarItemProps>(function MenubarItem(
  { className, variant = "default", inset, shortcut, children, ...props },
  ref,
) {
  return (
    <MenubarPrimitive.Item
      ref={ref}
      data-slot="menubar-item"
      data-variant={variant}
      data-inset={inset || undefined}
      className={cn("ui-menu-item", className)}
      {...props}
    >
      {children}
      {shortcut && <span className="ui-menu-shortcut">{shortcut}</span>}
    </MenubarPrimitive.Item>
  );
});

export const MenubarCheckboxItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(function MenubarCheckboxItem({ className, children, ...props }, ref) {
  return (
    <MenubarPrimitive.CheckboxItem
      ref={ref}
      data-slot="menubar-checkbox-item"
      className={cn("ui-menu-item", "ui-menu-item--check", className)}
      {...props}
    >
      {children}
      <MenubarPrimitive.ItemIndicator className="ui-menu-item__indicator">
        <Check />
      </MenubarPrimitive.ItemIndicator>
    </MenubarPrimitive.CheckboxItem>
  );
});

export const MenubarRadioItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(function MenubarRadioItem({ className, children, ...props }, ref) {
  return (
    <MenubarPrimitive.RadioItem
      ref={ref}
      data-slot="menubar-radio-item"
      className={cn("ui-menu-item", "ui-menu-item--check", className)}
      {...props}
    >
      {children}
      <MenubarPrimitive.ItemIndicator className="ui-menu-item__indicator">
        <Dot />
      </MenubarPrimitive.ItemIndicator>
    </MenubarPrimitive.RadioItem>
  );
});

export const MenubarLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & { inset?: boolean }
>(function MenubarLabel({ className, inset, ...props }, ref) {
  return (
    <MenubarPrimitive.Label
      ref={ref}
      data-inset={inset || undefined}
      className={cn("ui-menu-label", className)}
      {...props}
    />
  );
});

export const MenubarSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(function MenubarSeparator({ className, ...props }, ref) {
  return <MenubarPrimitive.Separator ref={ref} className={cn("ui-menu-separator", className)} {...props} />;
});

export const MenubarSubTrigger = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & { inset?: boolean }
>(function MenubarSubTrigger({ className, inset, children, ...props }, ref) {
  return (
    <MenubarPrimitive.SubTrigger
      ref={ref}
      data-inset={inset || undefined}
      className={cn("ui-menu-item", "ui-menu-item--sub", className)}
      {...props}
    >
      {children}
      <ChevronRight />
    </MenubarPrimitive.SubTrigger>
  );
});

export const MenubarSubContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(function MenubarSubContent({ className, sideOffset = 6, alignOffset = -6, ...props }, ref) {
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.SubContent
        ref={ref}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        className={cn("ui-popup", "ui-menu", "ui-menubar-content", className)}
        {...props}
      />
    </MenubarPrimitive.Portal>
  );
});
