import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../utils/cn";

/**
 * Onglets : changer de vue sans quitter la page. Flèches du clavier pour
 * passer d'un onglet à l'autre ; le panneau actif est relié à son onglet.
 */
export const Tabs = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(function Tabs({ className, ...props }, ref) {
  return <TabsPrimitive.Root ref={ref} data-slot="tabs" className={cn("ui-tabs", className)} {...props} />;
});

export interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  /**
   * `line` (défaut) : onglets de page, soulignés d'un rail primaire.
   * `segmented` : bascule compacte entre vues d'un même contenu.
   */
  variant?: "line" | "segmented";
}

export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { className, variant = "line", ...props },
  ref,
) {
  return (
    <TabsPrimitive.List
      ref={ref}
      data-slot="tabs-list"
      data-variant={variant}
      className={cn("ui-tabs__list", className)}
      {...props}
    />
  );
});

export const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return <TabsPrimitive.Trigger ref={ref} data-slot="tabs-trigger" className={cn("ui-tabs__trigger", className)} {...props} />;
});

export const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(function TabsContent({ className, ...props }, ref) {
  return <TabsPrimitive.Content ref={ref} data-slot="tabs-content" className={cn("ui-tabs__content", className)} {...props} />;
});
