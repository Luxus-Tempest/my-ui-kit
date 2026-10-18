import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Connexion as ConnexionBlock, connexionSample } from "@rovia/blocks/connexion";
import { Inscription as InscriptionBlock, inscriptionSample } from "@rovia/blocks/inscription";

const meta: Meta = {
  title: "Blocs/Authentification",
  parameters: {
    padding: 0,
    docs: {
      description: {
        component:
          "Écrans de connexion et d'inscription : une carte centrée sur le fond d'application, une seule action primaire, fournisseurs tiers en boutons secondaires, erreurs reliées aux champs par `Field`.",
      },
    },
  },
};
export default meta;

/** Connexion : le bloc `@rovia/blocks/connexion`, branché sur ses données d'exemple. */
function Login() {
  const [error, setError] = React.useState<string | null>(null);
  const { errorMessage, ...sample } = connexionSample;
  return <ConnexionBlock {...sample} error={error} onSubmit={() => setError(errorMessage)} />;
}

/** Connexion : fournisseur tiers, e-mail et mot de passe, erreur globale annoncée. Soumettez pour voir l'erreur. */
export const Connexion: StoryObj = { render: () => <Login />, parameters: { registry: "connexion" } };

/** Inscription : force du mot de passe en direct, critères explicites, action primaire tant que le mot de passe est trop faible. */
export const Inscription: StoryObj = {
  render: () => <InscriptionBlock {...inscriptionSample} onSubmit={() => {}} />,
  parameters: { registry: "inscription" },
};
