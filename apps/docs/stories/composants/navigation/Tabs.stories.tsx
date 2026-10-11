import type { Meta, StoryObj } from "@storybook/react";
import { Badge, Tabs, TabsContent, TabsList, TabsTrigger, Text } from "@acme/ui";
import { ClockIcon, FolderIcon, HomeIcon, StarIcon } from "../../_shared/icons";

const meta = {
  title: "Composants/Navigation/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Onglets : des vues sœurs d'un même contenu, parcourues aux flèches. `TabsList variant=\"line\"` : onglets de Drive (indicateur arrondi, texte primaire). `segmented` : segmented control d'iOS (filtre ou bascule de vue). En orientation verticale, la liste devient un tiroir de navigation à la Drive.",
      },
    },
  },
  args: { defaultValue: "factures", orientation: "horizontal" },
  render: (args) => (
    <Tabs {...args} style={{ maxWidth: 620 }}>
      <TabsList aria-label="Ventes">
        <TabsTrigger value="factures">Factures <Badge>128</Badge></TabsTrigger>
        <TabsTrigger value="avoirs">Avoirs <Badge>6</Badge></TabsTrigger>
        <TabsTrigger value="devis">Devis</TabsTrigger>
        <TabsTrigger value="archives" disabled>Archives</TabsTrigger>
      </TabsList>
      <TabsContent value="factures"><Text tone="muted">128 factures sur la période.</Text></TabsContent>
      <TabsContent value="avoirs"><Text tone="muted">6 avoirs émis.</Text></TabsContent>
      <TabsContent value="devis"><Text tone="muted">Aucun devis en attente.</Text></TabsContent>
    </Tabs>
  ),
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Onglets « line » : compteurs en Badge, onglet désactivé. */
export const Playground: Story = {};

/** Segmented control : quelques options courtes et exclusives. */
export const Segmente: Story = {
  name: "Segmenté",
  render: () => (
    <Tabs defaultValue="mois">
      <TabsList variant="segmented" aria-label="Période">
        <TabsTrigger value="semaine">Semaine</TabsTrigger>
        <TabsTrigger value="mois">Mois</TabsTrigger>
        <TabsTrigger value="annee">Année</TabsTrigger>
      </TabsList>
      <TabsContent value="semaine"><Text tone="muted">Vue hebdomadaire.</Text></TabsContent>
      <TabsContent value="mois"><Text tone="muted">Vue mensuelle.</Text></TabsContent>
      <TabsContent value="annee"><Text tone="muted">Vue annuelle.</Text></TabsContent>
    </Tabs>
  ),
};

/** Vertical : tiroir de navigation, entrée active en pilule de sélection. */
export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="drive" orientation="vertical" style={{ maxWidth: 720 }}>
      <TabsList aria-label="Navigation principale">
        <TabsTrigger value="accueil"><HomeIcon />Accueil</TabsTrigger>
        <TabsTrigger value="drive"><FolderIcon />Mon Drive</TabsTrigger>
        <TabsTrigger value="recents"><ClockIcon />Récents</TabsTrigger>
        <TabsTrigger value="favoris"><StarIcon />Favoris</TabsTrigger>
      </TabsList>
      <TabsContent value="accueil"><Text tone="muted">Accueil</Text></TabsContent>
      <TabsContent value="drive"><Text tone="muted">Contenu de Mon Drive</Text></TabsContent>
      <TabsContent value="recents"><Text tone="muted">Fichiers récents</Text></TabsContent>
      <TabsContent value="favoris"><Text tone="muted">Favoris</Text></TabsContent>
    </Tabs>
  ),
};
