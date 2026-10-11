import type { Meta, StoryObj } from "@storybook/react";
import { Button, EmptyState } from "@acme/ui";
import { Card } from "../../_shared/demo";
import { FolderIcon, InboxIcon, PlusIcon, SearchIcon, StarIcon, TrashIcon, UploadIcon } from "../../_shared/icons";

const meta = {
  title: "Composants/Retour/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Occupe une zone sans contenu (« Aucun fichier », « Aucun résultat ») et dit quoi faire ensuite. Pastille d'icône ronde, titre (`h3` par défaut, `titleAs` pour l'accorder à la page), description, puis une rangée d'actions avec au plus une action primaire. `variant=\"card\"` le pose dans une carte tonale.",
      },
    },
  },
  args: {
    title: "Aucun fichier",
    description: "Déposez des fichiers ici ou utilisez le bouton « Nouveau ».",
    variant: "plain",
    size: "default",
    titleAs: "h3",
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["plain", "card"] },
    size: { control: "inline-radio", options: ["sm", "default"] },
    titleAs: { control: "select", options: ["h2", "h3", "h4", "h5", "h6", "p"] },
    title: { control: "text" },
    description: { control: "text" },
    icon: { table: { disable: true } },
    actions: { table: { disable: true } },
  },
  render: (args) => (
    <Card width={520}>
      <EmptyState
        {...args}
        icon={<FolderIcon />}
        actions={
          <>
            <Button><UploadIcon />Importer</Button>
            <Button variant="outline"><PlusIcon />Nouveau dossier</Button>
          </>
        }
      />
    </Card>
  ),
} satisfies Meta<typeof EmptyState>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les props sont pilotables depuis le panneau Contrôles. */
export const Playground: Story = {};

/**
 * `plain` se pose tel quel dans la zone vide d'un panneau ; `card` crée sa propre surface
 * tonale (`--ui-card-2`, rayon `--ui-r-lg`), utile sur le fond d'application.
 */
export const Variantes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24, maxWidth: 520 }}>
      <Card width={520}>
        <EmptyState
          icon={<SearchIcon />}
          title="Aucun résultat"
          description="Aucun fichier ne correspond à « budget 2019 ». Vérifiez l'orthographe ou essayez un autre mot-clé."
          actions={<Button variant="outline">Effacer la recherche</Button>}
        />
      </Card>
      <EmptyState
        variant="card"
        icon={<TrashIcon />}
        title="La corbeille est vide"
        description="Les éléments supprimés y restent 30 jours avant d'être effacés définitivement."
      />
    </div>
  ),
};

/** `sm` pour un panneau latéral, une liste ou un menu ; `default` pour une page. */
export const Tailles: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
      <Card width={280}>
        <EmptyState
          size="sm"
          icon={<StarIcon />}
          title="Aucun favori"
          description="Ajoutez une étoile aux fichiers importants."
        />
      </Card>
      <Card width={460}>
        <EmptyState
          icon={<InboxIcon />}
          title="Aucune notification"
          description="Vous serez prévenu ici quand quelqu'un partage un fichier avec vous."
        />
      </Card>
    </div>
  ),
};

/**
 * Composition : une action primaire et une secondaire, titre `h2` quand l'état vide est
 * le contenu principal de la page, contenu libre en `children` sous les actions.
 */
export const Composition: Story = {
  render: () => (
    <Card width={560}>
      <EmptyState
        titleAs="h2"
        icon={<FolderIcon />}
        title="Ce dossier est vide"
        description="Importez des fichiers ou créez un dossier pour commencer."
        actions={
          <>
            <Button><UploadIcon />Importer</Button>
            <Button variant="outline"><PlusIcon />Nouveau dossier</Button>
          </>
        }
      >
        <span style={{ color: "var(--ui-fg-3)", fontSize: 13 }}>Astuce : glissez-déposez des fichiers dans cette fenêtre.</span>
      </EmptyState>
    </Card>
  ),
};
