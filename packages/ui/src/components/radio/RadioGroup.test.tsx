import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { RadioGroup, RadioGroupItem } from "./RadioGroup";

describe("RadioGroup", () => {
  it("choix au clic sur le libellé et aux flèches", async () => {
    const onChange = vi.fn();
    render(
      <RadioGroup aria-label="Fréquence" defaultValue="mois" onValueChange={onChange}>
        <RadioGroupItem value="semaine">Chaque semaine</RadioGroupItem>
        <RadioGroupItem value="mois" description="Le 1er du mois">Chaque mois</RadioGroupItem>
        <RadioGroupItem value="an" disabled>Chaque année</RadioGroupItem>
      </RadioGroup>,
    );
    await userEvent.click(screen.getByText("Chaque semaine"));
    expect(screen.getByRole("radio", { name: "Chaque semaine" })).toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith("semaine");
    expect(screen.getByRole("radio", { name: "Chaque mois" })).toHaveAccessibleDescription("Le 1er du mois");
    expect(screen.getByRole("radio", { name: "Chaque année" })).toBeDisabled();
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <RadioGroup aria-label="Taille" defaultValue="m">
        <RadioGroupItem value="s">Petite</RadioGroupItem>
        <RadioGroupItem value="m">Moyenne</RadioGroupItem>
      </RadioGroup>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
