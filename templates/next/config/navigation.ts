import { House, Settings } from "lucide-react";
import type { CoqueNavGroup } from "@/components/blocks/coque-application/CoqueApplication";

/**
 * Navigation de l'application, en un seul endroit : barre latérale, fil d'Ariane, palette ⌘K,
 * titre des pages et `robots.txt` (ces pages ne sont pas indexées). Ajoute une page ici, puis
 * crée son dossier dans `app/(app)/`.
 */
export const navigation: CoqueNavGroup[] = [
  {
    items: [{ href: "/tableau-de-bord", label: "Tableau de bord", icon: House }],
  },
  {
    label: "Compte",
    items: [{ href: "/parametres", label: "Paramètres", icon: Settings }],
  },
];

/** Toutes les entrées, à plat. */
export const navigationItems = navigation.flatMap((group) => group.items);

/** Titre d'une page de la navigation (métadonnées). */
export function titleFor(href: string) {
  return navigationItems.find((item) => item.href === href)?.label ?? "";
}
