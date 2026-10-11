import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./Command";

function Palette({ onSelect = () => {} }: { onSelect?: (value: string) => void }) {
  return (
    <Command label="Commandes">
      <CommandInput placeholder="Rechercher…" />
      <CommandList>
        <CommandEmpty>Aucun résultat</CommandEmpty>
        <CommandGroup heading="Créer">
          <CommandItem onSelect={onSelect} shortcut="⌘N">Nouveau document</CommandItem>
          <CommandItem onSelect={onSelect}>Nouveau dossier</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

describe("Command", () => {
  it("filtre à la frappe et affiche l'état vide", async () => {
    const user = userEvent.setup();
    render(<Palette />);
    await user.type(screen.getByRole("combobox"), "dossier");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option")).toHaveTextContent("Nouveau dossier");
    await user.clear(screen.getByRole("combobox"));
    await user.type(screen.getByRole("combobox"), "zzz");
    expect(screen.getByText("Aucun résultat")).toBeInTheDocument();
  });

  it("flèches et Entrée sélectionnent une entrée", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Palette onSelect={onSelect} />);
    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledWith("Nouveau dossier");
  });

  it("dans une modale, nommée pour les lecteurs d'écran", () => {
    render(
      <CommandDialog open>
        <CommandInput aria-label="Rechercher une commande" />
        <CommandList>
          <CommandItem>Paramètres</CommandItem>
        </CommandList>
      </CommandDialog>,
    );
    expect(screen.getByRole("dialog", { name: "Palette de commandes" })).toBeInTheDocument();
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(<Palette />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
