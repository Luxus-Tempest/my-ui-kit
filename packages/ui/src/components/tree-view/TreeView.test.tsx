import * as React from "react";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { TreeItem, TreeView, type TreeViewItem } from "./TreeView";

const ITEMS: TreeViewItem[] = [
  {
    id: "drive",
    label: "Mon Drive",
    children: [
      {
        id: "finance",
        label: "Finance",
        children: [
          { id: "budget", label: "Budget 2027" },
          { id: "factures", label: "Factures" },
        ],
      },
      { id: "rh", label: "Ressources humaines", children: [{ id: "contrats", label: "Contrats" }] },
      { id: "archives", label: "Archives", disabled: true, children: [{ id: "vieux", label: "2019" }] },
    ],
  },
  { id: "partages", label: "Partagés avec moi" },
  { id: "equipe", label: "Équipe produit" },
];

const item = (name: string) => screen.getByRole("treeitem", { name });

describe("TreeView", () => {
  it("expose la structure ARIA : niveaux, positions, état d'ouverture, groupes", () => {
    render(<TreeView aria-label="Dossiers" items={ITEMS} defaultExpandedIds={["drive"]} />);
    const tree = screen.getByRole("tree", { name: "Dossiers" });
    expect(tree).not.toHaveAttribute("aria-multiselectable");

    const drive = item("Mon Drive");
    expect(drive).toHaveAttribute("aria-level", "1");
    expect(drive).toHaveAttribute("aria-setsize", "3");
    expect(drive).toHaveAttribute("aria-posinset", "1");
    expect(drive).toHaveAttribute("aria-expanded", "true");

    const group = within(drive).getByRole("group");
    expect(within(group).getAllByRole("treeitem", { name: /./ }).filter((el) => el.getAttribute("aria-level") === "2")).toHaveLength(3);

    const rh = item("Ressources humaines");
    expect(rh).toHaveAttribute("aria-level", "2");
    expect(rh).toHaveAttribute("aria-posinset", "2");
    expect(rh).toHaveAttribute("aria-expanded", "false");
    // Une feuille ne porte pas d'état d'ouverture ; un nœud fermé ne rend pas ses enfants.
    expect(item("Partagés avec moi")).not.toHaveAttribute("aria-expanded");
    expect(screen.queryByRole("treeitem", { name: "Contrats" })).toBeNull();
    // Le nom du nœud est son libellé, pas le texte de ses descendants.
    expect(item("Mon Drive")).toHaveAccessibleName("Mon Drive");
  });

  it("clavier : tabindex mobile, flèches, ouverture, remontée, Origine / Fin", async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    render(<TreeView aria-label="Dossiers" items={ITEMS} onExpandedChange={onExpandedChange} />);

    await user.tab();
    expect(item("Mon Drive")).toHaveFocus();
    expect(screen.getAllByRole("treeitem").filter((el) => el.tabIndex === 0)).toHaveLength(1);

    await user.keyboard("{ArrowRight}");
    expect(item("Mon Drive")).toHaveAttribute("aria-expanded", "true");
    expect(onExpandedChange).toHaveBeenLastCalledWith(["drive"]);
    expect(item("Mon Drive")).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(item("Finance")).toHaveFocus();
    expect(item("Finance").tabIndex).toBe(0);
    expect(item("Mon Drive").tabIndex).toBe(-1);

    await user.keyboard("{ArrowDown}");
    expect(item("Ressources humaines")).toHaveFocus();

    // L'élément désactivé est sauté.
    await user.keyboard("{ArrowDown}");
    expect(item("Partagés avec moi")).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(item("Ressources humaines")).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(item("Mon Drive")).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(item("Mon Drive")).toHaveAttribute("aria-expanded", "false");

    await user.keyboard("{End}");
    expect(item("Équipe produit")).toHaveFocus();
    await user.keyboard("{Home}");
    expect(item("Mon Drive")).toHaveFocus();
  });

  it("clavier : `*` ouvre les frères, la saisie de lettres ignore casse et accents", async () => {
    const user = userEvent.setup();
    render(<TreeView aria-label="Dossiers" items={ITEMS} defaultExpandedIds={["drive"]} />);
    await user.tab();
    await user.keyboard("{ArrowDown}");
    expect(item("Finance")).toHaveFocus();

    await user.keyboard("*");
    expect(item("Finance")).toHaveAttribute("aria-expanded", "true");
    expect(item("Ressources humaines")).toHaveAttribute("aria-expanded", "true");
    // Le nœud désactivé reste fermé.
    expect(item("Archives")).toHaveAttribute("aria-expanded", "false");

    await user.keyboard("e");
    expect(item("Équipe produit")).toHaveFocus();
    await user.keyboard("{Home}");
    await user.keyboard("co");
    expect(item("Contrats")).toHaveFocus();
  });

  it("sélection unique : Entrée sélectionne et active, Espace et clic sélectionnent", async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    const onItemActivate = vi.fn();
    render(
      <TreeView
        aria-label="Dossiers"
        items={ITEMS}
        onSelectedChange={onSelectedChange}
        onItemActivate={onItemActivate}
      />,
    );
    await user.tab();
    await user.keyboard("{Enter}");
    expect(onSelectedChange).toHaveBeenLastCalledWith(["drive"]);
    expect(onItemActivate).toHaveBeenCalledWith(expect.objectContaining({ id: "drive", label: "Mon Drive" }));
    expect(item("Mon Drive")).toHaveAttribute("aria-selected", "true");
    // Sélection unique : aria-selected absent des autres nœuds.
    expect(item("Partagés avec moi")).not.toHaveAttribute("aria-selected");

    await user.keyboard("{ArrowDown} ");
    expect(item("Partagés avec moi")).toHaveAttribute("aria-selected", "true");
    expect(item("Mon Drive")).not.toHaveAttribute("aria-selected");

    await user.click(screen.getByText("Équipe produit"));
    expect(item("Équipe produit")).toHaveFocus();
    expect(onSelectedChange).toHaveBeenLastCalledWith(["equipe"]);

    await user.dblClick(screen.getByText("Partagés avec moi"));
    expect(onItemActivate).toHaveBeenLastCalledWith(expect.objectContaining({ id: "partages" }));
  });

  it("le chevron ouvre sans sélectionner ; `expansionTrigger=\"row\"` ouvre au clic de ligne", async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    const { rerender } = render(<TreeView aria-label="Dossiers" items={ITEMS} onSelectedChange={onSelectedChange} />);
    const toggle = item("Mon Drive").querySelector(".ui-tree__toggle")!;
    await user.click(toggle);
    expect(item("Mon Drive")).toHaveAttribute("aria-expanded", "true");
    expect(onSelectedChange).not.toHaveBeenCalled();

    rerender(<TreeView aria-label="Dossiers" items={ITEMS} selectionMode="none" expansionTrigger="row" />);
    await user.click(screen.getByText("Finance"));
    expect(item("Finance")).toHaveAttribute("aria-expanded", "true");
    expect(item("Finance")).not.toHaveAttribute("aria-selected");
  });

  it("sélection multiple : Espace, Maj + flèche, Ctrl + clic, Maj + clic, Ctrl + A", async () => {
    const user = userEvent.setup();
    render(<TreeView aria-label="Dossiers" items={ITEMS} selectionMode="multiple" />);
    expect(screen.getByRole("tree")).toHaveAttribute("aria-multiselectable", "true");
    expect(item("Partagés avec moi")).toHaveAttribute("aria-selected", "false");

    await user.tab();
    await user.keyboard(" ");
    expect(item("Mon Drive")).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Shift>}{ArrowDown}{/Shift}");
    expect(item("Partagés avec moi")).toHaveAttribute("aria-selected", "true");
    expect(item("Mon Drive")).toHaveAttribute("aria-selected", "true");

    await user.click(screen.getByText("Équipe produit"));
    expect(screen.getAllByRole("treeitem", { selected: true })).toHaveLength(1);

    await user.keyboard("{Control>}");
    await user.click(screen.getByText("Mon Drive"));
    await user.keyboard("{/Control}");
    expect(screen.getAllByRole("treeitem", { selected: true }).map((el) => el.dataset.treeId)).toEqual(["drive", "equipe"]);

    await user.keyboard("{Shift>}");
    await user.click(screen.getByText("Partagés avec moi"));
    await user.keyboard("{/Shift}");
    expect(screen.getAllByRole("treeitem", { selected: true }).map((el) => el.dataset.treeId)).toEqual(["drive", "partages"]);

    await user.keyboard("{Control>}a{/Control}");
    // Tous les nœuds actifs, y compris ceux des branches fermées.
    expect(screen.getAllByRole("treeitem", { selected: true })).toHaveLength(3);
    await user.keyboard("{Home}{ArrowRight}");
    expect(item("Finance")).toHaveAttribute("aria-selected", "true");
    expect(item("Archives")).toHaveAttribute("aria-selected", "false");
  });

  it("contrôlé : l'ouverture suit expandedIds", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [expanded, setExpanded] = React.useState<string[]>([]);
      return (
        <>
          <TreeView aria-label="Dossiers" items={ITEMS} expandedIds={expanded} onExpandedChange={setExpanded} />
          <button type="button" onClick={() => setExpanded(["drive", "rh"])}>Tout voir</button>
        </>
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole("button", { name: "Tout voir" }));
    expect(item("Contrats")).toBeInTheDocument();
    await user.click(item("Mon Drive").querySelector(".ui-tree__toggle")!);
    expect(screen.queryByRole("treeitem", { name: "Contrats" })).toBeNull();
  });

  it("chargement paresseux : indicateur d'attente, enfants chargés, échec puis nouvel essai", async () => {
    const user = userEvent.setup();
    let resolve!: (items: TreeViewItem[]) => void;
    const loadChildren = vi
      .fn<(item: TreeViewItem) => Promise<TreeViewItem[]>>()
      .mockImplementationOnce(() => new Promise((r) => (resolve = r)))
      .mockImplementationOnce(() => Promise.reject(new Error("réseau")))
      .mockImplementationOnce(() => Promise.resolve([{ id: "photos-2026", label: "2026" }]));

    render(
      <TreeView
        aria-label="Dossiers"
        loadChildren={loadChildren}
        items={[
          { id: "docs", label: "Documents", hasChildren: true },
          { id: "photos", label: "Photos", hasChildren: true },
        ]}
      />,
    );
    expect(item("Documents")).toHaveAttribute("aria-expanded", "false");

    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(loadChildren).toHaveBeenCalledWith(expect.objectContaining({ id: "docs" }));
    expect(item("Documents")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Chargement du contenu de Documents…");

    await act(async () => resolve([{ id: "devis", label: "Devis" }]));
    expect(item("Documents")).not.toHaveAttribute("aria-busy");
    expect(item("Devis")).toHaveAttribute("aria-level", "2");
    await user.keyboard("{ArrowRight}");
    expect(item("Devis")).toHaveFocus();

    // Échec : le nœud se referme, l'échec est annoncé et signalé.
    await user.keyboard("{ArrowLeft}{ArrowLeft}{ArrowDown}{ArrowRight}");
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/Impossible de charger le contenu de Photos/));
    expect(item("Photos")).toHaveAttribute("aria-expanded", "false");
    expect(item("Photos")).toHaveTextContent("Échec du chargement");

    // Nouvel essai à la réouverture.
    await user.keyboard("{ArrowRight}");
    expect(await screen.findByRole("treeitem", { name: "2026" })).toBeInTheDocument();
    expect(loadChildren).toHaveBeenCalledTimes(3);
  });

  it("API composable : TreeItem produit le même arbre", async () => {
    const user = userEvent.setup();
    render(
      <TreeView aria-label="Dossiers" defaultExpandedIds={["drive"]}>
        <TreeItem itemId="drive" label="Mon Drive">
          <TreeItem itemId="finance" label="Finance" />
          <>
            <TreeItem itemId="rh" label="Ressources humaines" />
          </>
        </TreeItem>
        <TreeItem itemId="corbeille" label="Corbeille" />
      </TreeView>,
    );
    expect(item("Ressources humaines")).toHaveAttribute("aria-posinset", "2");
    expect(item("Ressources humaines")).toHaveAttribute("aria-setsize", "2");
    await user.tab();
    await user.keyboard("{End}");
    expect(item("Corbeille")).toHaveFocus();
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <TreeView
        aria-label="Dossiers"
        items={ITEMS}
        defaultExpandedIds={["drive", "finance"]}
        defaultSelectedIds={["budget"]}
        loadChildren={async () => []}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("sans violation d'accessibilité en sélection multiple", async () => {
    const { container } = render(
      <TreeView aria-label="Dossiers" items={ITEMS} selectionMode="multiple" defaultExpandedIds={["drive"]} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
