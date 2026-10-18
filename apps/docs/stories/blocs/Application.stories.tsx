import type { Meta, StoryObj } from "@storybook/react";
import { Application, applicationSample } from "@rovia/blocks/application";

const meta: Meta = {
  title: "Blocs/Application",
  parameters: {
    padding: 0,
    docs: {
      story: { inline: false, height: "820px" },
      description: {
        component:
          "La coquille d'une application de gestion : barre latérale (`Sidebar`, réductible en icônes avec ⌘B), barre d'application avec fil d'Ariane, rangée d'indicateurs (`StatGroup`), onglets de vue et `DataTable` complète (recherche, facettes, sélection et actions groupées, export). Point de départ d'un ERP, d'un back-office ou d'un CRM : remplacer les données, garder la structure.",
      },
    },
  },
};
export default meta;

/**
 * Barre latérale réductible (⌘B ou bouton), fil d'Ariane, indicateurs, onglets de vue,
 * table avec recherche, filtres Client / Statut, sélection (actions groupées) et export CSV.
 * Un clic sur une ligne l'ouvre.
 */
export const Ecran: StoryObj = {
  name: "Écran complet",
  parameters: { registry: "application" },
  render: () => <Application {...applicationSample} />,
};
