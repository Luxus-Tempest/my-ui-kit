import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from "@rovia/ui";
import { CopyIcon, DownloadIcon, EditIcon, MoreIcon, TrashIcon } from "../../_shared/icons";

function Actions() {
  const [showZero, setShowZero] = React.useState(true);
  const [amounts, setAmounts] = React.useState("ht");
  return (
    <MenuContent>
      <MenuLabel>Facture</MenuLabel>
      <MenuItem shortcut="⌘E"><EditIcon />Modifier</MenuItem>
      <MenuItem shortcut="⌘D"><CopyIcon />Dupliquer</MenuItem>
      <MenuSub>
        <MenuSubTrigger><DownloadIcon />Exporter</MenuSubTrigger>
        <MenuSubContent>
          <MenuItem>PDF</MenuItem>
          <MenuItem>Excel (.xlsx)</MenuItem>
          <MenuItem>XML (DGI)</MenuItem>
        </MenuSubContent>
      </MenuSub>
      <MenuSeparator />
      <MenuCheckboxItem checked={showZero} onCheckedChange={setShowZero}>Afficher les lignes à zéro</MenuCheckboxItem>
      <MenuRadioGroup value={amounts} onValueChange={setAmounts}>
        <MenuLabel>Montants</MenuLabel>
        <MenuRadioItem value="ht">Hors taxes</MenuRadioItem>
        <MenuRadioItem value="ttc">Toutes taxes</MenuRadioItem>
      </MenuRadioGroup>
      <MenuSeparator />
      <MenuItem variant="danger"><TrashIcon />Supprimer</MenuItem>
    </MenuContent>
  );
}

const meta = {
  title: "Composants/Surcouches/Menu",
  component: Menu,
  tags: ["autodocs"],
  parameters: {
    registry: "menu",
    docs: {
      description: {
        component:
          "Menu d'actions ouvert par un bouton, en matériau translucide : entrées de 36 px, raccourcis, sous-menus, cases et radios (coche à droite, comme iOS), action dangereuse en rouge. Clavier : flèches, saisie de la première lettre, Échap. Pour le clic droit, `ContextMenu` a la même API.",
      },
    },
  },
  render: (args) => (
    <div style={{ minHeight: 420 }}>
      <Menu {...args}>
        <MenuTrigger asChild><Button variant="outline" size="icon" aria-label="Plus d'actions"><MoreIcon /></Button></MenuTrigger>
        <Actions />
      </Menu>
    </div>
  ),
} satisfies Meta<typeof Menu>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Toutes les sortes d'entrées dans un seul menu. */
export const Playground: Story = {};

/** Aperçu ouvert (tests visuels). */
export const Ouvert: Story = {
  name: "Aperçu ouvert",
  tags: ["!autodocs"],
  args: { defaultOpen: true, modal: false },
};
