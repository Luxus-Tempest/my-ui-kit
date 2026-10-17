import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardMedia,
  CardTitle,
  Progress,
} from "@rovia/ui";
import { FileIcon, MoreIcon } from "../../_shared/icons";

const meta = {
  title: "Composants/Affichage/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    registry: "card",
    docs: {
      description: {
        component:
          "Surface qui regroupe un contenu. La variante est le **rôle de la surface** : `filled` (tonale, sur un panneau blanc, comme les fichiers de Drive), `elevated` (posée sur le fond d'application) ou `outlined` (contenus denses côte à côte). `interactive` ajoute survol et pression, `selected` le conteneur de sélection, `asChild` rend toute la carte cliquable.",
      },
    },
  },
  args: { variant: "elevated", size: "default", interactive: false, selected: false },
  argTypes: {
    variant: { control: "inline-radio", options: ["filled", "elevated", "outlined"] },
    size: { control: "inline-radio", options: ["sm", "default"] },
    asChild: { table: { disable: true } },
  },
  render: (args) => (
    <Card {...args} style={{ maxWidth: 420 }}>
      <CardHeader>
        <CardTitle>Espace de stockage</CardTitle>
        <CardDescription>3,2 Go utilisés sur 15 Go</CardDescription>
        <CardAction>
          <Button size="icon" variant="ghost" aria-label="Plus d'actions"><MoreIcon /></Button>
        </CardAction>
      </CardHeader>
      <CardContent><Progress value={21} aria-label="Espace utilisé" /></CardContent>
      <CardFooter>
        <Button variant="ghost">Libérer de l'espace</Button>
        <Button variant="tonal">Plus d'espace</Button>
      </CardFooter>
    </Card>
  ),
} satisfies Meta<typeof Card>;
export default meta;
type Story = StoryObj<typeof meta>;

/** En-tête avec action, contenu et pied. */
export const Playground: Story = {};

/** Les trois rôles de surface. */
export const Variantes: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16, maxWidth: 900 }}>
      {(
        [
          ["filled", "Tonale", "Sur un panneau blanc, comme les fichiers de Drive."],
          ["elevated", "Surélevée", "Posée sur le fond d'application."],
          ["outlined", "À filet", "Pour les contenus denses côte à côte."],
        ] as const
      ).map(([variant, title, description]) => (
        <Card key={variant} variant={variant}>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  ),
};

const FILES = [
  { id: "budget", name: "Budget 2027.xlsx", meta: "Modifié par vous · 9 oct.", tint: "var(--ui-c3)" },
  { id: "contrat", name: "Contrat cadre.pdf", meta: "Partagé par Inès · hier", tint: "var(--ui-c2)" },
  { id: "q4", name: "Présentation Q4", meta: "Ouvert par vous · 2 oct.", tint: "var(--ui-c4)" },
];

function FileGrid() {
  const [selected, setSelected] = React.useState("budget");
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14, maxWidth: 760 }}>
      {FILES.map((f) => (
        // Une carte contient des blocs : pas de <button> (contenu phrasé seulement), mais role="button".
        <Card
          key={f.id}
          size="sm"
          interactive
          selected={selected === f.id}
          role="button"
          tabIndex={0}
          aria-pressed={selected === f.id}
          onClick={() => setSelected(f.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setSelected(f.id);
            }
          }}
        >
            <CardHeader>
              <CardTitle style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 500 }}>
                <span style={{ display: "flex", width: 18, height: 18, color: f.tint }}><FileIcon /></span>
                {f.name}
              </CardTitle>
            </CardHeader>
            <CardMedia
              aspectRatio="16 / 10"
              style={{ background: `linear-gradient(160deg, color-mix(in srgb, ${f.tint} 16%, var(--ui-panel)), var(--ui-panel))` }}
            />
            <CardDescription>{f.meta}</CardDescription>
        </Card>
      ))}
    </div>
  );
}

/**
 * Carte cliquable (`interactive`), média en retrait et sélection, comme la grille de Drive.
 * Pour une carte qui navigue, `asChild` avec un `<a>`.
 */
export const InteractiveEtSelection: Story = { name: "Interactive et sélection", render: () => <FileGrid /> };
