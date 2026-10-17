import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  Card,
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  Kbd,
  Text,
} from "@rovia/ui";
import { CopyIcon, DownloadIcon, EditIcon, FileIcon, FolderIcon, PlusIcon, TrashIcon } from "../../_shared/icons";

function PaletteItems() {
  return (
    <>
      <CommandInput placeholder="Rechercher une commande, un fichier…" />
      <CommandList>
        <CommandEmpty>Aucun résultat.</CommandEmpty>
        <CommandGroup heading="Créer">
          <CommandItem shortcut="⌥N"><PlusIcon />Nouveau document</CommandItem>
          <CommandItem shortcut="⇧⌥F"><FolderIcon />Nouveau dossier</CommandItem>
          <CommandItem shortcut="⌘U"><DownloadIcon />Importer un fichier</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Fichiers récents">
          <CommandItem><FileIcon />Budget 2027.xlsx</CommandItem>
          <CommandItem><FileIcon />Contrat cadre.pdf</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem><EditIcon />Renommer</CommandItem>
          <CommandItem><CopyIcon />Créer une copie</CommandItem>
          <CommandItem disabled><TrashIcon />Vider la corbeille</CommandItem>
        </CommandGroup>
      </CommandList>
    </>
  );
}

const meta = {
  title: "Composants/Surcouches/Command",
  component: Command,
  tags: ["autodocs"],
  parameters: {
    registry: "command",
    docs: {
      description: {
        component:
          "Palette de commandes (cmdk) : filtrage à la frappe, flèches, Entrée. Intégrée dans une page (`Command`) ou en modale façon Spotlight (`CommandDialog`, ouverte par ⌘K). Les entrées reprennent celles des menus. Pour choisir une valeur de formulaire, `Combobox` s'appuie sur ces mêmes briques.",
      },
    },
  },
  render: () => (
    <Card variant="elevated" style={{ padding: 0, overflow: "hidden", maxWidth: 560 }}>
      <Command label="Palette intégrée">
        <PaletteItems />
      </Command>
    </Card>
  ),
} satisfies Meta<typeof Command>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Palette intégrée dans une carte. */
export const Playground: Story = {};

function WithShortcut() {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return (
    <>
      <Text tone="muted">
        Appuyez sur <Kbd>⌘</Kbd> <Kbd>K</Kbd> (ou <Kbd>Ctrl</Kbd> <Kbd>K</Kbd>), ou{" "}
        <Button variant="link" onClick={() => setOpen(true)}>ouvrez la palette</Button>.
      </Text>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <PaletteItems />
      </CommandDialog>
    </>
  );
}

/** En modale, au raccourci ⌘K : panneau translucide en haut d'écran. */
export const EnModale: Story = { name: "En modale (⌘K)", render: () => <WithShortcut /> };

/** Aperçu ouvert (tests visuels). */
export const Ouverte: Story = {
  name: "Aperçu ouvert",
  tags: ["!autodocs"],
  render: () => (
    <CommandDialog defaultOpen>
      <PaletteItems />
    </CommandDialog>
  ),
};
