import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Label } from "../label/Label";
import { Input, Textarea } from "./Input";

describe("Input", () => {
  it("est relié à son libellé et accepte la saisie", async () => {
    render(<><Label htmlFor="n" required>Nom</Label><Input id="n" required /></>);
    const input = screen.getByRole("textbox", { name: "Nom" });
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("data-density", "default");
    await userEvent.type(input, "Atlas");
    expect(input).toHaveValue("Atlas");
  });

  it("densité sm et ref transmise", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Input ref={ref} density="sm" aria-label="Rechercher" />);
    expect(ref.current).toHaveAttribute("data-density", "sm");
  });

  it("annonce l'erreur via aria-invalid", () => {
    render(<Input aria-label="Email" aria-invalid="true" aria-describedby="e" />);
    expect(screen.getByRole("textbox")).toBeInvalid();
  });

  it("Textarea : autoResize pose l'attribut", () => {
    render(<Textarea aria-label="Note" autoResize />);
    expect(screen.getByRole("textbox")).toHaveAttribute("data-autoresize", "true");
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <>
        <Label htmlFor="a">Raison sociale</Label>
        <Input id="a" />
        <Label htmlFor="b">Notes</Label>
        <Textarea id="b" />
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
