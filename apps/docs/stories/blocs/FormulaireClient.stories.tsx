import type { Meta, StoryObj } from "@storybook/react";
import { toast, Toaster } from "@rovia/ui";
import { FormulaireClient, formulaireClientSample } from "@rovia/blocks/formulaire-client";

const meta: Meta = {
  title: "Blocs/Formulaire client",
  parameters: {
    docs: {
      description: {
        component:
          "Un formulaire de création complet : chaque contrôle est enveloppé dans un `Field`, qui relie libellé, aide, erreur et obligation. Une seule action primaire, en pied de carte.",
      },
    },
  },
};
export default meta;

/** Le bloc `@rovia/blocks/formulaire-client` avec ses données d'exemple (une erreur de validation sur l'ICE). */
export const Ecran: StoryObj = {
  name: "Écran complet",
  parameters: { registry: "formulaire-client" },
  render: () => (
    <>
      <FormulaireClient {...formulaireClientSample} onSubmit={(values) => toast.success(`Client « ${values.raisonSociale || "sans nom"} » créé`)} />
      <Toaster />
    </>
  ),
};
