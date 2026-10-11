import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Fab, fabVariants } from "./Fab";

const Plus = () => <svg data-testid="plus" />;

describe("Fab", () => {
  it("bouton nommé par aria-label, variante et taille par classes", () => {
    render(
      <Fab aria-label="Nouveau" variant="tonal" size="lg">
        <Plus />
      </Fab>,
    );
    const fab = screen.getByRole("button", { name: "Nouveau" });
    expect(fab).toHaveAttribute("type", "button");
    expect(fab).toHaveClass("ui-fab", "ui-fab--tonal", "ui-fab--size-lg");
    expect(fabVariants()).toBe("ui-fab ui-fab--elevated ui-fab--size-default");
  });

  it("étendu : libellé visible, pilule", () => {
    render(
      <Fab extended>
        <Plus />
        Nouveau
      </Fab>,
    );
    expect(screen.getByRole("button", { name: "Nouveau" })).toHaveClass("ui-fab--extended");
  });

  it("position fixe", () => {
    render(<Fab aria-label="Écrire" position="fixed"><Plus /></Fab>);
    expect(screen.getByRole("button")).toHaveAttribute("data-position", "fixed");
  });

  it("clavier : Entrée et Espace déclenchent l'action", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Fab aria-label="Nouveau" onClick={onClick}><Plus /></Fab>);
    await user.tab();
    expect(screen.getByRole("button")).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("asChild : devient un lien", () => {
    render(
      <Fab asChild extended variant="primary">
        <a href="#nouveau">Nouveau document</a>
      </Fab>,
    );
    const link = screen.getByRole("link", { name: "Nouveau document" });
    expect(link).toHaveClass("ui-fab", "ui-fab--primary");
    expect(link).not.toHaveAttribute("type");
  });

  it("sans violation d'accessibilité", async () => {
    const { container } = render(
      <>
        <Fab aria-label="Nouveau"><Plus /></Fab>
        <Fab extended variant="primary"><Plus />Nouveau</Fab>
      </>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
