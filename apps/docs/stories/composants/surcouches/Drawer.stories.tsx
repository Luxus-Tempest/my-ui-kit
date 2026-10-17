import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  Field,
  Input,
  List,
  ListItem,
  ListItemIcon,
  ListSection,
  Text,
  type DrawerDirection,
} from "@rovia/ui";
import {
  Camera,
  FileSpreadsheet,
  FileText,
  Folder,
  MapPin,
  Presentation,
  Upload,
} from "lucide-react";
import { Row } from "../../_shared/demo";

const Creation = () => (
  <>
    <DrawerHeader>
      <DrawerTitle>Nouveau</DrawerTitle>
      <DrawerDescription>Créer ou importer dans Mon Drive</DrawerDescription>
    </DrawerHeader>
    <DrawerBody>
      <List>
        <ListItem leading={<ListItemIcon tint="var(--ui-c4)"><Folder /></ListItemIcon>} asChild>
          <button type="button">Dossier</button>
        </ListItem>
        <ListItem leading={<ListItemIcon tint="var(--ui-c1)"><Upload /></ListItemIcon>} asChild>
          <button type="button">Importer un fichier</button>
        </ListItem>
        <ListItem leading={<ListItemIcon tint="var(--ui-c7)"><Camera /></ListItemIcon>} asChild>
          <button type="button">Numériser un document</button>
        </ListItem>
      </List>
      <ListSection title="Créer" style={{ marginTop: 20 }}>
        <List>
          <ListItem leading={<ListItemIcon tint="var(--ui-c1)"><FileText /></ListItemIcon>} asChild>
            <button type="button">Document</button>
          </ListItem>
          <ListItem leading={<ListItemIcon tint="var(--ui-c3)"><FileSpreadsheet /></ListItemIcon>} asChild>
            <button type="button">Feuille de calcul</button>
          </ListItem>
          <ListItem leading={<ListItemIcon tint="var(--ui-c2)"><Presentation /></ListItemIcon>} asChild>
            <button type="button">Présentation</button>
          </ListItem>
        </List>
      </ListSection>
    </DrawerBody>
  </>
);

const meta = {
  title: "Composants/Surcouches/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  parameters: {
    registry: "drawer",
    docs: {
      description: {
        component:
          "Feuille du bas d'iOS **glissable** : on la referme d'un geste vers le bas, par la poignée ou le contenu (quand il est défilé en haut). Mêmes surfaces et rayons que `Sheet` côté bas ; `direction` la fait venir d'un autre bord. `snapPoints` lui donne des crans d'arrêt, `shouldScaleBackground` fait reculer l'application derrière elle.\n\nMêmes garanties qu'une modale (piège à focus, Échap, retour du focus) : le focus se pose sur la feuille elle-même, qui annonce son titre sans ouvrir de clavier virtuel. Préférer `Sheet` sur ordinateur pour un panneau de détails ; `Drawer` brille au doigt.",
      },
    },
  },
  args: { direction: "bottom" },
  argTypes: {
    direction: { control: "inline-radio", options: ["bottom", "top", "left", "right"] },
    shouldScaleBackground: { control: false },
    snapPoints: { control: false },
    open: { control: false },
    defaultOpen: { control: false },
  },
  render: (args) => (
    <Drawer {...args}>
      <DrawerTrigger asChild>
        <Button variant="elevated"><Folder />Nouveau</Button>
      </DrawerTrigger>
      <DrawerContent>
        <Creation />
      </DrawerContent>
    </Drawer>
  ),
} satisfies Meta<typeof Drawer>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Ouvrez, puis glissez la feuille vers le bas (souris ou doigt) pour la refermer. */
export const Playground: Story = {};

function FormulaireDemo() {
  const [name, setName] = React.useState("Budget 2027.xlsx");
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Renommer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Renommer</DrawerTitle>
          <DrawerDescription>Le lien de partage reste valable.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <Field label="Nom du fichier">
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild><Button variant="ghost">Annuler</Button></DrawerClose>
          <DrawerClose asChild><Button>Enregistrer</Button></DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

/**
 * Pied d'actions : pleine largeur et empilées sur téléphone (la principale en haut,
 * comme iOS), alignées à droite au-delà de 720 px. `DrawerClose asChild` ferme la feuille.
 */
export const AvecFormulaire: Story = {
  name: "Avec formulaire",
  render: () => <FormulaireDemo />,
};

const LIEUX = [
  ["Siège · Casablanca", "Boulevard d'Anfa, 3e étage"],
  ["Agence de Rabat", "Avenue Mohammed V"],
  ["Agence de Marrakech", "Guéliz, rue de la Liberté"],
  ["Agence de Tanger", "Place des Nations"],
  ["Entrepôt · Mohammédia", "Zone industrielle Sud-Ouest"],
  ["Agence d'Agadir", "Avenue Hassan II"],
  ["Agence de Fès", "Ville nouvelle, avenue des FAR"],
  ["Agence d'Oujda", "Boulevard Mohammed VI"],
];

function CransDemo() {
  const [snap, setSnap] = React.useState<number | string | null>(0.45);
  return (
    <Drawer snapPoints={[0.45, 1]} activeSnapPoint={snap} setActiveSnapPoint={setSnap}>
      <DrawerTrigger asChild>
        <Button variant="outline"><MapPin />Nos agences</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Nos agences</DrawerTitle>
          <DrawerDescription>{snap === 1 ? "Glissez vers le bas pour réduire." : "Glissez vers le haut pour tout voir."}</DrawerDescription>
        </DrawerHeader>
        <DrawerBody style={{ overflowY: snap === 1 ? "auto" : "hidden" }}>
          <List>
            {LIEUX.map(([titre, adresse]) => (
              <ListItem key={titre} leading={<ListItemIcon tint="var(--ui-c1)"><MapPin /></ListItemIcon>} description={adresse} chevron asChild>
                <button type="button">{titre}</button>
              </ListItem>
            ))}
          </List>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

/**
 * `snapPoints` : crans d'arrêt en fraction de l'écran (`0.45`) ou en pixels (`"240px"`).
 * La feuille s'ouvre au premier cran ; un geste ou un appui sur la poignée la fait monter.
 * Le contenu ne défile qu'au cran le plus haut.
 */
export const Crans: Story = {
  name: "Crans (snapPoints)",
  render: () => <CransDemo />,
};

/**
 * `shouldScaleBackground` : l'application recule et s'arrondit derrière la feuille, comme
 * sur iOS. Il faut poser `data-vaul-drawer-wrapper` sur l'élément qui enveloppe l'application ;
 * ici `setBackgroundColorOnScale={false}` laisse le fond de la page intact.
 */
export const ArrierePlanQuiRecule: Story = {
  name: "Arrière-plan qui recule",
  render: () => (
    <div
      data-vaul-drawer-wrapper=""
      style={{
        display: "grid",
        gap: 16,
        alignContent: "start",
        maxWidth: 420,
        minHeight: 420,
        padding: 24,
        borderRadius: "var(--ui-r-xl)",
        background: "var(--ui-panel)",
      }}
    >
      <Text weight="semibold" size={16}>Mon Drive</Text>
      <List>
        <ListItem leading={<ListItemIcon tint="var(--ui-c3)"><FileSpreadsheet /></ListItemIcon>} description="Modifié à 09:12">Budget 2027.xlsx</ListItem>
        <ListItem leading={<ListItemIcon tint="var(--ui-c1)"><FileText /></ListItemIcon>} description="Modifié hier">Procès-verbal.docx</ListItem>
        <ListItem leading={<ListItemIcon tint="var(--ui-c2)"><Presentation /></ListItemIcon>} description="Modifié lundi">Revue trimestrielle</ListItem>
      </List>
      <Drawer shouldScaleBackground setBackgroundColorOnScale={false}>
        <DrawerTrigger asChild>
          <Button variant="elevated" style={{ justifySelf: "start" }}><Folder />Nouveau</Button>
        </DrawerTrigger>
        <DrawerContent>
          <Creation />
        </DrawerContent>
      </Drawer>
    </div>
  ),
};

const NOMS: Record<DrawerDirection, string> = { bottom: "Bas", top: "Haut", left: "Gauche", right: "Droite" };

/** Quatre bords. Les feuilles latérales n'ont pas de poignée par défaut (`showHandle` pour l'ajouter). */
export const Directions: Story = {
  render: () => (
    <Row>
      {(["bottom", "top", "left", "right"] as const).map((direction) => (
        <Drawer key={direction} direction={direction}>
          <DrawerTrigger asChild>
            <Button variant="outline">{NOMS[direction]}</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Feuille · {NOMS[direction].toLowerCase()}</DrawerTitle>
              <DrawerDescription>Glissez vers le bord pour la refermer, ou Échap.</DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
              <Text tone="muted" size={13}>
                Le geste suit le sens d'ouverture ; au-delà d'un quart de la feuille, elle se referme.
              </Text>
            </DrawerBody>
            <DrawerFooter>
              <DrawerClose asChild><Button variant="outline">Fermer</Button></DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ))}
    </Row>
  ),
};

/** Aperçu ouvert (tests visuels). */
export const Ouvert: Story = {
  name: "Aperçu ouvert",
  tags: ["!autodocs"],
  render: (args) => (
    <Drawer {...args} defaultOpen>
      <DrawerContent>
        <Creation />
      </DrawerContent>
    </Drawer>
  ),
};

/** Aperçu ouvert, feuille latérale avec formulaire (tests visuels). */
export const OuvertLateral: Story = {
  name: "Aperçu ouvert · latéral",
  tags: ["!autodocs"],
  render: () => (
    <Drawer direction="right" defaultOpen>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Renommer</DrawerTitle>
          <DrawerDescription>Le lien de partage reste valable.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>
          <Field label="Nom du fichier">
            <Input defaultValue="Budget 2027.xlsx" />
          </Field>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose asChild><Button variant="ghost">Annuler</Button></DrawerClose>
          <DrawerClose asChild><Button>Enregistrer</Button></DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
};
