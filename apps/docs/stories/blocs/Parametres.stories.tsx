import type { Meta, StoryObj } from "@storybook/react";
import { Parametres, parametresSample } from "@rovia/blocks/parametres";

const meta: Meta = {
  title: "Blocs/Paramètres",
  parameters: {
    docs: {
      description: {
        component:
          "Page de paramètres de compte : navigation verticale (tiroir Drive), réglages à effet immédiat en listes groupées iOS (interrupteurs), formulaires enregistrés explicitement en cartes, zone dangereuse confirmée par une AlertDialog.",
      },
    },
  },
};
export default meta;

/**
 * Réglages immédiats (interrupteurs) en listes groupées, formulaires enregistrés
 * explicitement en carte (une seule action primaire), suppression confirmée.
 */
export const Ecran: StoryObj = {
  name: "Écran complet",
  parameters: { registry: "parametres" },
  render: () => <Parametres {...parametresSample} />,
};
