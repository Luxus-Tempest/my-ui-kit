import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Label } from "../label/Label";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("se coche au clic et au clavier, via son libellé", async () => {
    const onChange = vi.fn();
    render(<><Checkbox id="c" onCheckedChange={onChange} /><Label htmlFor="c">Archiver</Label></>);
    const cb = screen.getByRole("checkbox", { name: "Archiver" });
    expect(cb).not.toBeChecked();
    await userEvent.click(screen.getByText("Archiver"));
    expect(cb).toBeChecked();
    cb.focus();
    await userEvent.keyboard(" ");
    expect(cb).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("état mixte", () => {
    render(<Checkbox aria-label="Tout sélectionner" checked="indeterminate" />);
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "mixed");
  });

  it("désactivée", async () => {
    render(<Checkbox aria-label="X" disabled />);
    const cb = screen.getByRole("checkbox");
    await userEvent.click(cb);
    expect(cb).not.toBeChecked();
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(<><Checkbox id="x" defaultChecked /><Label htmlFor="x">Actif</Label></>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
