import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Field } from "../field/Field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./Select";

function Devise(props: { onValueChange?: (v: string) => void; error?: string }) {
  return (
    <Field label="Devise" error={props.error}>
      <Select onValueChange={props.onValueChange}>
        <SelectTrigger><SelectValue placeholder="Choisir une devise" /></SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Courantes</SelectLabel>
            <SelectItem value="mad">Dirham (MAD)</SelectItem>
            <SelectItem value="eur">Euro (EUR)</SelectItem>
            <SelectItem value="usd" disabled>Dollar (USD)</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}

describe("Select", () => {
  it("est nommé par son Field, affiche le placeholder, s'ouvre au clavier et sélectionne", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Devise onValueChange={onChange} />);
    const trigger = screen.getByRole("combobox", { name: "Devise" });
    expect(trigger).toHaveTextContent("Choisir une devise");

    trigger.focus();
    await user.keyboard("{Enter}");
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Dollar (USD)" })).toHaveAttribute("aria-disabled", "true");

    await user.click(screen.getByRole("option", { name: "Euro (EUR)" }));
    expect(onChange).toHaveBeenCalledWith("eur");
    expect(trigger).toHaveTextContent("Euro (EUR)");
  });

  it("reçoit l'état d'erreur du Field", () => {
    render(<Devise error="Choisissez une devise" />);
    const trigger = screen.getByRole("combobox", { name: "Devise" });
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAccessibleDescription("Choisissez une devise");
  });
});
