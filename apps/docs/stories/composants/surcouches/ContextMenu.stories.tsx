import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@acme/ui";
import { Row } from "../../_shared/demo";
import {
  CopyIcon,
  DownloadIcon,
  EditIcon,
  FileIcon,
  FolderIcon,
  InfoIcon,
  LinkIcon,
  ShareIcon,
  StarIcon,
  TrashIcon,
} from "../../_shared/icons";

/** Zone à clic droit de démonstration : une tuile de fichier façon Drive. */
const Tile = ({ children, icon = <FileIcon /> }: { children: React.ReactNode; icon?: React.ReactNode }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      width: 260,
      padding: "14px 16px",
      borderRadius: "var(--ui-r-lg)",
      background: "var(--ui-card-2)",
      color: "var(--ui-fg)",
      font: "500 14px/1.3 var(--ui-font-sans)",
      cursor: "context-menu",
      userSelect: "none",
    }}
  >
    <span style={{ display: "inline-flex", width: 18, height: 18, color: "var(--ui-fg-2)" }}>{icon}</span>
    <span style={{ flex: 1, minWidth: 0 }}>
      {children}
      <span style={{ display: "block", marginTop: 2, fontSize: 12, fontWeight: 400, color: "var(--ui-fg-3)" }}>
        Clic droit, appui long ou Maj + F10
      </span>
    </span>
  </div>
);

const meta = {
  title: "Composants/Surcouches/ContextMenu",
  component: ContextMenu,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Menu ouvert au clic droit (ou appui long, touche Menu, Maj + F10) sur un élément : le menu d'un fichier dans Drive. Même API, mêmes entrées et même matériau translucide que **Menu** ; seul le déclencheur change. Il double toujours une action accessible autrement (bouton « Plus d'actions »), jamais la seule voie.",
      },
    },
  },
  args: { modal: true },
  argTypes: {
    modal: { control: "boolean" },
    onOpenChange: { table: { disable: true } },
    dir: { table: { disable: true } },
  },
  render: (args) => (
    <ContextMenu {...args}>
      <ContextMenuTrigger asChild>
        <div tabIndex={0} style={{ width: "fit-content", borderRadius: "var(--ui-r-lg)" }}><Tile>Rapport annuel 2026.pdf</Tile></div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem><DownloadIcon />Télécharger</ContextMenuItem>
        <ContextMenuItem shortcut="⌘⌥E"><EditIcon />Renommer</ContextMenuItem>
        <ContextMenuItem shortcut="⌘C"><CopyIcon />Créer une copie</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="danger"><TrashIcon />Placer dans la corbeille</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
} satisfies Meta<typeof ContextMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Clic droit sur la tuile. Toutes les props de la racine sont pilotables depuis le panneau Contrôles. */
export const Playground: Story = {};

/** Toutes les entrées de Menu : icône, raccourci, `inset`, désactivée, `danger`, groupe intitulé, sous-menu. */
export const Entrees: Story = {
  name: "Entrées",
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div tabIndex={0} style={{ width: "fit-content", borderRadius: "var(--ui-r-lg)" }}><Tile>Devis Atlas.docx</Tile></div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuItem shortcut="⌘O"><FileIcon />Ouvrir</ContextMenuItem>
          <ContextMenuSub>
            <ContextMenuSubTrigger><ShareIcon />Partager</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem><ShareIcon />Partager avec des personnes</ContextMenuItem>
              <ContextMenuItem><LinkIcon />Copier le lien</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuItem><FolderIcon />Déplacer vers…</ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuLabel inset>Informations</ContextMenuLabel>
        <ContextMenuItem inset>Historique des versions</ContextMenuItem>
        <ContextMenuItem><InfoIcon />Détails du fichier</ContextMenuItem>
        <ContextMenuItem disabled><DownloadIcon />Télécharger (hors ligne)</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="danger" shortcut="⌫"><TrashIcon />Placer dans la corbeille</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

function SelectionDemo() {
  const [starred, setStarred] = React.useState(true);
  const [offline, setOffline] = React.useState(false);
  const [sort, setSort] = React.useState("nom");
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div tabIndex={0} style={{ width: "fit-content", borderRadius: "var(--ui-r-lg)" }}><Tile icon={<FolderIcon />}>Comptabilité</Tile></div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuCheckboxItem checked={starred} onCheckedChange={setStarred}>
          <StarIcon />Suivi
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem checked={offline} onCheckedChange={setOffline}>
          <DownloadIcon />Disponible hors connexion
        </ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuLabel>Trier par</ContextMenuLabel>
        <ContextMenuRadioGroup value={sort} onValueChange={setSort}>
          <ContextMenuRadioItem value="nom">Nom</ContextMenuRadioItem>
          <ContextMenuRadioItem value="modification">Dernière modification</ContextMenuRadioItem>
          <ContextMenuRadioItem value="taille">Taille</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}

/** Cases (`ContextMenuCheckboxItem`) et choix exclusif (`ContextMenuRadioGroup`) : la coche vit à droite, comme dans iOS. */
export const CasesEtChoix: Story = {
  name: "Cases et choix",
  render: () => <SelectionDemo />,
};

/**
 * Chaque élément d'une liste a son propre menu ; `disabled` sur le déclencheur
 * rend le menu natif du navigateur (ici, sur la seconde tuile).
 */
export const Composition: Story = {
  render: () => (
    <Row>
      {["Budget 2027.xlsx", "Note interne.txt"].map((name, i) => (
        <ContextMenu key={name}>
          <ContextMenuTrigger asChild disabled={i === 1}>
            <div tabIndex={0} style={{ width: "fit-content", borderRadius: "var(--ui-r-lg)" }}><Tile>{name}</Tile></div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuLabel>{name}</ContextMenuLabel>
            <ContextMenuItem><FileIcon />Ouvrir</ContextMenuItem>
            <ContextMenuItem><CopyIcon />Créer une copie</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="danger"><TrashIcon />Placer dans la corbeille</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}
    </Row>
  ),
};
