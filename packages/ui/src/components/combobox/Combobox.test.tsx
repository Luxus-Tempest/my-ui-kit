import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Field } from "../field/Field";
import { Combobox, type ComboboxOption } from "./Combobox";

const villes: ComboboxOption[] = [
  { value: "cas", label: "Casablanca", group: "Maroc" },
  { value: "rba", label: "Rabat", group: "Maroc", description: "Capitale" },
  { value: "fes", label: "Fès", group: "Maroc", disabled: true },
  { value: "par", label: "Paris", group: "France" },
  { value: "lyo", label: "Lyon", group: "France" },
];

describe("Combobox", () => {
  it("expose le motif combobox, nommé par son Field", () => {
    render(
      <Field label="Ville" error="Ville obligatoire">
        <Combobox options={villes} placeholder="Choisir une ville" />
      </Field>,
    );
    const trigger = screen.getByRole("combobox", { name: "Ville" });
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAccessibleDescription("Ville obligatoire");
    expect(trigger).toHaveTextContent("Choisir une ville");
  });

  it("s'ouvre au clavier, filtre, sélectionne à Entrée et rend le focus", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Field label="Ville">
        <Combobox options={villes} onValueChange={onValueChange} />
      </Field>,
    );
    const trigger = screen.getByRole("combobox", { name: "Ville" });
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const listbox = await screen.findByRole("listbox");
    expect(trigger).toHaveAttribute("aria-controls", listbox.id);
    expect(within(listbox).getByRole("group", { name: "Maroc" })).toBeInTheDocument();
    expect(within(listbox).getByRole("option", { name: "Fès" })).toHaveAttribute("aria-disabled", "true");

    const search = screen.getByPlaceholderText("Rechercher…");
    await waitFor(() => expect(search).toHaveFocus());
    await user.keyboard("ly");
    expect(within(listbox).getAllByRole("option")).toHaveLength(1);
    await user.keyboard("{Enter}");

    expect(onValueChange).toHaveBeenCalledWith("lyo");
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveTextContent("Lyon");
  });

  it("la frappe sur le déclencheur ouvre la recherche ; « Aucun résultat » sinon", async () => {
    const user = userEvent.setup();
    render(<Combobox aria-label="Ville" options={villes} />);
    screen.getByRole("combobox", { name: "Ville" }).focus();
    await user.keyboard("z");
    expect(await screen.findByPlaceholderText("Rechercher…")).toHaveValue("z");
    expect(screen.getByText("Aucun résultat")).toBeInTheDocument();
  });

  it("flèches dans la liste, la coche marque la valeur, Échap ferme", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Combobox aria-label="Ville" options={villes} defaultValue="rba" onValueChange={onValueChange} />);
    const trigger = screen.getByRole("combobox", { name: "Ville" });
    expect(trigger).toHaveTextContent("Rabat");
    await user.click(trigger);
    const selected = await screen.findByRole("option", { name: /Rabat/ });
    expect(selected).toHaveAttribute("aria-checked", "true");
    // L'entrée active à l'ouverture est la valeur courante ; Fès (désactivée) est sautée.
    expect(selected).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("option", { name: "Paris" })).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  describe("multiple", () => {
    it("coche plusieurs entrées sans fermer, affiche puces puis résumé", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Field label="Villes">
          <Combobox multiple options={villes} onValueChange={onValueChange} />
        </Field>,
      );
      const trigger = screen.getByRole("combobox", { name: "Villes" });
      await user.click(trigger);
      const listbox = await screen.findByRole("listbox");
      expect(listbox).toHaveAttribute("aria-multiselectable", "true");

      await user.click(screen.getByRole("option", { name: "Paris" }));
      await user.click(screen.getByRole("option", { name: "Lyon" }));
      expect(onValueChange).toHaveBeenLastCalledWith(["par", "lyo"]);
      expect(screen.getByRole("listbox")).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Paris" })).toHaveAttribute("aria-checked", "true");
      expect(screen.getByRole("button", { name: "Retirer Paris" })).toBeInTheDocument();

      await user.click(screen.getByRole("option", { name: "Casablanca" }));
      expect(trigger).toHaveTextContent("3 sélectionnés");
      expect(screen.queryByRole("button", { name: "Retirer Paris" })).not.toBeInTheDocument();
    });

    it("retire une puce et rend le focus au déclencheur ; Retour arrière retire la dernière", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Field label="Villes">
          <Combobox multiple options={villes} defaultValue={["par", "lyo"]} onValueChange={onValueChange} />
        </Field>,
      );
      const trigger = screen.getByRole("combobox", { name: "Villes" });
      await user.click(screen.getByRole("button", { name: "Retirer Paris" }));
      expect(onValueChange).toHaveBeenLastCalledWith(["lyo"]);
      expect(trigger).toHaveFocus();
      await user.keyboard("{Backspace}");
      expect(onValueChange).toHaveBeenLastCalledWith([]);
      expect(trigger).toHaveTextContent("Choisir…");
    });
  });

  it("désactivé : ne s'ouvre pas", async () => {
    const user = userEvent.setup();
    render(<Combobox aria-label="Ville" options={villes} disabled />);
    const trigger = screen.getByRole("combobox", { name: "Ville" });
    expect(trigger).toBeDisabled();
    await user.click(trigger);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("sans violation d'accessibilité, fermé et ouvert", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Field label="Villes" hint="Plusieurs choix possibles">
        <Combobox multiple options={villes} defaultValue={["par"]} />
      </Field>,
    );
    expect(await axe(container)).toHaveNoViolations();
    await user.click(screen.getByRole("combobox", { name: "Villes" }));
    expect(await axe(await screen.findByRole("dialog"))).toHaveNoViolations();
  });
});
