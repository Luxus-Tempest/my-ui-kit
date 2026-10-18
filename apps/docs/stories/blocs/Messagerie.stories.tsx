import type { Meta, StoryObj } from "@storybook/react";
import { Messagerie, messagerieSample } from "@rovia/blocks/messagerie";

const meta: Meta = {
  title: "Blocs/Messagerie",
  parameters: {
    padding: 0,
    docs: {
      story: { inline: false, height: "720px" },
      description: {
        component:
          "Une messagerie d'équipe : liste des conversations avec recherche et non-lus, fil (`MessageList`, regroupement par expéditeur, séparateurs de date, statuts « Envoi… », « Envoyé », « Lu »), saisie (`ChatComposer`) et panneau de détails (`DescriptionList`). Sous 768 px, une seule colonne à la fois, comme sur iOS : la liste, puis la conversation avec un bouton retour.",
      },
    },
  },
};
export default meta;

/**
 * Ouvrez une conversation (les non-lus s'effacent), écrivez puis Entrée : « Envoi… », « Envoyé »,
 * puis « Lu » après la réponse. Le bouton (i) affiche ou masque les détails. En vue mobile
 * (barre d'outils « Viewport »), la liste et la conversation se succèdent.
 */
export const Ecran: StoryObj = {
  name: "Écran complet",
  parameters: { registry: "messagerie" },
  render: () => <Messagerie {...messagerieSample} />,
};
