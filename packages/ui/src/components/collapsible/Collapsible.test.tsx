import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "../../../vitest.setup";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./Collapsible";

function Demo(props: { defaultOpen?: boolean; onOpenChange?: (open: boolean) => void }) {
  return (
    <Collapsible {...props}>
      <CollapsibleTrigger>Réglages avancés</CollapsibleTrigger>
      <CollapsibleContent>Limite de bande passante</CollapsibleContent>
    </Collapsible>
  );
}

describe("Collapsible", () => {
  it("fermé par défaut : contenu absent, aria-expanded à false", () => {
    render(<Demo />);
    expect(screen.getByRole("button", { name: "Réglages avancés" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Limite de bande passante")).toBeNull();
  });

  it("clavier : Entrée puis Espace ouvrent et referment", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Demo onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole("button", { name: "Réglages avancés" });
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Limite de bande passante")).toBeVisible();
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await user.keyboard(" ");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("asChild : le déclencheur prête son comportement à l'enfant", async () => {
    render(
      <Collapsible>
        <CollapsibleTrigger asChild>
          <button type="button" className="mon-bouton">Afficher plus</button>
        </CollapsibleTrigger>
        <CollapsibleContent>Suite</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByRole("button", { name: "Afficher plus" });
    expect(trigger).toHaveClass("mon-bouton", "ui-collapsible__trigger");
    await userEvent.setup().click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", screen.getByText("Suite").id);
  });

  it("sans violation d'accessibilité (ouvert)", async () => {
    const { container } = render(<Demo defaultOpen />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
