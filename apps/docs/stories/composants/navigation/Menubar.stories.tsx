import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@acme/ui";
import {
  ClipboardPaste,
  Copy,
  Download,
  FilePlus,
  FileText,
  FolderOpen,
  History,
  Image,
  Link2,
  Printer,
  Redo2,
  Scissors,
  Share2,
  Star,
  Table,
  Trash,
  Undo2,
} from "lucide-react";

/** Barre « Fichier Édition Affichage Insertion » d'un éditeur de documents. */
function AppMenus() {
  const [ruler, setRuler] = React.useState(true);
  const [outline, setOutline] = React.useState(false);
  const [mode, setMode] = React.useState("edition");
  return (
    <>
      <MenubarMenu value="fichier">
        <MenubarTrigger>Fichier</MenubarTrigger>
        <MenubarContent>
          <MenubarGroup>
            <MenubarItem shortcut="⌘N"><FilePlus />Nouveau document</MenubarItem>
            <MenubarItem shortcut="⌘O"><FolderOpen />Ouvrir</MenubarItem>
            <MenubarItem><Copy />Créer une copie</MenubarItem>
          </MenubarGroup>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger><Share2 />Partager</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem><Share2 />Partager avec des personnes</MenubarItem>
              <MenubarItem><Link2 />Copier le lien</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSub>
            <MenubarSubTrigger><Download />Télécharger</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Document PDF (.pdf)</MenubarItem>
              <MenubarItem>Microsoft Word (.docx)</MenubarItem>
              <MenubarItem>Texte brut (.txt)</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarItem><History />Historique des versions</MenubarItem>
          <MenubarSeparator />
          <MenubarItem shortcut="⌘P"><Printer />Imprimer</MenubarItem>
          <MenubarSeparator />
          <MenubarItem variant="danger"><Trash />Placer dans la corbeille</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu value="edition">
        <MenubarTrigger>Édition</MenubarTrigger>
        <MenubarContent>
          <MenubarItem shortcut="⌘Z"><Undo2 />Annuler</MenubarItem>
          <MenubarItem shortcut="⇧⌘Z" disabled><Redo2 />Rétablir</MenubarItem>
          <MenubarSeparator />
          <MenubarItem shortcut="⌘X"><Scissors />Couper</MenubarItem>
          <MenubarItem shortcut="⌘C"><Copy />Copier</MenubarItem>
          <MenubarItem shortcut="⌘V"><ClipboardPaste />Coller</MenubarItem>
          <MenubarItem inset shortcut="⇧⌘V">Coller sans mise en forme</MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset shortcut="⌘A">Tout sélectionner</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu value="affichage">
        <MenubarTrigger>Affichage</MenubarTrigger>
        <MenubarContent>
          <MenubarLabel>Mode</MenubarLabel>
          <MenubarRadioGroup value={mode} onValueChange={setMode}>
            <MenubarRadioItem value="edition">Modification</MenubarRadioItem>
            <MenubarRadioItem value="suggestion">Suggestion</MenubarRadioItem>
            <MenubarRadioItem value="lecture">Lecture</MenubarRadioItem>
          </MenubarRadioGroup>
          <MenubarSeparator />
          <MenubarCheckboxItem checked={ruler} onCheckedChange={setRuler}>Afficher la règle</MenubarCheckboxItem>
          <MenubarCheckboxItem checked={outline} onCheckedChange={setOutline}>Afficher le plan</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarItem shortcut="⌃⌘F">Plein écran</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu value="insertion">
        <MenubarTrigger>Insertion</MenubarTrigger>
        <MenubarContent>
          <MenubarItem><Image />Image</MenubarItem>
          <MenubarItem><Table />Tableau</MenubarItem>
          <MenubarItem shortcut="⌘K"><Link2 />Lien</MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu value="aide">
        <MenubarTrigger>Aide</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Rechercher dans les menus</MenubarItem>
          <MenubarItem shortcut="⌘/">Raccourcis clavier</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </>
  );
}

const meta = {
  title: "Composants/Navigation/Menubar",
  component: Menubar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Barre de menus d'application (« Fichier Édition Affichage »), comme dans Docs ou un logiciel de bureau. Déclencheurs en pilule posés à plat ; chaque menu reprend l'API, les entrées (icône, raccourci, `inset`, `danger`, cases, radios, sous-menus) et le matériau translucide de **Menu**. Clavier : flèches gauche/droite d'un menu à l'autre, même ouverts ; flèche bas, Entrée ou Espace pour ouvrir ; Échap pour refermer.",
      },
    },
  },
  args: { loop: true },
  argTypes: {
    loop: { control: "boolean" },
    value: { table: { disable: true } },
    defaultValue: { table: { disable: true } },
    onValueChange: { table: { disable: true } },
    dir: { table: { disable: true } },
  },
  render: (args) => (
    <div style={{ minHeight: 440 }}>
      <Menubar aria-label="Menus du document" {...args}>
        <AppMenus />
      </Menubar>
    </div>
  ),
} satisfies Meta<typeof Menubar>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Cliquez sur « Fichier », puis glissez d'un menu à l'autre ou utilisez les flèches. */
export const Playground: Story = {};

/** En-tête d'éditeur : titre du document, puis la barre de menus juste dessous, comme dans Docs. */
export const BarreDApplication: Story = {
  name: "Barre d'application",
  render: (args) => (
    <div style={{ minHeight: 480 }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          maxWidth: 820,
          padding: "10px 16px 6px",
          borderRadius: "var(--ui-r-lg)",
          background: "var(--ui-panel)",
        }}
      >
        <span
          style={{
            display: "grid",
            placeItems: "center",
            width: 40,
            height: 40,
            borderRadius: "var(--ui-r-sm)",
            background: "var(--ui-pri-container)",
            color: "var(--ui-on-pri-container)",
          }}
        >
          <FileText size={20} aria-hidden />
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px", font: "400 18px/1.3 var(--ui-font-sans)", color: "var(--ui-fg)" }}>
            Rapport annuel 2026
            <Star size={16} aria-label="Suivi" style={{ color: "var(--ui-fg-3)" }} />
          </div>
          <Menubar aria-label="Menus du document" {...args} style={{ padding: "2px 0", minHeight: 0 }}>
            <AppMenus />
          </Menubar>
        </div>
      </header>
    </div>
  ),
};

/** Aperçu ouvert (tests visuels) : `defaultValue` désigne le menu ouvert. */
export const Ouvert: Story = {
  name: "Aperçu ouvert",
  tags: ["!autodocs"],
  args: { defaultValue: "affichage" },
};
