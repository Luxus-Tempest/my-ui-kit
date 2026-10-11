import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Chip, ChipGroup } from "./Chip";

describe("Chip", () => {
  it("puce d'action : pas d'aria-pressed", () => {
    render(<Chip>Type</Chip>);
    expect(screen.getByRole("button", { name: "Type" })).not.toHaveAttribute("aria-pressed");
  });

  it("puce de filtre : bascule aria-pressed et affiche la coche", async () => {
    function Filter() {
      const [on, setOn] = React.useState(false);
      return (
        <Chip selected={on} onClick={() => setOn(!on)}>
          Documents
        </Chip>
      );
    }
    render(<Filter />);
    const chip = screen.getByRole("button", { name: "Documents" });
    expect(chip).toHaveAttribute("aria-pressed", "false");
    await userEvent.setup().click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "true");
    expect(chip.querySelector(".ui-chip__icon")).not.toBeNull();
  });

  it("puce d'entrée : bouton Retirer et touche Retour arrière", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<Chip onRemove={onRemove}>Inès</Chip>);
    await user.click(screen.getByRole("button", { name: "Retirer Inès" }));
    screen.getByRole("button", { name: "Inès" }).focus();
    await user.keyboard("{Backspace}");
    expect(onRemove).toHaveBeenCalledTimes(2);
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <ChipGroup aria-label="Filtres">
        <Chip selected>Documents</Chip>
        <Chip selected={false}>Images</Chip>
        <Chip onRemove={() => {}}>Karim</Chip>
      </ChipGroup>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
