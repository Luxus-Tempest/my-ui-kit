import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback, Badge, List, ListItem, ListItemIcon, ListSection, Switch } from "@acme/ui";
import { ClockIcon, CloudIcon, DownloadIcon, FolderIcon, HomeIcon, StarIcon, TrashIcon } from "../../_shared/icons";

const meta = {
  title: "Composants/Affichage/List",
  component: List,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Liste de lignes. `inset` (défaut) : liste groupée des réglages d'iOS, filets décalés après l'élément de tête. `plain` : lignes nues de Drive (tiroir, fichiers). `ListSection` pose l'intitulé et la note de bas de groupe ; `ListItem` prend `leading`, `description`, `trailing` et `chevron` ; `asChild` en fait une ligne cliquable.",
      },
    },
  },
  args: { variant: "inset" },
  argTypes: { variant: { control: "inline-radio", options: ["inset", "plain"] } },
  render: (args) => (
    <div style={{ maxWidth: 420 }}>
      <List {...args}>
        <ListItem leading={<ListItemIcon tint="var(--ui-c1)"><CloudIcon /></ListItemIcon>} trailing="Activée">Sauvegarde</ListItem>
        <ListItem leading={<ListItemIcon tint="var(--ui-c2)"><ClockIcon /></ListItemIcon>} trailing="30 jours" chevron asChild>
          <button type="button">Conserver les versions</button>
        </ListItem>
        <ListItem leading={<ListItemIcon tint="var(--ui-c3)"><DownloadIcon /></ListItemIcon>} chevron asChild>
          <a href="#hors-connexion">Fichiers hors connexion</a>
        </ListItem>
      </List>
    </div>
  ),
} satisfies Meta<typeof List>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

function Settings() {
  const [sync, setSync] = React.useState(true);
  return (
    <div style={{ display: "grid", gap: 24, maxWidth: 420 }}>
      <ListSection title="Synchronisation" footer="Les fichiers marqués hors connexion restent disponibles sans réseau.">
        <List>
          <ListItem
            leading={<ListItemIcon tint="var(--ui-c1)"><CloudIcon /></ListItemIcon>}
            trailing={<Switch checked={sync} onCheckedChange={setSync} aria-label="Sauvegarde automatique" />}
          >
            Sauvegarde automatique
          </ListItem>
          <ListItem leading={<ListItemIcon tint="var(--ui-c2)"><ClockIcon /></ListItemIcon>} trailing="30 jours" chevron asChild>
            <button type="button">Conserver les versions</button>
          </ListItem>
        </List>
      </ListSection>
      <ListSection title="Membres">
        <List>
          <ListItem leading={<Avatar><AvatarFallback>IB</AvatarFallback></Avatar>} description="ines@exemple.ma" trailing={<Badge variant="pri">Propriétaire</Badge>}>
            Inès Benali
          </ListItem>
          <ListItem leading={<Avatar><AvatarFallback>KA</AvatarFallback></Avatar>} description="karim@exemple.ma" trailing="Éditeur">
            Karim Alaoui
          </ListItem>
        </List>
      </ListSection>
    </div>
  );
}

/** Réglages groupés : intitulé, note de bas, interrupteur, valeur et chevron. */
export const ListeGroupee: Story = { name: "Liste groupée (réglages)", render: () => <Settings /> };

function Drawer() {
  const [current, setCurrent] = React.useState("drive");
  const items = [
    { id: "accueil", label: "Accueil", icon: <HomeIcon /> },
    { id: "drive", label: "Mon Drive", icon: <FolderIcon /> },
    { id: "favoris", label: "Favoris", icon: <StarIcon /> },
    { id: "corbeille", label: "Corbeille", icon: <TrashIcon /> },
  ];
  return (
    <div style={{ maxWidth: 280 }}>
      <List variant="plain" aria-label="Navigation">
        {items.map((n) => (
          <ListItem key={n.id} leading={n.icon} selected={current === n.id} asChild>
            <button type="button" onClick={() => setCurrent(n.id)}>{n.label}</button>
          </ListItem>
        ))}
      </List>
    </div>
  );
}

/** Liste nue : entrées en pilule, l'entrée courante en conteneur de sélection (`aria-current`). */
export const ListeNue: Story = { name: "Liste nue (tiroir)", render: () => <Drawer /> };
