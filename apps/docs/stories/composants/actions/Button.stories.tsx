import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@rovia/ui";
import { Row } from "../../_shared/demo";
import { ArrowIcon, BoldIcon, DownloadIcon, MoreIcon, PlusIcon, TrashIcon } from "../../_shared/icons";

const meta = {
  title: "Composants/Actions/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    registry: "button",
    docs: {
      description: {
        component:
          "Déclenche une action. La variante est le **rôle**, jamais la couleur : une seule action `default` par vue, le reste est `tonal`, `outline`, `ghost` ou icône. Pilule, couche d'état au survol (Drive), pression en ressort (iOS). `asChild` le rend comme un lien.",
      },
    },
  },
  args: { children: "Enregistrer", variant: "default", size: "default" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "tonal", "elevated", "outline", "secondary", "ghost", "danger", "destructive", "link", "onDark", "onDarkGhost"],
    },
    size: { control: "inline-radio", options: ["sm", "default", "lg", "icon", "icon-sm", "icon-lg"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    fullWidth: { control: "boolean" },
    asChild: { table: { disable: true } },
  },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles. */
export const Playground: Story = {};

/** Un rôle par intention. Une seule action primaire (`default`) par vue. */
export const Variantes: Story = {
  render: () => (
    <>
      <Row label="Primaire"><Button><PlusIcon />Nouvelle facture</Button></Row>
      <Row label="Tonale"><Button variant="tonal"><DownloadIcon />Importer</Button></Row>
      <Row label="Surélevée">
        <Button variant="elevated"><PlusIcon />Nouveau</Button>
        <Button variant="elevated" size="lg"><PlusIcon />Nouveau</Button>
      </Row>
      <Row label="Secondaire">
        <Button variant="outline"><DownloadIcon />Exporter</Button>
        <Button variant="secondary">Dupliquer</Button>
      </Row>
      <Row label="Fantôme"><Button variant="ghost">Annuler</Button></Row>
      <Row label="Danger">
        <Button variant="danger"><TrashIcon />Retirer l'accès</Button>
        <Button variant="destructive">Supprimer définitivement</Button>
      </Row>
      <Row label="Lien"><Button variant="link">Voir l'historique</Button></Row>
    </>
  ),
};

/** 32 / 36 / 44 px ; les boutons icône sont des cercles et exigent un `aria-label`. */
export const Tailles: Story = {
  render: () => (
    <>
      <Row label="sm · 32">
        <Button size="sm">Filtrer</Button>
        <Button size="sm" variant="outline"><PlusIcon />Ajouter</Button>
        <Button size="icon-sm" variant="ghost" aria-label="Plus d'actions"><MoreIcon /></Button>
      </Row>
      <Row label="default · 36">
        <Button>Enregistrer</Button>
        <Button variant="outline"><PlusIcon />Ajouter</Button>
        <Button size="icon" variant="outline" aria-label="Plus d'actions"><MoreIcon /></Button>
      </Row>
      <Row label="lg · 44">
        <Button size="lg">Démarrer l'essai<ArrowIcon /></Button>
        <Button size="lg" variant="outline">Voir la démo</Button>
        <Button size="icon-lg" variant="outline" aria-label="Plus d'actions"><MoreIcon /></Button>
      </Row>
    </>
  ),
};

function PressedDemo() {
  const [bold, setBold] = React.useState(true);
  return (
    <Button size="icon" variant="ghost" aria-label="Gras" aria-pressed={bold} onClick={() => setBold(!bold)}>
      <BoldIcon />
    </Button>
  );
}

function LoadingDemo() {
  const [loading, setLoading] = React.useState(false);
  return (
    <Button
      loading={loading}
      onClick={() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1500);
      }}
    >
      Enregistrer
    </Button>
  );
}

/**
 * Tous les états sont pilotés par ARIA : `aria-pressed` (bascule), `aria-expanded`
 * (menu ouvert), `aria-invalid`. En chargement, le bouton reste focusable.
 */
export const Etats: Story = {
  name: "États",
  render: () => (
    <>
      <Row label="Enfoncé"><PressedDemo /></Row>
      <Row label="Chargement"><LoadingDemo /><Button loading variant="outline">Exporter</Button></Row>
      <Row label="Ouvert"><Button variant="outline" aria-expanded="true">Menu ouvert</Button></Row>
      <Row label="Invalide"><Button variant="outline" aria-invalid="true">Choisir un fichier</Button></Row>
      <Row label="Désactivé">
        <Button disabled>Enregistrer</Button>
        <Button disabled variant="outline">Exporter</Button>
      </Row>
    </>
  ),
};

/** `onDark` et `onDarkGhost` n'ont de sens que sur le bandeau de marque. */
export const SurBandeauDeMarque: Story = {
  name: "Sur bandeau de marque",
  render: () => (
    <div style={{ background: "var(--ui-brand-wash)", borderRadius: "var(--ui-r-lg)", padding: "40px 32px", maxWidth: 560 }}>
      <p style={{ margin: "0 0 6px", color: "#fff", font: "600 22px/1.2 var(--ui-font-sans)", letterSpacing: "-0.02em" }}>
        Pilotez votre activité en temps réel
      </p>
      <p style={{ margin: "0 0 24px", color: "rgb(255 255 255 / .7)", font: "400 14px/1.5 var(--ui-font-sans)" }}>
        Appels à l'action de la surface publique.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Button size="lg" variant="onDark">Démarrer l'essai<ArrowIcon /></Button>
        <Button size="lg" variant="onDarkGhost">Parler à un expert</Button>
      </div>
    </div>
  ),
};

/** `asChild` transmet classes, ref et gestionnaires à l'enfant (`<a>`, `<Link>` de Next…). */
export const CommeLien: Story = {
  name: "Comme lien (asChild)",
  render: () => (
    <Row>
      <Button asChild variant="outline"><a href="#docs">Ouvrir la documentation</a></Button>
      <Button asChild variant="outline" disabled><a href="#docs">Lien désactivé</a></Button>
    </Row>
  ),
};
