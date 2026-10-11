import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
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
} from "./Menubar";

function Demo({ onNew = () => {}, onUndo = () => {} }: { onNew?: () => void; onUndo?: () => void }) {
  return (
    <Menubar aria-label="Menus de l'application">
      <MenubarMenu>
        <MenubarTrigger>Fichier</MenubarTrigger>
        <MenubarContent>
          <MenubarGroup>
            <MenubarItem onSelect={onNew} shortcut="⌘N">Nouveau</MenubarItem>
            <MenubarItem disabled>Ouvrir récent</MenubarItem>
          </MenubarGroup>
          <MenubarSub>
            <MenubarSubTrigger>Exporter</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>PDF</MenubarItem>
              <MenubarItem>Word (.docx)</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem variant="danger">Placer dans la corbeille</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Édition</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onSelect={onUndo} shortcut="⌘Z">Annuler</MenubarItem>
          <MenubarItem shortcut="⇧⌘Z">Rétablir</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Affichage</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked>Règle</MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarLabel inset>Mode</MenubarLabel>
          <MenubarRadioGroup value="edition">
            <MenubarRadioItem value="edition">Édition</MenubarRadioItem>
            <MenubarRadioItem value="lecture">Lecture</MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

describe("Menubar", () => {
  it("barre de menus avec les classes de Menu", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    const bar = screen.getByRole("menubar", { name: "Menus de l'application" });
    expect(bar).toHaveClass("ui-menubar");
    const trigger = screen.getByRole("menuitem", { name: "Fichier" });
    expect(trigger).toHaveClass("ui-menubar__trigger");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("data-state", "open");
    const menu = screen.getByRole("menu");
    expect(menu).toHaveClass("ui-popup", "ui-menu", "ui-menubar-content");
    expect(menu).toHaveAttribute("data-slot", "menubar-content");
    expect(screen.getByRole("menuitem", { name: /Nouveau/ })).toHaveClass("ui-menu-item");
    expect(screen.getByText("⌘N")).toHaveClass("ui-menu-shortcut");
    expect(screen.getByRole("menuitem", { name: "Ouvrir récent" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("menuitem", { name: "Placer dans la corbeille" })).toHaveAttribute("data-variant", "danger");
  });

  it("clavier : flèches entre les menus, flèche bas pour ouvrir, Entrée pour choisir", async () => {
    const user = userEvent.setup();
    const onUndo = vi.fn();
    render(<Demo onUndo={onUndo} />);
    await user.tab();
    expect(screen.getByRole("menuitem", { name: "Fichier" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    const edit = screen.getByRole("menuitem", { name: "Édition" });
    expect(edit).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(edit).toHaveAttribute("data-state", "open");
    await waitFor(() => expect(screen.getByRole("menuitem", { name: /Annuler/ })).toHaveFocus());
    await user.keyboard("{Enter}");
    expect(onUndo).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
  });

  it("menu ouvert : la flèche droite passe au menu suivant, Échap referme", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole("menuitem", { name: "Édition" }));
    expect(screen.getByRole("menuitem", { name: /Annuler/ })).toBeInTheDocument();
    await user.keyboard("{ArrowRight}");
    expect(await screen.findByRole("menuitemcheckbox", { name: "Règle" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitemradio", { name: "Édition" })).toHaveAttribute("aria-checked", "true");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(screen.getByRole("menuitem", { name: "Affichage" })).toHaveFocus();
  });

  it("sous-menu à la flèche droite", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.click(screen.getByRole("menuitem", { name: "Fichier" }));
    const sub = screen.getByRole("menuitem", { name: "Exporter" });
    act(() => sub.focus());
    await user.keyboard("{ArrowRight}");
    expect(await screen.findByRole("menuitem", { name: "PDF" })).toBeInTheDocument();
    expect(screen.getAllByRole("menu")[1]).toHaveClass("ui-menubar-content");
  });

  it("sans violation d'accessibilité", async () => {
    const user = userEvent.setup();
    const { container } = render(<Demo />);
    expect(await axe(container)).toHaveNoViolations();
    await user.click(screen.getByRole("menuitem", { name: "Affichage" }));
    expect(await axe(screen.getByRole("menu"))).toHaveNoViolations();
  });
});
