import type { Meta, StoryObj } from "@storybook/react";
import { TableauDeBord, tableauDeBordSample } from "@rovia/blocks/tableau-de-bord";

const meta: Meta = {
  title: "Blocs/Tableau de bord",
  parameters: {
    docs: {
      description: {
        component:
          "Un tableau de bord financier : filtre de période sur une seule rangée au-dessus de tout ce qu'il filtre, rangée d'indicateurs (`StatGroup`) avec variation et tendance, courbes, barres et anneau, bascule graphique / tableau.",
      },
    },
  },
};
export default meta;

/** Le bloc `@rovia/blocks/tableau-de-bord` avec ses données d'exemple (douze mois d'activité). */
export const Ecran: StoryObj = {
  name: "Écran complet",
  parameters: { registry: "tableau-de-bord" },
  render: () => <TableauDeBord {...tableauDeBordSample} />,
};
