import type { Meta, StoryObj } from "@storybook/react";
import { Heading, Stack, Text } from "@rovia/ui";
import { Section } from "../_shared/tokens";

const meta: Meta = {
  tags: ["autodocs"],
  title: "Fondations/Typographie",
  parameters: {
    docs: {
      description: {
        component:
          "Une seule famille, neutre et lisible (Inter, repli sur SF Pro / Segoe UI / Roboto), comme SF Pro et Google Sans Text. Graisses légères : 400 pour lire, 500 pour les libellés et actions, 600 pour les titres. Corps de lecture 14 px / 1,5. Chiffres tabulaires seulement dans les colonnes.",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const HEADINGS = [
  ["2xl", "34 / 700", "Pilotez votre activité"],
  ["xl", "28 / 650", "Factures clients"],
  ["lg", "24 / 600", "Échéancier"],
  ["md", "20 / 600", "Relances du mois"],
  ["sm", "18 / 600", "Coordonnées bancaires"],
  ["xs", "15 / 600", "Pièces jointes"],
] as const;

/** Échelle des titres : taille indépendante du niveau (h1-h6). */
export const Titres: Story = {
  render: () => (
    <Section title="Titres" description="Interlettrage négatif sur les grands corps ; retour à la ligne équilibré.">
      <Stack gap={3}>
        {HEADINGS.map(([size, spec, label]) => (
          <div key={size} style={{ display: "grid", gridTemplateColumns: "120px 1fr", alignItems: "baseline", gap: 16 }}>
            <Text size={12} tone="subtle" mono>{size} · {spec}</Text>
            <Heading level={2} size={size}>{label}</Heading>
          </div>
        ))}
      </Stack>
    </Section>
  ),
};

/** Corps de texte : 16 à 10 px, du paragraphe à la mention. */
export const Corps: Story = {
  render: () => (
    <Section title="Corps de texte" description="14 px pour lire ; 13 et 12 px pour les libellés et les mentions ; en dessous, réservé aux compteurs.">
      <Stack gap={2}>
        {([16, 15, 14, 13, 12.5, 12, 11, 10] as const).map((size) => (
          <div key={size} style={{ display: "grid", gridTemplateColumns: "120px 1fr", alignItems: "baseline", gap: 16 }}>
            <Text size={12} tone="subtle" mono>{size} px</Text>
            <Text size={size}>Les fichiers hors connexion restent disponibles sans réseau.</Text>
          </div>
        ))}
      </Stack>
    </Section>
  ),
};

/** Graisses et chiffres. */
export const GraissesEtChiffres: Story = {
  name: "Graisses et chiffres",
  render: () => (
    <Section title="Graisses et chiffres">
      <Stack gap={2}>
        <Text weight="regular">400 — lecture</Text>
        <Text weight="medium">500 — libellés, actions</Text>
        <Text weight="semibold">600 — titres, valeurs</Text>
        <Text numeric>Chiffres tabulaires (colonnes) : 1 111,00 · 9 999,00</Text>
        <Text>Chiffres proportionnels (grands nombres isolés) : 1 241 000 MAD</Text>
      </Stack>
    </Section>
  ),
};
