import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "./ContextMenu";

function Demo({ onOpenFile = () => {}, onCopy = () => {} }: { onOpenFile?: () => void; onCopy?: () => void }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger data-testid="zone">Rapport annuel.pdf</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>Fichier</ContextMenuLabel>
        <ContextMenuItem onSelect={onOpenFile} shortcut="⌘O">Ouvrir</ContextMenuItem>
        <ContextMenuItem onSelect={onCopy}>Créer une copie</ContextMenuItem>
        <ContextMenuItem disabled>Télécharger</ContextMenuItem>
        <ContextMenuCheckboxItem checked>Suivi</ContextMenuCheckboxItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Trier par</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuRadioGroup value="nom">
              <ContextMenuRadioItem value="nom">Nom</ContextMenuRadioItem>
              <ContextMenuRadioItem value="date">Date</ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem variant="danger">Placer dans la corbeille</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

describe("ContextMenu", () => {
  it("s'ouvre au clic droit avec les classes de Menu", () => {
    render(<Demo />);
    fireEvent.contextMenu(screen.getByTestId("zone"));
    const menu = screen.getByRole("menu");
    expect(menu).toHaveClass("ui-popup", "ui-menu", "ui-context-menu");
    expect(menu).toHaveAttribute("data-slot", "context-menu-content");
    expect(screen.getByRole("menuitem", { name: /Ouvrir/ })).toHaveClass("ui-menu-item");
    expect(screen.getByText("⌘O")).toHaveClass("ui-menu-shortcut");
    expect(screen.getByRole("menuitem", { name: "Télécharger" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("menuitemcheckbox", { name: "Suivi" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitem", { name: "Placer dans la corbeille" })).toHaveAttribute("data-variant", "danger");
  });

  it("clavier : flèches, Entrée pour choisir, puis se referme", async () => {
    const user = userEvent.setup();
    const onCopy = vi.fn();
    render(<Demo onCopy={onCopy} />);
    fireEvent.contextMenu(screen.getByTestId("zone"));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: /Ouvrir/ })).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Créer une copie" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onCopy).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("sous-menu à la flèche droite, Échap referme", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    fireEvent.contextMenu(screen.getByTestId("zone"));
    const sub = screen.getByRole("menuitem", { name: "Trier par" });
    act(() => sub.focus());
    await user.keyboard("{ArrowRight}");
    expect(await screen.findByRole("menuitemradio", { name: "Nom" })).toHaveAttribute("aria-checked", "true");
    await user.keyboard("{Escape}");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
  });

  it("sans violation d'accessibilité", async () => {
    render(<Demo />);
    fireEvent.contextMenu(screen.getByTestId("zone"));
    expect(await axe(await screen.findByRole("menu"))).toHaveNoViolations();
  });
});
