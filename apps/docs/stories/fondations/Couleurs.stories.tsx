import type { Meta, StoryObj } from "@storybook/react";
import { Section, Swatch, SwatchGrid } from "../_shared/tokens";

const meta: Meta = {
  tags: ["autodocs"],
  title: "Fondations/Couleurs",
  parameters: {
    docs: {
      description: {
        component:
          "Jetons de couleur de `tokens.css`, lus en direct : basculez le thème dans la barre d'outils pour voir leurs pas sombres. On choisit un jeton par son **rôle**, jamais par sa teinte. Un fond teinté de statut va avec son filet (`-soft` + `-line`).",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

/** Du fond d'application au conteneur le plus marqué : la structure vient des surfaces, pas des ombres. */
export const Surfaces: Story = {
  render: () => (
    <Section title="Surfaces" description="Teinte bleutée très légère, comme Drive ; aucune ombre au repos.">
      <SwatchGrid>
        <Swatch token="--ui-app" role="Fond d'application" border />
        <Swatch token="--ui-panel" role="Panneau, carte surélevée" border />
        <Swatch token="--ui-panel-2" role="Pied de tableau" border />
        <Swatch token="--ui-card-2" role="Champs, carte tonale, listes groupées" />
        <Swatch token="--ui-card-hover" role="Recherche, survol, piste segmentée" />
        <Swatch token="--ui-sel" role="Sélection (navigation, fichier choisi)" />
        <Swatch token="--ui-inverse" role="Infobulle" />
      </SwatchGrid>
    </Section>
  ),
};

export const EncresEtFilets: Story = {
  name: "Encres et filets",
  render: () => (
    <Section title="Encres et filets" description="Trois encres pour la hiérarchie du texte ; filets fins, du plus discret au bord de contrôle (3:1).">
      <SwatchGrid>
        <Swatch token="--ui-fg" role="Texte principal" />
        <Swatch token="--ui-fg-2" role="Texte secondaire, libellés" />
        <Swatch token="--ui-fg-3" role="Texte discret, axes" />
        <Swatch token="--ui-line" role="Séparateurs, grille" border />
        <Swatch token="--ui-line-2" role="Filet marqué" />
        <Swatch token="--ui-line-3" role="Bouton outline, puce" />
        <Swatch token="--ui-outline" role="Bord de case et radio (3:1)" />
      </SwatchGrid>
    </Section>
  ),
};

export const PrimaireEtSelection: Story = {
  name: "Primaire et sélection",
  render: () => (
    <Section title="Primaire" description="Une seule action primaire par vue. Le conteneur primaire porte la sélection et les actions tonales.">
      <SwatchGrid>
        <Swatch token="--ui-pri" role="Action primaire, focus" />
        <Swatch token="--ui-pri-d" role="Survol du primaire" />
        <Swatch token="--ui-pri-fg" role="Texte sur primaire" border />
        <Swatch token="--ui-pri-soft" role="Fond estompé (pastille, encadré)" />
        <Swatch token="--ui-pri-line" role="Filet du fond estompé" />
        <Swatch token="--ui-pri-container" role="Bouton tonal, bascule enfoncée" />
        <Swatch token="--ui-on-pri-container" role="Texte sur conteneur" />
      </SwatchGrid>
    </Section>
  ),
};

export const Statuts: Story = {
  render: () => (
    <Section
      title="Statuts"
      description="Réservés à l'état (réussi, attention, erreur) et toujours doublés d'une icône ou d'un libellé — jamais une couleur de série."
    >
      <SwatchGrid>
        <Swatch token="--ui-ok" role="Réussi" />
        <Swatch token="--ui-ok-soft" role="Fond" />
        <Swatch token="--ui-ok-line" role="Filet" />
        <Swatch token="--ui-warn" role="Attention" />
        <Swatch token="--ui-warn-soft" role="Fond" />
        <Swatch token="--ui-warn-line" role="Filet" />
        <Swatch token="--ui-err" role="Erreur, destructif" />
        <Swatch token="--ui-err-soft" role="Fond" />
        <Swatch token="--ui-err-line" role="Filet" />
      </SwatchGrid>
    </Section>
  ),
};

/** Ordre fixe, validé pour le daltonisme : ne jamais permuter ni régénérer au-delà de 8. */
export const Graphiques: Story = {
  render: () => (
    <>
      <Section
        title="Palette catégorielle"
        description="Identité des séries d'un graphique, dans cet ordre. Validée par le contrôle daltonisme (écarts adjacents ≥ 8) sur les deux thèmes ; c3, c4 et c5 sont sous 3:1 sur blanc : légende, étiquettes ou vue tableau obligatoires. Jamais comme couleur de texte."
      >
        <SwatchGrid>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <Swatch key={n} token={`--ui-c${n}`} role={`Série ${n}`} />
          ))}
        </SwatchGrid>
      </Section>
      <Section title="Gamme séquentielle" description="Une seule teinte, du plus proche de zéro au plus fort (cartes de chaleur, intensités).">
        <SwatchGrid>
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <Swatch key={n} token={`--ui-seq-${n}`} />
          ))}
        </SwatchGrid>
      </Section>
      <Section title="Gamme divergente" description="Deux pôles opposés autour d'un gris neutre (écart à un objectif, variation).">
        <SwatchGrid>
          <Swatch token="--ui-div-neg" role="Pôle bleu" />
          <Swatch token="--ui-div-mid" role="Neutre" border />
          <Swatch token="--ui-div-pos" role="Pôle rouge" />
        </SwatchGrid>
      </Section>
    </>
  ),
};
