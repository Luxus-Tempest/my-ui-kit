import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
  toast,
  Toaster,
} from "@rovia/ui";
import { Card } from "../../_shared/demo";

/** Les détails d'un fichier, tels que les montre le panneau de Drive. */
function FileDetails(props: React.ComponentProps<typeof DescriptionList>) {
  return (
    <DescriptionList {...props}>
      <DescriptionItem>
        <DescriptionTerm>Type</DescriptionTerm>
        <DescriptionDetails>Feuille de calcul</DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>Taille</DescriptionTerm>
        <DescriptionDetails>2,4 Mo</DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>Emplacement</DescriptionTerm>
        <DescriptionDetails>Mon Drive › Finance</DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>Propriétaire</DescriptionTerm>
        <DescriptionDetails>Inès Benali</DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>Modifié</DescriptionTerm>
        <DescriptionDetails>11 oct. 2026 par Karim Alaoui</DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>Créé</DescriptionTerm>
        <DescriptionDetails>3 janv. 2026</DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>
  );
}

const meta = {
  title: "Composants/Données/DescriptionList",
  component: DescriptionList,
  subcomponents: { DescriptionItem, DescriptionTerm, DescriptionDetails },
  tags: ["autodocs"],
  parameters: {
    registry: "description-list",
    docs: {
      description: {
        component:
          "Paires libellé / valeur en `<dl>` natif, comme le panneau « Détails » de Drive ou la fiche « Infos » d'iOS. Trois mises en page : `horizontal` (libellé à gauche, valeur à droite), `vertical` (libellé au-dessus) et `grid` (colonnes qui passent à la ligne) ; `variant=\"inset\"` pour la carte groupée d'iOS. Une valeur se copie avec `copyable` : retour « Copié » visible et annoncé.",
      },
    },
  },
  args: { layout: "horizontal", variant: "plain", columns: 2 },
  argTypes: {
    layout: { control: "inline-radio", options: ["horizontal", "vertical", "grid"] },
    variant: { control: "inline-radio", options: ["plain", "inset"] },
    columns: { control: "inline-radio", options: [2, 3, 4], if: { arg: "layout", eq: "grid" } },
  },
  render: (args) => (
    <Card width={args.layout === "grid" ? 640 : 420}>
      <FileDetails {...args} />
    </Card>
  ),
} satisfies Meta<typeof DescriptionList>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles. */
export const Playground: Story = {};

/**
 * Horizontale pour les fiches courtes (valeur alignée à droite, filets fins),
 * verticale pour un panneau étroit, grille pour une fiche dense.
 */
export const MisesEnPage: Story = {
  name: "Mises en page",
  render: () => (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "start" }}>
      <Card width={380}>
        <span style={{ color: "var(--ui-fg-3)", fontSize: 12, fontWeight: 500 }}>horizontal</span>
        <FileDetails layout="horizontal" />
      </Card>
      <Card width={280}>
        <span style={{ color: "var(--ui-fg-3)", fontSize: 12, fontWeight: 500 }}>vertical</span>
        <FileDetails layout="vertical" />
      </Card>
      <Card width={680}>
        <span style={{ color: "var(--ui-fg-3)", fontSize: 12, fontWeight: 500 }}>grid · columns=3</span>
        <FileDetails layout="grid" columns={3} />
      </Card>
    </div>
  ),
};

/** La liste groupée d'iOS : carte tonale, filets décalés qui commencent au retrait du texte. */
export const Inset: Story = {
  name: "Inset (carte groupée)",
  render: () => (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "start" }}>
      <Card width={380}>
        <FileDetails layout="horizontal" variant="inset" />
      </Card>
      <Card width={300}>
        <FileDetails layout="vertical" variant="inset" />
      </Card>
    </div>
  ),
};

/**
 * `copyable` ajoute une pastille « Copier » nommée par le libellé de la paire
 * (« Copier Identifiant ») ; `copyValue` copie un texte différent de
 * l'affichage (lien complet) ; `onCopied` permet un retour plus large (toast).
 */
export const Copiable: Story = {
  name: "Valeurs copiables",
  render: () => (
    <>
      <Toaster />
      <Card width={440}>
      <DescriptionList variant="inset">
        <DescriptionItem>
          <DescriptionTerm>Identifiant</DescriptionTerm>
          <DescriptionDetails copyable className="ui-mono">
            1aB9-xK42-77Qp
          </DescriptionDetails>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>Lien de partage</DescriptionTerm>
          <DescriptionDetails copyable copyValue="https://drive.exemple.ma/f/1aB9-xK42-77Qp">
            drive.exemple.ma/f/1aB9…
          </DescriptionDetails>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>IBAN</DescriptionTerm>
          <DescriptionDetails copyable onCopied={() => toast("IBAN copié dans le presse-papiers")} className="ui-mono">
            MA64 0115 1900 0001 2050 0053 4921
          </DescriptionDetails>
        </DescriptionItem>
      </DescriptionList>
      </Card>
    </>
  ),
};

/**
 * Les valeurs acceptent tout contenu : avatar, pastille d'état, plusieurs
 * `DescriptionDetails` pour une même paire. `span="full"` étale une paire
 * sur toute la largeur de la grille.
 */
export const Composition: Story = {
  render: () => (
    <Card width={640}>
      <DescriptionList layout="grid" columns={3}>
        <DescriptionItem>
          <DescriptionTerm>Client</DescriptionTerm>
          <DescriptionDetails>Atlas Distribution</DescriptionDetails>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>Statut</DescriptionTerm>
          <DescriptionDetails>
            <Badge variant="ok" dot>Payée</Badge>
          </DescriptionDetails>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>Montant</DescriptionTerm>
          <DescriptionDetails>48 600,00 MAD</DescriptionDetails>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>Responsable</DescriptionTerm>
          <DescriptionDetails style={{ gap: 8 }}>
            <Avatar size="sm">
              <AvatarFallback name="Inès Benali" />
            </Avatar>
            Inès Benali
          </DescriptionDetails>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>Échéances</DescriptionTerm>
          <DescriptionDetails>15 nov. 2026</DescriptionDetails>
          <DescriptionDetails>15 déc. 2026</DescriptionDetails>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>Référence</DescriptionTerm>
          <DescriptionDetails copyable className="ui-mono">F-2026-118</DescriptionDetails>
        </DescriptionItem>
        <DescriptionItem span="full">
          <DescriptionTerm>Note</DescriptionTerm>
          <DescriptionDetails>
            Paiement reçu en deux virements ; le second couvre les frais de livraison de la commande complémentaire.
          </DescriptionDetails>
        </DescriptionItem>
      </DescriptionList>
    </Card>
  ),
};
