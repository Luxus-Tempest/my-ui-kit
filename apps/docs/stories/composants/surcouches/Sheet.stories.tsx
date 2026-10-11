import type { Meta, StoryObj } from "@storybook/react";
import {
  Avatar,
  AvatarFallback,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListSection,
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@acme/ui";
import { DownloadIcon, FileIcon, FolderIcon, HomeIcon, StarIcon } from "../../_shared/icons";

const Details = () => (
  <>
    <SheetHeader>
      <SheetTitle>Budget 2027.xlsx</SheetTitle>
      <SheetDescription>Feuille de calcul · 284 Ko</SheetDescription>
    </SheetHeader>
    <SheetBody style={{ display: "grid", gap: 20, alignContent: "start" }}>
      <ListSection title="Accès">
        <List>
          <ListItem leading={<Avatar><AvatarFallback>IB</AvatarFallback></Avatar>} trailing="Propriétaire">Inès Benali</ListItem>
          <ListItem leading={<Avatar><AvatarFallback>KA</AvatarFallback></Avatar>} trailing="Éditeur">Karim Alaoui</ListItem>
        </List>
      </ListSection>
      <ListSection title="Informations">
        <List>
          <ListItem trailing="Mon Drive">Emplacement</ListItem>
          <ListItem trailing="9 oct. 2026">Modifié</ListItem>
          <ListItem trailing="2 sept. 2026">Créé</ListItem>
        </List>
      </ListSection>
    </SheetBody>
    <SheetFooter>
      <Button variant="ghost">Copier le lien</Button>
      <Button>Partager</Button>
    </SheetFooter>
  </>
);

const meta = {
  title: "Composants/Surcouches/Sheet",
  component: SheetContent,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Modale qui glisse depuis un bord. `right` / `left` : panneau flottant détaché du bord de 8 px (le panneau « Détails » de Drive, à la manière d'iPadOS). `bottom` : feuille d'iOS avec poignée, centrée sur grand écran. Mêmes garanties que Dialog ; la croix reçoit le focus à l'ouverture ; `SheetBody` est la seule zone qui défile.",
      },
    },
  },
  args: { side: "right", size: "md", showCloseButton: true },
  argTypes: {
    side: { control: "inline-radio", options: ["right", "left", "bottom", "top"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  render: (args) => (
    <Sheet>
      <SheetTrigger asChild><Button variant="outline">Détails</Button></SheetTrigger>
      <SheetContent {...args}><Details /></SheetContent>
    </Sheet>
  ),
} satisfies Meta<typeof SheetContent>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Choisissez le bord dans les contrôles, puis cliquez « Détails ». */
export const Playground: Story = {};

/** Feuille du bas d'iOS : un choix rapide, une action de création. */
export const FeuilleDuBas: Story = {
  name: "Feuille du bas",
  render: () => (
    <Sheet>
      <SheetTrigger asChild><Button variant="elevated"><FolderIcon />Nouveau</Button></SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Nouveau</SheetTitle>
          <SheetDescription>Créer ou importer dans Mon Drive</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <List>
            <ListItem leading={<ListItemIcon tint="var(--ui-c4)"><FolderIcon /></ListItemIcon>} asChild><button type="button">Dossier</button></ListItem>
            <ListItem leading={<ListItemIcon tint="var(--ui-c1)"><DownloadIcon /></ListItemIcon>} asChild><button type="button">Importer un fichier</button></ListItem>
            <ListItem leading={<ListItemIcon tint="var(--ui-c3)"><FileIcon /></ListItemIcon>} asChild><button type="button">Document</button></ListItem>
          </List>
        </SheetBody>
      </SheetContent>
    </Sheet>
  ),
};

/** Panneau de navigation à gauche, sur mobile. */
export const NavigationLaterale: Story = {
  name: "Navigation latérale",
  render: () => (
    <Sheet>
      <SheetTrigger asChild><Button variant="outline">Menu</Button></SheetTrigger>
      <SheetContent side="left" size="sm">
        <SheetHeader><SheetTitle>Navigation</SheetTitle></SheetHeader>
        <SheetBody>
          <List variant="plain">
            <ListItem leading={<HomeIcon />} selected asChild><a href="#accueil">Accueil</a></ListItem>
            <ListItem leading={<FolderIcon />} asChild><a href="#drive">Mon Drive</a></ListItem>
            <ListItem leading={<StarIcon />} asChild><a href="#favoris">Favoris</a></ListItem>
          </List>
        </SheetBody>
      </SheetContent>
    </Sheet>
  ),
};

/** Aperçu ouvert (tests visuels). */
export const Ouverte: Story = {
  name: "Aperçu ouvert",
  tags: ["!autodocs"],
  render: (args) => (
    <Sheet defaultOpen>
      <SheetContent {...args}><Details /></SheetContent>
    </Sheet>
  ),
};
