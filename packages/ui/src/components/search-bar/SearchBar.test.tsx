import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { SearchBar } from "./SearchBar";

describe("SearchBar", () => {
  it("non contrôlée : saisie, bouton d'effacement, focus conservé", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onClear = vi.fn();
    render(<SearchBar aria-label="Rechercher" onValueChange={onValueChange} onClear={onClear} />);
    const input = screen.getByRole("searchbox", { name: "Rechercher" });
    expect(screen.queryByRole("button", { name: "Effacer la recherche" })).toBeNull();
    await user.type(input, "budget");
    expect(onValueChange).toHaveBeenLastCalledWith("budget");
    await user.click(screen.getByRole("button", { name: "Effacer la recherche" }));
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("Échap vide le champ", async () => {
    const user = userEvent.setup();
    render(<SearchBar aria-label="Rechercher" defaultValue="contrat" />);
    const input = screen.getByRole("searchbox");
    input.focus();
    await user.keyboard("{Escape}");
    expect(input).toHaveValue("");
  });

  it("contrôlée : suit la valeur reçue", () => {
    render(<SearchBar aria-label="Rechercher" value="notes" onValueChange={() => {}} />);
    expect(screen.getByRole("searchbox")).toHaveValue("notes");
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(<SearchBar aria-label="Rechercher dans le Drive" defaultValue="q4" size="lg" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
