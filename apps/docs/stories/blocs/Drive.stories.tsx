import type { Meta, StoryObj } from "@storybook/react";
import { Drive, driveSample } from "@rovia/blocks/drive";

const meta: Meta = {
  title: "Blocs/Drive",
  parameters: {
    padding: 0,
    docs: {
      description: {
        component:
          "Un écran complet de gestion de fichiers, assemblé uniquement avec les composants de la librairie. **De Drive** : surfaces tonales plutôt qu'ombres, sélection en conteneur bleu, actions et filtres en pilule, couches d'état au survol, infobulles inversées. **D'iOS** : grands rayons continus, matériau translucide pour ce qui flotte, listes groupées, interrupteurs et segmented control, feuilles et courbes en ressort.",
      },
    },
  },
};
export default meta;

/**
 * Recherche qui filtre, puces de filtre, cartes sélectionnables, menu « ⋯ », panneau
 * Détails (double-clic ou menu), réglages groupés et palette ⌘K (ou bouton « Nouveau »).
 */
export const Ecran: StoryObj = {
  name: "Écran complet",
  parameters: { registry: "drive" },
  render: () => <Drive {...driveSample} />,
};
