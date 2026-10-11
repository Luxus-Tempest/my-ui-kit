import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { ToggleGroup, ToggleGroupItem } from "./ToggleGroup";

describe("ToggleGroup", () => {
  it("single : radiogroup, segmented et default par défaut", () => {
    render(
      <ToggleGroup type="single" defaultValue="liste" aria-label="Affichage">
        <ToggleGroupItem value="liste">Liste</ToggleGroupItem>
        <ToggleGroupItem value="grille">Grille</ToggleGroupItem>
      </ToggleGroup>,
    );
    const group = screen.getByRole("radiogroup", { name: "Affichage" });
    expect(group).toHaveAttribute("data-variant", "segmented");
    expect(group).toHaveAttribute("data-size", "default");
    expect(group).toHaveClass("ui-toggle-group");
    const liste = screen.getByRole("radio", { name: "Liste" });
    expect(liste).toHaveAttribute("aria-checked", "true");
    expect(liste).toHaveAttribute("data-state", "on");
    expect(liste).toHaveClass("ui-toggle-group__item");
  });

  it("single : flèches pour se déplacer, Espace pour choisir", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ToggleGroup type="single" defaultValue="liste" aria-label="Affichage" onValueChange={onValueChange}>
        <ToggleGroupItem value="liste">Liste</ToggleGroupItem>
        <ToggleGroupItem value="grille">Grille</ToggleGroupItem>
      </ToggleGroup>,
    );
    await user.tab();
    expect(screen.getByRole("radio", { name: "Liste" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    const grille = screen.getByRole("radio", { name: "Grille" });
    expect(grille).toHaveFocus();
    await user.keyboard(" ");
    expect(grille).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Liste" })).toHaveAttribute("aria-checked", "false");
    expect(onValueChange).toHaveBeenLastCalledWith("grille");
  });

  it("single : un choix reste toujours sélectionné, sauf avec allowEmpty", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <ToggleGroup type="single" defaultValue="mois" aria-label="Période" onValueChange={onValueChange}>
        <ToggleGroupItem value="semaine">Semaine</ToggleGroupItem>
        <ToggleGroupItem value="mois">Mois</ToggleGroupItem>
      </ToggleGroup>,
    );
    await user.click(screen.getByRole("radio", { name: "Mois" }));
    expect(screen.getByRole("radio", { name: "Mois" })).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).not.toHaveBeenCalled();

    rerender(
      <ToggleGroup type="single" defaultValue="mois" aria-label="Période" allowEmpty key="vide">
        <ToggleGroupItem value="semaine">Semaine</ToggleGroupItem>
        <ToggleGroupItem value="mois">Mois</ToggleGroupItem>
      </ToggleGroup>,
    );
    await user.click(screen.getByRole("radio", { name: "Mois" }));
    expect(screen.getByRole("radio", { name: "Mois" })).toHaveAttribute("aria-checked", "false");
  });

  it("multiple : toolbar, éléments à aria-pressed, variante outline sm", async () => {
    const user = userEvent.setup();
    render(
      <ToggleGroup type="multiple" variant="outline" size="sm" aria-label="Mise en forme">
        <ToggleGroupItem value="gras">Gras</ToggleGroupItem>
        <ToggleGroupItem value="italique">Italique</ToggleGroupItem>
      </ToggleGroup>,
    );
    const toolbar = screen.getByRole("toolbar", { name: "Mise en forme" });
    expect(toolbar).toHaveAttribute("data-variant", "outline");
    expect(toolbar).toHaveAttribute("data-size", "sm");
    await user.click(screen.getByRole("button", { name: "Gras" }));
    await user.keyboard("{ArrowRight}{Enter}");
    expect(screen.getByRole("button", { name: "Gras" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Italique" })).toHaveAttribute("aria-pressed", "true");
  });

  it("élément désactivé : ignoré", async () => {
    render(
      <ToggleGroup type="single" aria-label="Vue">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b" disabled>B</ToggleGroupItem>
      </ToggleGroup>,
    );
    const b = screen.getByRole("radio", { name: "B" });
    expect(b).toBeDisabled();
    await userEvent.click(b);
    expect(b).toHaveAttribute("aria-checked", "false");
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <>
        <ToggleGroup type="single" defaultValue="liste" aria-label="Affichage">
          <ToggleGroupItem value="liste">Liste</ToggleGroupItem>
          <ToggleGroupItem value="grille">Grille</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="multiple" variant="outline" aria-label="Mise en forme">
          <ToggleGroupItem value="gras" aria-label="Gras"><svg aria-hidden="true" /></ToggleGroupItem>
          <ToggleGroupItem value="italique" aria-label="Italique"><svg aria-hidden="true" /></ToggleGroupItem>
        </ToggleGroup>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
